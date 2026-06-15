import { createClient } from "@/lib/supabase/server";
import { TarjetasClient } from "./TarjetasClient";
import { EnrollmentQR } from "./EnrollmentQR";
import type { LoyaltyCard } from "@/types/database";

export default async function TarjetasPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: business } = await supabase
    .from("businesses")
    .select("id, slug")
    .eq("owner_id", user!.id)
    .single();

  const { data: cards } = await supabase
    .from("loyalty_cards")
    .select("*")
    .eq("business_id", business!.id)
    .order("created_at", { ascending: false });

  const enrollUrl = `${process.env.NEXT_PUBLIC_APP_URL}/c/${business!.slug}`;

  return (
    <div className="animate-fade-up space-y-10">
      <div>
        <h1 className="text-3xl font-extrabold text-paper">Mis tarjetas de fidelidad</h1>
        <p className="mt-1 text-mist">
          Personaliza cómo se ve tu tarjeta en el wallet de tus clientes.
        </p>
      </div>

      {/* QR de inscripción */}
      <EnrollmentQR enrollUrl={enrollUrl} slug={business!.slug} />

      {/* Editor de tarjetas */}
      <TarjetasClient
        cards={(cards as LoyaltyCard[]) ?? []}
        businessId={business!.id}
      />
    </div>
  );
}
