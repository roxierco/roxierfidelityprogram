import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/fidelity/login");

  const admin = createAdminClient();
  const { data: business } = await admin
    .from("businesses")
    .select("id, name, status, trial_ends_at, logo_url")
    .eq("owner_id", user.id)
    .single();

  if (!business) redirect("/fidelity/login");

  const { data: subscription } = await admin
    .from("subscriptions")
    .select("status")
    .eq("business_id", business.id)
    .maybeSingle();

  const hasSubscription = subscription?.status === "authorized";

  return (
    <DashboardShell
      businessName={business.name}
      businessLogoUrl={(business as { logo_url?: string | null }).logo_url ?? null}
      businessStatus={business.status}
      trialEndsAt={business.trial_ends_at ?? null}
      hasSubscription={hasSubscription}
    >
      {children}
    </DashboardShell>
  );
}
