import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import { EnrollmentForm } from "./EnrollmentForm";

export default async function EnrollPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ card?: string }>;
}) {
  const { slug } = await params;
  const { card: cardId } = await searchParams;

  const supabase = createAdminClient();

  const { data: business } = await supabase
    .from("businesses")
    .select("id, name")
    .eq("slug", slug)
    .single();

  if (!business) notFound();

  // Si viene un cardId específico, usar esa tarjeta; si no, usar la primera activa
  let card = null;
  if (cardId) {
    const { data } = await supabase
      .from("loyalty_cards")
      .select("*")
      .eq("id", cardId)
      .eq("business_id", business.id)
      .single();
    card = data;
  }
  if (!card) {
    const { data } = await supabase
      .from("loyalty_cards")
      .select("*")
      .eq("business_id", business.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    card = data;
  }

  const primary = card?.color_primary ?? "#FF2E63";
  const bg = card?.color_background ?? "#0E0E10";
  const text = card?.text_color ?? "#F5F4F2";
  const cardType = card?.card_type ?? "sellos";

  // Cada tipo de tarjeta tiene su propia identidad — nada de "sellos" en las que no lo son.
  const subtitulo =
    cardType === "cashback" ? "Regístrate para empezar a acumular cashback." :
    cardType === "cupon" ? "Regístrate para obtener tu cupón." :
    cardType === "descuento" ? "Regístrate para obtener tu descuento." :
    "Regístrate para empezar a acumular sellos.";

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: bg }}>
      <div className="w-full max-w-sm">

        {/* Vista previa de la tarjeta del negocio */}
        <div className="mb-6 rounded-2xl p-5 shadow-2xl" style={{
          backgroundColor: bg,
          color: text,
          border: `2px solid ${primary}`,
        }}>
          <div className="flex items-center gap-3 mb-4">
            {card?.logo_url ? (
              <img src={card.logo_url} alt="Logo" className="h-10 w-10 rounded-lg object-contain" />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-lg font-bold"
                style={{ backgroundColor: primary, color: bg }}>
                {business.name[0]}
              </div>
            )}
            <div>
              <p className="font-bold text-lg">{card?.title ?? "Tarjeta de lealtad"}</p>
              <p className="text-xs" style={{ opacity: 0.6 }}>{business.name}</p>
            </div>
          </div>

          {cardType === "cashback" ? (
            <div className="rounded-xl p-4 text-center" style={{ backgroundColor: `${primary}1a` }}>
              <p className="text-2xl font-extrabold" style={{ color: primary }}>
                {card?.cashback_percent ?? 0}% de cashback
              </p>
              <p className="text-xs mt-1" style={{ opacity: 0.7 }}>
                Recibe saldo por cada compra que hagas
              </p>
            </div>
          ) : cardType === "cupon" ? (
            <div className="rounded-xl p-4 text-center" style={{ backgroundColor: `${primary}1a` }}>
              <p className="text-xl font-extrabold" style={{ color: primary }}>
                {card?.coupon_value ?? card?.reward_text ?? "Cupón especial"}
              </p>
              <p className="text-xs mt-1" style={{ opacity: 0.7 }}>Cupón de un solo uso</p>
            </div>
          ) : cardType === "descuento" ? (
            <div className="rounded-xl p-4 text-center" style={{ backgroundColor: `${primary}1a` }}>
              <p className="text-xl font-extrabold" style={{ color: primary }}>
                {card?.coupon_value ?? card?.reward_text ?? "Descuento especial"}
              </p>
              <p className="text-xs mt-1" style={{ opacity: 0.7 }}>Válido en cada visita</p>
            </div>
          ) : (
            <>
              <p className="text-sm mb-3" style={{ opacity: 0.75 }}>
                Junta <strong>{card?.stamps_required ?? 10} sellos</strong> y obtén:{" "}
                <strong>{card?.reward_text ?? "un premio especial"}</strong>
              </p>
              <div className="flex gap-1 flex-wrap">
                {Array.from({ length: card?.stamps_required ?? 10 }).map((_, i) => (
                  <div key={i} className="h-6 w-6 rounded-full border-2"
                    style={{ borderColor: primary }} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Formulario de registro */}
        <div className="rounded-2xl bg-white p-6 shadow-2xl">
          <h1 className="text-xl font-bold text-gray-800 mb-1">Únete al programa</h1>
          <p className="text-sm text-gray-500 mb-5">
            {subtitulo}
          </p>
          <EnrollmentForm businessId={business.id} slug={slug} cardId={cardId} />
        </div>
      </div>
    </div>
  );
}
