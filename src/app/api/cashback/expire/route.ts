export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Expira saldo de cashback vencido. Lo dispara el Vercel Cron (ver vercel.json).
 * Protegido con CRON_SECRET: Vercel manda el header Authorization: Bearer <CRON_SECRET>.
 *
 * Política actual (simple): si la tarjeta define vigencia y el cliente no acumula
 * ni redime desde hace más de esa vigencia, su saldo se pone en cero. La vigencia
 * FIFO por transacción queda para una segunda iteración si el negocio la pide.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
  }

  const admin = createAdminClient();
  const { data, error } = await admin.rpc("expire_cashback");

  if (error) {
    console.error("expire_cashback failed", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, expired: data ?? 0 });
}
