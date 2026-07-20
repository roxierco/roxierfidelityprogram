import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { BillingClient } from "./BillingClient";

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/fidelity/login");

  const admin = createAdminClient();
  const { data: business } = await admin
    .from("businesses")
    .select("id, name, status, plan, monthly_price, trial_ends_at")
    .eq("owner_id", user.id)
    .single();

  if (!business) redirect("/fidelity/login");

  const [{ data: subscription }, { count: sucursalCount }] = await Promise.all([
    admin
      .from("subscriptions")
      .select("status, amount, next_payment_at, mercadopago_subscription_id")
      .eq("business_id", business.id)
      .maybeSingle(),
    admin
      .from("sucursales")
      .select("*", { count: "exact", head: true })
      .eq("business_id", business.id)
      .eq("is_active", true),
  ]);

  return (
    <BillingClient
      business={business}
      subscription={subscription}
      paymentStatus={status}
      multiSucursal={(sucursalCount ?? 0) >= 4}
    />
  );
}
