import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

// Este endpoint solo es accesible para negocios autenticados
export async function GET(_req: NextRequest, { params }: { params: Promise<{ customerId: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { customerId } = await params;

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(customerId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: customer } = await admin
    .from("end_customers")
    .select("id, full_name, current_stamps, total_visits, rewards_redeemed, business_id")
    .eq("id", customerId)
    .single();

  if (!customer) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  // Verificar que el negocio del cliente pertenece al usuario autenticado
  const { data: ownedBusiness } = await admin
    .from("businesses")
    .select("id, name, slug")
    .eq("id", customer.business_id)
    .eq("owner_id", user.id)
    .single();

  if (!ownedBusiness) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { data: card } = await admin
    .from("loyalty_cards")
    .select("title, stamps_required, reward_text, color_primary, color_background, text_color, logo_url")
    .eq("business_id", customer.business_id)
    .eq("is_active", true)
    .maybeSingle();

  return NextResponse.json({ customer, business: ownedBusiness, card });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ customerId: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { customerId } = await params;

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(customerId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  const admin = createAdminClient();

  // Verificar que el cliente pertenece a un negocio del usuario autenticado
  const { data: customer } = await admin
    .from("end_customers")
    .select("business_id")
    .eq("id", customerId)
    .single();

  if (!customer) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const { data: ownedBusiness } = await admin
    .from("businesses")
    .select("id")
    .eq("id", customer.business_id)
    .eq("owner_id", user.id)
    .single();

  if (!ownedBusiness) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const { error } = await admin
    .from("end_customers")
    .delete()
    .eq("id", customerId);

  if (error) return NextResponse.json({ error: "Error al eliminar" }, { status: 500 });

  return NextResponse.json({ ok: true });
}
