import Link from "next/link";
import { RoxierLogo } from "@/components/brand/XMark";

// Tarjeta de ejemplo reutilizable
function CardDemo({
  bg,
  accent,
  textColor = "white",
  business,
  initial,
  reward,
  stamped,
  total,
  icon,
}: {
  bg: string;
  accent: string;
  textColor?: string;
  business: string;
  initial: string;
  reward: string;
  stamped: number;
  total: number;
  icon: string;
}) {
  return (
    <div className="relative rounded-2xl p-5 shadow-xl text-left flex-shrink-0 w-64" style={{ background: bg, color: textColor }}>
      <div className="flex items-center gap-2.5 mb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-black" style={{ background: accent, color: bg }}>
          {initial}
        </div>
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest opacity-50">Tarjeta de fidelidad</p>
          <p className="font-bold text-sm leading-tight">{business}</p>
        </div>
        <div className="ml-auto text-xs font-bold opacity-50">{stamped}/{total}</div>
      </div>

      <p className="text-[9px] font-bold uppercase tracking-widest opacity-40 mb-1.5">Sellos</p>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} className="flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-black"
            style={{
              borderColor: i < stamped ? accent : `${textColor}30`,
              background: i < stamped ? accent : "transparent",
              color: i < stamped ? bg : `${textColor}30`,
            }}>
            {i < stamped ? icon : ""}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest opacity-40">Recompensa</p>
          <p className="text-sm font-bold">{reward}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl opacity-20">
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor">
            <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" />
          </svg>
        </div>
      </div>
    </div>
  );
}

const CARD_EXAMPLES = [
  { bg: "#1C0A00", accent: "#D97706", business: "La Taquería del Centro", initial: "T", reward: "🌮 Taco gratis", stamped: 7, total: 10, icon: "★" },
  { bg: "#0C1A2E", accent: "#3B82F6", business: "Roxier Coffee", initial: "R", reward: "☕ Café gratis", stamped: 4, total: 8, icon: "✓" },
  { bg: "#0D2016", accent: "#16A34A", business: "Barbería El Estilo", initial: "E", reward: "✂️ Corte gratis", stamped: 2, total: 6, icon: "★" },
  { bg: "#130020", accent: "#A855F7", business: "Spa Serenidad", initial: "S", reward: "💆 Masaje gratis", stamped: 5, total: 8, icon: "♥" },
  { bg: "#1A0010", accent: "#EC4899", business: "Pastelería Dulce", initial: "D", reward: "🎂 Pastel gratis", stamped: 9, total: 12, icon: "★" },
  { bg: "#FFFFFF", accent: "#0E0E10", textColor: "#0E0E10", business: "Gym FitZone", initial: "F", reward: "🏋️ Mes gratis", stamped: 3, total: 10, icon: "✓" },
];

