import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ScannerClient } from "./ScannerClient";

export default async function ScannerPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/fidelity/login");

  const { data: business } = await supabase
    .from("businesses")
    .select("id, name")
    .eq("owner_id", user.id)
    .single();

  if (!business) redirect("/fidelity/dashboard");

  const { data: sucursales } = await supabase
    .from("sucursales")
    .select("id, name")
    .eq("business_id", business.id)
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  return (
    <div className="animate-fade-up">
      <h1 className="text-3xl font-extrabold text-paper">Escáner de sellos</h1>
      <p className="mt-1 text-mist">
        Apunta la cámara al código QR del cliente para registrar su visita.
      </p>
      <div className="mt-8">
        <Suspense fallback={null}>
          <ScannerClient
            businessId={business.id}
            businessName={business.name}
            sucursales={(sucursales ?? []) as { id: string; name: string }[]}
          />
        </Suspense>
      </div>
    </div>
  );
}
