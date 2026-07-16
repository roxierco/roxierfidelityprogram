"use client";

import { useState } from "react";
import Link from "next/link";

const PLAN = {
  key: "pro",
  name: "Roxier Fidelity",
  price: 749,
  description: "Todo lo que necesitas para fidelizar a tus clientes",
  features: [
    "Tarjetas de lealtad ilimitadas",
    "Promociones ilimitadas",
    "Notificaciones personalizadas con nombre",
    "Estadísticas avanzadas + exportar Excel",
    "Soporte por WhatsApp",
  ],
} as const;

export default function PlanesPage() {
  const [loading, setLoading] = useState(false);

  async function activar() {
    setLoading(true);
    try {
      const res = await fetch("/api/mercadopago/crear-suscripcion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: PLAN.key }),
      });
      const data = await res.json();
      if (data.initPoint) {
        window.location.href = data.initPoint;
      } else {
        alert(data.error || "Error al procesar el pago");
        setLoading(false);
      }
    } catch {
      alert("Error de conexión. Intenta de nuevo.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-near-black flex flex-col items-center justify-center px-4 py-16">

      <div className="mb-12 text-center">
        <p className="text-magenta text-sm font-bold uppercase tracking-widest mb-2">Roxier Fidelity</p>
        <h1 className="text-4xl font-black text-paper mb-3">Activa tu cuenta</h1>
        <p className="text-mist text-lg">Sin cuota de activación · Cancela cuando quieras</p>
      </div>

      <div className="w-full max-w-sm">
        <div className="rounded-2xl p-8 flex flex-col border-2 border-magenta bg-surface shadow-2xl shadow-magenta/10">
          <p className="text-xl font-black text-paper mb-1">{PLAN.name}</p>
          <p className="text-mist text-sm mb-4">{PLAN.description}</p>

          <div className="mb-6">
            <span className="text-4xl font-black text-paper">${PLAN.price}</span>
            <span className="text-mist ml-1 text-sm">MXN / mes</span>
          </div>

          <ul className="space-y-2.5 mb-8 flex-1">
            {PLAN.features.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-paper">
                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-magenta/20 text-magenta text-xs mt-0.5">✓</span>
                {f}
              </li>
            ))}
          </ul>

          <button
            onClick={activar}
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold text-sm transition-all disabled:opacity-60 bg-magenta text-white hover:bg-magenta/90"
          >
            {loading ? "Redirigiendo..." : "Suscribirme"}
          </button>
        </div>
      </div>

      <p className="mt-8 text-mist text-xs text-center max-w-sm">
        El cobro se realiza de forma automática cada mes a partir de tu suscripción.
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
