import { createClient } from "@/lib/supabase/server";
import { TarjetasClient } from "./TarjetasClient";
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
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  return (
    <div className="animate-fade-up space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-paper">Mis tarjetas de fidelidad</h1>
        <p className="mt-1 text-mist">
          Diseña tu tarjeta y genera el QR para que tus clientes se registren.
        </p>
      </div>

      <TarjetasClient
        cards={(cards as LoyaltyCard[]) ?? []}
        businessId={business!.id}
        slug={business!.slug}
        appUrl={process.env.NEXT_PUBLIC_APP_URL ?? ""}
      />
    </div>
  );
}
