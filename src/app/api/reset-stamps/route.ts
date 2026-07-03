import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { businessId } = await req.json();
  if (!businessId) return NextResponse.json({ error: "Faltan datos" }, { status: 400 });

  const admin = createAdminClient();

  // Verificar que el negocio pertenece al usuario autenticado
  const { data: business } = await admin
    .from("businesses")
    .select("id")
    .eq("id", businessId)
    .eq("owner_id", user.id)
    .single();

  if (!business) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  await admin
    .from("end_customers")
    .update({ current_stamps: 0 })
    .eq("business_id", businessId);

  return NextResponse.json({ ok: true });
}
