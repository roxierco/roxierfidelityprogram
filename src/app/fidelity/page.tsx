import Link from "next/link";
import Image from "next/image";
import { RoxierLogo } from "@/components/brand/XMark";

// Tarjetas reales de clientes, capturadas desde Apple Wallet.
const CARD_EXAMPLES = [
  { src: "/ejemplos/panaderia.jpg", alt: "Tarjeta de lealtad de TheBakeryShop en Apple Wallet" },
  { src: "/ejemplos/barberia.jpg", alt: "Tarjeta de lealtad de BarberShop en Apple Wallet" },
  { src: "/ejemplos/carnitas.jpg", alt: "Tarjeta de lealtad de Carnitas en Apple Wallet" },
  { src: "/ejemplos/cafe.jpg", alt: "Tarjeta de lealtad de RoxierCompany en Apple Wallet" },
];

export default function FidelityLanding() {
  return (
    <div className="min-h-screen bg-white text-[#0E0E10] overflow-x-hidden">

      {/* ── Navbar ────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <RoxierLogo forceDark />
          <nav className="flex items-center gap-6">
            <Link href="#ejemplos" className="hidden text-sm font-medium text-gray-600 hover:text-[#0E0E10] transition-colors sm:block">
              Ejemplos
            </Link>
            <Link href="#como-funciona" className="hidden text-sm font-medium text-gray-600 hover:text-[#0E0E10] transition-colors sm:block">
              Cómo funciona
            </Link>
            <Link href="#precios" className="hidden text-sm font-medium text-gray-600 hover:text-[#0E0E10] transition-colors sm:block">
              Precios
            </Link>
            <Link href="/fidelity/login" className="text-sm font-semibold text-gray-700 hover:text-[#0E0E10] transition-colors">
              Iniciar sesión
            </Link>
            <Link href="/fidelity/registro"
              className="rounded-full bg-[#FF2E63] px-5 py-2 text-sm font-bold text-white hover:bg-[#e0254f] transition-colors shadow-sm">
              Probar gratis
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative mx-auto max-w-6xl px-6 pt-20 pb-24 text-center">
        <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-[#FF2E63]/5 blur-[120px]" />

        <div className="relative z-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-1.5 text-xs font-bold text-green-700">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            7 DÍAS GRATIS · SIN TARJETA
          </span>

          <h1 className="mx-auto mt-8 max-w-4xl text-5xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl">
            Haz que tus clientes{" "}
            <span className="bg-gradient-to-r from-[#FF2E63] to-[#ff6b91] bg-clip-text text-transparent">
              vuelvan más seguido
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 leading-relaxed">
            Cambia las tarjetitas de papel por una tarjeta digital que tus clientes guardan en su celular.
            Tú la creas en minutos, ellos la escanean y regresan por su premio.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/fidelity/registro"
              className="group flex items-center gap-2 rounded-full bg-[#FF2E63] px-8 py-4 text-base font-bold text-white hover:bg-[#e0254f] transition-all hover:scale-105 shadow-lg shadow-[#FF2E63]/25">
              Empieza 7 días gratis
              <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link href="#como-funciona"
              className="rounded-full border border-gray-300 px-8 py-4 text-base font-semibold text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-all">
              Ver cómo funciona
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              No pedimos tarjeta
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              Listo en 5 minutos
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              Cancela cuando quieras
            </span>
          </div>
        </div>
      </section>

      {/* ── Galería de tarjetas ───────────────────────────────────── */}
      <section id="ejemplos" className="py-20 overflow-hidden bg-[#F7F7F6] border-y border-gray-200">
        <div className="mx-auto max-w-6xl px-6 mb-12 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-[#FF2E63] mb-3">Para cualquier negocio</p>
          <h2 className="text-4xl font-extrabold mb-4">Así se ve tu tarjeta</h2>
          <p className="text-gray-600 text-lg max-w-xl mx-auto">
            Cafeterías, barberías, gimnasios, restaurantes... tú eliges los colores, el premio y cuántos sellos pedir.
          </p>
        </div>

        <div className="relative">
          <div className="flex gap-6 px-6 overflow-x-auto pb-4 scrollbar-hide md:justify-center">
            {CARD_EXAMPLES.map((card, i) => (
              <Image
                key={card.src}
                src={card.src}
                alt={card.alt}
                width={620}
                height={860}
                priority={i < 2}
                className="w-[250px] flex-shrink-0 rounded-2xl shadow-xl shadow-black/10 ring-1 ring-black/5"
              />
            ))}
          </div>
          <div className="pointer-events-none absolute left-0 top-0 bottom-4 w-20 bg-gradient-to-r from-[#F7F7F6] to-transparent md:hidden" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-4 w-20 bg-gradient-to-l from-[#F7F7F6] to-transparent md:hidden" />
        </div>

        <div className="text-center mt-10">
          <p className="text-gray-500 text-sm mb-4">Elige colores, íconos y recompensas según tu negocio</p>
          <Link href="/fidelity/registro"
            className="inline-flex items-center gap-2 rounded-full border-2 border-[#FF2E63] px-6 py-3 text-sm font-bold text-[#FF2E63] hover:bg-[#FF2E63] hover:text-white transition-all">
            Crear la mía gratis →
          </Link>
        </div>
      </section>

      {/* ── Beneficios ─────────────────────────────────────────────── */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16 grid grid-cols-2 gap-8 md:grid-cols-4">
          {[
            { value: "5 min", label: "En lo que armas tu tarjeta" },
            { value: "0", label: "Apps que bajar (tú o tus clientes)" },
            { value: "$0", label: "Costo por cliente que registres" },
            { value: "∞", label: "Clientes y sucursales sin límite" },
          ].map((s) => (
            <div key={s.value} className="text-center">
              <p className="text-4xl font-extrabold text-[#FF2E63]">{s.value}</p>
              <p className="mt-1.5 text-sm text-gray-600 leading-snug">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Cómo funciona ──────────────────────────────────────────── */}
      <section id="como-funciona" className="bg-[#F7F7F6] border-y border-gray-200">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-[#FF2E63] mb-3">Simple y rápido</p>
            <h2 className="text-4xl font-extrabold">Listo en 3 pasos</h2>
            <p className="mt-4 text-gray-600 text-lg max-w-xl mx-auto">
              No necesitas saber de tecnología. Si sabes usar WhatsApp, sabes usar Roxier Fidelity.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              { num: "01", icon: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z", title: "Arma tu tarjeta", text: "Pones tu logo, tus colores y qué premio das. En 5 minutos la tienes lista." },
              { num: "02", icon: "M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8H2a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2v-4a2 2 0 00-2-2h-1m-3-6V4a2 2 0 00-2-2H6a2 2 0 00-2 2v10", title: "Tu cliente la guarda", text: "Pones un QR en tu mostrador. El cliente lo escanea y la tarjeta le queda en su celular, en Apple o Google Wallet." },
              { num: "03", icon: "M13 10V3L4 14h7v7l9-11h-7z", title: "Sellas y vuelve", text: "En cada visita escaneas su código. Cuando completa la tarjeta le llega un aviso a su celular con su premio." },
            ].map((step) => (
              <div key={step.num} className="group relative rounded-2xl border border-gray-200 bg-white p-8 shadow-sm hover:shadow-md hover:border-[#FF2E63]/40 transition-all">
                <div className="mb-6 flex items-center gap-4">
                  <span className="text-4xl font-extrabold text-gray-200">{step.num}</span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF2E63]/10">
                    <svg className="h-5 w-5 text-[#FF2E63]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={step.icon} />
                    </svg>
                  </div>
                </div>
                <h3 className="mb-3 text-xl font-bold">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Características ────────────────────────────────────────── */}
      <section id="caracteristicas" className="relative py-24 overflow-hidden bg-white">
        <div className="mx-auto max-w-6xl px-6 relative z-10">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-[#FF2E63] mb-3">Todo incluido</p>
            <h2 className="text-4xl font-extrabold">Todo lo que necesitas, sin costos extra</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: "M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z", title: "Apple Wallet y Google Wallet", text: "La tarjeta les queda guardada junto a sus boletos y tarjetas. Nunca se les pierde." },
              { icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9", title: "Avisos a su celular", text: "Les llega una notificación cuando les das un sello o cuando ya ganaron su premio." },
              { icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", title: "Sellos, cupones y cashback", text: "Elige cómo premiar: tarjeta de sellos, cupón, descuento fijo o devolverles un % de cada compra." },
              { icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", title: "Sabes cómo va tu negocio", text: "Cuántos clientes tienes, quién ya no regresa y a qué horas se te llena el local." },
              { icon: "M20 12l-8 8-8-8 8-8z", title: "Promociones a todos", text: "¿Día flojo? Mandas una promo a todos tus clientes con un clic y les llega al celular." },
              { icon: "M3 21h18M4 21V7l8-4 8 4v14M9 21v-6h6v6", title: "Varias sucursales", text: "Tus clientes acumulan en cualquiera de tus locales, y tú ves cuál vende más." },
            ].map((feat) => (
              <div key={feat.title} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-gray-300 transition-all">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF2E63]/10">
                  <svg className="h-5 w-5 text-[#FF2E63]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={feat.icon} />
                  </svg>
                </div>
                <h3 className="mb-2 font-bold">{feat.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{feat.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Precios ────────────────────────────────────────────────── */}
      <section id="precios" className="relative py-24 overflow-hidden bg-[#F7F7F6] border-y border-gray-200">
        <div className="mx-auto max-w-6xl px-6 relative z-10">

          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-[#FF2E63] mb-4">Planes y precios</p>
            <h2 className="text-4xl font-extrabold mb-4">
              Invierte en lealtad,{" "}
              <span className="bg-gradient-to-r from-[#FF2E63] to-[#ff6b91] bg-clip-text text-transparent">
                no en publicidad.
              </span>
            </h2>
            <p className="text-gray-600 text-lg max-w-lg mx-auto">
              Que un cliente regrese cuesta mucho menos que conseguir uno nuevo.
            </p>
          </div>

          {/* Badge de prueba gratis */}
          <div className="flex justify-center mt-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-5 py-2.5">
              <span className="text-sm font-semibold text-green-700">
                7 días gratis en todos los planes — empieza sin tarjeta
              </span>
            </div>
          </div>

          {/* Cards de planes por período */}
          <div className="grid gap-5 md:grid-cols-3 max-w-4xl mx-auto mt-8">
            {[
              { name: "Mensual", price: "$749", period: "/mes MXN", equiv: "", nota: "", highlight: false },
              { name: "6 meses", price: "$3,999", period: "/6 meses", equiv: "≈ $666/mes", nota: "Ahorras ~11%", highlight: false },
              { name: "Anual", price: "$7,490", period: "/año", equiv: "≈ $624/mes", nota: "2 meses gratis", highlight: true },
            ].map((p) => (
              <div key={p.name}
                className={`relative rounded-2xl p-7 flex flex-col bg-white ${
                  p.highlight
                    ? "border-2 border-[#FF2E63] shadow-xl shadow-[#FF2E63]/10"
                    : "border border-gray-200 shadow-sm"
                }`}>
                {p.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#FF2E63] px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-white whitespace-nowrap shadow-lg shadow-[#FF2E63]/30">
                    Mejor precio
                  </span>
                )}
                <p className="text-lg font-extrabold mb-3">{p.name}</p>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-extrabold">{p.price}</span>
                  <span className="text-gray-500 text-sm mb-1.5">{p.period}</span>
                </div>
                <div className="mb-6 mt-1 h-9">
                  {p.equiv && <p className="text-xs text-gray-500">{p.equiv}</p>}
                  {p.nota && <p className="text-xs font-bold text-green-600">{p.nota}</p>}
                </div>
                <Link href="/fidelity/registro"
                  className={`w-full rounded-xl py-3 text-center text-sm font-bold transition-all ${
                    p.highlight
                      ? "bg-[#FF2E63] text-white hover:bg-[#e0254f] shadow-lg shadow-[#FF2E63]/25"
                      : "border border-gray-300 text-[#0E0E10] hover:border-gray-400 hover:bg-gray-50"
                  }`}>
                  Probar 7 días gratis
                </Link>
              </div>
            ))}
          </div>

          {/* Nota multi-sucursal */}
          <p className="text-center text-xs text-gray-500 mt-6">
            Ubicaciones ilimitadas incluidas · Con 4+ sucursales aplica tarifa multi-sucursal (desde $999/mes)
          </p>

          {/* Todo incluido en cualquier plan */}
          <div className="max-w-3xl mx-auto mt-10">
            <p className="text-center text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Todo incluido en cualquier plan</p>
            <ul className="grid gap-2.5 sm:grid-cols-2">
              {[
                "Tarjetas de lealtad ilimitadas",
                "Cashback, cupones, sellos y descuentos",
                "Apple Wallet y Google Wallet",
                "Notificaciones y promociones",
                "Dashboard con estadísticas",
                "Soporte por WhatsApp",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-gray-700">
                  <svg className="h-4 w-4 flex-shrink-0 text-[#FF2E63]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Garantía / tranquilidad */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-12 text-sm text-gray-500">
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              Sin contrato de permanencia
            </span>
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
              Pago seguro vía Mercado Pago
            </span>
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
              Cancela cuando quieras
            </span>
          </div>
        </div>
      </section>

      {/* ── Preguntas frecuentes ───────────────────────────────────── */}
      <section className="bg-white">
        <div className="mx-auto max-w-3xl px-6 py-24">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-[#FF2E63] mb-3">Dudas comunes</p>
            <h2 className="text-4xl font-extrabold">Preguntas frecuentes</h2>
          </div>
          <div className="space-y-3">
            {[
              { q: "¿Mis clientes tienen que bajar una app?", a: "No. Escanean un QR y la tarjeta se les guarda en el Wallet que ya trae su celular (Apple o Google). No instalan nada." },
              { q: "¿Necesito saber de tecnología?", a: "No. Si sabes usar WhatsApp, puedes usar Roxier Fidelity. Armas tu tarjeta eligiendo colores y premio, y listo." },
              { q: "¿Qué pasa cuando terminen mis 7 días gratis?", a: "Si no activas un plan, pierdes el acceso al panel hasta que pagues. Tus clientes y sus sellos no se borran: quedan guardados esperándote." },
              { q: "¿Me van a cobrar durante la prueba?", a: "No. Puedes probar sin poner tarjeta. Y si decides registrarla desde el inicio, tampoco se te cobra nada hasta que terminen los 7 días." },
              { q: "¿Necesito un aparato especial para escanear?", a: "No. Escaneas con la cámara de tu celular o computadora. Si prefieres, también puedes conectar una pistola lectora de códigos." },
              { q: "¿Sirve si tengo varias sucursales?", a: "Sí. Tus clientes acumulan en cualquiera de tus locales y tú puedes ver cuál tiene más movimiento. Hasta 3 sucursales al precio normal." },
            ].map((item) => (
              <details key={item.q} className="group rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
                <summary className="flex cursor-pointer items-center justify-between font-semibold list-none">
                  {item.q}
                  <svg className="h-5 w-5 flex-shrink-0 text-gray-400 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="mt-3 text-gray-600 leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ──────────────────────────────────────────────── */}
      <section className="relative mx-auto max-w-6xl px-6 pb-24">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FF2E63] to-[#8B0028] p-12 text-center shadow-2xl shadow-[#FF2E63]/20">
          <div className="relative z-10">
            <h2 className="text-4xl font-extrabold text-white mb-4">Empieza hoy, sin pagar nada</h2>
            <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
              Arma tu tarjeta en 5 minutos y empieza a hacer que tus clientes regresen.
            </p>
            <Link href="/fidelity/registro"
              className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-base font-bold text-[#FF2E63] hover:bg-white/90 transition-all hover:scale-105 shadow-xl">
              Empieza 7 días gratis
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <p className="mt-4 text-white/80 text-sm">Sin tarjeta de crédito · Cancela cuando quieras</p>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-10 flex flex-col items-center justify-between gap-6 sm:flex-row">
          <RoxierLogo forceDark />
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <Link href="/fidelity/login" className="hover:text-[#0E0E10] transition-colors">Iniciar sesión</Link>
            <Link href="/fidelity/registro" className="hover:text-[#0E0E10] transition-colors">Registrarse</Link>
          </div>
          <p className="text-sm text-gray-400">© {new Date().getFullYear()} Roxier Co.</p>
        </div>
      </footer>
    </div>
  );
}
