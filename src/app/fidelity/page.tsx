import Link from "next/link";
import { RoxierLogo } from "@/components/brand/XMark";

function QRMockup() {
  return (
    <svg viewBox="0 0 33 33" fill="currentColor" className="h-full w-full">
      {/* Esquina superior izquierda */}
      <rect x="0" y="0" width="9" height="9" />
      <rect x="1" y="1" width="7" height="7" fill="white" />
      <rect x="2" y="2" width="5" height="5" />
      {/* Esquina superior derecha */}
      <rect x="24" y="0" width="9" height="9" />
      <rect x="25" y="1" width="7" height="7" fill="white" />
      <rect x="26" y="2" width="5" height="5" />
      {/* Esquina inferior izquierda */}
      <rect x="0" y="24" width="9" height="9" />
      <rect x="1" y="25" width="7" height="7" fill="white" />
      <rect x="2" y="26" width="5" height="5" />
      {/* Datos simulados */}
      <rect x="11" y="0" width="2" height="2" /><rect x="14" y="0" width="2" height="2" /><rect x="17" y="0" width="2" height="2" /><rect x="20" y="0" width="2" height="2" />
      <rect x="11" y="3" width="2" height="2" /><rect x="15" y="3" width="2" height="2" /><rect x="19" y="3" width="2" height="2" />
      <rect x="11" y="6" width="2" height="2" /><rect x="14" y="6" width="2" height="2" /><rect x="17" y="6" width="2" height="2" /><rect x="21" y="6" width="2" height="2" />
      <rect x="0" y="11" width="2" height="2" /><rect x="3" y="11" width="2" height="2" /><rect x="6" y="11" width="2" height="2" /><rect x="10" y="11" width="2" height="2" /><rect x="13" y="11" width="2" height="2" /><rect x="16" y="11" width="2" height="2" /><rect x="19" y="11" width="2" height="2" /><rect x="23" y="11" width="2" height="2" /><rect x="26" y="11" width="2" height="2" /><rect x="30" y="11" width="2" height="2" />
      <rect x="0" y="14" width="2" height="2" /><rect x="4" y="14" width="2" height="2" /><rect x="8" y="14" width="2" height="2" /><rect x="12" y="14" width="2" height="2" /><rect x="17" y="14" width="2" height="2" /><rect x="21" y="14" width="2" height="2" /><rect x="25" y="14" width="2" height="2" /><rect x="29" y="14" width="2" height="2" />
      <rect x="2" y="17" width="2" height="2" /><rect x="6" y="17" width="2" height="2" /><rect x="10" y="17" width="2" height="2" /><rect x="14" y="17" width="2" height="2" /><rect x="18" y="17" width="2" height="2" /><rect x="22" y="17" width="2" height="2" /><rect x="27" y="17" width="2" height="2" /><rect x="31" y="17" width="2" height="2" />
      <rect x="0" y="20" width="2" height="2" /><rect x="4" y="20" width="2" height="2" /><rect x="9" y="20" width="2" height="2" /><rect x="13" y="20" width="2" height="2" /><rect x="17" y="20" width="2" height="2" /><rect x="20" y="20" width="2" height="2" /><rect x="24" y="20" width="2" height="2" /><rect x="28" y="20" width="2" height="2" />
      <rect x="11" y="24" width="2" height="2" /><rect x="15" y="24" width="2" height="2" /><rect x="19" y="25" width="2" height="2" /><rect x="23" y="24" width="2" height="2" /><rect x="28" y="24" width="2" height="2" /><rect x="31" y="24" width="2" height="2" />
      <rect x="11" y="27" width="2" height="2" /><rect x="14" y="27" width="2" height="2" /><rect x="18" y="27" width="2" height="2" /><rect x="22" y="27" width="2" height="2" /><rect x="26" y="27" width="2" height="2" /><rect x="30" y="27" width="2" height="2" />
      <rect x="11" y="30" width="2" height="2" /><rect x="16" y="30" width="2" height="2" /><rect x="20" y="30" width="2" height="2" /><rect x="24" y="30" width="2" height="2" /><rect x="28" y="31" width="2" height="2" />
    </svg>
  );
}

