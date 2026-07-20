import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createHmac } from "node:crypto";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { PLANS, type PlanKey } from "@/lib/mercadopago/client";

function verifyMpSignature(req: NextRequest, rawBody: string, dataId: string): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) return true; // si no está configurado, se omite la verificación

  const xSignature = req.headers.get("x-signature") ?? "";
  const xRequestId = req.headers.get("x-request-id") ?? "";

  const tsMatch = xSignature.match(/ts=(\d+)/);
  const v1Match = xSignature.match(/v1=([a-f0-9]+)/);
  if (!tsMatch || !v1Match) return false;

  const ts = tsMatch[1];
  const expected = v1Match[1];

  // Mensaje firmado por MercadoPago: id:{id};request-date:{ts};
  const message = `id:${dataId};request-date:${ts};`;
  const hmac = createHmac("sha256", secret).update(message).digest("hex");

  return hmac === expected;
  void rawBody; void xRequestId;
}

export async function POST(req: NextRequest) {
  // MercadoPago no tiene IPs fijas, pero limitamos para prevenir DoS
  if (!rateLimit(getClientIp(req), "mp-webhook", 200, 60 * 1000)) {
    return NextResponse.json({ ok: true }, { status: 429 });
  }

  try {
    const rawBody = await req.text();
    const body = JSON.parse(rawBody) as { type?: string; data?: { id?: string } };
    const { type, data } = body;

    // Verificar firma si el secret está configurado
    if (data?.id && !verifyMpSignature(req, rawBody, data.id)) {
      console.warn("MP webhook: firma inválida");
      return NextResponse.json({ ok: true }); // 200 para que MP no reintente
    }

    const token = process.env.MP_ACCESS_TOKEN || process.env.MP_ACCESS_TOKEN_TEST;
    if (!token) return NextResponse.json({ ok: true });

    const admin = createAdminClient();

    // ── Pago único (activación $1,499) ──────────────────────────────
    if (type === "payment" && data?.id) {
      const res = await fetch(`https://api.mercadopago.com/v1/payments/${data.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const payment = await res.json();

      if (payment.status === "approved" && payment.external_reference?.startsWith("setup:")) {
        const businessId = payment.external_reference.replace("setup:", "");
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1);

        await admin.from("businesses").update({
          status: "active",
          plan: "pro",
          monthly_price: 449,
          trial_ends_at: expiresAt.toISOString(),
        }).eq("id", businessId);
      }
    }

    // ── Suscripción mensual ($449) ──────────────────────────────────
    if ((type === "preapproval" || type === "subscription_preapproval") && data?.id) {
      const res = await fetch(`https://api.mercadopago.com/preapproval/${data.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const sub = await res.json();
      const ref = sub.external_reference as string | undefined;
      if (!ref) return NextResponse.json({ ok: true });

      const [, businessId, planKey] = ref.split(":");
      const plan = PLANS[planKey as PlanKey] ?? PLANS.mensual;
      const amount = plan.amount;

      if (sub.status === "authorized") {
        // Próximo cobro = ahora + el período del plan (1, 6 o 12 meses).
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + plan.frequency);

        await admin.from("businesses").update({
          status: "active",
          plan: "pro", // el tier del producto es siempre "pro"; el plan solo cambia el período de cobro
          monthly_price: amount,
          trial_ends_at: expiresAt.toISOString(),
        }).eq("id", businessId);

        await admin.from("subscriptions").upsert({
          business_id: businessId,
          mercadopago_subscription_id: sub.id,
          status: "authorized",
          amount,
          next_payment_at: expiresAt.toISOString(),
        }, { onConflict: "business_id" });

      } else if (sub.status === "cancelled") {
        await admin.from("businesses").update({ status: "suspended" }).eq("id", businessId);
        await admin.from("subscriptions").update({ status: "cancelled" })
          .eq("mercadopago_subscription_id", sub.id);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("MP webhook error:", err);
    return NextResponse.json({ ok: true }); // siempre 200 para que MP no reintente
  }
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