export default function FidelityLanding() {
  return (
    <div className="min-h-screen bg-[#09090B] text-white overflow-x-hidden">

      {/* ── Navbar ────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#09090B]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <RoxierLogo />
          <nav className="flex items-center gap-6">
            <Link href="#ejemplos" className="hidden text-sm font-medium text-white/50 hover:text-white transition-colors sm:block">
              Ejemplos
            </Link>
            <Link href="#como-funciona" className="hidden text-sm font-medium text-white/50 hover:text-white transition-colors sm:block">
              Cómo funciona
            </Link>
            <Link href="/fidelity/login" className="text-sm font-semibold text-white/70 hover:text-white transition-colors">
              Iniciar sesión
            </Link>
            <Link href="/fidelity/registro"
              className="rounded-full bg-[#FF2E63] px-5 py-2 text-sm font-bold text-white hover:bg-[#e0254f] transition-colors">
              Empieza gratis
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative mx-auto max-w-6xl px-6 pt-20 pb-32 text-center">
        <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-[#FF2E63]/10 blur-[120px]" />

        <div className="relative z-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#FF2E63]/30 bg-[#FF2E63]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#FF2E63]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#FF2E63] animate-pulse" />
            Roxier Co. · Agencia Digital
          </span>

          <h1 className="mx-auto mt-8 max-w-4xl text-5xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl">
            El programa de lealtad{" "}
            <span className="bg-gradient-to-r from-[#FF2E63] to-[#ff6b91] bg-clip-text text-transparent">
              más simple
            </span>{" "}
            para tu negocio.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/50 leading-relaxed">
            Crea tarjetas de lealtad digitales en minutos. Tus clientes las guardan en Google Wallet
            directamente desde su celular — sin apps, sin fricciones.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/fidelity/registro"
              className="group flex items-center gap-2 rounded-full bg-[#FF2E63] px-8 py-3.5 text-base font-bold text-white hover:bg-[#e0254f] transition-all hover:scale-105 shadow-lg shadow-[#FF2E63]/25">
              Empieza gratis
              <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link href="/fidelity/login"
              className="rounded-full border border-white/10 px-8 py-3.5 text-base font-semibold text-white/70 hover:border-white/30 hover:text-white transition-all">
              Ya tengo cuenta
            </Link>
          </div>
          <p className="mt-4 text-sm text-white/30">7 días gratis · Sin compromisos · Cancela cuando quieras</p>
        </div>

        {/* Tarjeta hero */}
        <div className="relative mx-auto mt-20 max-w-sm">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#FF2E63]/40 to-purple-600/20 blur-2xl scale-110" />
          <div className="relative rounded-3xl bg-gradient-to-br from-[#FF2E63] to-[#8B0028] p-6 shadow-2xl text-left">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 text-white font-black text-lg">R</div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">Tarjeta de fidelidad</p>
                <p className="font-bold text-white text-base">Roxier Coffee</p>
              </div>
              <div className="ml-auto text-xs font-bold text-white/60">6 / 10</div>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2">Sellos</p>
            <div className="flex flex-wrap gap-2 mb-5">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-black transition-all ${i < 6 ? "border-white bg-white text-[#FF2E63]" : "border-white/30 text-white/30"}`}>
                  {i < 6 ? "✓" : ""}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">Recompensa</p>
                <p className="text-sm font-bold text-white">☕ Café gratis</p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/10 text-white/60">
                <svg viewBox="0 0 24 24" className="h-8 w-8" fill="currentColor">
                  <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm px-4 py-2">
            <div className="h-4 w-4 rounded-full bg-[#4285F4]" />
            <span className="text-xs font-semibold text-white/80">Guardado en Google Wallet</span>
          </div>
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────────────────── */}
      <section className="border-y border-white/[0.06] bg-white/[0.02]">
        <div className="mx-auto max-w-6xl px-6 py-14 grid grid-cols-2 gap-8 md:grid-cols-4">
          {[
            { value: "4s", label: "Para registrar un cliente nuevo" },
            { value: "0", label: "Apps que instalar" },
            { value: "100%", label: "Digital y en tiempo real" },
            { value: "∞", label: "Clientes sin límite" },
          ].map((s) => (
            <div key={s.value} className="text-center">
              <p className="text-4xl font-extrabold text-white">{s.value}</p>
              <p className="mt-1 text-sm text-white/40 leading-snug">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Ejemplos de tarjetas ───────────────────────────────────── */}
      <section id="ejemplos" className="py-28 overflow-hidden">
        <div className="mx-auto max-w-6xl px-6 mb-12 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-[#FF2E63] mb-3">Para cualquier negocio</p>
          <h2 className="text-4xl font-extrabold text-white mb-4">Así se ve en tu negocio</h2>
          <p className="text-white/40 text-lg max-w-xl mx-auto">Personaliza colores, íconos y recompensas. Cada tarjeta es única para tu marca.</p>
        </div>

        {/* Scroll horizontal de tarjetas */}
        <div className="relative">
          <div className="flex gap-5 px-6 overflow-x-auto pb-6 scrollbar-hide md:justify-center md:flex-wrap md:overflow-visible">
            {CARD_EXAMPLES.map((card, i) => (
              <CardDemo key={i} {...card} />
            ))}
          </div>
          {/* Gradiente en los bordes para indicar scroll */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-6 w-16 bg-gradient-to-r from-[#09090B] to-transparent md:hidden" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-6 w-16 bg-gradient-to-l from-[#09090B] to-transparent md:hidden" />
        </div>

        <div className="text-center mt-10">
          <Link href="/fidelity/registro"
            className="inline-flex items-center gap-2 rounded-full border border-[#FF2E63]/40 px-6 py-3 text-sm font-bold text-[#FF2E63] hover:bg-[#FF2E63]/10 transition-all">
            Crea la tuya gratis →
          </Link>
        </div>
      </section>

      {/* ── Cómo funciona ──────────────────────────────────────────── */}
      <section id="como-funciona" className="mx-auto max-w-6xl px-6 py-28">
        <div className="text-center mb-16">
          <p className="text-xs font-bold uppercase tracking-widest text-[#FF2E63] mb-3">Simple y rápido</p>
          <h2 className="text-4xl font-extrabold text-white">Listo en 3 pasos</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            { num: "01", icon: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z", title: "Diseña tu tarjeta", text: "Crea tu tarjeta de lealtad digital con tu logo, colores y recompensas en menos de 5 minutos." },
            { num: "02", icon: "M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8H2a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2v-4a2 2 0 00-2-2h-1m-3-6V4a2 2 0 00-2-2H6a2 2 0 00-2 2v10", title: "Tus clientes escanean", text: "El cliente escanea un QR en tu negocio y su tarjeta queda guardada en Google Wallet al instante." },
            { num: "03", icon: "M13 10V3L4 14h7v7l9-11h-7z", title: "Sella y recompensa", text: "Escanea su tarjeta en cada visita. Al completarla, le llega una notificación con su premio automáticamente." },
          ].map((step) => (
            <div key={step.num} className="group relative rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 hover:border-[#FF2E63]/30 hover:bg-white/[0.05] transition-all">
              <div className="mb-6 flex items-center gap-4">
                <span className="text-4xl font-extrabold text-white/10">{step.num}</span>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF2E63]/10">
                  <svg className="h-5 w-5 text-[#FF2E63]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={step.icon} />
                  </svg>
                </div>
              </div>
              <h3 className="mb-3 text-xl font-bold text-white">{step.title}</h3>
              <p className="text-white/50 leading-relaxed">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Características ────────────────────────────────────────── */}
      <section id="caracteristicas" className="relative py-28 overflow-hidden">
        <div className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-[#FF2E63]/5 blur-[100px]" />
        <div className="mx-auto max-w-6xl px-6 relative z-10">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-[#FF2E63] mb-3">Todo incluido</p>
            <h2 className="text-4xl font-extrabold text-white">Herramientas que tu negocio necesita</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: "M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z", title: "Google Wallet integrado", text: "Tus clientes guardan su tarjeta directamente en Google Wallet con un toque." },
              { icon: "M13 10V3L4 14h7v7l9-11h-7z", title: "Actualización en tiempo real", text: "La tarjeta del cliente se actualiza al instante cuando escaneas su QR. Sin recargar nada." },
              { icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9", title: "Notificaciones push gratis", text: "Avisa a tus clientes de sellos y promociones directamente en su celular, sin costo extra." },
              { icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", title: "Dashboard de analytics", text: "Ve en tiempo real cuántos clientes tienes, visitas del mes y recompensas canjeadas." },
              { icon: "M20 12l-8 8-8-8 8-8z", title: "Promociones masivas", text: "Crea una promo y envíala por email y notificación a todos tus clientes con un clic." },
              { icon: "M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4", title: "Sin apps que instalar", text: "Todo funciona desde el navegador. Ni tú ni tus clientes necesitan descargar nada." },
            ].map((feat) => (
              <div key={feat.title} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 hover:border-white/[0.12] hover:bg-white/[0.04] transition-all">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF2E63]/10">
                  <svg className="h-5 w-5 text-[#FF2E63]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={feat.icon} />
                  </svg>
                </div>
                <h3 className="mb-2 font-bold text-white">{feat.title}</h3>
                <p className="text-sm text-white/45 leading-relaxed">{feat.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ──────────────────────────────────────────────── */}
      <section className="relative mx-auto max-w-6xl px-6 py-28">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FF2E63] to-[#8B0028] p-12 text-center shadow-2xl shadow-[#FF2E63]/20">
          <div className="relative z-10">
            <h2 className="text-4xl font-extrabold text-white mb-4">¿Listo para fidelizar a tus clientes?</h2>
            <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">
              Únete a los negocios que ya están construyendo clientes leales con Roxier Fidelity.
            </p>
            <Link href="/fidelity/registro"
              className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-base font-bold text-[#FF2E63] hover:bg-white/90 transition-all hover:scale-105 shadow-xl">
              Crea tu cuenta gratis
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <p className="mt-4 text-white/40 text-sm">7 días gratis · Cancela cuando quieras</p>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.06]">
        <div className="mx-auto max-w-6xl px-6 py-10 flex flex-col items-center justify-between gap-6 sm:flex-row">
          <RoxierLogo />
          <div className="flex items-center gap-6 text-sm text-white/30">
            <Link href="/fidelity/login" className="hover:text-white/60 transition-colors">Iniciar sesión</Link>
            <Link href="/fidelity/registro" className="hover:text-white/60 transition-colors">Registrarse</Link>
          </div>
          <p className="text-sm text-white/20">© {new Date().getFullYear()} Roxier Co.</p>
        </div>
      </footer>

    </div>
  );
}