function CardDemo({
  image,
  accent,
  business,
  category,
  initial,
  reward,
  stamped,
  total,
  icon,
}: {
  image: string;
  accent: string;
  business: string;
  category: string;
  initial: string;
  reward: string;
  stamped: number;
  total: number;
  icon: string;
}) {
  return (
    <div className="relative rounded-2xl overflow-hidden flex-shrink-0 w-64 h-80 shadow-2xl text-white">
      {/* Imagen de fondo */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image} alt={business} className="absolute inset-0 w-full h-full object-cover" />
      {/* Overlay oscuro */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80" />

      {/* Contenido */}
      <div className="relative h-full flex flex-col p-4">
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-black flex-shrink-0" style={{ background: accent, color: "white" }}>
            {initial}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm leading-tight truncate">{business}</p>
            <p className="text-[9px] font-bold uppercase tracking-widest text-white/50">{category}</p>
          </div>
        </div>

        {/* QR central */}
        <div className="flex flex-1 items-center justify-center">
          <div className="bg-white rounded-2xl p-3 shadow-xl">
            <div className="h-20 w-20 text-black">
              <QRMockup />
            </div>
            <p className="text-center text-[8px] font-bold text-black/40 uppercase tracking-widest mt-1.5">Escanear</p>
          </div>
        </div>

        {/* Footer: sellos + recompensa */}
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-1 flex-wrap">
            {Array.from({ length: total }).map((_, i) => (
              <div key={i}
                className="flex h-5 w-5 items-center justify-center rounded-full border text-[9px] font-black transition-all"
                style={{
                  borderColor: i < stamped ? accent : "rgba(255,255,255,0.3)",
                  background: i < stamped ? accent : "transparent",
                  color: i < stamped ? "white" : "rgba(255,255,255,0.3)",
                }}>
                {i < stamped ? icon : ""}
              </div>
            ))}
            <span className="ml-auto text-[9px] font-bold text-white/40">{stamped}/{total}</span>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-white/80">{reward}</p>
            <div className="h-2 w-2 rounded-full animate-pulse" style={{ background: accent }} />
          </div>
        </div>
      </div>
    </div>
  );
}

const CARD_EXAMPLES = [
  {
    image: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=400&q=80",
    accent: "#D97706",
    business: "La Taquería del Centro",
    category: "Restaurante",
    initial: "T",
    reward: "🌮 Taco gratis",
    stamped: 7,
    total: 10,
    icon: "★",
  },
  {
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80",
    accent: "#FF2E63",
    business: "Roxier Coffee",
    category: "Cafetería",
    initial: "R",
    reward: "☕ Café gratis",
    stamped: 4,
    total: 8,
    icon: "✓",
  },
  {
    image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&q=80",
    accent: "#EAB308",
    business: "Barbería El Estilo",
    category: "Barbería",
    initial: "E",
    reward: "✂️ Corte gratis",
    stamped: 3,
    total: 6,
    icon: "★",
  },
  {
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&q=80",
    accent: "#A855F7",
    business: "Spa Serenidad",
    category: "Spa & Bienestar",
    initial: "S",
    reward: "💆 Masaje gratis",
    stamped: 5,
    total: 8,
    icon: "♥",
  },
  {
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&q=80",
    accent: "#EC4899",
    business: "Pastelería Dulce",
    category: "Pastelería",
    initial: "D",
    reward: "🎂 Pastel gratis",
    stamped: 9,
    total: 12,
    icon: "★",
  },
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
            <Link href="#precios" className="hidden text-sm font-medium text-white/50 hover:text-white transition-colors sm:block">
              Precios
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
      <section className="relative mx-auto max-w-6xl px-6 pt-20 pb-28 text-center">
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
      </section>

      {/* ── Galería de tarjetas con imagen ────────────────────────── */}
      <section id="ejemplos" className="py-20 overflow-hidden">
        <div className="mx-auto max-w-6xl px-6 mb-12 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-[#FF2E63] mb-3">Para cualquier negocio</p>
          <h2 className="text-4xl font-extrabold text-white mb-4">Así se ve tu tarjeta</h2>
          <p className="text-white/40 text-lg max-w-xl mx-auto">
            Tus clientes escanean el QR, acumulan sellos y reciben su recompensa — todo desde su celular.
          </p>
        </div>

        <div className="relative">
          <div className="flex gap-5 px-6 overflow-x-auto pb-4 scrollbar-hide md:justify-center">
            {CARD_EXAMPLES.map((card, i) => (
              <CardDemo key={i} {...card} />
            ))}
          </div>
          <div className="pointer-events-none absolute left-0 top-0 bottom-4 w-20 bg-gradient-to-r from-[#09090B] to-transparent md:hidden" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-4 w-20 bg-gradient-to-l from-[#09090B] to-transparent md:hidden" />
        </div>

        <div className="text-center mt-10">
          <p className="text-white/30 text-sm mb-4">Elige colores, íconos y recompensas según tu negocio</p>
          <Link href="/fidelity/registro"
            className="inline-flex items-center gap-2 rounded-full border border-[#FF2E63]/40 px-6 py-3 text-sm font-bold text-[#FF2E63] hover:bg-[#FF2E63]/10 transition-all">
            Crea la tuya gratis →
          </Link>
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

      {/* ── Cómo funciona ──────────────────────────────────────────── */}
      <section id="como-funciona" className="mx-auto max-w-6xl px-6 py-28">
        <div className="text-center mb-16">
          <p className="text-xs font-bold uppercase tracking-widest text-[#FF2E63] mb-3">Simple y rápido</p>
          <h2 className="text-4xl font-extrabold text-white">Listo en 3 pasos</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            { num: "01", icon: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z", title: "Diseña tu tarjeta", text: "Crea tu tarjeta de lealtad digital con tu logo, colores y recompensas en menos de 5 minutos." },
            { num: "02", icon: "M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8H2a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2v-4a2 2 0 00-2-2h-1m-3-6V4a2 2 0 00-2-2H6a2 2 0 00-2 2v10", title: "Tus clientes escanean", text: "El cliente escanea el QR en tu negocio y su tarjeta queda guardada en Google Wallet al instante." },
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

      {/* ── Precios ────────────────────────────────────────────────── */}
      <section id="precios" className="relative py-28 overflow-hidden">
        <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[500px] w-[700px] rounded-full bg-[#FF2E63]/8 blur-[120px]" />
        <div className="mx-auto max-w-6xl px-6 relative z-10">

          <div className="text-center mb-4">
            <p className="text-xs font-bold uppercase tracking-widest text-[#FF2E63] mb-4">Planes y precios</p>
            <h2 className="text-4xl font-extrabold text-white mb-4">
              Cuesta menos que un empleado.<br />
              <span className="bg-gradient-to-r from-[#FF2E63] to-[#ff6b91] bg-clip-text text-transparent">
                Trabaja 24/7 sin quejarse.
              </span>
            </h2>
            <p className="text-white/40 text-lg max-w-lg mx-auto">
              Sin contratos anuales. Sin cuota de instalación. Cancela cuando quieras.
            </p>
          </div>

          {/* Badge de prueba gratis */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/[0.05] border border-white/10 px-5 py-2.5">
              <svg className="h-4 w-4 text-[#FF2E63]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-semibold text-white/70">7 días gratis en ambos planes — tarjeta requerida, cobro al término</span>
            </div>
          </div>

          {/* Cards de planes */}
          <div className="grid gap-6 md:grid-cols-2 max-w-3xl mx-auto">

            {/* Plan Básico */}
            <div className="relative rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 flex flex-col">
              <div className="mb-6">
                <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-1">Plan</p>
                <h3 className="text-2xl font-extrabold text-white mb-1">Básico</h3>
                <p className="text-white/40 text-sm">Todo lo que necesitas para empezar</p>
              </div>
              <div className="flex items-end gap-1 mb-8">
                <span className="text-5xl font-extrabold text-white">$549</span>
                <span className="text-white/40 text-sm mb-2">/mes MXN</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {[
                  "1 tarjeta de lealtad activa",
                  "Clientes ilimitados",
                  "QR para sellos en segundos",
                  "Guardado en Google Wallet",
                  "Notificaciones push",
                  "Promociones a clientes",
                  "Dashboard con analytics",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-white/70">
                    <svg className="h-4 w-4 flex-shrink-0 text-[#FF2E63]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/fidelity/registro"
                className="w-full rounded-xl border border-white/15 py-3 text-center text-sm font-bold text-white hover:border-white/30 hover:bg-white/[0.05] transition-all">
                Probar 7 días gratis
              </Link>
            </div>

            {/* Plan Pro — destacado */}
            <div className="relative rounded-2xl border border-[#FF2E63]/50 bg-gradient-to-b from-[#FF2E63]/10 to-transparent p-8 flex flex-col">
              {/* Badge popular */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="inline-block rounded-full bg-[#FF2E63] px-4 py-1 text-[10px] font-extrabold uppercase tracking-widest text-white shadow-lg shadow-[#FF2E63]/30">
                  Más popular
                </span>
              </div>
              <div className="mb-6">
                <p className="text-xs font-bold uppercase tracking-widest text-[#FF2E63]/70 mb-1">Plan</p>
                <h3 className="text-2xl font-extrabold text-white mb-1">Pro</h3>
                <p className="text-white/40 text-sm">Para negocios que quieren más impacto</p>
              </div>
              <div className="flex items-end gap-1 mb-8">
                <span className="text-5xl font-extrabold text-white">$749</span>
                <span className="text-white/40 text-sm mb-2">/mes MXN</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {[
                  "3 tarjetas de lealtad activas",
                  "Clientes ilimitados",
                  "QR para sellos en segundos",
                  "Guardado en Google Wallet",
                  "Notificaciones push",
                  "Promociones a clientes",
                  "Dashboard con analytics",
                  "Soporte prioritario por WhatsApp",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-white/70">
                    <svg className="h-4 w-4 flex-shrink-0 text-[#FF2E63]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/fidelity/registro"
                className="w-full rounded-xl bg-[#FF2E63] py-3 text-center text-sm font-bold text-white hover:bg-[#e0254f] transition-all shadow-lg shadow-[#FF2E63]/25">
                Probar 7 días gratis
              </Link>
            </div>
          </div>

          {/* Garantía / tranquilidad */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-12 text-sm text-white/30">
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              Sin contrato de permanencia
            </span>
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
              Pago seguro vía Mercado Pago
            </span>
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
              Cancela cuando quieras
            </span>
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
