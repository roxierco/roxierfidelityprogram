import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith("/fidelity/dashboard")) return NextResponse.next();

  // Billing siempre accesible (para que puedan pagar)
  if (pathname.startsWith("/fidelity/dashboard/billing")) return NextResponse.next();

  const res = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookies: { name: string; value: string; options: CookieOptions }[]) =>
          cookies.forEach(({ name, value, options }) => res.cookies.set(name, value, options)),
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/fidelity/login", req.url));

  // Admins y cuentas de desarrollo pasan directo sin chequeo de pago
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (isAdmin) return res;

  const { data: business } = await supabase
    .from("businesses")
    .select("status")
    .eq("owner_id", user.id)
    .single();

  if (!business) return NextResponse.redirect(new URL("/fidelity/login", req.url));

  // Solo negocios activos pueden usar el dashboard
  // trial = no han puesto tarjeta → van a elegir plan
  // suspended = suscripción cancelada → van a billing
  if (business.status === "active") return res;
  if (business.status === "suspended") return NextResponse.redirect(new URL("/fidelity/dashboard/billing", req.url));

  // trial u otro estado → poner tarjeta primero
  return NextResponse.redirect(new URL("/fidelity/planes", req.url));
}

export const config = {
  matcher: ["/fidelity/dashboard/:path*"],
};
