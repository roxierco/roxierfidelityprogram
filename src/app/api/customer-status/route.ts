import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  if (!rateLimit(getClientIp(req), "customer-status", 30, 60 * 1000)) {
    return NextResponse.json({ error: "Demasiadas solicitudes." }, { status: 429 });
  }

  const customerId = req.nextUrl.searchParams.get("customerId");
  const cardId = req.nextUrl.searchParams.get("cardId");

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!customerId || !uuidRegex.test(customerId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data } = await admin
    .from("end_customers")
    .select("current_stamps, total_visits, rewards_redeemed")
    .eq("id", customerId)
    .single();

  if (!data) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  // Canjes por-tarjeta (cupón/descuento) para reflejar CANJEADO en vivo.
  let cardRedemptions = 0;
  if (cardId && uuidRegex.test(cardId)) {
    const { count } = await admin
      .from("card_redemptions")
      .select("id", { count: "exact", head: true })
      .eq("customer_id", customerId)
      .eq("card_id", cardId);
    cardRedemptions = count ?? 0;
  }

  return NextResponse.json({
    current_stamps: data.current_stamps,
    total_visits: data.total_visits,
    rewards_redeemed: data.rewards_redeemed,
    card_redemptions: cardRedemptions,
  }, {
    headers: { "Cache-Control": "no-store" },
  });
}
