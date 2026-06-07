import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/server";
import { consultarSuscripcion } from "@/lib/mercadopago/client";
import { getServerEnv } from "@/lib/env";

/**
 * POST /api/mercadopago/webhook
 *
 * Mercado Pago llama a esta URL cuando pasa algo con un pago
 * (autorizado, cancelado, etc.). Aquí actualizamos el estado del
 * negocio en nuestra base de datos.
 *
 * SEGURIDAD CRÍTICA: validamos la firma para asegurarnos de que
 * la petición viene REALMENTE de Mercado Pago y no de un atacante.
 */
export async function POST(request: NextRequest) {
  try {
    const env = getServerEnv();
    const body = await request.text();

    // --- Validar la firma del webhook (anti-falsificación) ---
    const signature = request.headers.get("x-signature") ?? "";
    const requestId = request.headers.get("x-request-id") ?? "";
    const url = new URL(request.url);
    const dataId = url.searchParams.get("data.id") ?? "";

    if (!verificarFirma(signature, requestId, dataId, env.MERCADOPAGO_WEBHOOK_SECRET)) {
      console.warn("Webhook con firma inválida — petición rechazada.");
      return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
    }

    const payload = JSON.parse(body) as {
      type?: string;
      data?: { id?: string };
    };

    // Solo nos interesan eventos de suscripción
    if (payload.type !== "subscription_preapproval" || !payload.data?.id) {
      return NextResponse.json({ received: true });
    }

    // Consultar el estado real en Mercado Pago (no confiar solo en el payload)
    const subscription = await consultarSuscripcion(payload.data.id);
    const businessId = subscription.external_reference;
    const mpStatus = subscription.status; // "authorized", "paused", "cancelled"...

    if (!businessId) {
      return NextResponse.json({ received: true });
    }

    // Usamos el cliente ADMIN porque el webhook no tiene sesión de usuario
    const admin = createAdminClient();

    // Mapear el estado de Mercado Pago al estado de nuestro negocio
    const businessStatus =
      mpStatus === "authorized" ? "active" :
      mpStatus === "cancelled" ? "cancelled" :
      mpStatus === "paused" ? "suspended" : "trial";

    await admin
      .from("subscriptions")
      .update({ status: mpStatus === "authorized" ? "authorized" : mpStatus })
      .eq("mercadopago_subscription_id", payload.data.id);

    await admin
      .from("businesses")
      .update({ status: businessStatus })
      .eq("id", businessId);

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Error en webhook de Mercado Pago:", err);
    // Devolvemos 200 para que MP no reintente infinitamente por un error nuestro
    return NextResponse.json({ received: true });
  }
}

/**
 * Verifica la firma HMAC del webhook según el formato de Mercado Pago.
 */
function verificarFirma(
  signature: string,
  requestId: string,
  dataId: string,
  secret: string,
): boolean {
  try {
    // El header viene como: "ts=1234567890,v1=abcdef..."
    const parts = Object.fromEntries(
      signature.split(",").map((p) => p.split("=").map((s) => s.trim())),
    );
    const ts = parts["ts"];
    const hash = parts["v1"];
    if (!ts || !hash) return false;

    const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
    const computed = crypto
      .createHmac("sha256", secret)
      .update(manifest)
      .digest("hex");

    // Comparación segura contra ataques de tiempo
    return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(hash));
  } catch {
    return false;
  }
}
