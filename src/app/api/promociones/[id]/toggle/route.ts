import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const admin = createAdminClient();

  // Verificar que la promo es de este negocio
  const { data: promo } = await admin
    .from("promotions")
    .select("id, is_active, business_id")
    .eq("id", id)
    .single();
  if (!promo) return NextResponse.json({ error: "No encontrada" }, { status: 404 });

  const { data: biz } = await admin
    .from("businesses")
    .select("id")
    .eq("id", promo.business_id)
    .eq("owner_id", user.id)
    .single();
  if (!biz) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  await admin
    .from("promotions")
    .update({ is_active: !promo.is_active })
    .eq("id", id);

  return NextResponse.json({ is_active: !promo.is_active });
}
