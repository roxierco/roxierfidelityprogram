import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createHmac, timingSafeEqual } from "node:crypto";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { PLANS, TRIAL_DAYS, type PlanKey } from "@/lib/mercadopago/client";

type FirmaResultado = "ok" | "invalida" | "sin-secret";

function verifyMpSignature(req: NextRequest, dataId: string): FirmaResultado {
  const secret = process.env.MP_WEBHOOK_SECRET;
  // Sin secreto configurado no podemos verificar. NO fingimos que es válida:
  // se marca aparte para que el POST decida, apoyándose en la reconsulta a MP.
  if (!secret) return "sin-secret";

  const xSignature = req.headers.get("x-signature") ?? "";
  const tsMatch = xSignature.match(/ts=(\d+)/);
  const v1Match = xSignature.match(/v1=([a-f0-9]+)/);
  if (!tsMatch || !v1Match) return "invalida";

  const ts = tsMatch[1];
  const recibido = v1Match[1];

  // Mensaje firmado por MercadoPago: id:{id};request-date:{ts};
  const message = `id:${dataId};request-date:${ts};`;
  const esperado = createHmac("sha256", secret).update(message).digest("hex");

  // Comparación en tiempo constante para no filtrar la firma por timing.
  const a = Buffer.from(recibido, "hex");
  const b = Buffer.from(esperado, "hex");
  if (a.length !== b.length) return "invalida";
  return timingSafeEqual(a, b) ? "ok" : "invalida";
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

    // Verificación de firma. Con secreto configurado, una firma inválida se
    // rechaza de inmediato. Sin secreto, se registra la advertencia y se
    // continúa: la reconsulta a la API de MercadoPago (con el token privado,
    // más abajo) es la barrera real — solo actuamos sobre pagos/suscripciones
    // que existen de verdad en la cuenta del negocio.
    if (data?.id) {
      const firma = verifyMpSignature(req, data.id);
      if (firma === "invalida") {
        console.warn("MP webhook: firma inválida — rechazado");
        return NextResponse.json({ ok: true }); // 200 para que MP no reintente
      }
      if (firma === "sin-secret") {
        console.warn("MP webhook: MP_WEBHOOK_SECRET no configurado — configúralo en Vercel para verificar firmas.");
      }
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
      // Monto real cobrado por MP (respeta la tarifa multi-sucursal si aplicó);
      // si no viene, cae al precio base del plan.
      const amount = Number(sub.auto_recurring?.transaction_amount ?? plan.amount);

      if (sub.status === "authorized") {
        // Con prueba gratis, el PRIMER cobro es al terminar los 7 días;
        // después ya se cobra cada período del plan. MP nos dice la fecha
        // real del próximo cobro, así que la usamos si viene.
        const primerCobro = new Date();
        if (sub.next_payment_date) {
          primerCobro.setTime(new Date(sub.next_payment_date).getTime());
        } else {
          primerCobro.setDate(primerCobro.getDate() + TRIAL_DAYS);
        }

        await admin.from("businesses").update({
          status: "active",
          plan: "pro", // el tier del producto es siempre "pro"; el plan solo cambia el período de cobro
          monthly_price: amount,
          trial_ends_at: primerCobro.toISOString(),
        }).eq("id", businessId);

        await admin.from("subscriptions").upsert({
          business_id: businessId,
          mercadopago_subscription_id: sub.id,
          status: "authorized",
          amount,
          next_payment_at: primerCobro.toISOString(),
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
