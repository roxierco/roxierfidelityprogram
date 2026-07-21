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

export default function PlanesPage() {
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
    <div className="min-h-screen bg-near-black flex flex-col items-center justify-center px-4 py-16">
      <div className="mb-8 text-center">
        <p className="text-magenta text-sm font-bold uppercase tracking-widest mb-2">Roxier Fidelity</p>
        <h1 className="text-4xl font-black text-paper mb-3">Elige tu plan</h1>
        <p className="text-mist text-lg">Mismo servicio completo · paga menos si te comprometes más</p>
      </div>

      {/* Las dos formas de probar — explicadas sin letras chiquitas */}
      <div className="mb-10 grid w-full max-w-3xl gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4">
          <p className="text-sm font-bold text-green-400 mb-1">🎁 Prueba sin tarjeta</p>
          <p className="text-xs text-paper/80 leading-relaxed">
            Ya tienes <strong>7 días gratis</strong> desde que te registraste, sin poner tarjeta.
            Al terminar los 7 días <strong>pierdes el acceso</strong> y tendrás que pagar un plan para volver a entrar.
          </p>
        </div>
        <div className="rounded-xl border border-magenta/30 bg-magenta/10 p-4">
          <p className="text-sm font-bold text-magenta mb-1">💳 Prueba con tarjeta</p>
          <p className="text-xs text-paper/80 leading-relaxed">
            Eliges un plan abajo y registras tu tarjeta: también son <strong>7 días gratis</strong>, pero al
            terminar <strong>el cobro es automático</strong> y no pierdes el acceso. Cancela cuando quieras.
          </p>
        </div>
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
              {loading === plan.key ? "Redirigiendo..." : "Empezar 7 días gratis"}
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
        Al elegir un plan no se te cobra nada hoy: los primeros 7 días son gratis y el cobro empieza al terminar la prueba,
        renovándose automáticamente cada período. Incluye ubicaciones ilimitadas; con 4 o más sucursales aplica la tarifa
        multi-sucursal (desde $999/mes). Sin cuota de activación · Cancela cuando quieras.
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
