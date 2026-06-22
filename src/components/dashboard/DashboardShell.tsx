"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { XMark } from "@/components/brand/XMark";
import { OnboardingTour } from "./OnboardingTour";

export function DashboardShell({
  children,
  businessName,
  businessLogoUrl,
}: {
  children: React.ReactNode;
  businessName: string;
  businessLogoUrl: string | null;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Cierra el menú al navegar
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Bloquea scroll del body cuando el menú está abierto
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <div className="flex min-h-screen bg-near-black">
      <OnboardingTour />

      {/* Overlay oscuro móvil */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — fijo en móvil, estático en desktop */}
      <div className={`
        fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 md:flex md:flex-shrink-0
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <Sidebar
          businessName={businessName}
          businessLogoUrl={businessLogoUrl}
          onClose={() => setMobileOpen(false)}
        />
      </div>

      {/* Contenido principal */}
      <div className="flex flex-1 flex-col min-w-0">

        {/* Barra superior móvil */}
        <div className="md:hidden sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-surface-border bg-surface px-4">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 text-mist hover:text-paper transition-colors"
            aria-label="Abrir menú"
          >
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
