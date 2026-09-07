import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isGoogleWalletConfigured, sendWalletPromoMessage, checkGoogleWalletAuth } from "@/lib/google-wallet";
import { isPushConfigured, sendPush } from "@/lib/web-push";
import { isAppleWalletConfigured, sendApnsPassUpdate } from "@/lib/apple-wallet";
import { logWalletEvent } from "@/lib/wallet-events";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const admin = createAdminClient();

  // Cargar promo y verificar ownership
  const { data: promo } = await admin
    .from("promotions")
    .select("id, title, message, business_id")
    .eq("id", id)
    .single();
  if (!promo) return NextResponse.json({ error: "Promoción no encontrada" }, { status: 404 });

  const { data: business } = await admin
    .from("businesses")
    .select("id, name, slug, logo_url")
    .eq("id", promo.business_id)
    .eq("owner_id", user.id)
    .single();
  if (!business) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  // Obtener todos los clientes
  const { data: allCustomers } = await admin
    .from("end_customers")
    .select("id, full_name")
    .eq("business_id", business.id);

  const customers = allCustomers ?? [];

  // TODAS las tarjetas del negocio, activas o no. No filtrar por `is_active`:
  // el cliente conserva el pase en su celular aunque el negocio haya desactivado
  // ese diseño, y esos son justo los pases a los que hay que avisarles.
  const { data: businessCards } = await admin
    .from("loyalty_cards")
    .select("id")
    .eq("business_id", business.id);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  // Conteo real por canal. El aviso llega al celular del cliente (Wallet o
  // navegador); el correo se retiró a propósito: era el canal más invasivo y
  // el único que costaba dinero.
  const canales = { apple: 0, google: 0, web: 0 };

  // 1. Google Wallet addMessage para clientes con tarjeta guardada en Wallet.
  //    Ojo: sendWalletPromoMessage no lanza excepción si Google responde error,
  //    así que hay que mirar `ok` — que la promesa se resuelva no basta.
  if (isGoogleWalletConfigured() && businessCards?.length) {
    // Si las credenciales no sirven, no sirven para nadie: se comprueba una vez
    // y se anota un solo evento, en vez de repetir el mismo error por cada
    // cliente y cada tarjeta.
    const auth = await checkGoogleWalletAuth();
    if (!auth.ok) {
      await logWalletEvent("promo_push_failed", `promo:${promo.id}`, undefined, {
        canal: "google",
        error: auth.error,
        cuenta: auth.clientEmail,
        issuer_id: auth.issuerId,
        nota: "credenciales de Google Wallet rechazadas; no se intentó ningún envío",
      });
    } else {
      const pares = customers.flatMap((c) => businessCards.map((card) => ({ c, card })));
      const results = await Promise.allSettled(
        pares.map(({ c, card }) => sendWalletPromoMessage(c.id, card.id, promo.title, promo.message)),
      );

      await Promise.allSettled(
        results.map(async (r, i) => {
          const { c, card } = pares[i];
          const serial = `${c.id}-${card.id}`;
          if (r.status === "fulfilled" && r.value.ok) {
            canales.google += 1;
          } else if (r.status === "fulfilled") {
            // 404 = ese cliente no guardó ESA tarjeta en Google Wallet. Es lo
            // normal (se prueban todas las tarjetas del negocio), no un fallo.
            if (r.value.status !== 404) {
              await logWalletEvent("promo_push_failed", serial, undefined, {
                canal: "google",
                status: r.value.status,
              });
            }
          } else {
            await logWalletEvent("promo_push_failed", serial, undefined, {
              canal: "google",
              error: String(r.reason),
            });
          }
        }),
      );
    }
  }

  // 2. Web Push para clientes con suscripción activa en el navegador
  if (isPushConfigured() && customers.length > 0) {
    const customerIds = customers.map((c) => c.id);
    const { data: subs } = await admin
      .from("push_subscriptions")
      .select("id, endpoint, p256dh, auth, customer_id")
      .in("customer_id", customerIds);

    if (subs?.length) {
      const expired: string[] = [];
      await Promise.allSettled(
        subs.map(async (sub) => {
          const customer = customers.find((c) => c.id === sub.customer_id);
          const cardUrl = `${appUrl}/c/${business.slug}/u/${sub.customer_id}`;
          const result = await sendPush(
            { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
            { title: `${business.name}: ${promo.title}`, body: promo.message, url: cardUrl },
          );
          if (result === "expired") expired.push(sub.id);
          else canales.web += 1;
          return customer;
        }),
      );
      if (expired.length) {
        await admin.from("push_subscriptions").delete().in("id", expired);
      }
    }
  }

  // 3. Apple Wallet: Apple no permite mensajes libres. Guardamos el texto de la
  //    promo en el negocio (el pase lo muestra en el reverso con changeMessage) y
  //    empujamos un refresh por APNs; al cambiar el valor, el iPhone notifica.
  if (isAppleWalletConfigured() && customers.length > 0) {
    await admin
      .from("businesses")
      .update({
        latest_promo_text: `${promo.title}: ${promo.message}`,
        latest_promo_at: new Date().toISOString(),
      })
      .eq("id", business.id);

    // El serial es "{customerId}-{cardId}", así que buscamos por prefijo de
    // cliente. NO se filtra por tarjeta activa a propósito: el cliente trae el
    // pase guardado en su celular aunque el negocio haya desactivado o
    // reemplazado ese diseño después. Exigir `is_active` deja fuera a casi
    // todos los dispositivos reales y la promo no le llega a nadie.
    //
    // Se filtra en la base (en lotes de OR ... LIKE) en vez de traer todos los
    // registros de todos los negocios: eso leía datos ajenos y topaba con el
    // límite de ~1000 filas de Supabase.
    const registrations: { push_token: string; serial_number: string; device_library_id: string }[] = [];
    const CHUNK = 50;
    for (let i = 0; i < customers.length; i += CHUNK) {
      const filtro = customers
        .slice(i, i + CHUNK)
        .map((c) => `serial_number.like.${c.id}-%`)
        .join(",");
      const { data } = await admin
        .from("apple_wallet_registrations")
        .select("push_token, serial_number, device_library_id")
        .or(filtro);
      if (data) registrations.push(...data);
    }

    // Un mismo dispositivo puede tener varias filas para el mismo pase (se
    // re-registra); sin deduplicar le llegarían pushes repetidos.
    const unicos = [...new Map(registrations.map((r) => [r.push_token, r])).values()];

    if (!unicos.length) {
      await logWalletEvent("promo_push_skipped_no_registration", `promo:${promo.id}`);
    } else {
      // Marcamos los registros como actualizados para que el iPhone los pida.
      await Promise.allSettled(
        Array.from({ length: Math.ceil(unicos.length / CHUNK) }, (_, i) =>
          admin
            .from("apple_wallet_registrations")
            .update({ updated_at: new Date().toISOString() })
            .in("serial_number", unicos.slice(i * CHUNK, (i + 1) * CHUNK).map((r) => r.serial_number)),
        ),
      );

      const results = await Promise.allSettled(
        unicos.map((r) => sendApnsPassUpdate(r.push_token)),
      );

      const deadTokens: string[] = [];
      await Promise.allSettled(
        results.map(async (r, i) => {
          const reg = unicos[i];
          if (r.status === "fulfilled" && r.value.ok) {
            canales.apple += 1;
            await logWalletEvent("promo_push_sent", reg.serial_number, reg.device_library_id, { canal: "apple", status: 200 });
          } else if (r.status === "fulfilled") {
            const { status, reason } = r.value;
            await logWalletEvent("promo_push_failed", reg.serial_number, reg.device_library_id, { canal: "apple", status, reason });
            if (status === 410 || (status === 400 && reason === "BadDeviceToken")) {
              deadTokens.push(reg.push_token);
            }
          } else {
            await logWalletEvent("promo_push_failed", reg.serial_number, reg.device_library_id, { canal: "apple", error: String(r.reason) });
          }
        }),
      );

      if (deadTokens.length) {
        await admin.from("apple_wallet_registrations").delete().in("push_token", deadTokens);
      }
    }
  }

  // Total real de avisos entregados, sumando canales. Un mismo cliente puede
  // recibir por más de uno (Apple y navegador, por ejemplo), así que esto no es
  // "clientes alcanzados" sino avisos enviados.
  const totalAvisos = canales.apple + canales.google + canales.web;

  // Registrar en historial
  await admin.from("push_notifications").insert({
    business_id: business.id,
    title: promo.title,
    message: promo.message,
    recipients_count: totalAvisos,
  });

  return NextResponse.json({ sent: totalAvisos, canales, clientes: customers.length });
}
