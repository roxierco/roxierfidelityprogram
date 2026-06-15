import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  // Verificar que el negocio que escanea está autenticado
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { customerId, businessId, cardId } = await req.json();
  if (!customerId || !businessId) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  const admin = createAdminClient();

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
  if (cardId) {
    const { data } = await admin
      .from("loyalty_cards")
      .select("stamps_required, reward_text")
      .eq("id", cardId)
      .eq("business_id", businessId)
      .single();
    card = data;
  }
  if (!card) {
    // fallback: primera tarjeta activa del negocio
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

  // Actualizar sellos
  await admin
    .from("end_customers")
    .update({
      current_stamps: finalStamps,
      total_visits: customer.total_visits + 1,
      rewards_redeemed: rewarded ? customer.rewards_redeemed + 1 : customer.rewards_redeemed,
      last_visit_at: new Date().toISOString(),
    })
    .eq("id", customerId);

  // Registrar visita
  await admin.from("visits").insert({
    business_id: businessId,
    customer_id: customerId,
    stamps_added: 1,
    is_redemption: rewarded,
  });

  return NextResponse.json({
    success: true,
    customer: { ...customer, current_stamps: finalStamps },
    rewarded,
    rewardText: card?.reward_text ?? "",
    stampsRequired,
  });
}
