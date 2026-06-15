import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import { EnrollmentForm } from "./EnrollmentForm";

export default async function EnrollPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = createAdminClient();

  const { data: business } = await supabase
    .from("businesses")
    .select("id, name")
    .eq("slug", slug)
    .single();

  if (!business) notFound();

  const { data: card } = await supabase
    .from("loyalty_cards")
    .select("*")
    .eq("business_id", business.id)
    .eq("is_active", true)
    .maybeSingle();

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: card?.color_background ?? "#0E0E10" }}>
      <div className="w-full max-w-sm">
        {/* Card preview */}
        <div
          className="mb-6 rounded-2xl p-5 shadow-2xl"
          style={{
            backgroundColor: card?.color_background ?? "#0E0E10",
            color: card?.color_text ?? "#F5F4F2",
            border: `2px solid ${card?.color_primary ?? "#FF2E63"}`,
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            {card?.logo_url ? (
              <img src={card.logo_url} alt="Logo" className="h-10 w-10 rounded-lg object-contain" />
            ) : (
              <div className="h-10 w-10 rounded-lg flex items-center justify-center font-bold"
                style={{ backgroundColor: card?.color_primary ?? "#FF2E63", color: card?.color_background ?? "#0E0E10" }}>
                {business.name[0]}
              </div>
            )}
            <div>
              <p className="font-bold text-lg" style={{ color: card?.text_color ?? "#F5F4F2" }}>
                {card?.title ?? "Tarjeta de lealtad"}
              </p>
              <p className="text-xs opacity-60" style={{ color: card?.text_color ?? "#F5F4F2" }}>
                {business.name}
              </p>
            </div>
          </div>
          <p className="text-sm opacity-75 mb-3" style={{ color: card?.text_color ?? "#F5F4F2" }}>
            Junta <strong>{card?.stamps_required ?? 10} sellos</strong> y obtén:{" "}
            <strong>{card?.reward_text ?? "un premio"}</strong>
          </p>
          <div className="flex gap-1 flex-wrap">
            {Array.from({ length: card?.stamps_required ?? 10 }).map((_, i) => (
              <div key={i} className="h-6 w-6 rounded-full border-2"
                style={{ borderColor: card?.color_primary ?? "#FF2E63" }} />
            ))}
          </div>
        </div>

        {/* Enrollment form */}
        <div className="rounded-2xl bg-white p-6 shadow-2xl">
          <h1 className="text-xl font-bold text-gray-800 mb-1">Únete al programa</h1>
          <p className="text-sm text-gray-500 mb-5">
            Regístrate para empezar a acumular sellos.
          </p>
          <EnrollmentForm businessId={business.id} slug={slug} />
        </div>
      </div>
    </div>
  );
}
