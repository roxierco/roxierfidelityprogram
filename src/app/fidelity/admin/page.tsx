import { createClient } from "@/lib/supabase/server";
import { formatMXN } from "@/lib/utils";
import { RoxierLogo } from "@/components/brand/XMark";
import { cerrarSesion } from "@/app/fidelity/(auth)/actions";

/**
 * Panel de súper admin.
 * Aquí TÚ ves todos tus clientes (negocios), su estado, su plan,
 * y cuántos clientes finales tiene cada uno.
 * RLS permite que el admin lea todo gracias a la función is_admin().
 */
export default async function AdminPanel() {
  const supabase = await createClient();

  // Cargar todos los negocios con conteo de clientes finales
  const { data: businesses } = await supabase
    .from("businesses")
    .select("id, name, email, status, plan, monthly_price, created_at")
    .order("created_at", { ascending: false });

  const list = businesses ?? [];

  // Conteo de clientes finales por negocio
  const customerCounts = await Promise.all(
    list.map(async (b) => {
      const { count } = await supabase
        .from("end_customers")
        .select("*", { count: "exact", head: true })
        .eq("business_id", b.id);
      return { businessId: b.id, count: count ?? 0 };
    }),
  );
  const countMap = new Map(customerCounts.map((c) => [c.businessId, c.count]));

  // Resumen general
  const totalNegocios = list.length;
  const activos = list.filter((b) => b.status === "active").length;
  const ingresoMensual = list
    .filter((b) => b.status === "active")
    .reduce((sum, b) => sum + b.monthly_price, 0);

  return (
    <div className="mx-auto max-w-6xl px-8 py-8">
      <header className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <RoxierLogo />
          <span className="rounded-full bg-magenta-muted px-3 py-1 text-xs font-bold text-magenta">
            ADMIN
          </span>
        </div>
        <form action={cerrarSesion}>
          <button className="text-sm font-semibold text-mist hover:text-paper">
            Cerrar sesión
          </button>
        </form>
      </header>

      {/* Resumen */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="card">
          <p className="text-sm text-mist">Total de clientes</p>
          <p className="mt-2 text-3xl font-extrabold text-paper">{totalNegocios}</p>
        </div>
        <div className="card">
          <p className="text-sm text-mist">Clientes activos</p>
          <p className="mt-2 text-3xl font-extrabold text-magenta">{activos}</p>
        </div>
        <div className="card">
          <p className="text-sm text-mist">Ingreso mensual recurrente</p>
          <p className="mt-2 text-3xl font-extrabold text-magenta">{formatMXN(ingresoMensual)}</p>
        </div>
      </div>

      {/* Tabla de negocios */}
      <h2 className="mb-4 text-xl font-extrabold text-paper">Mis clientes</h2>
      <div className="overflow-hidden rounded-brand-lg border border-surface-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface text-mist">
            <tr>
              <th className="px-4 py-3 font-semibold">Negocio</th>
              <th className="px-4 py-3 font-semibold">Plan</th>
              <th className="px-4 py-3 font-semibold">Clientes finales</th>
              <th className="px-4 py-3 font-semibold">Mensualidad</th>
              <th className="px-4 py-3 font-semibold">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {list.map((b) => (
              <tr key={b.id} className="text-paper">
                <td className="px-4 py-3">
                  <p className="font-semibold">{b.name}</p>
                  <p className="text-xs text-mist">{b.email}</p>
                </td>
                <td className="px-4 py-3 capitalize">{b.plan}</td>
                <td className="px-4 py-3 font-semibold">{countMap.get(b.id) ?? 0}</td>
                <td className="px-4 py-3">{formatMXN(b.monthly_price)}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={b.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && (
          <p className="px-4 py-8 text-center text-mist">Aún no tienes clientes registrados.</p>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-magenta-muted text-magenta",
    trial: "bg-surface-raised text-mist",
    suspended: "bg-surface-raised text-mist",
    cancelled: "bg-surface-raised text-mist",
  };
  const labels: Record<string, string> = {
    active: "Activo",
    trial: "Prueba",
    suspended: "Suspendido",
    cancelled: "Cancelado",
  };
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[status] ?? styles.trial}`}>
      {labels[status] ?? status}
    </span>
  );
}
