import Link from "next/link";
import { RoxierLogo, XMark } from "@/components/brand/XMark";

/**
 * Landing pública de Roxier Fidelity (roxierco.com/fidelity).
 * Presenta el servicio y dirige al registro.
 */
export default function FidelityLanding() {
  return (
    <div className="min-h-screen bg-near-black">
      {/* Navegación */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <RoxierLogo />
        <nav className="flex items-center gap-4">
          <Link
            href="/fidelity/login"
            className="text-sm font-semibold text-mist transition-colors hover:text-paper"
          >
            Iniciar sesión
          </Link>
          <Link href="/fidelity/registro" className="btn-primary !py-2 !px-5 text-sm">
            Empieza gratis
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <main>
        <section className="relative mx-auto max-w-6xl px-6 pb-24 pt-16 text-center">
          {/* X decorativa de fondo */}
          <XMark className="pointer-events-none absolute right-0 top-0 -z-0 h-96 w-96 opacity-[0.04]" />

          <div className="relative z-10 animate-fade-up">
            <span className="inline-block rounded-full border border-surface-border px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-magenta">
              Agencia digital · IA — Roxier Co.
            </span>
            <h1 className="mx-auto mt-8 max-w-3xl text-5xl font-extrabold leading-[1.05] tracking-tight text-paper sm:text-6xl">
              Tarjetas de lealtad digitales para tu negocio.
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-mist">
              Sin apps. Sin fricciones. Tus clientes guardan su tarjeta en Apple
              Wallet y Google Wallet con un solo escaneo.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/fidelity/registro" className="btn-primary w-full sm:w-auto">
                Cotiza tu proyecto
              </Link>
              <Link href="/fidelity/login" className="btn-secondary w-full sm:w-auto">
                Ya tengo cuenta
              </Link>
            </div>
            <p className="mt-6 text-sm text-mist">
              Prueba gratis por 15 días · Sin tarjeta de crédito
            </p>
          </div>
        </section>

        {/* Cómo funciona */}
        <section className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="mb-12 text-center text-3xl font-extrabold text-paper">
            Lo que hacemos
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Diseña",
                text: "Crea tu tarjeta de lealtad digital en minutos desde el panel, con tu logo y colores.",
              },
              {
                step: "02",
                title: "Comparte",
                text: "Tus clientes escanean un QR y guardan la tarjeta en su wallet. Sin descargar nada.",
              },
              {
                step: "03",
                title: "Crece",
                text: "Mide visitas, recompensas y clientes recurrentes en tiempo real desde tu dashboard.",
              },
            ].map((item) => (
              <div key={item.step} className="card">
                <div className="mb-4 flex items-center gap-3">
                  <XMark className="h-5 w-5" />
                  <span className="text-sm font-bold text-magenta">{item.step}</span>
                </div>
                <h3 className="mb-2 text-xl font-bold text-paper">{item.title}</h3>
                <p className="text-mist">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA final */}
        <section className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h2 className="text-3xl font-extrabold text-paper">
            Dale a tu negocio el poder de la lealtad
          </h2>
          <p className="mt-4 text-mist">
            Únete a los negocios que ya fidelizan a sus clientes con Roxier.
          </p>
          <Link href="/fidelity/registro" className="btn-primary mt-8">
            Empieza ahora
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-surface-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <RoxierLogo className="scale-90" />
          <p className="text-sm text-mist">
            © {new Date().getFullYear()} Roxier Co. · @roxier.co
          </p>
        </div>
      </footer>
    </div>
  );
}
