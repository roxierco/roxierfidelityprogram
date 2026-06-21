import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Solo aplica al dashboard
  if (!pathname.startsWith("/fidelity/dashboard")) return NextResponse.next();

  // La página de billing siempre es accesible (para poder pagar)
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

  // Verificar estado del negocio
  const { data: business } = await supabase
    .from("businesses")
    .select("status, trial_ends_at")
    .eq("owner_id", user.id)
    .single();

  if (!business) return NextResponse.redirect(new URL("/fidelity/login", req.url));

  const isTrial = business.status === "trial";
  const isActive = business.status === "active";
  const isSuspended = business.status === "suspended";

  // Si está activo, dejar pasar
  if (isActive) return res;

  // Si es trial, revisar si expiró
  if (isTrial && business.trial_ends_at) {
    const trialEnds = new Date(business.trial_ends_at);
    if (trialEnds > new Date()) return res; // trial vigente
  }

  // Si es trial sin fecha límite, dejar pasar por ahora
  if (isTrial && !business.trial_ends_at) return res;

  // Trial expirado o cuenta suspendida → billing
  if (isSuspended || (isTrial && business.trial_ends_at && new Date(business.trial_ends_at) <= new Date())) {
    return NextResponse.redirect(new URL("/fidelity/dashboard/billing", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/fidelity/dashboard/:path*"],
};
