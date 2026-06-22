"use client";

import { useState } from "react";
import Link from "next/link";

const PLANES = [
  {
    key: "basico",
    name: "Básico",
    price: 549,
    description: "Para negocios que están empezando",
    features: [
      "1 tarjeta de lealtad activa",
      "1 promoción activa",
      "Notificaciones push",
      "Estadísticas básicas",
      "Soporte por WhatsApp",
    ],
    highlight: false,
  },
  {
    key: "pro",
    name: "Pro",
    price: 749,
    description: "Para negocios que quieren crecer",
    features: [
      "Tarjetas de lealtad ilimitadas",
      "Promociones ilimitadas",
      "Notificaciones personalizadas con nombre",
      "Estadísticas avanzadas + exportar Excel",
      "Soporte por WhatsApp",
    ],
    highlight: true,
  },
] as const;

export default function PlanesPage() {
  const [loading, setLoading] = useState<string | null>(null);

  async function activar(plan: "basico" | "pro") {
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

      <div className="mb-12 text-center">
        <p className="text-magenta text-sm font-bold uppercase tracking-widest mb-2">Roxier Fidelity</p>
        <h1 className="text-4xl font-black text-paper mb-3">Elige tu plan</h1>
        <p className="text-mist text-lg">7 días gratis · Sin cuota de activación · Cancela cuando quieras</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
        {PLANES.map((plan) => (
          <div
            key={plan.key}
            className={`rounded-2xl p-8 flex flex-col ${
              plan.highlight
                ? "border-2 border-magenta bg-surface shadow-2xl shadow-magenta/10"
                : "border border-white/10 bg-surface"
            }`}
          >
            {plan.highlight && (
              <div className="inline-flex items-center gap-2 rounded-full bg-magenta/15 px-3 py-1 mb-4 self-start">
                <span className="h-1.5 w-1.5 rounded-full bg-magenta animate-pulse" />
                <span className="text-magenta text-xs font-bold uppercase tracking-widest">Más popular</span>
              </div>
            )}

            <p className="text-xl font-black text-paper mb-1">{plan.name}</p>
            <p className="text-mist text-sm mb-4">{plan.description}</p>

            <div className="mb-6">
              <span className="text-4xl font-black text-paper">${plan.price}</span>
              <span className="text-mist ml-1 text-sm">MXN / mes</span>
            </div>

            <ul className="space-y-2.5 mb-8 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-paper">
                  <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-magenta/20 text-magenta text-xs mt-0.5">✓</span>
                  {f}
                </li>
              ))}
            </ul>

            <button
              onClick={() => activar(plan.key)}
              disabled={loading !== null}
              className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all disabled:opacity-60 ${
                plan.highlight
                  ? "bg-magenta text-white hover:bg-magenta/90"
                  : "border border-magenta text-magenta hover:bg-magenta/10"
              }`}
            >
              {loading === plan.key ? "Redirigiendo..." : `Probar 7 días gratis`}
            </button>
          </div>
        ))}
      </div>

      <p className="mt-8 text-mist text-xs text-center max-w-sm">
        Al terminar el período de prueba se hace el cobro automático. Cancela antes de los 7 días sin costo.
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
