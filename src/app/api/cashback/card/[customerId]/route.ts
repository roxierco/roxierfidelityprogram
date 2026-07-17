export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Consulta el saldo de cashback de un cliente + la config de su tarjeta.
 * Usado por la pantalla de escaneo antes de acumular/redimir.
 * GET /api/cashback/card/{customerId}?card={cardId}
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ customerId: string }> },
) {
  const { customerId } = await params;
  const cardId = new URL(req.url).searchParams.get("card");

  if (!uuidRegex.test(customerId) || !cardId || !uuidRegex.test(cardId)) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const admin = createAdminClient();

  const { data: customer } = await admin
    .from("end_customers")
    .select("id, full_name, cashback_balance, business_id")
    .eq("id", customerId)
    .single();

  if (!customer) return NextResponse.json({ error: "Tarjeta no encontrada" }, { status: 404 });

  // SEGURIDAD: el cliente debe pertenecer a un negocio del usuario autenticado.
  const { data: business } = await admin
    .from("businesses")
    .select("id")
    .eq("id", customer.business_id)
    .eq("owner_id", user.id)
    .single();
  if (!business) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const { data: card } = await admin
    .from("loyalty_cards")
    .select("id, card_type, cashback_percent, cashback_min_purchase, is_active")
    .eq("id", cardId)
    .eq("business_id", customer.business_id)
    .single();

  if (!card || card.card_type !== "cashback" || !card.is_active) {
    return NextResponse.json({ error: "Esta tarjeta no es de cashback" }, { status: 409 });
  }

  return NextResponse.json({
    customerId: customer.id,
    customerName: customer.full_name,
    balance: Number(customer.cashback_balance),
    businessId: customer.business_id,
    cashbackPercent: Number(card.cashback_percent),
    minPurchase: Number(card.cashback_min_purchase),
  });
}
