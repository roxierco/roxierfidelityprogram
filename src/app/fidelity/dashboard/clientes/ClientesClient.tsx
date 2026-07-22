"use client";

import { useState, useMemo, useCallback } from "react";
import { Icon } from "@/components/ui/Icon";

interface Customer {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
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
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());

  const deleteCustomer = useCallback(async (customerId: string) => {
    setDeleting(true);
    const res = await fetch(`/api/customer/${customerId}`, { method: "DELETE" });
    setDeleting(false);
    if (res.ok) {
      setDeletedIds((prev) => new Set([...prev, customerId]));
      setConfirmDeleteId(null);
    }
  }, []);

  const visibleCustomers = useMemo(
    () => customers.filter((c) => !deletedIds.has(c.id)),
    [customers, deletedIds],
  );

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const activeThisMonth = visibleCustomers.filter(
    (c) => c.last_visit_at && new Date(c.last_visit_at) >= startOfMonth,
  ).length;

  const nearRewardCount = visibleCustomers.filter(
    (c) => c.current_stamps === stampsRequired - 1,
  ).length;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    let list = q
      ? visibleCustomers.filter((c) =>
          c.full_name.toLowerCase().includes(q) ||
          (c.phone ?? "").toLowerCase().includes(q) ||
          (c.email ?? "").toLowerCase().includes(q),
        )
      : [...visibleCustomers];

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
  }, [visibleCustomers, search, sort, stampsRequired]);

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
          <p className="text-2xl font-extrabold text-paper">{visibleCustomers.length}</p>
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
      {visibleCustomers.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-mist" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Buscar por nombre, teléfono o correo..."
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
      {visibleCustomers.length === 0 ? (
        <div className="card text-center py-12">
          <Icon name="clientes" className="mx-auto mb-4 h-12 w-12 text-mist" />
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
              <div key={c.id} className="card hover:border-white/10 transition-colors">
                {confirmDeleteId === c.id ? (
                  /* Confirmación de borrado */
                  <div className="flex items-center gap-3 px-1 py-1">
                    <div className="flex-shrink-0 h-9 w-9 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 font-bold text-sm">
                      {c.full_name[0]?.toUpperCase()}
                    </div>
                    <p className="flex-1 text-sm text-paper font-medium">¿Borrar a <span className="text-magenta">{c.full_name}</span>?</p>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="rounded-brand border border-surface-border px-3 py-1.5 text-xs text-mist hover:text-paper transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => deleteCustomer(c.id)}
                      disabled={deleting}
                      className="rounded-brand bg-red-500/15 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/25 disabled:opacity-50 transition-colors"
                    >
                      {deleting ? "Borrando..." : "Sí, borrar"}
                    </button>
                  </div>
                ) : (
                  /* Vista normal */
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 h-11 w-11 rounded-full bg-magenta/10 flex items-center justify-center text-magenta font-bold text-base">
                      {c.full_name[0]?.toUpperCase()}
                    </div>

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
                      {(c.phone || c.email) && (
                        <p className="text-xs text-mist truncate mt-0.5">
                          {[c.phone, c.email].filter(Boolean).join(" · ")}
                        </p>
                      )}
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

                    <div className="hidden sm:flex flex-col items-end gap-0.5 flex-shrink-0 text-right">
                      <p className="text-xs text-mist">{relativeTime(c.last_visit_at)}</p>
                      <p className="text-xs text-mist">
                        {c.total_visits} visita{c.total_visits !== 1 ? "s" : ""}
                        {c.rewards_redeemed > 0 && (
                          <span className="ml-1 inline-flex items-center gap-1 text-yellow-400">· {c.rewards_redeemed}<Icon name="trofeo" className="h-3.5 w-3.5" /></span>
                        )}
                      </p>
                    </div>

                    {c.phone && (
                      <a
                        href={`https://wa.me/${c.phone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Escribir por WhatsApp"
                        className="flex-shrink-0 rounded-lg p-2 text-mist hover:text-green-400 hover:bg-surface-border transition-colors"
                      >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zm0 18.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.18 8.18 0 01-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 012.41 5.83c0 4.55-3.7 8.23-8.24 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.13-.17.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.15-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.15.16-.25.24-.42.08-.17.04-.31-.02-.44-.06-.12-.56-1.35-.77-1.85-.2-.48-.4-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.87.86-.87 2.09 0 1.23.9 2.42 1.02 2.59.12.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.29z" />
                        </svg>
                      </a>
                    )}
                    {c.email && (
                      <a
                        href={`mailto:${c.email}`}
                        title="Enviar correo"
                        className="flex-shrink-0 rounded-lg p-2 text-mist hover:text-paper hover:bg-surface-border transition-colors"
                      >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </a>
                    )}

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

                    <button
                      onClick={() => { setConfirmDeleteId(c.id); setCopiedId(null); }}
                      title="Eliminar cliente"
                      className="flex-shrink-0 rounded-lg p-2 text-red-400/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
