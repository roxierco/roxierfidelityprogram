import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Cliente de Supabase para usar en el SERVIDOR (Server Components,
 * Route Handlers, Server Actions). Lee la sesión del usuario desde
 * las cookies de forma segura.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Esto puede fallar en Server Components (solo lectura).
            // El middleware se encarga de refrescar la sesión, así que es seguro ignorarlo.
          }
        },
      },
    },
  );
}

/**
 * Cliente ADMIN con privilegios totales (service role).
 * Usar SOLO en el servidor para operaciones internas (ej: webhooks).
 * NUNCA exponer al navegador. Salta RLS, así que úsalo con cuidado.
 */
export function createAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: { getAll: () => [], setAll: () => {} },
    },
  );
}
