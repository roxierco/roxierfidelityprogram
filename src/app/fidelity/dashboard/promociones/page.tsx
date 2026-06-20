import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PromocionesClient } from "./PromocionesClient";

export default async function PromocionesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const admin = createAdminClient();
  const { data: business } = await admin
    .from("businesses")
    .select("id")
    .eq("owner_id", user!.id)
    .single();

  const { data: promos } = await admin
    .from("promotions")
    .select("id, title, message, is_active, created_at")
    .eq("business_id", business!.id)
    .order("created_at", { ascending: false });

  return (
    <PromocionesClient
      promos={promos ?? []}
      businessId={business!.id}
    />
  );
}
