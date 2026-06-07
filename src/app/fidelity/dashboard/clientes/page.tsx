import { createClient } from "@/lib/supabase/server";
import type { EndCustomer } from "@/types/database";

/**
 * Lista de clientes finales del negocio.
 * Muestra los datos capturados: nombre, teléfono, email, sellos, visitas.
 */
export default async function ClientesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", user!.id)
    .single();

  const { data: customers } = await supabase
    .from("end_customers")
    .select("*")
    .eq("business_id", business!.id)
    .order("enrolled_at", { ascending: false });

  const list = (customers ?? []) as EndCustomer[];

  return (
    <div className="animate-fade-up">
      <h1 className="text-3xl font-extrabold text-paper">Clientes</h1>
      <p className="mt-1 text-mist">
        Personas que tienen tu tarjeta de lealtad.
      </p>

      {list.length === 0 ? (
        <div className="card mt-8 text-center">
          <p className="text-mist">
            Todavía no hay clientes registrados. Comparte tu código QR para empezar.
          </p>
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-brand-lg border border-surface-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface text-mist">
              <tr>
                <th className="px-4 py-3 font-semibold">Nombre</th>
                <th className="px-4 py-3 font-semibold">Contacto</th>
                <th className="px-4 py-3 font-semibold">Sellos</th>
                <th className="px-4 py-3 font-semibold">Visitas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {list.map((c) => (
                <tr key={c.id} className="text-paper">
                  <td className="px-4 py-3 font-semibold">{c.full_name}</td>
                  <td className="px-4 py-3 text-mist">{c.phone ?? c.email ?? "—"}</td>
                  <td className="px-4 py-3">{c.current_stamps}</td>
                  <td className="px-4 py-3">{c.total_visits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
