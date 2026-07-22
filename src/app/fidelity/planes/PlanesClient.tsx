"use client";

import { useState } from "react";
import Link from "next/link";

type PlanKey = "mensual" | "semestral" | "anual";

const FEATURES = [
  "Tarjetas de lealtad ilimitadas",
  "Cashback, cupones, sellos y descuentos",
  "Apple Wallet y Google Wallet",
  "Promociones y notificaciones",
  "Estadísticas del negocio",
  "Soporte por WhatsApp",
];

const PLANES: {
  key: PlanKey;
  name: string;
  price: number;
  period: string;
  equivalente?: string;
  ahorro?: string;
  badge?: string;
  highlight?: boolean;
}[] = [
  { key: "mensual", name: "Mensual", price: 749, period: "/ mes" },
  {
    key: "semestral",
    name: "6 meses",
    price: 3999,
    period: "/ 6 meses",
    equivalente: "≈ $666 / mes",
    ahorro: "Ahorras ~11%",
  },
  {
    key: "anual",
    name: "Anual",
    price: 7490,
    period: "/ año",
    equivalente: "≈ $624 / mes",
    ahorro: "2 meses gratis",
    badge: "Mejor precio",
    highlight: true,
  },
];

export function PlanesClient({
  diasRestantes,
  pruebaActiva,
}: {
  diasRestantes: number;
  pruebaActiva: boolean;
}) {
  const [loading, setLoading] = useState<PlanKey | null>(null);

  async function activar(plan: PlanKey) {
    setLoading(plan);
    try {
      const res = await fetch("/api/mercadopago/crear-suscripcion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.initPoint) {
        window.location.href = data.initPoint;
      } else {
        alert(data.error || "Error al procesar el pago");
        setLoading(null);
      }
    } catch {
      alert("Error de conexión. Intenta de nuevo.");
      setLoading(null);
    }
  }

  return (
    <div className="relative min-h-screen bg-near-black flex flex-col items-center justify-center px-4 py-16">

      {/* Salir — solo si todavía puede volver al dashboard */}
      {pruebaActiva && (
        <Link
          href="/fidelity/dashboard"
          aria-label="Volver al dashboard"
          title="Volver al dashboard"
          className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-surface-border bg-surface text-mist hover:text-paper hover:border-white/30 transition-colors"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Link>
      )}

      <div className="mb-8 text-center">
        <p className="text-magenta text-sm font-bold uppercase tracking-widest mb-2">Roxier Fidelity</p>
        <h1 className="text-4xl font-black text-paper mb-3">Elige tu plan</h1>
        <p className="text-mist text-lg">Mismo servicio completo · paga menos si te comprometes más</p>
      </div>

      {/* Estado de la prueba — sin letras chiquitas */}
      <div className="mb-10 w-full max-w-2xl">
        {pruebaActiva ? (
          <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-center">
            <p className="text-sm font-bold text-green-400 mb-1">
              🎁 Te quedan {diasRestantes} día{diasRestantes !== 1 ? "s" : ""} de prueba gratis
            </p>
            <p className="text-xs text-paper/80 leading-relaxed">
              Si registras tu tarjeta ahora <strong>no se te cobra nada hoy</strong>: se te respetan los días que te
              quedan y el cobro empieza justo cuando termine tu prueba, sin días extra. Así no pierdes el acceso.
              Cancela cuando quieras.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-magenta/30 bg-magenta/10 p-4 text-center">
            <p className="text-sm font-bold text-magenta mb-1">Tu prueba gratis terminó</p>
            <p className="text-xs text-paper/80 leading-relaxed">
              Activa un plan para recuperar el acceso a tu dashboard. Tus clientes, tarjetas y sellos siguen
              guardados esperándote.
            </p>
          </div>
        )}
      </div>

      <div className="grid w-full max-w-4xl gap-5 md:grid-cols-3">
        {PLANES.map((plan) => (
          <div
            key={plan.key}
            className={`relative rounded-2xl p-7 flex flex-col bg-surface ${
              plan.highlight ? "border-2 border-magenta shadow-2xl shadow-magenta/10" : "border border-white/10"
            }`}
          >
            {plan.badge && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-magenta px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-white whitespace-nowrap">
                {plan.badge}
              </span>
            )}

            <p className="text-lg font-black text-paper">{plan.name}</p>

            <div className="mt-3 mb-1">
              <span className="text-4xl font-black text-paper">${plan.price.toLocaleString("es-MX")}</span>
              <span className="text-mist ml-1 text-sm">{plan.period}</span>
            </div>
            <div className="mb-5 h-8">
              {plan.equivalente && <p className="text-xs text-mist">{plan.equivalente}</p>}
              {plan.ahorro && <p className="text-xs font-bold text-green-400">{plan.ahorro}</p>}
            </div>

            <button
              onClick={() => activar(plan.key)}
              disabled={loading !== null}
              className={`w-full py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-60 ${
                plan.highlight
                  ? "bg-magenta text-white hover:bg-magenta/90"
                  : "border border-magenta text-magenta hover:bg-magenta/10"
              }`}
            >
              {loading === plan.key ? "Redirigiendo..." : pruebaActiva ? "Activar este plan" : "Elegir este plan"}
            </button>
          </div>
        ))}
      </div>

      <ul className="mt-10 grid gap-2 sm:grid-cols-2 max-w-2xl w-full">
        {FEATURES.map((f) => (
          <li key={f} className="flex items-center gap-2.5 text-sm text-paper">
            <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-magenta/20 text-magenta text-xs">✓</span>
            {f}
          </li>
        ))}
      </ul>

      <p className="mt-8 text-mist text-xs text-center max-w-md">
        La prueba gratis dura 7 días contados desde que te registraste — registrar tu tarjeta no te da días extra, solo evita que pierdas el acceso. Después el cobro se renueva automáticamente cada período. Incluye ubicaciones ilimitadas; con 4 o más sucursales aplica la tarifa multi-sucursal (desde $999/mes). Sin cuota de activación · Cancela cuando quieras.
      </p>

      <p className="mt-6 text-mist text-sm">
        ¿Ya tienes cuenta?{" "}
        <Link href="/fidelity/login" className="text-magenta hover:underline">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
