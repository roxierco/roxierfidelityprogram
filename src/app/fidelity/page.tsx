import Link from "next/link";
import Image from "next/image";
import { RoxierLogo, XMark } from "@/components/brand/XMark";
import { WhatsAppFab } from "@/components/ui/WhatsAppFab";

/**
 * Tarjetas reales de clientes, capturadas desde Apple Wallet.
 * `w`/`h` son las dimensiones reales del archivo: cada captura salió de un
 * celular distinto, así que sus proporciones no coinciden (0.709 a 0.724).
 * Pasarle a next/image las medidas de verdad evita que se aplasten.
 */
const CARD_EXAMPLES = [
  { src: "/ejemplos/panaderia.jpg", w: 620, h: 856, alt: "Tarjeta de lealtad de TheBakeryShop en Apple Wallet" },
  { src: "/ejemplos/barberia.jpg", w: 559, h: 778, alt: "Tarjeta de lealtad de BarberShop en Apple Wallet" },
  { src: "/ejemplos/carnitas.jpg", w: 612, h: 855, alt: "Tarjeta de lealtad de Carnitas en Apple Wallet" },
  { src: "/ejemplos/cafe.jpg", w: 620, h: 874, alt: "Tarjeta de lealtad de RoxierCompany en Apple Wallet" },
  { src: "/ejemplos/TarjetaRoxier.jpg", w: 1083, h: 1509, alt: "Tarjeta de sellos con estrellas de RoxierCompany en Apple Wallet" },
];

/**
 * Proporción única para mostrar todas las tarjetas. Es el promedio de las
 * cinco capturas, así todas quedan de la misma altura y alineadas en la fila.
 */
const CARD_RATIO = "0.716";

/**
 * Una tarjeta de ejemplo, normalizada.
 * El recorte importa: las capturas ya traen sus propias esquinas redondeadas
 * (de 4 a 6 px a este tamaño) y `cafe.jpg` además trae franjas negras arriba y
 * abajo. El contenedor recorta con `object-cover` y un `scale` mínimo que se
 * come esos bordes, y el redondeo lo pone el CSS una sola vez para todas.
 */
