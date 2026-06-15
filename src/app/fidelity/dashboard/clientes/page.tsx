import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { EndCustomer } from "@/types/database";

export default async function ClientesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Usamos admin client para que RLS no filtre los end_customers
  const admin = createAdminClient();

  const { data: business } = await admin
    .from("businesses")
    .select("id")
    .eq("owner_id", user!.id)
    .single();

  const { data: customers } = await admin
    .from("end_customers")
    .select("*")
    .eq("business_id", business!.id)
    .order("enrolled_at", { ascending: false });

  const list = (customers ?? []) as EndCustomer[];

  return (
    <div className="animate-fade-up space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-paper">Clientes</h1>
          <p className="mt-1 text-mist">
            {list.length === 0
              ? "Todavía no hay clientes registrados."
              : `${list.length} cliente${list.length !== 1 ? "s" : ""} registrado${list.length !== 1 ? "s" : ""}`}
          </p>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="rounded-brand-lg border border-surface-border bg-surface p-10 text-center">
          <div className="text-4xl mb-3">👥</div>
          <p className="text-paper font-semibold mb-1">Aún no hay clientes</p>
          <p className="text-sm text-mist">
            Comparte el QR de tu tarjeta desde la sección <strong className="text-paper">Tarjetas</strong> para que tus clientes se registren.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-brand-lg border border-surface-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface text-mist border-b border-surface-border">
              <tr>
                <th className="px-4 py-3 font-semibold">Nombre</th>
                <th className="px-4 py-3 font-semibold">Teléfono</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold text-center">Sellos</th>
                <th className="px-4 py-3 font-semibold text-center">Visitas</th>
                <th className="px-4 py-3 font-semibold text-center">Premios</th>
                <th className="px-4 py-3 font-semibold">Registrado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {list.map((c) => (
                <tr key={c.id} className="text-paper hover:bg-surface-raised transition-colors">
                  <td className="px-4 py-3 font-semibold">{c.full_name}</td>
                  <td className="px-4 py-3 text-mist">{c.phone ?? "—"}</td>
                  <td className="px-4 py-3 text-mist text-xs">{c.email ?? "—"}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-block rounded-full bg-magenta/10 px-2 py-0.5 text-xs font-bold text-magenta">
                      {c.current_stamps}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-mist">{c.total_visits}</td>
                  <td className="px-4 py-3 text-center">
                    {c.rewards_redeemed > 0 ? (
                      <span className="inline-block rounded-full bg-yellow-400/10 px-2 py-0.5 text-xs font-bold text-yellow-400">
                        🎉 {c.rewards_redeemed}
                      </span>
                    ) : (
                      <span className="text-mist">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-mist">
                    {new Date(c.enrolled_at).toLocaleDateString("es-MX", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
