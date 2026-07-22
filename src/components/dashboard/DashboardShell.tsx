"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { XMark } from "@/components/brand/XMark";
import { OnboardingTour } from "./OnboardingTour";
import Link from "next/link";

const DIAS_PRUEBA = 7;

/**
 * Barra de la prueba gratis con cuenta regresiva en vivo.
 * Compacta a propósito: una sola línea, sin robar espacio al dashboard.
 */
function TrialBanner({ trialEndsAt, hasSubscription }: { trialEndsAt: string | null; hasSubscription: boolean }) {
  // Se refresca cada 30s para que el contador vaya bajando solo.
  const [ahora, setAhora] = useState<number | null>(null);
  useEffect(() => {
    setAhora(Date.now());
    const t = setInterval(() => setAhora(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  if (hasSubscription || !trialEndsAt) return null;

  const finMs = new Date(trialEndsAt).getTime();
  // Antes de montar en el cliente usamos la hora del servidor implícita (sin
  // contador) para no romper la hidratación.
  const restanteMs = ahora === null ? null : Math.max(0, finMs - ahora);

  const expirada = restanteMs !== null && restanteMs === 0;
  const dias = restanteMs === null ? null : Math.floor(restanteMs / 86_400_000);
  const horas = restanteMs === null ? null : Math.floor((restanteMs % 86_400_000) / 3_600_000);
  const minutos = restanteMs === null ? null : Math.floor((restanteMs % 3_600_000) / 60_000);

  // Últimas 48h = urgente (rojo). El resto, magenta de marca.
  const urgente = restanteMs !== null && restanteMs <= 2 * 86_400_000;

  // Cuánto se ha consumido de la prueba, para la barrita de progreso.
  const consumido = restanteMs === null
    ? 0
    : Math.min(100, Math.max(0, 100 - (restanteMs / (DIAS_PRUEBA * 86_400_000)) * 100));

  const tiempo =
    dias === null ? null
    : dias > 0 ? `${dias}d ${horas}h`
    : horas! > 0 ? `${horas}h ${minutos}m`
    : `${minutos}m`;

  const color = urgente
    ? { texto: "text-red-400", fondo: "bg-red-500/15 border-red-500/30", barra: "bg-red-500", boton: "bg-red-500 hover:bg-red-600" }
    : { texto: "text-magenta", fondo: "bg-magenta/10 border-magenta/20", barra: "bg-magenta", boton: "bg-magenta hover:bg-magenta/90" };

  return (
    <div className={`flex items-center gap-3 border-b px-4 py-2 text-sm ${color.fondo}`}>
      <span className={`flex-shrink-0 font-medium ${color.texto}`}>
        {expirada ? (
          <>⚠️ Tu prueba terminó</>
        ) : tiempo ? (
          <>
            ⏳ Te quedan <span className="font-black tabular-nums">{tiempo}</span> de prueba
          </>
        ) : (
          <>⏳ Prueba gratis activa</>
        )}
      </span>

      {/* Barrita de progreso — se llena conforme se acaba la prueba */}
      {!expirada && (
        <div className="hidden h-1.5 flex-1 overflow-hidden rounded-full bg-white/10 sm:block">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${color.barra}`}
            style={{ width: `${consumido}%` }}
          />
        </div>
      )}

      <span className="hidden flex-shrink-0 text-xs text-mist md:inline">
        {expirada ? "Activa un plan para recuperar el acceso" : "Al terminar pierdes el acceso"}
      </span>

      <Link
        href="/fidelity/planes"
        className={`ml-auto flex-shrink-0 rounded-lg px-3 py-1 text-xs font-bold text-white transition-colors ${color.boton}`}
      >
        Activar plan
      </Link>
    </div>
  );
}

export function DashboardShell({
  children,
  businessName,
  businessLogoUrl,
  businessStatus,
  trialEndsAt,
  hasSubscription,
  isAdmin = false,
}: {
  children: React.ReactNode;
  businessName: string;
  businessLogoUrl: string | null;
  businessStatus: string;
  trialEndsAt: string | null;
  hasSubscription: boolean;
  isAdmin?: boolean;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const showBanner = !isAdmin && (businessStatus !== "active" || !hasSubscription);

  return (
    <div className="flex min-h-screen bg-near-black">
      <OnboardingTour />

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <div className={`
        fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 md:flex md:flex-shrink-0
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <Sidebar businessName={businessName} businessLogoUrl={businessLogoUrl} onClose={() => setMobileOpen(false)} />
      </div>

      <div className="flex flex-1 flex-col min-w-0">

        {/* Banner de trial — siempre visible si no han pagado */}
        {showBanner && (
          <TrialBanner trialEndsAt={trialEndsAt} hasSubscription={hasSubscription} />
        )}

        {/* Barra superior móvil */}
        <div className="md:hidden sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-surface-border bg-surface px-4">
          <button onClick={() => setMobileOpen(true)} className="rounded-lg p-2 text-mist hover:text-paper transition-colors" aria-label="Abrir menú">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-1.5">
            <XMark className="h-4 w-4" />
            <span className="font-extrabold tracking-wide text-paper text-sm">
              ROXIER<span className="ml-1 text-xs font-semibold text-magenta">Fidelity</span>
            </span>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-5xl px-4 py-5 md:px-8 md:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
