"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { trackPixel } from "./MetaPixel";

/**
 * Dispara el evento de conversión "CompleteRegistration" en Meta cuando un
 * cliente recién registrado cae en el dashboard (?bienvenido=1), y limpia el
 * parámetro para que no se vuelva a contar si recarga.
 */
export function PixelRegistro() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  useEffect(() => {
    if (params.get("bienvenido") !== "1") return;
    trackPixel("CompleteRegistration");
    router.replace(pathname); // quita ?bienvenido=1 sin recargar
  }, [params, pathname, router]);

  return null;
}
