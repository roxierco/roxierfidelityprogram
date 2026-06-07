import type { NextConfig } from "next";

/**
 * Configuración de Next.js para Roxier Fidelity.
 *
 * Incluye cabeceras de seguridad HTTP que protegen contra los ataques
 * más comunes (clickjacking, MIME sniffing, fugas de referrer, etc.).
 * Estas cabeceras se aplican a TODAS las rutas de la aplicación.
 */
const securityHeaders = [
  // Evita que el navegador "adivine" el tipo de archivo (previene ataques MIME)
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Impide que la app se cargue dentro de un <iframe> de otro sitio (anti-clickjacking)
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Controla cuánta información de origen se envía a otros sitios
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Fuerza HTTPS durante 2 años (solo activa en producción con dominio real)
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Restringe permisos del navegador que la app no necesita
  {
    key: "Permissions-Policy",
    value: "camera=(self), microphone=(), geolocation=(), browsing-topics=()",
  },
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
