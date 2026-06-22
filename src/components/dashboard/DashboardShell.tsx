"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { XMark } from "@/components/brand/XMark";
import { OnboardingTour } from "./OnboardingTour";
import Link from "next/link";

function TrialBanner({ trialEndsAt, hasSubscription }: { trialEndsAt: string | null; hasSubscription: boolean }) {
  if (hasSubscription) return null;

  const daysLeft = trialEndsAt
    ? Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / 86400000))
    : null;

  const urgent = daysLeft !== null && daysLeft <= 2;
  const expired = daysLeft === 0;

  return (
    <div className={`flex items-center justify-between gap-4 px-4 py-2.5 text-sm ${urgent ? "bg-red-500/15 border-b border-red-500/30" : "bg-magenta/10 border-b border-magenta/20"}`}>
      <span className={urgent ? "text-red-400 font-medium" : "text-magenta font-medium"}>
        {expired
          ? "⚠️ Tu período de prueba terminó — activa tu plan para seguir usando Roxier Fidelity"
          : daysLeft !== null
          ? `⏳ ${daysLeft} día${daysLeft !== 1 ? "s" : ""} de prueba restante${daysLeft !== 1 ? "s" : ""} — activa tu plan para no perder el acceso`
          : "Estás en período de prueba gratuita — activa tu plan cuando quieras"}
      </span>
      <Link
        href="/fidelity/planes"
        className={`flex-shrink-0 rounded-lg px-3 py-1 text-xs font-bold transition-colors ${urgent ? "bg-red-500 text-white hover:bg-red-600" : "bg-magenta text-white hover:bg-magenta/90"}`}
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
}: {
  children: React.ReactNode;
  businessName: string;
  businessLogoUrl: string | null;
  businessStatus: string;
  trialEndsAt: string | null;
  hasSubscription: boolean;
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

  const showBanner = businessStatus !== "active" || !hasSubscription;

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
