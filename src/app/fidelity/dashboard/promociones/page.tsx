import { createClient } from "@/lib/supabase/server";
import type { Promotion } from "@/types/database";

/**
 * Promociones del negocio. Pantalla base — la creación/edición
 * se conecta en la siguiente iteración.
 */
export default async function PromocionesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", user!.id)
    .single();

  const { data: promos } = await supabase
    .from("promotions")
    .select("*")
    .eq("business_id", business!.id)
    .order("created_at", { ascending: false });

  const list = (promos ?? []) as Promotion[];

  return (
    <div className="animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-paper">Promociones</h1>
          <p className="mt-1 text-mist">Crea ofertas para tus clientes.</p>
        </div>
        <button className="btn-primary !py-2 !px-5 text-sm">Nueva promoción</button>
      </div>

      {list.length === 0 ? (
        <div className="card mt-8 text-center">
          <p className="text-mist">Aún no has creado promociones.</p>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {list.map((p) => (
            <div key={p.id} className="card flex items-center justify-between">
              <div>
                <h3 className="font-bold text-paper">{p.title}</h3>
                <p className="text-sm text-mist">{p.message}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${p.is_active ? "bg-magenta-muted text-magenta" : "bg-surface-raised text-mist"}`}>
                {p.is_active ? "Activa" : "Inactiva"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
