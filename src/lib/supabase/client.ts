import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente de Supabase para usar en el NAVEGADOR (componentes "use client").
 * Usa la clave pública (anon), que es segura de exponer porque
 * la seguridad real la garantiza RLS en la base de datos.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
