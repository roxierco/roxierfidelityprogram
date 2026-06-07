import { createClient } from "@/lib/supabase/server";
import { formatMXN } from "@/lib/utils";
import type { DashboardMetrics } from "@/types/database";

/**
 * Resumen del dashboard — las métricas que pediste:
 * total de clientes, visitas del mes, recompensas canjeadas,
 * nuevos vs recurrentes, e ingresos estimados.
 */
export default async function DashboardHome() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: business } = await supabase
    .from("businesses")
    .select("id, name, status, trial_ends_at")
    .eq("owner_id", user!.id)
    .single();

  const metrics = await calcularMetricas(supabase, business!.id);

  return (
    <div className="animate-fade-up">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-paper">Resumen</h1>
          <p className="mt-1 text-mist">Así va tu programa de lealtad.</p>
        </div>
        {business!.status === "trial" && (
          <span className="rounded-full bg-magenta-muted px-4 py-2 text-sm font-semibold text-magenta">
            Periodo de prueba activo
          </span>
        )}
      </div>

      {/* Tarjetas de métricas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard label="Clientes con tarjeta" value={metrics.totalCustomers.toString()} />
        <MetricCard label="Visitas este mes" value={metrics.visitsThisMonth.toString()} />
        <MetricCard label="Recompensas canjeadas" value={metrics.rewardsRedeemed.toString()} />
        <MetricCard label="Clientes nuevos (mes)" value={metrics.newCustomers.toString()} accent />
        <MetricCard label="Clientes recurrentes" value={metrics.returningCustomers.toString()} />
        <MetricCard label="Ingresos estimados" value={formatMXN(metrics.estimatedRevenue)} accent />
      </div>

      {metrics.totalCustomers === 0 && (
        <div className="card mt-8 text-center">
          <h3 className="text-lg font-bold text-paper">Aún no tienes clientes registrados</h3>
          <p className="mx-auto mt-2 max-w-md text-mist">
            Configura tu tarjeta en &quot;Mis tarjetas&quot; y comparte el código QR para que
            tus clientes empiecen a registrarse.
          </p>
        </div>
      )}
    </div>
  );
}

function MetricCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="card">
      <p className="text-sm text-mist">{label}</p>
      <p className={`mt-2 text-3xl font-extrabold ${accent ? "text-magenta" : "text-paper"}`}>
        {value}
      </p>
    </div>
  );
}

/**
 * Calcula las métricas del negocio a partir de los datos reales.
 * RLS garantiza que solo se leen los datos de ESTE negocio.
 */
async function calcularMetricas(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  businessId: string,
): Promise<DashboardMetrics> {
  const inicioMes = new Date();
  inicioMes.setDate(1);
  inicioMes.setHours(0, 0, 0, 0);

  const [
    { count: totalCustomers },
    { count: visitsThisMonth },
    { count: newCustomers },
    { data: customers },
    { data: business },
  ] = await Promise.all([
    supabase.from("end_customers").select("*", { count: "exact", head: true }).eq("business_id", businessId),
    supabase.from("visits").select("*", { count: "exact", head: true }).eq("business_id", businessId).gte("created_at", inicioMes.toISOString()),
    supabase.from("end_customers").select("*", { count: "exact", head: true }).eq("business_id", businessId).gte("enrolled_at", inicioMes.toISOString()),
    supabase.from("end_customers").select("rewards_redeemed, total_visits").eq("business_id", businessId),
    supabase.from("businesses").select("monthly_price").eq("id", businessId).single(),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rewardsRedeemed = (customers ?? []).reduce((sum: number, c: any) => sum + (c.rewards_redeemed ?? 0), 0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const returning = (customers ?? []).filter((c: any) => (c.total_visits ?? 0) > 1).length;

  // Ingreso estimado: regla simple (clientes recurrentes × ticket promedio supuesto).
  // Esto se afina con datos reales más adelante.
  const estimatedRevenue = returning * 150;

  return {
    totalCustomers: totalCustomers ?? 0,
    visitsThisMonth: visitsThisMonth ?? 0,
    rewardsRedeemed,
    newCustomers: newCustomers ?? 0,
    returningCustomers: returning,
    estimatedRevenue,
  };
}
