import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, data } = body as { type?: string; data?: { id?: string } };
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
          plan: "basico",
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

      const businessId = ref.replace("sub:", "");

      if (sub.status === "authorized") {
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1);

        await admin.from("businesses").update({
          status: "active",
          trial_ends_at: expiresAt.toISOString(),
        }).eq("id", businessId);

        await admin.from("subscriptions").upsert({
          business_id: businessId,
          mercadopago_subscription_id: sub.id,
          status: "authorized",
          amount: 449,
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
