"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const PIXEL_ID = "2796452900741814";

// Tipado mínimo de fbq para no usar `any`.
declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

/**
 * Píxel de Meta (Facebook). Mide visitas y conversiones para optimizar tus
 * anuncios. El código base se carga una vez; además registramos un PageView
 * en cada cambio de página (Next navega sin recargar, así que el píxel no se
 * enteraría solo).
 */
export function MetaPixel() {
  const pathname = usePathname();
  const primeraCarga = useRef(true);

  useEffect(() => {
    // El script inline ya dispara el primer PageView; evitamos duplicarlo.
    if (primeraCarga.current) {
      primeraCarga.current = false;
      return;
    }
    window.fbq?.("track", "PageView");
  }, [pathname]);

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${PIXEL_ID}');
fbq('track', 'PageView');`}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          alt=""
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  );
}

/** Dispara un evento de conversión estándar (ej. "CompleteRegistration"). */
export function trackPixel(event: string, params?: Record<string, unknown>) {
  if (typeof window !== "undefined") window.fbq?.("track", event, params);
}
