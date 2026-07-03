import type { NextConfig } from "next";

/**
 * Configuración de Next.js para Roxier Fidelity.
 *
 * Incluye cabeceras de seguridad HTTP que protegen contra los ataques
 * más comunes (clickjacking, MIME sniffing, fugas de referrer, etc.).
 * Estas cabeceras se aplican a TODAS las rutas de la aplicación.
 */
// Dominios de Supabase necesarios para auth, realtime y storage
const supabaseHosts = "https://*.supabase.co wss://*.supabase.co https://*.supabase.in wss://*.supabase.in";
// Dominios de MercadoPago (checkout, SDK y API)
const mpHosts = "https://sdk.mercadopago.com https://api.mercadopago.com https://www.mercadopago.com https://www.mercadopago.com.mx https://www.mercadopago.com.ar https://secure.mlstatic.com";

const csp = [
  "default-src 'self'",
  // Next.js necesita unsafe-inline para sus scripts de hidratación
  `script-src 'self' 'unsafe-inline' ${mpHosts}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${supabaseHosts} https://secure.mlstatic.com`,
  `connect-src 'self' ${supabaseHosts} ${mpHosts} https://api.push.apple.com`,
  "font-src 'self' data:",
  // Solo MercadoPago puede cargar iframes (checkout)
  `frame-src ${mpHosts}`,
  "object-src 'none'",
  "base-uri 'self'",
  `form-action 'self' ${mpHosts}`,
  "upgrade-insecure-requests",
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
  { key: "Content-Security-Policy", value: csp },
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
