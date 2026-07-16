import Link from "next/link";

export default function BienvenidaPage() {
  return (
    <div className="min-h-screen bg-near-black flex flex-col items-center justify-center px-4 text-center">
      <div className="max-w-md space-y-6">

        {/* Icono */}
        <div className="flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-magenta/15 text-4xl">
            🎉
          </div>
        </div>

        {/* Texto */}
        <div className="space-y-3">
          <p className="text-magenta text-sm font-bold uppercase tracking-widest">Roxier Fidelity</p>
          <h1 className="text-3xl font-black text-paper">
            ¡Tu cuenta está lista!
          </h1>
          <p className="text-mist text-base leading-relaxed">
            Correo verificado correctamente. Activa tu suscripción para empezar a usar tu dashboard.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3 pt-2">
          <Link
            href="/fidelity/planes"
            className="btn-primary w-full py-4 text-base font-bold text-center"
          >
            Activar mi cuenta
          </Link>
          <Link
            href="/fidelity/dashboard"
            className="text-sm text-mist hover:text-paper transition-colors"
          >
            Explorar el dashboard primero →
          </Link>
        </div>
      </div>
    </div>
  );
}
