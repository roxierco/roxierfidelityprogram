export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { applyCashbackSchema } from "@/lib/cashback/schemas";
import { logWalletEvent } from "@/lib/wallet-events";
import { notifyCashbackUpdate } from "@/lib/cashback/notify";

const ERROR_MAP: Record<string, { status: number; message: string }> = {
  CARD_NOT_FOUND: { status: 404, message: "Tarjeta no encontrada" },
  CASHBACK_NOT_ENABLED: { status: 409, message: "El cashback no está activo para esta tarjeta" },
  BELOW_MIN_PURCHASE: { status: 422, message: "La compra no alcanza el mínimo para cashback" },
  INVALID_PURCHASE_AMOUNT: { status: 422, message: "Monto de compra inválido" },
};

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const parsed = applyCashbackSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }
  const { customerId, cardId, businessId, purchaseAmount, idempotencyKey } = parsed.data;

  const admin = createAdminClient();

  // SEGURIDAD: el negocio debe pertenecer al usuario autenticado.
  const { data: business } = await admin
    .from("businesses")
    .select("id, slug")
    .eq("id", businessId)
    .eq("owner_id", user.id)
    .single();
  if (!business) return NextResponse.json({ error: "No autorizado para este negocio" }, { status: 403 });

  // Lógica atómica en Postgres (idempotente, con FOR UPDATE).
  const { data, error } = await admin.rpc("apply_cashback", {
    p_customer_id: customerId,
    p_card_id: cardId,
    p_business_id: businessId,
    p_purchase_amount: purchaseAmount,
    p_created_by: user.id,
    p_idempotency_key: idempotencyKey,
  });

  if (error) {
    const mapped = ERROR_MAP[error.message];
    if (mapped) return NextResponse.json({ error: mapped.message }, { status: mapped.status });
    console.error("apply_cashback failed", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }

  const result = Array.isArray(data) ? data[0] : data;
  const newBalance = Number(result.new_balance);
  const earned = Number(result.earned);

  // Datos del cliente para la notificación.
  const { data: customer } = await admin
    .from("end_customers")
    .select("full_name")
    .eq("id", customerId)
    .single();

  const serial = `${customerId}-${cardId}`;
  await logWalletEvent("cashback_earned", serial, undefined, {
    earned,
    new_balance: newBalance,
    purchase_amount: purchaseAmount,
  });

  await notifyCashbackUpdate({
    customerId,
    cardId,
    customerName: customer?.full_name ?? "",
    balance: newBalance,
    slug: business.slug,
    title: "¡Ganaste cashback! 💰",
    body: `+$${earned.toFixed(2)} — Saldo total: $${newBalance.toFixed(2)}`,
  });

  return NextResponse.json({ ok: true, earned, balance: newBalance });
}
