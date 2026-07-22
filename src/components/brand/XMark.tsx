import { cn } from "@/lib/utils";

/**
 * La X de Roxier — el símbolo de la marca.
 * Marca geométrica tipo navaja. Funciona sola como icono y favicon.
 * Siempre en magenta sobre fondo oscuro.
 */
export function XMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={cn("text-magenta", className)}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M22 18 L50 42 L78 18 L82 22 L58 50 L82 78 L78 82 L50 58 L22 82 L18 78 L42 50 L18 22 Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * Logo horizontal: X + "ROXIER Co."
 * `forceLight` / `forceDark`: fijan el color del texto para secciones con fondo
 * fijo que no siguen el toggle de tema claro/oscuro (ej. la landing).
 */
export function RoxierLogo({
  className,
  forceLight,
  forceDark,
}: {
  className?: string;
  forceLight?: boolean;
  forceDark?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <XMark className="h-7 w-7" />
      <span className={cn(
        "text-xl font-extrabold tracking-wide",
        forceDark ? "text-[#0E0E10]" : forceLight ? "text-white" : "text-paper",
      )}>
        ROXIER
        <span className="ml-1.5 text-sm font-semibold text-magenta">
          Fidelity
        </span>
      </span>
    </div>
  );
}
