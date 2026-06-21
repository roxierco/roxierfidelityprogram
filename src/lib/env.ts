import { z } from "zod";

const serverEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  // Acepta MP_ACCESS_TOKEN (producción) o MP_ACCESS_TOKEN_TEST
  MP_ACCESS_TOKEN: z.string().optional(),
  MP_ACCESS_TOKEN_TEST: z.string().optional(),
  MERCADOPAGO_WEBHOOK_SECRET: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url(),
});

export function getServerEnv() {
  const parsed = serverEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error("Variables de entorno faltantes:", parsed.error.flatten().fieldErrors);
    throw new Error("Faltan variables de entorno del servidor.");
  }
  const env = parsed.data;
  const token = env.MP_ACCESS_TOKEN || env.MP_ACCESS_TOKEN_TEST;
  if (!token) throw new Error("Falta MP_ACCESS_TOKEN en las variables de entorno.");
  return { ...env, MERCADOPAGO_ACCESS_TOKEN: token };
}

export function getClientEnv() {
  return {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? "",
  };
}
