import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { SucursalesClient } from "./SucursalesClient";
import type { Sucursal } from "@/types/database";

export default async function SucursalesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/fidelity/login");

  const admin = createAdminClient();
  const { data: business } = await admin
    .from("businesses")
    .select("id")
    .eq("owner_id", user.id)
    .single();
  if (!business) redirect("/fidelity/login");

  const { data: sucursales } = await admin
    .from("sucursales")
    .select("id, business_id, name, is_active, created_at")
    .eq("business_id", business.id)
    .order("created_at", { ascending: true });

  return (
    <SucursalesClient
      businessId={business.id}
      initialSucursales={(sucursales ?? []) as Sucursal[]}
    />
  );
}
