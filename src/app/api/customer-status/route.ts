import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  if (!rateLimit(getClientIp(req), "customer-status", 30, 60 * 1000)) {
    return NextResponse.json({ error: "Demasiadas solicitudes." }, { status: 429 });
  }

  const customerId = req.nextUrl.searchParams.get("customerId");

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

  return NextResponse.json({
    current_stamps: data.current_stamps,
    total_visits: data.total_visits,
    rewards_redeemed: data.rewards_redeemed,
  }, {
    headers: { "Cache-Control": "no-store" },
  });
}
