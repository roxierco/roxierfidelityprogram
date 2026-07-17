import { createClient } from "@/lib/supabase/server";

// Paleta categórica fija — validada para el tema oscuro de la app (superficie #161618).
// El orden importa: separa el par más débil (magenta/ámbar) para que nunca queden adyacentes.
const COLOR = {
  visitas: "#FF2E63",   // magenta — marca
  nuevos: "#0284C7",    // azul
  activos: "#059669",   // verde
  riesgo: "#7C3AED",    // violeta
  pico: "#D97706",      // ámbar
};

const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
// Mercado objetivo de Roxier Fidelity es MX (UTC-6) — el servidor corre en UTC.
const OFFSET_HORAS_MX = -6;

interface CustomerRow {
  id: string;
  full_name: string;
  total_visits: number;
  rewards_redeemed: number;
  enrolled_at: string;
  last_visit_at: string | null;
}

export default async function EstadisticasPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", user!.id)
    .single();

  const businessId = business!.id;

  const hace90dias = new Date();
  hace90dias.setDate(hace90dias.getDate() - 90);
  hace90dias.setHours(0, 0, 0, 0);

  const [
    { data: customers },
    { data: visits },
    { count: activeCards },
  ] = await Promise.all([
    supabase
      .from("end_customers")
      .select("id, full_name, total_visits, rewards_redeemed, enrolled_at, last_visit_at")
      .eq("business_id", businessId),
    supabase
      .from("visits")
      .select("created_at")
      .eq("business_id", businessId)
      .gte("created_at", hace90dias.toISOString()),
    supabase
      .from("loyalty_cards")
      .select("*", { count: "exact", head: true })
      .eq("business_id", businessId)
      .eq("is_active", true),
  ]);

  const allCustomers = (customers ?? []) as CustomerRow[];
  const allVisits = (visits ?? []) as { created_at: string }[];

  const now = Date.now();
  const dia = 86400000;

  const totalCustomers = allCustomers.length;
  const totalVisitas = allCustomers.reduce((s, c) => s + (c.total_visits ?? 0), 0);
  const promedioVisitas = totalCustomers > 0 ? (totalVisitas / totalCustomers) : 0;

  const activos30 = allCustomers.filter(
    (c) => c.last_visit_at && now - new Date(c.last_visit_at).getTime() <= 30 * dia,
  ).length;

  const enRiesgo = allCustomers.filter((c) => {
    const enrolledHaceMasDe30 = now - new Date(c.enrolled_at).getTime() > 30 * dia;
    const sinVisitaReciente = !c.last_visit_at || now - new Date(c.last_visit_at).getTime() > 30 * dia;
    return enrolledHaceMasDe30 && sinVisitaReciente;
  }).length;

  const tasaRetencion = totalCustomers > 0 ? Math.round((activos30 / totalCustomers) * 100) : 0;

  // Tendencia — últimos 30 días
  const desde30 = new Date(now - 29 * dia);
  desde30.setHours(0, 0, 0, 0);

  const visitasPorDia = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(desde30);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    const count = allVisits.filter((v) => v.created_at.startsWith(dateStr)).length;
    return { label: d.toLocaleDateString("es-MX", { day: "numeric", month: "short" }), count };
  });

  const nuevosPorDia = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(desde30);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    const count = allCustomers.filter((c) => c.enrolled_at.startsWith(dateStr)).length;
    return { label: d.toLocaleDateString("es-MX", { day: "numeric", month: "short" }), count };
  });

  // Visitas por día de la semana (últimos 90 días)
  const porDiaSemana = [0, 0, 0, 0, 0, 0, 0]; // Lun..Dom
  for (const v of allVisits) {
    const jsDay = new Date(v.created_at).getDay(); // 0=Dom..6=Sáb
    const idx = jsDay === 0 ? 6 : jsDay - 1; // reindexar a Lun=0..Dom=6
    porDiaSemana[idx]++;
  }

  // Visitas por hora del día (últimos 90 días, ajustado a hora de México)
  const porHora = Array.from({ length: 24 }, () => 0);
  for (const v of allVisits) {
    const utcHour = new Date(v.created_at).getUTCHours();
    const localHour = (utcHour + OFFSET_HORAS_MX + 24) % 24;
    porHora[localHour]++;
  }
  // Agrupar en bloques de 3 horas para que se lea mejor
  const bloquesHora = Array.from({ length: 8 }, (_, i) => {
    const start = i * 3;
    const count = porHora[start] + porHora[start + 1] + porHora[start + 2];
    const label = `${start}h`;
    return { label, count };
  });

  const topClientes = [...allCustomers]
    .sort((a, b) => (b.total_visits ?? 0) - (a.total_visits ?? 0))
    .slice(0, 5);

  return (
    <div className="animate-fade-up space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-paper">Estadísticas</h1>
        <p className="mt-1 text-mist">Conoce a fondo el comportamiento de tus clientes.</p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Visitas por cliente (prom.)" value={promedioVisitas.toFixed(1)} />
        <StatTile label="Clientes activos (30 días)" value={activos30.toString()} accentColor={COLOR.activos} />
        <StatTile label="Clientes en riesgo" value={enRiesgo.toString()} accentColor={COLOR.riesgo} />
        <StatTile label="Tarjetas activas" value={(activeCards ?? 0).toString()} />
      </div>

      {/* Tendencia 30 días — visitas y clientes nuevos (small multiples, escalas distintas) */}
      <div className="card space-y-6">
        <div>
          <h2 className="font-bold text-paper">Tendencia — últimos 30 días</h2>
          <p className="text-xs text-mist mt-0.5">Visitas y clientes nuevos, día a día</p>
        </div>
        <BarSeries data={visitasPorDia} color={COLOR.visitas} legend="Visitas" total={visitasPorDia.reduce((s, d) => s + d.count, 0)} />
        <BarSeries data={nuevosPorDia} color={COLOR.nuevos} legend="Clientes nuevos" total={nuevosPorDia.reduce((s, d) => s + d.count, 0)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Retención — donut */}
        <div className="card space-y-4">
          <div>
            <h2 className="font-bold text-paper">Retención de clientes</h2>
            <p className="text-xs text-mist mt-0.5">Visitaron en los últimos 30 días</p>
          </div>
          <div className="flex items-center gap-6">
            <div
              className="relative h-32 w-32 flex-shrink-0 rounded-full"
              style={{
                background: `conic-gradient(${COLOR.activos} 0% ${tasaRetencion}%, var(--surface-border) ${tasaRetencion}% 100%)`,
              }}
            >
              <div className="absolute inset-3 rounded-full bg-surface flex items-center justify-center">
                <span className="text-2xl font-extrabold text-paper">{tasaRetencion}%</span>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLOR.activos }} />
                <span className="text-paper font-semibold">{activos30}</span>
                <span className="text-mist">activos</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-surface-border" />
                <span className="text-paper font-semibold">{Math.max(0, totalCustomers - activos30)}</span>
                <span className="text-mist">inactivos</span>
              </div>
            </div>
          </div>
        </div>

        {/* Días de la semana */}
        <div className="card space-y-4">
          <div>
            <h2 className="font-bold text-paper">Días con más visitas</h2>
            <p className="text-xs text-mist mt-0.5">Últimos 90 días</p>
          </div>
          <BarSeries
            data={DIAS.map((label, i) => ({ label, count: porDiaSemana[i] }))}
            color={COLOR.visitas}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Horarios pico */}
        <div className="card space-y-4">
          <div>
            <h2 className="font-bold text-paper">Horarios con más visitas</h2>
            <p className="text-xs text-mist mt-0.5">Últimos 90 días · hora local (CDMX)</p>
          </div>
          <BarSeries data={bloquesHora} color={COLOR.pico} />
        </div>

        {/* Top clientes */}
        <div className="card space-y-3">
          <div>
            <h2 className="font-bold text-paper">Clientes más frecuentes</h2>
            <p className="text-xs text-mist mt-0.5">Por número de visitas</p>
          </div>
          {topClientes.length === 0 ? (
            <p className="text-sm text-mist py-4 text-center">Aún no hay suficientes datos.</p>
          ) : (
            <div className="space-y-2">
              {topClientes.map((c, i) => (
                <div key={c.id} className="flex items-center gap-3 rounded-xl bg-near-black px-3 py-2.5">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-magenta-muted text-magenta font-bold text-xs">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-paper truncate">{c.full_name}</p>
                  </div>
                  <span className="text-sm font-bold text-paper flex-shrink-0">{c.total_visits ?? 0} visitas</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatTile({ label, value, accentColor }: { label: string; value: string; accentColor?: string }) {
  return (
    <div className="card">
      <p className="text-sm text-mist">{label}</p>
      <p className="mt-2 text-3xl font-extrabold" style={{ color: accentColor ?? "var(--paper)" }}>
        {value}
      </p>
    </div>
  );
}

/** Serie de barras reutilizable con tooltip al pasar el cursor (misma mecánica que el chart de Resumen). */
function BarSeries({
  data,
  color,
  legend,
  total,
}: {
  data: { label: string; count: number }[];
  color: string;
  legend?: string;
  total?: number;
}) {
  const rawMax = Math.max(...data.map((d) => d.count), 0);
  const max = Math.max(rawMax, 1);
  const chartH = 96;
  const isEmpty = rawMax === 0;
  // Mostrar solo algunas etiquetas si hay muchas barras, para evitar amontonamiento
  const showEvery = data.length > 14 ? Math.ceil(data.length / 7) : 1;

  return (
    <div className="space-y-2">
      {legend && (
        <div className="flex items-center gap-2 text-xs">
          <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
          <span className="text-paper font-semibold">{legend}</span>
          {total !== undefined && <span className="text-mist ml-auto">{total} en total</span>}
        </div>
      )}
      {isEmpty ? (
        <div className="flex items-center justify-center rounded-xl border border-dashed border-surface-border text-xs text-mist" style={{ height: chartH + 24 }}>
          Sin datos en este período todavía
        </div>
      ) : (
        <div className="relative pl-7" style={{ height: chartH + 22 }}>
          {/* Eje Y: valor máximo de referencia + líneas guía */}
          <span className="absolute -top-1 left-0 text-[9px] text-mist tabular-nums">{max}</span>
          <span className="absolute left-0 text-[9px] text-mist tabular-nums" style={{ top: chartH / 2 - 5 }}>
            {Math.round(max / 2)}
          </span>
          <span className="absolute left-0 text-[9px] text-mist tabular-nums" style={{ top: chartH - 4 }}>0</span>
          {[0, 0.5, 1].map((f) => (
            <div
              key={f}
              className="absolute right-0 border-t border-surface-border/60"
              style={{ left: 26, top: (1 - f) * chartH }}
            />
          ))}

          <div className="absolute inset-y-0 left-7 right-0 top-0 flex items-end gap-1" style={{ height: chartH }}>
            {data.map((d, i) => {
              const barH = Math.max((d.count / max) * chartH, d.count > 0 ? 3 : 0);
              const isPeak = d.count === rawMax && rawMax > 0;
              return (
                <div key={i} className="relative flex-1 flex flex-col justify-end group" style={{ height: chartH }}>
                  <div
                    className={`absolute left-1/2 -translate-x-1/2 flex items-center whitespace-nowrap rounded-lg bg-near-black border border-surface-border px-2 py-1 text-[10px] text-paper z-10 shadow-lg transition-opacity ${
                      d.count > 0 ? "opacity-0 group-hover:opacity-100" : "hidden"
                    }`}
                    style={{ bottom: barH + 8 }}
                  >
                    {d.count}
                  </div>
                  <div
                    className="w-full max-w-[22px] mx-auto rounded-t-sm transition-opacity group-hover:opacity-80"
                    style={{ height: barH, backgroundColor: color, opacity: isPeak ? 1 : 0.75 }}
                  />
                </div>
              );
            })}
          </div>
          <div className="absolute inset-x-0 left-7 flex gap-1" style={{ top: chartH + 4 }}>
            {data.map((d, i) => (
              <div key={i} className="flex-1 text-center">
                {i % showEvery === 0 && (
                  <span className="text-[9px] text-mist leading-none">{d.label}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
