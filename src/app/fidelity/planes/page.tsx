import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PlanesClient } from "./PlanesClient";

export default async function PlanesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/fidelity/login");

  const { data: business } = await supabase
    .from("businesses")
    .select("status, trial_ends_at")
    .eq("owner_id", user.id)
    .single();

  // Días que le quedan de prueba (los mismos que respetamos en el cobro).
  const diasRestantes =
    business?.status === "trial" && business.trial_ends_at
      ? Math.max(0, Math.ceil((new Date(business.trial_ends_at).getTime() - Date.now()) / 86_400_000))
      : 0;

  // Si todavía tiene prueba activa puede volver al dashboard; si ya venció, no
  // tiene a dónde volver (el middleware lo regresaría aquí).
  const pruebaActiva = diasRestantes > 0;

  return <PlanesClient diasRestantes={diasRestantes} pruebaActiva={pruebaActiva} />;
}
