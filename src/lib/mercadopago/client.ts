import { MercadoPagoConfig, PreApproval } from "mercadopago";
import { getServerEnv } from "@/lib/env";

/**
 * Cliente de Mercado Pago (solo servidor).
 *
 * Usamos "PreApproval" (suscripciones) porque tu modelo es cobro
 * mensual recurrente a cada negocio. Mercado Pago cobra automáticamente
 * cada mes a la tarjeta del cliente.
 */
function getClient() {
  const env = getServerEnv();
  return new MercadoPagoConfig({
    accessToken: env.MERCADOPAGO_ACCESS_TOKEN,
    options: { timeout: 10000 },
  });
}

/**
 * Crea una suscripción mensual para un negocio.
 * Devuelve la URL a la que se redirige al cliente para autorizar el pago.
 */
export async function crearSuscripcion(params: {
  businessEmail: string;
  monthlyPrice: number;
  businessId: string;
}): Promise<{ initPoint: string; subscriptionId: string }> {
  const env = getServerEnv();
  const preApproval = new PreApproval(getClient());

  const result = await preApproval.create({
    body: {
      reason: `Roxier Fidelity — Suscripción mensual`,
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: params.monthlyPrice,
        currency_id: "MXN",
      },
      back_url: `${env.NEXT_PUBLIC_APP_URL}/fidelity/dashboard?pago=exitoso`,
      payer_email: params.businessEmail,
      // Guardamos el ID del negocio para identificarlo en el webhook
      external_reference: params.businessId,
      status: "pending",
    },
  });

  if (!result.init_point || !result.id) {
    throw new Error("Mercado Pago no devolvió una URL de pago válida.");
  }

  return {
    initPoint: result.init_point,
    subscriptionId: result.id,
  };
}

/**
 * Consulta el estado de una suscripción en Mercado Pago.
 */
export async function consultarSuscripcion(subscriptionId: string) {
  const preApproval = new PreApproval(getClient());
  return await preApproval.get({ id: subscriptionId });
}
