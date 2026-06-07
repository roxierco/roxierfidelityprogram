import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * El middleware corre en CADA petición antes de llegar a las páginas.
 * Aquí refrescamos la sesión y protegemos las rutas privadas.
 */
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  // No corre en archivos estáticos ni imágenes (mejor rendimiento)
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
