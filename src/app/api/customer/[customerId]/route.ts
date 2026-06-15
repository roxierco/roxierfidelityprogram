import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ customerId: string }> }) {
  const { customerId } = await params;
  const supabase = createAdminClient();

  const { data: customer } = await supabase
    .from("end_customers")
    .select("id, full_name, current_stamps, total_visits, rewards_redeemed, business_id")
    .eq("id", customerId)
    .single();

  if (!customer) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const { data: business } = await supabase
    .from("businesses")
    .select("name, slug")
    .eq("id", customer.business_id)
    .single();

  const { data: card } = await supabase
    .from("loyalty_cards")
    .select("title, stamps_required, reward_text, color_primary, color_background, text_color, logo_url")
    .eq("business_id", customer.business_id)
    .maybeSingle();

  return NextResponse.json({ customer, business, card });
}
