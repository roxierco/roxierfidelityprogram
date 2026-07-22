import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

export default function BienvenidaPage() {
  return (
    <div className="min-h-screen bg-near-black flex flex-col items-center justify-center px-4 text-center">
      <div className="max-w-md space-y-6">

        {/* Icono */}
        <div className="flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-magenta/15 text-4xl">
            <Icon name="check-circulo" className="h-10 w-10 text-magenta" />
          </div>
        </div>

        {/* Texto */}
        <div className="space-y-3">
          <p className="text-magenta text-sm font-bold uppercase tracking-widest">Roxier Fidelity</p>
          <h1 className="text-3xl font-black text-paper">
            ¡Tu cuenta está lista!
          </h1>
          <p className="text-mist text-base leading-relaxed">
            Correo verificado correctamente. Tus <strong className="text-paper">7 días gratis</strong> ya empezaron —
            entra y arma tu programa de lealtad. Al terminar la prueba necesitarás un plan para seguir entrando.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3 pt-2">
          <Link
            href="/fidelity/dashboard"
            className="btn-primary w-full py-4 text-base font-bold text-center"
          >
            Entrar a mi dashboard
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
