import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const { businessId, name, email, phone } = await req.json();

  if (!businessId || !name || !email || !phone) {
    return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Si ya existe el cliente en este negocio, devolver el existente
  const { data: existing } = await supabase
    .from("end_customers")
    .select("id, current_stamps, rewards_redeemed")
    .eq("business_id", businessId)
    .eq("email", email.toLowerCase().trim())
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ customerId: existing.id, isNew: false });
  }

  const { data, error } = await supabase
    .from("end_customers")
    .insert({
      business_id: businessId,
      full_name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ customerId: data.id, isNew: true });
}
