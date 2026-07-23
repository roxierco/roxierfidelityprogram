export const runtime = "nodejs"; // http2 no funciona en Edge runtime

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { isGoogleWalletConfigured, syncAfterStamp } from "@/lib/google-wallet";
import { isAppleWalletConfigured, sendApnsPassUpdate } from "@/lib/apple-wallet";
import { logWalletEvent } from "@/lib/wallet-events";
import { isPushConfigured, sendPush } from "@/lib/web-push";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  // Límite anti-abuso: 120 sellos por minuto por IP (holgado para un mostrador real).
  if (!rateLimit(getClientIp(req), "stamp", 120, 60 * 1000)) {
    return NextResponse.json({ error: "Demasiadas peticiones, espera un momento." }, { status: 429 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const { customerId, businessId, cardId, sucursalId } = body;

  if (!customerId || !businessId) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  // Validar formato UUID para evitar queries maliciosas
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(customerId) || !uuidRegex.test(businessId)) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }
  const sucursalIdValida = sucursalId && uuidRegex.test(sucursalId) ? sucursalId : null;

  const admin = createAdminClient();

  // SEGURIDAD: verificar que el businessId pertenece al usuario autenticado
  const { data: ownedBusiness } = await admin
    .from("businesses")
    .select("id, slug, name")
    .eq("id", businessId)
    .eq("owner_id", user.id)
    .single();

  if (!ownedBusiness) {
    return NextResponse.json({ error: "No autorizado para este negocio" }, { status: 403 });
  }

  // Verificar que el cliente pertenece a este negocio
  const { data: customer } = await admin
    .from("end_customers")
    .select("id, full_name, current_stamps, total_visits, rewards_redeemed, business_id")
    .eq("id", customerId)
    .eq("business_id", businessId)
    .single();

  if (!customer) {
    return NextResponse.json({ error: "Cliente no encontrado en este negocio" }, { status: 404 });
  }

  // Obtener la tarjeta específica para saber cuántos sellos se necesitan
  let card = null;
  if (cardId && uuidRegex.test(cardId)) {
    const { data } = await admin
      .from("loyalty_cards")
      .select("id, stamps_required, reward_text, card_type, coupon_value, max_uses")
      .eq("id", cardId)
      .eq("business_id", businessId)
      .eq("is_active", true)
      .single();
    card = data;
  }
  if (!card) {
    // Cuando el QR no trae ?card=, usamos la tarjeta activa más reciente,
    // pero NUNCA una de cashback (esas se manejan por /api/cashback, no con sellos).
    const { data } = await admin
      .from("loyalty_cards")
      .select("id, stamps_required, reward_text, card_type, coupon_value, max_uses")
      .eq("business_id", businessId)
      .eq("is_active", true)
      .neq("card_type", "cashback")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    card = data;
  }

  // Cupón: bloquear si ya fue canjeado
  if (card?.card_type === "cupon" && customer.rewards_redeemed > 0) {
    return NextResponse.json({ error: "Este cupón ya fue canjeado" }, { status: 409 });
  }

  // Descuento con límite de usos: bloquear si ya alcanzó el máximo
  if (card?.card_type === "descuento" && card.max_uses != null && customer.rewards_redeemed >= card.max_uses) {
    return NextResponse.json({ error: "Esta tarjeta ya alcanzó su límite de usos" }, { status: 409 });
  }

  const stampsRequired = card?.stamps_required ?? 10;
  const newStamps = customer.current_stamps + 1;
  const rewarded = newStamps >= stampsRequired;
  const finalStamps = rewarded ? newStamps - stampsRequired : newStamps;

  await admin
    .from("end_customers")
    .update({
      current_stamps: finalStamps,
      total_visits: customer.total_visits + 1,
      rewards_redeemed: rewarded ? customer.rewards_redeemed + 1 : customer.rewards_redeemed,
      last_visit_at: new Date().toISOString(),
    })
    .eq("id", customerId);

  await admin.from("visits").insert({
    business_id: businessId,
    customer_id: customerId,
    stamps_added: 1,
    is_redemption: rewarded,
    sucursal_id: sucursalIdValida,
  });

  const slug = (ownedBusiness as { id: string; slug: string }).slug;
  const cardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/c/${slug}/u/${customerId}${cardId ? `?card=${cardId}` : ""}`;

  // 1. Broadcast Supabase Realtime → actualiza la tarjeta en el navegador en tiempo real
  fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/realtime/v1/api/broadcast`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      "apikey": process.env.SUPABASE_SERVICE_ROLE_KEY!,
    },
    body: JSON.stringify({
      messages: [{
        topic: `realtime:customer:${customerId}`,
        event: "stamp_added",
        payload: {
          current_stamps: finalStamps,
          total_visits: customer.total_visits + 1,
          rewards_redeemed: rewarded ? customer.rewards_redeemed + 1 : customer.rewards_redeemed,
          rewarded,
          reward_text: card?.reward_text ?? "",
          stamps_required: stampsRequired,
        },
      }],
    }),
  }).catch(() => null);

  // 2. Google Wallet sync
  if (isGoogleWalletConfigured() && cardId) {
    syncAfterStamp({
      customerId,
      cardId,
      customerName: customer.full_name,
      currentStamps: finalStamps,
      stampsRequired,
      rewardText: card?.reward_text ?? "",
      cardUrl,
      rewarded,
    }).catch(() => null);
  }

  // 3. Apple Wallet APNS push — awaited antes del return para que Vercel
  // no mate la función serverless antes de que el push complete.
  const walletCardId = cardId ?? (card as { id?: string } | null)?.id ?? null;
  console.log(`[apple-wallet] configured=${isAppleWalletConfigured()} walletCardId=${walletCardId ?? "null"}`);
  if (isAppleWalletConfigured() && walletCardId) {
    try {
      const serialNumber = `${customerId}-${walletCardId}`;
      const { data: registrations } = await admin
        .from("apple_wallet_registrations")
        .select("push_token, device_library_id")
        .eq("serial_number", serialNumber);

      console.log(`[apple-wallet] serial=${serialNumber} registrations=${registrations?.length ?? 0}`);

      if (!registrations?.length) {
        await logWalletEvent("push_skipped_no_registration", serialNumber);
      } else {
        await admin
          .from("apple_wallet_registrations")
          .update({ updated_at: new Date().toISOString() })
          .eq("serial_number", serialNumber);

        const results = await Promise.allSettled(
          registrations.map((r) => sendApnsPassUpdate(r.push_token)),
        );

        const deadTokens: string[] = [];

        await Promise.allSettled(results.map(async (r, i) => {
          const reg = registrations[i];
          const shortToken = reg.push_token.slice(0, 8) + "...";
          if (r.status === "fulfilled") {
            const { ok, status, reason } = r.value;
            if (ok) {
              console.log(`[apple-wallet] push ${i} OK`);
              await logWalletEvent("push_sent", serialNumber, reg.device_library_id, { status: 200, pushToken: shortToken });
            } else {
              console.error(`[apple-wallet] push ${i} failed: status=${status} reason=${reason}`);
              await logWalletEvent("push_failed", serialNumber, reg.device_library_id, { status, reason, pushToken: shortToken });
              if (status === 410 || (status === 400 && reason === "BadDeviceToken")) {
                deadTokens.push(reg.push_token);
              }
            }
          } else {
            console.error(`[apple-wallet] push ${i} network error:`, r.reason);
            await logWalletEvent("push_failed", serialNumber, reg.device_library_id, { error: String(r.reason), pushToken: shortToken });
          }
        }));

        if (deadTokens.length) {
          await admin.from("apple_wallet_registrations")
            .delete()
            .eq("serial_number", serialNumber)
            .in("push_token", deadTokens);
          console.log(`[apple-wallet] deleted ${deadTokens.length} dead token(s) for serial=${serialNumber}`);
        }
      }
    } catch (e) {
      console.error("[apple-wallet] error:", e);
    }
  }

  // 4. Web Push al navegador del cliente
  if (isPushConfigured()) {
    (async () => {
      const { data: subs } = await admin
        .from("push_subscriptions")
        .select("endpoint, p256dh, auth, id")
        .eq("customer_id", customerId);

      if (!subs?.length) return;

      const notifTitle = rewarded
        ? `¡Ganaste tu premio en ${ownedBusiness.id}!`
        : `Sello añadido — ${finalStamps}/${stampsRequired}`;
      const notifBody = rewarded
        ? (card?.reward_text ?? "¡Ve a recoger tu recompensa!")
        : `Te faltan ${stampsRequired - finalStamps} sellos para tu premio.`;

      const expired: string[] = [];
      await Promise.allSettled(
        subs.map(async (sub) => {
          const result = await sendPush(
            { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
            { title: notifTitle, body: notifBody, url: cardUrl },
          );
          if (result === "expired") expired.push(sub.id);
        }),
      );

      if (expired.length) {
        await admin.from("push_subscriptions").delete().in("id", expired);
      }
    })().catch(() => null);
  }

  const nearReward = !rewarded && finalStamps === stampsRequired - 1;

  return NextResponse.json({
    success: true,
    customer: { ...customer, current_stamps: finalStamps },
    rewarded,
    nearReward,
    rewardText: card?.reward_text ?? "",
    stampsRequired,
    cardType: card?.card_type ?? "sellos",
    couponValue: card?.coupon_value ?? null,
  });
}
