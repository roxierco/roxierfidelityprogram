"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { XMark } from "@/components/brand/XMark";
import { cerrarSesion } from "@/app/fidelity/(auth)/actions";
import { ThemeToggle } from "@/components/dashboard/ThemeToggle";

const navItems = [
  { href: "/fidelity/dashboard", label: "Resumen", icon: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" },
  { href: "/fidelity/dashboard/tarjetas", label: "Mis tarjetas", icon: "M3 5h18v14H3zM3 10h18" },
  { href: "/fidelity/dashboard/promociones", label: "Promociones", icon: "M20 12l-8 8-8-8 8-8z" },
  { href: "/fidelity/dashboard/clientes", label: "Clientes", icon: "M12 12a4 4 0 100-8 4 4 0 000 8zM4 20a8 8 0 0116 0" },
  { href: "/fidelity/dashboard/notificaciones", label: "Notificaciones", icon: "M12 22a2 2 0 002-2H10a2 2 0 002 2zM18 16V11a6 6 0 10-12 0v5l-2 2h16z" },
  { href: "/fidelity/dashboard/configuracion", label: "Configuración", icon: "M12 15a3 3 0 100-6 3 3 0 000 6zM19 12a7 7 0 00-.1-1l2-1.5-2-3.5-2.4 1a7 7 0 00-1.7-1L14.5 2h-5l-.3 2.5a7 7 0 00-1.7 1l-2.4-1-2 3.5L2.6 11a7 7 0 000 2l-2 1.5 2 3.5 2.4-1a7 7 0 001.7 1l.3 2.5h5l.3-2.5a7 7 0 001.7-1l2.4 1 2-3.5-2-1.5a7 7 0 00.1-1z" },
];

export function Sidebar({
  businessName,
  businessLogoUrl,
  onClose,
}: {
  businessName: string;
  businessLogoUrl: string | null;
  onClose?: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-72 flex-col border-r border-surface-border bg-surface md:w-64">
      {/* Co-branding header */}
      <div className="px-5 py-5 border-b border-surface-border">
        {/* Roxier Fidelity + botón cerrar en móvil */}
        <div className="flex items-center gap-2 mb-3">
          <XMark className="h-5 w-5" />
          <span className="font-extrabold tracking-wide text-paper text-sm">
            ROXIER<span className="ml-1 text-xs font-semibold text-magenta">Fidelity</span>
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="ml-auto rounded-lg p-1 text-mist hover:text-paper md:hidden"
              aria-label="Cerrar menú"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Separador × */}
        <div className="flex items-center gap-2 mb-3">
          <div className="h-px flex-1 bg-surface-border" />
          <span className="text-xs font-bold text-mist">×</span>
          <div className="h-px flex-1 bg-surface-border" />
        </div>

        {/* Logo + nombre del negocio */}
        <div className="flex items-center gap-2.5">
          {businessLogoUrl ? (
            <img
              src={businessLogoUrl}
              alt={businessName}
              className="h-8 w-8 flex-shrink-0 rounded-lg object-contain bg-near-black p-0.5"
            />
          ) : (
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-magenta text-near-black font-extrabold text-sm">
              {businessName[0]?.toUpperCase()}
            </div>
          )}
          <span className="truncate text-sm font-bold text-paper">{businessName}</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-brand px-3 py-2.5 text-sm font-semibold transition-colors",
                active
                  ? "bg-magenta-muted text-magenta"
                  : "text-mist hover:bg-near-black hover:text-paper",
              )}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={item.icon} />
              </svg>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-surface-border p-3 space-y-1">
        <ThemeToggle />
        <form action={cerrarSesion}>
          <button type="submit" className="flex w-full items-center gap-3 rounded-brand px-3 py-2.5 text-sm font-semibold text-mist transition-colors hover:bg-near-black hover:text-paper">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            Cerrar sesión
          </button>
        </form>
      </div>
    </aside>
  );
}
