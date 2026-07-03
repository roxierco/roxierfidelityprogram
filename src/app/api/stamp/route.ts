import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { isGoogleWalletConfigured, syncAfterStamp } from "@/lib/google-wallet";
import { isAppleWalletConfigured, sendApnsPassUpdate } from "@/lib/apple-wallet";
import { isPushConfigured, sendPush } from "@/lib/web-push";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const { customerId, businessId, cardId } = body;

  if (!customerId || !businessId) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  // Validar formato UUID para evitar queries maliciosas
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(customerId) || !uuidRegex.test(businessId)) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

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
      .select("stamps_required, reward_text, card_type, coupon_value")
      .eq("id", cardId)
      .eq("business_id", businessId)
      .eq("is_active", true)
      .single();
    card = data;
  }
  if (!card) {
    const { data } = await admin
      .from("loyalty_cards")
      .select("stamps_required, reward_text, card_type, coupon_value")
      .eq("business_id", businessId)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    card = data;
  }

  // Cupón: bloquear si ya fue canjeado
  if (card?.card_type === "cupon" && customer.rewards_redeemed > 0) {
    return NextResponse.json({ error: "Este cupón ya fue canjeado" }, { status: 409 });
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

  // 3. Apple Wallet APNS push
  if (isAppleWalletConfigured() && cardId) {
    (async () => {
      const serialNumber = `${customerId}-${cardId}`;
      const { data: registrations } = await admin
        .from("apple_wallet_registrations")
        .select("push_token")
        .eq("serial_number", serialNumber);

      console.log(`[apple-wallet] serial=${serialNumber} registrations=${registrations?.length ?? 0}`);

      if (registrations?.length) {
        const businessName = (ownedBusiness as { id: string; slug: string; name: string }).name;
        const notifText = rewarded
          ? `🎉 ¡Ganaste tu premio en ${businessName}: ${card?.reward_text ?? "Premio"}!`
          : `¡Tu visita se ha registrado con un sello nuevo en tu tarjeta de lealtad!`;

        // DB update y APNS en paralelo: iOS tarda ~500ms en procesar el push,
        // tiempo suficiente para que la DB quede lista antes de que consulte registrations
        const [, ...pushResults] = await Promise.allSettled([
          admin
            .from("apple_wallet_registrations")
            .update({ updated_at: new Date().toISOString() })
            .eq("serial_number", serialNumber),
          ...registrations.map((r) => sendApnsPassUpdate(r.push_token, notifText)),
        ]);
        const results = pushResults;
        results.forEach((r, i) => {
          if (r.status === "rejected") {
            console.error(`[apple-wallet] push ${i} failed:`, r.reason);
          }
        });
      }
    })().catch((e) => console.error("[apple-wallet] unexpected error:", e));
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
        ? `🎉 ¡Ganaste tu premio en ${ownedBusiness.id}!`
        : `✅ Sello añadido — ${finalStamps}/${stampsRequired}`;
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
