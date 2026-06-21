import { MercadoPagoConfig, Preference, PreApproval } from "mercadopago";
import { getServerEnv } from "@/lib/env";

export const MP_PRICES = { setup: 1499, monthly: 449 } as const;

function getClient() {
  const env = getServerEnv();
  return new MercadoPagoConfig({ accessToken: env.MERCADOPAGO_ACCESS_TOKEN, options: { timeout: 10000 } });
}

export async function crearCheckoutInicial(params: {
  businessEmail: string;
  businessId: string;
}): Promise<{ initPoint: string }> {
  const env = getServerEnv();
  const preference = new Preference(getClient());
  const appUrl = env.NEXT_PUBLIC_APP_URL;

  const result = await preference.create({
    body: {
      items: [{
        id: "roxier-activacion",
        title: "Activación Roxier Fidelity",
        description: "Pago inicial + primer mes incluido",
        quantity: 1,
        unit_price: MP_PRICES.setup,
        currency_id: "MXN",
      }],
      payer: { email: params.businessEmail },
      back_urls: {
        success: `${appUrl}/fidelity/dashboard/billing?status=success`,
        failure: `${appUrl}/fidelity/dashboard/billing?status=failure`,
        pending: `${appUrl}/fidelity/dashboard/billing?status=pending`,
      },
      auto_return: "approved",
      notification_url: `${appUrl}/api/mercadopago/webhook`,
      external_reference: `setup:${params.businessId}`,
      statement_descriptor: "ROXIER FIDELITY",
    },
  });

  if (!result.init_point) throw new Error("MP no devolvió URL de pago");
  return { initPoint: result.init_point };
}

export async function crearSuscripcion(params: {
  businessEmail: string;
  businessId: string;
}): Promise<{ initPoint: string; subscriptionId: string }> {
  const env = getServerEnv();
  const preApproval = new PreApproval(getClient());
  const appUrl = env.NEXT_PUBLIC_APP_URL;

  const result = await preApproval.create({
    body: {
      reason: "Roxier Fidelity — Mensualidad",
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: MP_PRICES.monthly,
        currency_id: "MXN",
      },
      back_url: `${appUrl}/fidelity/dashboard/billing?status=subscribed`,
      payer_email: params.businessEmail,
      external_reference: `sub:${params.businessId}`,
      status: "pending",
    },
  });

  if (!result.init_point || !result.id) throw new Error("MP no devolvió URL de suscripción");
  return { initPoint: result.init_point, subscriptionId: result.id };
}

export async function consultarSuscripcion(subscriptionId: string) {
  const preApproval = new PreApproval(getClient());
  return await preApproval.get({ id: subscriptionId });
}
