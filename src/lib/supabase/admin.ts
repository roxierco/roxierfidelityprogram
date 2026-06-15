import { createClient } from "@supabase/supabase-js";

/** Cliente con service_role — bypasa RLS. Solo usar en rutas de servidor. */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}
