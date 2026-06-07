import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/dashboard/Sidebar";

/**
 * Layout del dashboard.
 * Verifica sesión y carga el negocio del usuario. Si no hay negocio,
 * algo salió mal en el registro, así que se manda a login.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/fidelity/login");

  const { data: business } = await supabase
    .from("businesses")
    .select("name")
    .eq("owner_id", user.id)
    .single();

  if (!business) redirect("/fidelity/login");

  return (
    <div className="flex min-h-screen bg-near-black">
      <Sidebar businessName={business.name} />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
