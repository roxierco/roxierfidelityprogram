import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Borra una promoción.
 *
 * El historial de envíos vive aparte en `push_notifications` y no referencia
 * la promo, así que borrarla no desaparece lo que ya se le mandó a los
 * clientes: solo la quita de la lista del panel.
 */
export async function DELETE(
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
    .select("id, business_id")
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

  const { error } = await admin.from("promotions").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
