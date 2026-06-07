import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refresca la sesión del usuario en cada petición y protege rutas.
 *
 * - Mantiene la sesión viva (renueva el token automáticamente).
 * - Redirige a login si alguien sin sesión intenta entrar al dashboard.
 * - Redirige al dashboard si alguien con sesión visita login/registro.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANTE: getUser() valida el token contra el servidor de Supabase.
  // No usar getSession() para decisiones de seguridad (puede ser falsificado).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isDashboard = path.startsWith("/fidelity/dashboard");
  const isAdmin = path.startsWith("/fidelity/admin");
  const isAuthPage =
    path.startsWith("/fidelity/login") || path.startsWith("/fidelity/registro");

  // Sin sesión -> no puede entrar a zonas protegidas
  if (!user && (isDashboard || isAdmin)) {
    const url = request.nextUrl.clone();
    url.pathname = "/fidelity/login";
    return NextResponse.redirect(url);
  }

  // Con sesión -> no tiene sentido ver login/registro
  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/fidelity/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