function CardShot({
  card,
  className = "",
  radius = "rounded-[10px]",
  priority = false,
}: {
  card: (typeof CARD_EXAMPLES)[number];
  className?: string;
  radius?: string;
  priority?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden ${radius} ring-1 ring-black/[0.08] ${className}`}
      style={{ aspectRatio: CARD_RATIO }}
    >
      <Image
        src={card.src}
        alt={card.alt}
        width={card.w}
        height={card.h}
        priority={priority}
        className="h-full w-full scale-[1.035] object-cover"
      />
    </div>
  );
}

/**
 * Mockup del celular para el hero.
 * Se dibuja con CSS (marco, isla dinámica, barra de estado) y adentro va la
 * captura real de la tarjeta en Wallet. Así se lee como una foto de producto
 * y no como un JPG recortado flotando.
 */
function PhoneMockup() {
  return (
    <div className="relative mx-auto w-[276px] sm:w-[300px]">
      <div className="rounded-[2.6rem] bg-gradient-to-b from-[#3A3532] to-[#17140F] p-[11px] shadow-[0_50px_90px_-35px_rgba(0,0,0,0.55)]">
        <div className="relative overflow-hidden rounded-[2.05rem] bg-[#0A0A0B]">

          {/* Isla dinámica */}
          <div className="absolute left-1/2 top-2 z-20 h-[24px] w-[88px] -translate-x-1/2 rounded-full bg-black" />

          {/* Barra de estado */}
          <div className="flex items-center justify-between px-6 pb-1.5 pt-3 text-[11px] font-semibold text-white">
            <span className="tracking-tight">9:41</span>
            <span className="flex items-center gap-[5px]">
              {/* Señal */}
              <span className="flex items-end gap-[2px]">
                <span className="h-[4px] w-[3px] rounded-[1px] bg-white" />
                <span className="h-[6px] w-[3px] rounded-[1px] bg-white" />
                <span className="h-[8px] w-[3px] rounded-[1px] bg-white" />
                <span className="h-[10px] w-[3px] rounded-[1px] bg-white/40" />
              </span>
              {/* Wi-Fi */}
              <svg viewBox="0 0 16 12" className="h-[11px] w-[14px] fill-white">
                <path d="M8 11.2 5.9 8.8a3.1 3.1 0 0 1 4.2 0L8 11.2Zm-4-4.6L2.4 4.8a8.2 8.2 0 0 1 11.2 0L12 6.6a5.9 5.9 0 0 0-8 0Z" />
              </svg>
              {/* Batería */}
              <span className="relative flex h-[11px] w-[22px] items-center rounded-[3px] border border-white/50 px-[2px]">
                <span className="h-[5px] w-full rounded-[1px] bg-white" />
                <span className="absolute -right-[3px] h-[4px] w-[2px] rounded-r-[1px] bg-white/50" />
              </span>
            </span>
          </div>

          {/* Encabezado de Wallet */}
          <div className="flex items-baseline justify-between px-5 pb-3 pt-3">
            <span className="text-[20px] font-bold tracking-[-0.02em] text-white">Wallet</span>
            <span className="text-[12px] text-white/40">Tarjetas</span>
          </div>

          {/* La tarjeta del negocio */}
          <div className="px-3 pb-3">
            <CardShot
              card={CARD_EXAMPLES[4]}
              priority
              radius="rounded-[14px]"
              className="w-full shadow-[0_10px_25px_-8px_rgba(0,0,0,0.6)]"
            />
          </div>

          {/* Tarjetas apiladas detrás, como se ven en Wallet */}
          <div className="px-3 pb-8">
            <div className="mx-auto h-[14px] w-[92%] rounded-t-[12px] bg-[#2E6B4F]" />
            <div className="mx-auto -mt-[6px] h-[14px] w-[84%] rounded-t-[12px] bg-[#8A4A2B]" />
          </div>

          {/* Barra de inicio */}
          <div className="absolute bottom-2 left-1/2 h-[4px] w-[110px] -translate-x-1/2 rounded-full bg-white/40" />
        </div>
      </div>

      {/* Notificación de push, encimada — enseña la función estrella */}
      <div className="absolute -left-6 bottom-16 w-[236px] rounded-[18px] bg-white/95 p-3 shadow-[0_20px_45px_-15px_rgba(0,0,0,0.35)] ring-1 ring-black/[0.06] backdrop-blur-sm sm:-left-12">
        <div className="flex gap-2.5">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[9px] bg-[#12100E]">
            <XMark className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-[11.5px] font-semibold tracking-[-0.01em]">Roxier Fidelity</p>
              <span className="flex-shrink-0 text-[10px] text-[#A8A29E]">ahora</span>
            </div>
            <p className="mt-0.5 text-[11.5px] leading-snug text-[#57534E]">
              Completaste tus 8 sellos. Pasa por tu café gratis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Palomita fina — reutilizada en varias secciones. */
function Check({ className = "" }: { className?: string }) {
  return (
    <svg className={`h-4 w-4 flex-shrink-0 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

export default function FidelityLanding() {
  return (
    <div className="min-h-screen bg-white text-[#12100E] overflow-x-hidden">

      {/* Botón flotante de WhatsApp — siempre visible mientras navegan */}
      <WhatsAppFab />

      {/* ── Navbar ────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-[#EAE8E4] bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <RoxierLogo forceDark />
          <nav className="flex items-center gap-7">
            <Link href="#ejemplos" className="hidden text-[13px] text-[#57534E] transition-colors hover:text-[#12100E] sm:block">
              Ejemplos
            </Link>
            <Link href="#como-funciona" className="hidden text-[13px] text-[#57534E] transition-colors hover:text-[#12100E] sm:block">
              Cómo funciona
            </Link>
            <Link href="#precios" className="hidden text-[13px] text-[#57534E] transition-colors hover:text-[#12100E] sm:block">
              Precios
            </Link>
            <span className="hidden h-4 w-px bg-[#EAE8E4] sm:block" />
            <Link href="/fidelity/login" className="text-[13px] font-medium text-[#12100E] transition-colors hover:text-[#FF2E63]">
              Iniciar sesión
            </Link>
            <Link href="/fidelity/registro"
              className="rounded-md bg-[#12100E] px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-[#2A2723]">
              Probar gratis
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="border-b border-[#EAE8E4]">
        <div className="mx-auto grid max-w-6xl gap-14 px-6 pb-16 pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:pb-24 lg:pt-24">

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#78716C]">
              Tarjetas de lealtad digitales
            </p>

            <h1 className="mt-5 max-w-xl text-[2.6rem] font-bold leading-[1.05] tracking-[-0.035em] sm:text-[3.25rem] lg:text-[3.75rem]">
              Haz que tus clientes vuelvan más seguido
            </h1>

            <p className="mt-6 max-w-lg text-[17px] leading-[1.65] text-[#57534E]">
              Cambia las tarjetitas de papel por una tarjeta digital que tus clientes guardan en su celular.
              Tú la creas en minutos, ellos la escanean y regresan por su premio.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/fidelity/registro"
                className="group inline-flex items-center justify-center gap-2 rounded-md bg-[#FF2E63] px-6 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-[#E31E51]">
                Empieza 7 días gratis
                <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link href="#como-funciona"
                className="inline-flex items-center justify-center rounded-md border border-[#D6D3D1] px-6 py-3.5 text-[15px] font-medium text-[#12100E] transition-colors hover:border-[#12100E]">
                Ver cómo funciona
              </Link>
            </div>

            <ul className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-[#78716C]">
              {["No pedimos tarjeta", "Listo en 5 minutos", "Cancela cuando quieras"].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-[#FF2E63]" />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {/* Producto real: la tarjeta dentro del Wallet del cliente */}
          <div className="relative">
            {/* Panel de fondo que aterriza el mockup en algo, no en blanco */}
            <div className="absolute inset-x-0 bottom-0 top-8 -mx-4 rounded-[28px] bg-[#F3F1ED] sm:-mx-8" />
            <div className="relative pb-10 pt-14">
              <PhoneMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ── Cifras ─────────────────────────────────────────────────── */}
      <section className="border-b border-[#EAE8E4] bg-[#FAF9F7]">
        <div className="mx-auto grid max-w-6xl grid-cols-2 divide-y divide-[#EAE8E4] px-6 md:grid-cols-4 md:divide-x md:divide-y-0">
          {[
            { value: "5 min", label: "En lo que armas tu tarjeta" },
            { value: "0", label: "Apps que bajar (tú o tus clientes)" },
            { value: "$0", label: "Costo por cliente que registres" },
            { value: "∞", label: "Clientes y sucursales sin límite" },
          ].map((s, i) => (
            <div key={s.value} className={`py-8 md:px-8 ${i === 0 ? "md:pl-0" : ""}`}>
              <p className="text-[2rem] font-bold leading-none tracking-[-0.03em]">{s.value}</p>
              <p className="mt-2 text-[13px] leading-snug text-[#78716C]">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Galería de tarjetas ───────────────────────────────────── */}
      <section id="ejemplos" className="overflow-hidden border-b border-[#EAE8E4] py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-2xl">
            <h2 className="text-[2rem] font-bold tracking-[-0.03em] sm:text-[2.5rem]">Así se ve tu tarjeta</h2>
            <p className="mt-4 text-[17px] leading-relaxed text-[#57534E]">
              Cafeterías, barberías, gimnasios, restaurantes... tú eliges los colores, el premio y cuántos sellos pedir.
            </p>
          </div>
        </div>

        <div className="relative mt-12">
          <div className="scrollbar-hide flex items-start gap-5 overflow-x-auto px-6 pb-4 md:justify-center">
            {CARD_EXAMPLES.map((card) => (
              <CardShot
                key={card.src}
                card={card}
                radius="rounded-xl"
                className="w-[230px] flex-shrink-0 shadow-[0_16px_40px_-20px_rgba(0,0,0,0.3)]"
              />
            ))}
          </div>
          <div className="pointer-events-none absolute bottom-4 left-0 top-0 w-16 bg-gradient-to-r from-white to-transparent md:hidden" />
          <div className="pointer-events-none absolute bottom-4 right-0 top-0 w-16 bg-gradient-to-l from-white to-transparent md:hidden" />
        </div>

        <div className="mx-auto mt-10 flex max-w-6xl flex-col items-start gap-4 px-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13px] text-[#78716C]">Elige colores, íconos y recompensas según tu negocio</p>
          <Link href="/fidelity/registro"
            className="inline-flex items-center gap-2 text-[14px] font-semibold text-[#FF2E63] transition-colors hover:text-[#E31E51]">
            Crear la mía gratis
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      {/* ── Cómo funciona ──────────────────────────────────────────── */}
      <section id="como-funciona" className="border-b border-[#EAE8E4] bg-[#FAF9F7]">
        <div className="mx-auto max-w-6xl px-6 py-20 lg:py-24">
          <div className="max-w-2xl">
            <h2 className="text-[2rem] font-bold tracking-[-0.03em] sm:text-[2.5rem]">Listo en 3 pasos</h2>
            <p className="mt-4 text-[17px] leading-relaxed text-[#57534E]">
              No necesitas saber de tecnología. Si sabes usar WhatsApp, sabes usar Roxier Fidelity.
            </p>
          </div>

          <ol className="mt-14 grid gap-px overflow-hidden rounded-lg border border-[#EAE8E4] bg-[#EAE8E4] md:grid-cols-3">
            {[
              { num: "01", title: "Arma tu tarjeta", text: "Pones tu logo, tus colores y qué premio das. En 5 minutos la tienes lista." },
              { num: "02", title: "Tu cliente la guarda", text: "Pones un QR en tu mostrador. El cliente lo escanea y la tarjeta le queda en su celular, en Apple o Google Wallet." },
              { num: "03", title: "Sellas y vuelve", text: "En cada visita escaneas su código. Cuando completa la tarjeta le llega un aviso a su celular con su premio." },
            ].map((step) => (
              <li key={step.num} className="bg-white p-8">
                <span className="text-[12px] font-semibold tracking-[0.14em] text-[#FF2E63]">{step.num}</span>
                <h3 className="mt-5 text-[19px] font-semibold tracking-[-0.02em]">{step.title}</h3>
                <p className="mt-2.5 text-[15px] leading-relaxed text-[#57534E]">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Características ────────────────────────────────────────── */}
      <section id="caracteristicas" className="border-b border-[#EAE8E4]">
        <div className="mx-auto max-w-6xl px-6 py-20 lg:py-24">
          <h2 className="max-w-2xl text-[2rem] font-bold tracking-[-0.03em] sm:text-[2.5rem]">
            Todo lo que necesitas, sin costos extra
          </h2>

          <div className="mt-14 grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: "M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z", title: "Apple Wallet y Google Wallet", text: "La tarjeta les queda guardada junto a sus boletos y tarjetas. Nunca se les pierde." },
              { icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9", title: "Avisos a su celular", text: "Les llega una notificación cuando les das un sello o cuando ya ganaron su premio." },
              { icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", title: "Sellos, cupones y cashback", text: "Elige cómo premiar: tarjeta de sellos, cupón, descuento fijo o devolverles un % de cada compra." },
              { icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", title: "Sabes cómo va tu negocio", text: "Cuántos clientes tienes, quién ya no regresa y a qué horas se te llena el local." },
              { icon: "M20 12l-8 8-8-8 8-8z", title: "Promociones a todos", text: "¿Día flojo? Mandas una promo a todos tus clientes con un clic y les llega al celular." },
              { icon: "M3 21h18M4 21V7l8-4 8 4v14M9 21v-6h6v6", title: "Varias sucursales", text: "Tus clientes acumulan en cualquiera de tus locales, y tú ves cuál vende más." },
            ].map((feat) => (
              <div key={feat.title} className="border-t border-[#EAE8E4] pt-6">
                <svg className="h-5 w-5 text-[#FF2E63]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={feat.icon} />
                </svg>
                <h3 className="mt-4 text-[16px] font-semibold tracking-[-0.01em]">{feat.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-[#57534E]">{feat.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Precios ────────────────────────────────────────────────── */}
      <section id="precios" className="border-b border-[#EAE8E4] bg-[#FAF9F7]">
        <div className="mx-auto max-w-6xl px-6 py-20 lg:py-24">

          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl">
              <h2 className="text-[2rem] font-bold tracking-[-0.03em] sm:text-[2.5rem]">
                Invierte en lealtad, no en publicidad.
              </h2>
              <p className="mt-4 text-[17px] leading-relaxed text-[#57534E]">
                Que un cliente regrese cuesta mucho menos que conseguir uno nuevo.
              </p>
            </div>
            <p className="text-[13px] leading-relaxed text-[#57534E] md:text-right">
              7 días gratis en todos los planes
              <br className="hidden md:block" />
              <span className="text-[#A8A29E]">empieza sin tarjeta</span>
            </p>
          </div>

          {/* Planes por período */}
          <div className="mt-12 grid gap-px overflow-hidden rounded-lg border border-[#EAE8E4] bg-[#EAE8E4] md:grid-cols-3">
            {[
              { name: "Mensual", price: "$479", antes: "", period: "/mes MXN", equiv: "", nota: "", highlight: false },
              { name: "6 meses", price: "$2,395", antes: "", period: "/6 meses", equiv: "≈ $399/mes", nota: "1 mes gratis", highlight: false },
              { name: "Anual", price: "$4,311", antes: "", period: "/año", equiv: "≈ $359/mes", nota: "3 meses gratis", highlight: true },
            ].map((p) => (
              <div key={p.name}
                className={`flex flex-col p-8 ${p.highlight ? "bg-[#12100E] text-white" : "bg-white"}`}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[15px] font-semibold">{p.name}</p>
                  {p.highlight && (
                    <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
                      Mejor precio
                    </span>
                  )}
                </div>

                <div className="mt-6 flex items-end gap-1.5">
                  {p.antes && <span className="mb-1 text-lg font-medium text-[#A8A29E] line-through">{p.antes}</span>}
                  <span className="text-[2.5rem] font-bold leading-none tracking-[-0.035em]">{p.price}</span>
                  <span className={`mb-1 text-[13px] ${p.highlight ? "text-white/60" : "text-[#78716C]"}`}>{p.period}</span>
                </div>

                <div className="mb-8 mt-3 h-9 space-y-0.5">
                  {p.equiv && <p className={`text-[12px] ${p.highlight ? "text-white/60" : "text-[#78716C]"}`}>{p.equiv}</p>}
                  {p.nota && <p className={`text-[12px] font-semibold ${p.highlight ? "text-[#FF7EA0]" : "text-[#FF2E63]"}`}>{p.nota}</p>}
                </div>

                <Link href="/fidelity/registro"
                  className={`mt-auto w-full rounded-md py-3 text-center text-[14px] font-semibold transition-colors ${
                    p.highlight
                      ? "bg-[#FF2E63] text-white hover:bg-[#E31E51]"
                      : "border border-[#D6D3D1] text-[#12100E] hover:border-[#12100E]"
                  }`}>
                  Probar 7 días gratis
                </Link>
              </div>
            ))}
          </div>

          {/* Nota multi-sucursal */}
          <p className="mt-5 text-[12px] text-[#A8A29E]">
            Ubicaciones ilimitadas incluidas · Con 4+ sucursales aplica tarifa multi-sucursal (desde $579/mes)
          </p>

          {/* Todo incluido en cualquier plan */}
          <div className="mt-14 border-t border-[#EAE8E4] pt-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#78716C]">
              Todo incluido en cualquier plan
            </p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                "Tarjetas de lealtad ilimitadas",
                "Cashback, cupones, sellos y descuentos",
                "Apple Wallet y Google Wallet",
                "Notificaciones y promociones",
                "Dashboard con estadísticas",
                "Soporte por WhatsApp",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-[14px] text-[#44403C]">
                  <Check className="text-[#FF2E63]" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Garantía / tranquilidad */}
          <div className="mt-10 flex flex-col gap-4 border-t border-[#EAE8E4] pt-8 text-[13px] text-[#78716C] sm:flex-row sm:items-center sm:gap-8">
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 text-[#A8A29E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              Sin contrato de permanencia
            </span>
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 text-[#A8A29E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
              Pago seguro vía Mercado Pago
            </span>
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 text-[#A8A29E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
              Cancela cuando quieras
            </span>
          </div>
        </div>
      </section>

      {/* ── Preguntas frecuentes ───────────────────────────────────── */}
      <section className="border-b border-[#EAE8E4]">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-[0.8fr_1.2fr] lg:py-24">
          <div>
            <h2 className="text-[2rem] font-bold tracking-[-0.03em] sm:text-[2.5rem]">Preguntas frecuentes</h2>
            <p className="mt-4 text-[15px] leading-relaxed text-[#57534E]">
              ¿Te queda otra duda? Escríbenos por WhatsApp y te contestamos.
            </p>
          </div>

          <div className="border-t border-[#EAE8E4]">
            {[
              { q: "¿Mis clientes tienen que bajar una app?", a: "No. Escanean un QR y la tarjeta se les guarda en el Wallet que ya trae su celular (Apple o Google). No instalan nada." },
              { q: "¿Necesito saber de tecnología?", a: "No. Si sabes usar WhatsApp, puedes usar Roxier Fidelity. Armas tu tarjeta eligiendo colores y premio, y listo." },
              { q: "¿Qué pasa cuando terminen mis 7 días gratis?", a: "Si no activas un plan, pierdes el acceso al panel hasta que pagues. Tus clientes y sus sellos no se borran: quedan guardados esperándote." },
              { q: "¿Me van a cobrar durante la prueba?", a: "No. Puedes probar sin poner tarjeta. Y si decides registrarla desde el inicio, tampoco se te cobra nada hasta que terminen los 7 días." },
              { q: "¿Necesito un aparato especial para escanear?", a: "No. Escaneas con la cámara de tu celular o computadora. Si prefieres, también puedes conectar una pistola lectora de códigos." },
              { q: "¿Sirve si tengo varias sucursales?", a: "Sí. Tus clientes acumulan en cualquiera de tus locales y tú puedes ver cuál tiene más movimiento. Hasta 3 sucursales al precio normal." },
            ].map((item) => (
              <details key={item.q} className="group border-b border-[#EAE8E4] py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[16px] font-medium">
                  {item.q}
                  <svg className="h-4 w-4 flex-shrink-0 text-[#A8A29E] transition-transform group-open:rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
                  </svg>
                </summary>
                <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[#57534E]">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ──────────────────────────────────────────────── */}
      <section className="bg-[#12100E]">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-20 lg:flex-row lg:items-center lg:justify-between lg:py-24">
          <div className="max-w-xl">
            <h2 className="text-[2rem] font-bold tracking-[-0.03em] text-white sm:text-[2.5rem]">
              Empieza hoy, sin pagar nada
            </h2>
            <p className="mt-4 text-[17px] leading-relaxed text-white/60">
              Arma tu tarjeta en 5 minutos y empieza a hacer que tus clientes regresen.
            </p>
          </div>
          <div className="flex-shrink-0">
            <Link href="/fidelity/registro"
              className="group inline-flex items-center gap-2 rounded-md bg-[#FF2E63] px-7 py-4 text-[15px] font-semibold text-white transition-colors hover:bg-[#E31E51]">
              Empieza 7 días gratis
              <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <p className="mt-3 text-[13px] text-white/40">Sin tarjeta de crédito · Cancela cuando quieras</p>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 py-10 sm:flex-row">
          <RoxierLogo forceDark />
          <div className="flex items-center gap-6 text-[13px] text-[#57534E]">
            <Link href="/fidelity/login" className="transition-colors hover:text-[#12100E]">Iniciar sesión</Link>
            <Link href="/fidelity/registro" className="transition-colors hover:text-[#12100E]">Registrarse</Link>
          </div>
          <p className="text-[13px] text-[#A8A29E]">© {new Date().getFullYear()} Roxier Co.</p>
        </div>
      </footer>
    </div>
  );
}
