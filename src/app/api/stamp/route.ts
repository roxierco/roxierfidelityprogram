import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { isGoogleWalletConfigured, syncAfterStamp } from "@/lib/google-wallet";

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
    .select("id, slug")
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
      .select("stamps_required, reward_text")
      .eq("id", cardId)
      .eq("business_id", businessId)
      .eq("is_active", true)
      .single();
    card = data;
  }
  if (!card) {
    const { data } = await admin
      .from("loyalty_cards")
      .select("stamps_required, reward_text")
      .eq("business_id", businessId)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    card = data;
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

  // Sincronizar con Google Wallet en segundo plano + notificación push
  if (isGoogleWalletConfigured() && cardId) {
    const slug = (ownedBusiness as { id: string; slug: string }).slug;
    const cardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/c/${slug}/u/${customerId}?card=${cardId}`;
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

  return NextResponse.json({
    success: true,
    customer: { ...customer, current_stamps: finalStamps },
    rewarded,
    rewardText: card?.reward_text ?? "",
    stampsRequired,
  });
}
