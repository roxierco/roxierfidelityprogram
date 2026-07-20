import { MercadoPagoConfig, PreApproval } from "mercadopago";
import { getServerEnv } from "@/lib/env";

/**
 * Planes de Roxier Fidelity. Todos son el mismo producto; cambia el período
 * de cobro. `frequency` es cada cuántos meses cobra Mercado Pago de forma
 * automática y recurrente.
 *   - mensual:   $749 cada mes
 *   - semestral: $3,999 cada 6 meses  (~$666/mes · ahorras ~11%)
 *   - anual:     $7,490 cada 12 meses (~$624/mes · "2 meses gratis" · ~17%)
 */
export const PLANS = {
  mensual:   { name: "Mensual", amount: 749,  frequency: 1,  period: "mes" },
  semestral: { name: "6 meses", amount: 3999, frequency: 6,  period: "6 meses" },
  anual:     { name: "Anual",   amount: 7490, frequency: 12, period: "año" },
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
  const { name, amount, frequency } = PLANS[params.plan];

  const result = await preApproval.create({
    body: {
      reason: `Roxier Fidelity — Plan ${name}`,
      auto_recurring: {
        frequency,
        frequency_type: "months",
        transaction_amount: amount,
        currency_id: "MXN",
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
