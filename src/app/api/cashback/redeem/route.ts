export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redeemCashbackSchema } from "@/lib/cashback/schemas";
import { logWalletEvent } from "@/lib/wallet-events";
import { notifyCashbackUpdate } from "@/lib/cashback/notify";

const ERROR_MAP: Record<string, { status: number; message: string }> = {
  CARD_NOT_FOUND: { status: 404, message: "Tarjeta no encontrada" },
  INSUFFICIENT_BALANCE: { status: 422, message: "Saldo insuficiente" },
  INVALID_REDEEM_AMOUNT: { status: 422, message: "Monto a redimir inválido" },
};

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const parsed = redeemCashbackSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }
  const { customerId, cardId, businessId, redeemAmount, idempotencyKey, sucursalId } = parsed.data;

  const admin = createAdminClient();

  const { data: business } = await admin
    .from("businesses")
    .select("id, slug")
    .eq("id", businessId)
    .eq("owner_id", user.id)
    .single();
  if (!business) return NextResponse.json({ error: "No autorizado para este negocio" }, { status: 403 });

  const { data, error } = await admin.rpc("redeem_cashback", {
    p_customer_id: customerId,
    p_card_id: cardId,
    p_business_id: businessId,
    p_redeem_amount: redeemAmount,
    p_created_by: user.id,
    p_idempotency_key: idempotencyKey,
  });

  if (error) {
    const mapped = ERROR_MAP[error.message];
    if (mapped) return NextResponse.json({ error: mapped.message }, { status: mapped.status });
    console.error("redeem_cashback failed", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }

  const result = Array.isArray(data) ? data[0] : data;
  const newBalance = Number(result.new_balance);

  if (sucursalId && result.transaction_id) {
    await admin.from("cashback_transactions").update({ sucursal_id: sucursalId }).eq("id", result.transaction_id);
  }

  const { data: customer } = await admin
    .from("end_customers")
    .select("full_name")
    .eq("id", customerId)
    .single();

  const serial = `${customerId}-${cardId}`;
  await logWalletEvent("cashback_redeemed", serial, undefined, {
    redeemed: redeemAmount,
    new_balance: newBalance,
  });

  await notifyCashbackUpdate({
    customerId,
    cardId,
    customerName: customer?.full_name ?? "",
    balance: newBalance,
    slug: business.slug,
    title: "Cashback aplicado",
    body: `Usaste $${redeemAmount.toFixed(2)} — Saldo restante: $${newBalance.toFixed(2)}`,
  });

  return NextResponse.json({ ok: true, balance: newBalance });
}
