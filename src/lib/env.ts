import { z } from "zod";

/**
 * Validación de variables de entorno.
 *
 * Esto previene un error de seguridad muy común: arrancar la app
 * con configuración incompleta. Si falta una variable crítica,
 * la app falla de inmediato con un mensaje claro, en vez de
 * comportarse de forma extraña o insegura en producción.
 */
const serverEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  MERCADOPAGO_ACCESS_TOKEN: z.string().min(1),
  MERCADOPAGO_WEBHOOK_SECRET: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url(),
});

const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url(),
});

/**
 * Lee y valida las variables del servidor.
 * Llamar solo desde código que corre en el servidor.
 */
export function getServerEnv() {
  const parsed = serverEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error("Error de configuración (variables de entorno):", parsed.error.flatten().fieldErrors);
    throw new Error("Faltan variables de entorno del servidor. Revisa tu archivo .env.local o la configuración en Vercel.");
  }
  return parsed.data;
}

/**
 * Lee y valida las variables públicas (seguras para el navegador).
 */
export function getClientEnv() {
  const parsed = clientEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY: process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  });
  if (!parsed.success) {
    throw new Error("Faltan variables de entorno públicas.");
  }
  return parsed.data;
}
