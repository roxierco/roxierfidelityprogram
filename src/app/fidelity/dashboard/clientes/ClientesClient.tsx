"use client";

import { useState, useMemo } from "react";

interface Customer {
  id: string;
  full_name: string;
  current_stamps: number;
  total_visits: number;
  rewards_redeemed: number;
  last_visit_at: string | null;
  enrolled_at: string;
}

type Sort = "recientes" | "activos" | "cerca";

function relativeTime(dateStr: string | null): string {
  if (!dateStr) return "Nunca";
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (diff === 0) return "Hoy";
  if (diff === 1) return "Ayer";
  if (diff < 7) return `Hace ${diff} días`;
  if (diff < 30) return `Hace ${Math.floor(diff / 7)} sem.`;
  if (diff < 365) return `Hace ${Math.floor(diff / 30)} mes${Math.floor(diff / 30) !== 1 ? "es" : ""}`;
  return `Hace ${Math.floor(diff / 365)} año${Math.floor(diff / 365) !== 1 ? "s" : ""}`;
}

export function ClientesClient({
  customers,
  stampsRequired,
  cardId,
  businessSlug,
  appUrl,
}: {
  customers: Customer[];
  stampsRequired: number;
  cardId: string | null;
  businessSlug: string;
  appUrl: string;
}) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<Sort>("recientes");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const activeThisMonth = customers.filter(
    (c) => c.last_visit_at && new Date(c.last_visit_at) >= startOfMonth,
  ).length;

  const nearRewardCount = customers.filter(
    (c) => c.current_stamps === stampsRequired - 1,
  ).length;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    let list = q ? customers.filter((c) => c.full_name.toLowerCase().includes(q)) : [...customers];

    if (sort === "recientes") {
      list.sort((a, b) => (b.last_visit_at ?? "").localeCompare(a.last_visit_at ?? ""));
    } else if (sort === "activos") {
      list.sort((a, b) => b.total_visits - a.total_visits);
    } else {
      list.sort((a, b) => {
        const aLeft = stampsRequired - a.current_stamps;
        const bLeft = stampsRequired - b.current_stamps;
        return aLeft - bLeft;
      });
    }
    return list;
  }, [customers, search, sort, stampsRequired]);

  function copyLink(customerId: string) {
    if (!cardId) return;
    const url = `${appUrl}/c/${businessSlug}/u/${customerId}?card=${cardId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(customerId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-3xl font-extrabold text-paper">Clientes</h1>
        <p className="mt-1 text-mist">
          {customers.length === 0
            ? "Aún no hay clientes registrados."
            : `${customers.length} cliente${customers.length !== 1 ? "s" : ""} con tu tarjeta`}
        </p>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card text-center py-4">
          <p className="text-2xl font-extrabold text-paper">{customers.length}</p>
          <p className="text-xs text-mist mt-1">Total</p>
        </div>
        <div className="card text-center py-4">
          <p className="text-2xl font-extrabold text-magenta">{activeThisMonth}</p>
          <p className="text-xs text-mist mt-1">Activos este mes</p>
        </div>
        <div className="card text-center py-4">
          <p className="text-2xl font-extrabold text-yellow-400">{nearRewardCount}</p>
          <p className="text-xs text-mist mt-1">A 1 sello del premio</p>
        </div>
      </div>

      {/* Buscador + ordenamiento */}
      {customers.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-mist" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-surface-border bg-surface pl-9 pr-4 py-2.5 text-sm text-paper placeholder:text-mist focus:border-magenta focus:outline-none"
            />
          </div>
          <div className="flex rounded-xl border border-surface-border overflow-hidden flex-shrink-0">
            {(["recientes", "activos", "cerca"] as Sort[]).map((s) => (
              <button
                key={s}
                onClick={() => setSort(s)}
                className={`px-3 py-2 text-xs font-semibold transition-colors ${
                  sort === s ? "bg-magenta text-white" : "text-mist hover:text-paper bg-surface"
                }`}
              >
                {s === "recientes" ? "Recientes" : s === "activos" ? "Activos" : "Cerca del premio"}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Lista de clientes */}
      {customers.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-5xl mb-4">👥</div>
          <h3 className="text-lg font-bold text-paper">Aún no tienes clientes</h3>
          <p className="text-mist text-sm mt-2 max-w-sm mx-auto">
            Comparte el link de tu tarjeta para que los clientes se registren. Ve a <strong className="text-paper">Mis tarjetas</strong> y copia el enlace.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-mist text-sm">No se encontraron clientes con ese nombre.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => {
            const progress = Math.min(c.current_stamps, stampsRequired);
            const pct = (progress / stampsRequired) * 100;
            const isNear = c.current_stamps === stampsRequired - 1;
            const isFull = c.current_stamps >= stampsRequired;

            return (
              <div key={c.id} className="card flex items-center gap-4 hover:border-white/10 transition-colors">
                {/* Avatar */}
                <div className="flex-shrink-0 h-11 w-11 rounded-full bg-magenta/10 flex items-center justify-center text-magenta font-bold text-base">
                  {c.full_name[0]?.toUpperCase()}
                </div>

                {/* Info principal */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-paper truncate">{c.full_name}</p>
                    {isNear && (
                      <span className="flex-shrink-0 text-[10px] font-black uppercase tracking-wider text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-full">
                        ¡1 sello para el premio!
                      </span>
                    )}
                    {isFull && (
                      <span className="flex-shrink-0 text-[10px] font-black uppercase tracking-wider text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">
                        Premio pendiente
                      </span>
                    )}
                  </div>

                  {/* Barra de progreso */}
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-surface-border overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${isNear ? "bg-yellow-400" : isFull ? "bg-green-400" : "bg-magenta"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="flex-shrink-0 text-xs text-mist tabular-nums">
                      {progress}/{stampsRequired}
                    </span>
                  </div>
                </div>

                {/* Columna de stats — oculta en móvil pequeño */}
                <div className="hidden sm:flex flex-col items-end gap-0.5 flex-shrink-0 text-right">
                  <p className="text-xs text-mist">{relativeTime(c.last_visit_at)}</p>
                  <p className="text-xs text-mist">
                    {c.total_visits} visita{c.total_visits !== 1 ? "s" : ""}
                    {c.rewards_redeemed > 0 && (
                      <span className="text-yellow-400 ml-1">· {c.rewards_redeemed} 🎉</span>
                    )}
                  </p>
                </div>

                {/* Botón copiar link */}
                {cardId && (
                  <button
                    onClick={() => copyLink(c.id)}
                    title="Copiar link de tarjeta"
                    className="flex-shrink-0 rounded-lg p-2 text-mist hover:text-paper hover:bg-surface-border transition-colors"
                  >
                    {copiedId === c.id ? (
                      <svg className="h-4 w-4 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
