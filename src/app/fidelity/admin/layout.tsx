import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Layout del panel de súper admin (solo para ti y tu equipo Roxier).
 * Verifica que el usuario esté en la tabla admin_users.
 * Si no es admin, lo saca del panel.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/fidelity/login");

  // Verificar que es admin
  const { data: admin } = await supabase
    .from("admin_users")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (!admin) redirect("/fidelity/dashboard");

  return <div className="min-h-screen bg-near-black">{children}</div>;
}
