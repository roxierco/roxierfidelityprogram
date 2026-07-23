import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { Icon } from "@/components/ui/Icon";
import { PixelRegistro } from "@/components/analytics/PixelRegistro";
import type { DashboardMetrics } from "@/types/database";

export default async function DashboardHome() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: business } = await supabase
    .from("businesses")
    .select("id, name, status, trial_ends_at")
    .eq("owner_id", user!.id)
    .single();

  const [metrics, visitsByDay, nearRewardCustomers] = await Promise.all([
    calcularMetricas(supabase, business!.id),
    calcularVisitasPorDia(supabase, business!.id),
    obtenerCercaDelPremio(supabase, business!.id),
  ]);

  return (
    <div className="animate-fade-up space-y-8">
      <Suspense fallback={null}>
        <PixelRegistro />
      </Suspense>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-paper">Resumen</h1>
          <p className="mt-1 text-mist">Así va tu programa de lealtad.</p>
        </div>
        {business!.status === "trial" && (
          <span className="rounded-full bg-magenta-muted px-4 py-2 text-sm font-semibold text-magenta">
            Periodo de prueba
          </span>
        )}
      </div>

      {/* Métricas principales */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard label="Clientes con tarjeta" value={metrics.totalCustomers.toString()} />
        <MetricCard label="Visitas este mes" value={metrics.visitsThisMonth.toString()} />
        <MetricCard label="Recompensas canjeadas" value={metrics.rewardsRedeemed.toString()} />
        <MetricCard label="Clientes nuevos (mes)" value={metrics.newCustomers.toString()} accent />
        <MetricCard label="Clientes recurrentes" value={metrics.returningCustomers.toString()} />
        <MetricCard
          label="Tasa de retención"
          value={metrics.totalCustomers > 0 ? `${Math.round((metrics.returningCustomers / metrics.totalCustomers) * 100)}%` : "—"}
          accent
        />
      </div>

      {/* Gráfica de visitas */}
      <VisitsChart data={visitsByDay} />

      {/* Clientes cerca del premio */}
      {nearRewardCustomers.length > 0 && (
        <div className="card space-y-3">
          <div className="flex items-center gap-2">
            <Icon name="diana" className="h-5 w-5 text-yellow-400" />
            <h2 className="font-bold text-paper">A 1 sello del premio</h2>
            <span className="ml-auto text-xs font-semibold text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-full">
              {nearRewardCustomers.length} cliente{nearRewardCustomers.length !== 1 ? "s" : ""}
            </span>
          </div>
          <p className="text-xs text-mist">Estos clientes están muy cerca — incentívalos a volver.</p>
          <div className="space-y-2">
            {nearRewardCustomers.slice(0, 5).map((c: { id: string; full_name: string; current_stamps: number }) => (
              <div key={c.id} className="flex items-center gap-3 rounded-xl bg-yellow-400/5 border border-yellow-400/20 px-3 py-2.5">
                <div className="h-8 w-8 rounded-full bg-yellow-400/20 flex items-center justify-center text-yellow-400 font-bold text-sm">
                  {c.full_name[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-paper truncate">{c.full_name}</p>
                  <p className="text-xs text-mist">{c.current_stamps} sellos acumulados</p>
                </div>
                <span className="text-xs font-bold text-yellow-400">1 falta</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {metrics.totalCustomers === 0 && (
        <div className="card text-center py-10">
          <Icon name="cohete" className="mx-auto mb-3 h-10 w-10 text-magenta" />
          <h3 className="text-lg font-bold text-paper">¡Todo listo para empezar!</h3>
          <p className="mx-auto mt-2 max-w-md text-mist text-sm">
            Ve a <strong className="text-paper">Mis tarjetas</strong> para configurar tu programa y comparte el QR con tus clientes.
          </p>
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="card">
      <p className="text-sm text-mist">{label}</p>
      <p className={`mt-2 text-3xl font-extrabold ${accent ? "text-magenta" : "text-paper"}`}>
        {value}
      </p>
    </div>
  );
}

interface DayData { date: string; count: number; label: string }

function VisitsChart({ data }: { data: DayData[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  const chartH = 72;

  return (
    <div className="card space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-paper">Visitas — últimos 14 días</h2>
        <span className="text-xs text-mist">{data.reduce((s, d) => s + d.count, 0)} en total</span>
      </div>
      <div className="relative" style={{ height: chartH + 28 }}>
        {/* Líneas guía */}
        {[0, 0.5, 1].map((f) => (
          <div
            key={f}
            className="absolute left-0 right-0 border-t border-surface-border"
            style={{ top: (1 - f) * chartH }}
          />
        ))}
        {/* Barras */}
        <div className="absolute inset-x-0 top-0 flex items-end gap-1" style={{ height: chartH }}>
          {data.map((d, i) => {
            const barH = max === 0 ? 0 : Math.max((d.count / max) * chartH, d.count > 0 ? 3 : 0);
            const isToday = i === data.length - 1;
            return (
              <div key={d.date} className="relative flex-1 flex flex-col justify-end group" style={{ height: chartH }}>
                {d.count > 0 && (
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center whitespace-nowrap rounded-lg bg-near-black border border-surface-border px-2 py-1 text-[10px] text-paper z-10 shadow-lg">
                    {d.count} visita{d.count !== 1 ? "s" : ""}
                  </div>
                )}
                <div
                  className={`w-full rounded-t-sm transition-all ${isToday ? "bg-magenta" : "bg-magenta/40 group-hover:bg-magenta/60"}`}
                  style={{ height: barH }}
                />
              </div>
            );
          })}
        </div>
        {/* Etiquetas eje X */}
        <div className="absolute inset-x-0 flex gap-1" style={{ top: chartH + 6 }}>
          {data.map((d, i) => (
            <div key={d.date} className="flex-1 text-center">
              {(i === 0 || i === 6 || i === 13) && (
                <span className="text-[9px] text-mist leading-none">{d.label}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function calcularMetricas(supabase: any, businessId: string): Promise<DashboardMetrics> {
  const inicioMes = new Date();
  inicioMes.setDate(1);
  inicioMes.setHours(0, 0, 0, 0);

  const [
    { count: totalCustomers },
    { count: visitsThisMonth },
    { count: newCustomers },
    { data: customers },
  ] = await Promise.all([
    supabase.from("end_customers").select("*", { count: "exact", head: true }).eq("business_id", businessId),
    supabase.from("visits").select("*", { count: "exact", head: true }).eq("business_id", businessId).gte("created_at", inicioMes.toISOString()),
    supabase.from("end_customers").select("*", { count: "exact", head: true }).eq("business_id", businessId).gte("enrolled_at", inicioMes.toISOString()),
    supabase.from("end_customers").select("rewards_redeemed, total_visits").eq("business_id", businessId),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rewardsRedeemed = (customers ?? []).reduce((s: number, c: any) => s + (c.rewards_redeemed ?? 0), 0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const returning = (customers ?? []).filter((c: any) => (c.total_visits ?? 0) > 1).length;

  return {
    totalCustomers: totalCustomers ?? 0,
    visitsThisMonth: visitsThisMonth ?? 0,
    rewardsRedeemed,
    newCustomers: newCustomers ?? 0,
    returningCustomers: returning,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function calcularVisitasPorDia(supabase: any, businessId: string): Promise<DayData[]> {
  const since = new Date();
  since.setDate(since.getDate() - 13);
  since.setHours(0, 0, 0, 0);

  const { data: visits } = await supabase
    .from("visits")
    .select("created_at")
    .eq("business_id", businessId)
    .gte("created_at", since.toISOString());

  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    const count = (visits ?? []).filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (v: any) => (v.created_at as string).startsWith(dateStr),
    ).length;
    const label = d.toLocaleDateString("es-MX", { day: "numeric", month: "short" });
    return { date: dateStr, count, label };
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function obtenerCercaDelPremio(supabase: any, businessId: string) {
  const { data: card } = await supabase
    .from("loyalty_cards")
    .select("stamps_required")
    .eq("business_id", businessId)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!card) return [];

  const { data: customers } = await supabase
    .from("end_customers")
    .select("id, full_name, current_stamps")
    .eq("business_id", businessId)
    .eq("current_stamps", card.stamps_required - 1)
    .order("last_visit_at", { ascending: false })
    .limit(5);

  return customers ?? [];
}
