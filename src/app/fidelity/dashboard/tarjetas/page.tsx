import { createClient } from "@/lib/supabase/server";
import { TarjetaEditor } from "./TarjetaEditor";
import type { LoyaltyCard } from "@/types/database";

/**
 * "Mis tarjetas de fidelidad" — el negocio personaliza el diseño
 * de su tarjeta (logo, colores, texto, sellos requeridos).
 */
export default async function TarjetasPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", user!.id)
    .single();

  // Buscar la tarjeta existente o preparar una nueva por defecto
  const { data: card } = await supabase
    .from("loyalty_cards")
    .select("*")
    .eq("business_id", business!.id)
    .maybeSingle();

  const initialCard: Partial<LoyaltyCard> = card ?? {
    business_id: business!.id,
    title: "Tarjeta de lealtad",
    color_primary: "#FF2E63",
    color_background: "#0E0E10",
    text_color: "#F5F4F2",
    stamps_required: 10,
    reward_text: "Un producto gratis",
  };

  return (
    <div className="animate-fade-up">
      <h1 className="text-3xl font-extrabold text-paper">Mis tarjetas de fidelidad</h1>
      <p className="mt-1 text-mist">
        Personaliza cómo se ve tu tarjeta en el wallet de tus clientes.
      </p>
      <div className="mt-8">
        <TarjetaEditor initialCard={initialCard} businessId={business!.id} />
      </div>
    </div>
  );
}
