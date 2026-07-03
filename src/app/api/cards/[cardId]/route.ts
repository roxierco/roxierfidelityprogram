import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ cardId: string }> },
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { cardId } = await params;
  if (!UUID.test(cardId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  const admin = createAdminClient();

  // Verificar que la tarjeta pertenece a un negocio del usuario autenticado
  const { data: card } = await admin
    .from("loyalty_cards")
    .select("id, business_id")
    .eq("id", cardId)
    .single();

  if (!card) return NextResponse.json({ error: "Tarjeta no encontrada" }, { status: 404 });

  const { data: business } = await admin
    .from("businesses")
    .select("id")
    .eq("id", card.business_id)
    .eq("owner_id", user.id)
    .single();

  if (!business) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  // Soft delete: desactivar en lugar de borrar para preservar historial de visitas
  const { error } = await admin
    .from("loyalty_cards")
    .update({ is_active: false })
    .eq("id", cardId);

  if (error) return NextResponse.json({ error: "Error al eliminar" }, { status: 500 });

  return NextResponse.json({ ok: true });
}
