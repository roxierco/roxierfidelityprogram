import { MercadoPagoConfig, PreApproval } from "mercadopago";
import { getServerEnv } from "@/lib/env";

/**
 * Planes de Roxier Fidelity. Todos son el mismo producto; cambia el período
 * de cobro. `frequency` es cada cuántos meses cobra Mercado Pago de forma
 * automática y recurrente.
 *   - amount:     precio con hasta 3 sucursales.
 *   - amountPlus: precio con 4 o más sucursales (multi-sucursal).
 */
export const PLANS = {
  mensual:   { name: "Mensual", frequency: 1,  period: "mes",     amount: 749,  amountPlus: 999 },
  semestral: { name: "6 meses", frequency: 6,  period: "6 meses", amount: 3999, amountPlus: 5299 },
  anual:     { name: "Anual",   frequency: 12, period: "año",     amount: 7490, amountPlus: 9990 },
} as const;

export type PlanKey = keyof typeof PLANS;

/** Días de prueba gratis, tanto sin tarjeta (registro) como con tarjeta (Mercado Pago). */
export const TRIAL_DAYS = 7;

/** Precio del plan según la cantidad de sucursales (4+ = tarifa multi-sucursal). */
export function precioPlan(plan: PlanKey, sucursalCount: number): number {
  return sucursalCount >= 4 ? PLANS[plan].amountPlus : PLANS[plan].amount;
}

function getClient() {
  const env = getServerEnv();
  return new MercadoPagoConfig({ accessToken: env.MERCADOPAGO_ACCESS_TOKEN, options: { timeout: 10000 } });
}

export async function crearSuscripcion(params: {
  businessEmail: string;
  businessId: string;
  plan: PlanKey;
  sucursalCount?: number;
  /**
   * Días que le QUEDAN de su prueba gratis (la que arranca al registrarse).
   * Se los respetamos en Mercado Pago para que la prueba total siga siendo
   * de 7 días desde el registro — no 7 días extra por poner la tarjeta.
   */
  trialDaysRemaining?: number;
}): Promise<{ initPoint: string; subscriptionId: string }> {
  const env = getServerEnv();
  const preApproval = new PreApproval(getClient());
  const appUrl = env.NEXT_PUBLIC_APP_URL;
  const { name, frequency } = PLANS[params.plan];
  const amount = precioPlan(params.plan, params.sucursalCount ?? 0);

  const diasGratis = Math.min(Math.max(Math.floor(params.trialDaysRemaining ?? 0), 0), TRIAL_DAYS);

  const result = await preApproval.create({
    body: {
      reason: `Roxier Fidelity — Plan ${name}`,
      auto_recurring: {
        frequency,
        frequency_type: "months",
        transaction_amount: amount,
        currency_id: "MXN",
        // Solo se le regalan los días que le falten de su prueba. Si ya se le
        // acabó, se cobra de inmediato (sin free_trial).
        ...(diasGratis > 0
          ? { free_trial: { frequency: diasGratis, frequency_type: "days" } }
          : {}),
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
