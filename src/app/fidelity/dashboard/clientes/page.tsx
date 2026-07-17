import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { ClientesClient } from "./ClientesClient";

export default async function ClientesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/fidelity/login");

  const admin = createAdminClient();
  const { data: business } = await admin
    .from("businesses")
    .select("id, slug")
    .eq("owner_id", user.id)
    .single();

  if (!business) redirect("/fidelity/login");

  const [{ data: customers }, { data: card }] = await Promise.all([
    admin
      .from("end_customers")
      .select("id, full_name, phone, email, current_stamps, total_visits, rewards_redeemed, last_visit_at, enrolled_at")
      .eq("business_id", business.id)
      .order("last_visit_at", { ascending: false, nullsFirst: false })
      .limit(500),
    admin
      .from("loyalty_cards")
      .select("id, stamps_required, title")
      .eq("business_id", business.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  return (
    <ClientesClient
      customers={customers ?? []}
      stampsRequired={card?.stamps_required ?? 10}
      cardId={card?.id ?? null}
      businessSlug={business.slug}
      appUrl={process.env.NEXT_PUBLIC_APP_URL ?? ""}
    />
  );
}
