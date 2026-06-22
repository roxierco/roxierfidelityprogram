import { MercadoPagoConfig, PreApproval } from "mercadopago";
import { getServerEnv } from "@/lib/env";

export const PLANS = {
  basico: { name: "Básico", amount: 549 },
  pro: { name: "Pro", amount: 749 },
} as const;

export type PlanKey = keyof typeof PLANS;

function getClient() {
  const env = getServerEnv();
  return new MercadoPagoConfig({ accessToken: env.MERCADOPAGO_ACCESS_TOKEN, options: { timeout: 10000 } });
}

export async function crearSuscripcion(params: {
  businessEmail: string;
  businessId: string;
  plan: PlanKey;
}): Promise<{ initPoint: string; subscriptionId: string }> {
  const env = getServerEnv();
  const preApproval = new PreApproval(getClient());
  const appUrl = env.NEXT_PUBLIC_APP_URL;
  const { name, amount } = PLANS[params.plan];

  const result = await preApproval.create({
    body: {
      reason: `Roxier Fidelity — Plan ${name}`,
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: amount,
        currency_id: "MXN",
        free_trial: { frequency: 7, frequency_type: "days" },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
      back_url: `${appUrl}/fidelity/dashboard/billing?status=subscribed`,
      payer_email: params.businessEmail,
      external_reference: `sub:${params.businessId}:${params.plan}`,
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
