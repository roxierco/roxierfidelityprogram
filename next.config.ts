import type { NextConfig } from "next";

// Content Security Policy. Va en modo "Report-Only": el navegador NO bloquea
// nada, solo reportaría lo que bloquearía. Así confirmamos que no rompe el
// escáner de cámara ni las imágenes de los pases antes de activarlo de verdad.
// Para hacerlo obligatorio: cambia la key a "Content-Security-Policy".
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",   // Next inyecta scripts inline
  "style-src 'self' 'unsafe-inline'",                  // estilos inline de Next/Tailwind
  "img-src 'self' data: blob: https://*.supabase.co",  // logos, QR, video del escáner
  "media-src 'self' blob:",                            // cámara del escáner
  "font-src 'self'",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co", // API + realtime
  "frame-ancestors 'none'",                            // que nadie embeba el sitio
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(self), microphone=(), geolocation=(), browsing-topics=()",
  },
  { key: "Content-Security-Policy-Report-Only", value: csp },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false, // Oculta la cabecera "X-Powered-By" (menos info para atacantes)

  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },

  images: {
    // Permite mostrar logos/imágenes subidos a Supabase Storage.
    // Reemplaza TU-PROYECTO por el ID real de tu proyecto Supabase cuando lo tengas.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
