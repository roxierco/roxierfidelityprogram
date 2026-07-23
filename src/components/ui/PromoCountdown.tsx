"use client";

import { useState, useEffect } from "react";
import { PROMO_FIN, promoActiva } from "@/lib/promo";

/**
 * Banda de promo de lanzamiento con cuenta regresiva en vivo.
 * Se oculta sola cuando la promo termina. `theme` ajusta los colores según
 * el fondo (la landing es clara, la página de planes es oscura).
 */
export function PromoCountdown({ theme = "light" }: { theme?: "light" | "dark" }) {
  const [restante, setRestante] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setRestante(PROMO_FIN.getTime() - Date.now());
    tick();
    const t = setInterval(tick, 60_000);
    return () => clearInterval(t);
  }, []);

  if (restante === null || restante <= 0 || !promoActiva()) return null;

  const dias = Math.floor(restante / 86_400_000);
  const horas = Math.floor((restante % 86_400_000) / 3_600_000);
  const cuenta = dias > 0 ? `${dias}d ${horas}h` : `${horas}h`;

  const claro = theme === "light";

  return (
    <div
      className={`mx-auto flex max-w-md items-center justify-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold ${
        claro
          ? "border-[#FF2E63]/30 bg-[#FF2E63]/10 text-[#FF2E63]"
          : "border-[#FF2E63]/40 bg-[#FF2E63]/15 text-[#ff6b91]"
      }`}
    >
      <span className="relative flex h-2 w-2 flex-shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FF2E63] opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-[#FF2E63]" />
      </span>
      Precio de lanzamiento — termina en <span className="tabular-nums font-black">{cuenta}</span>
    </div>
  );
}
