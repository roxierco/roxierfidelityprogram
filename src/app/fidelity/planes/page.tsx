"use client";

import { useState } from "react";
import Link from "next/link";

export default function PlanesPage() {
  const [loading, setLoading] = useState(false);

  async function activar() {
    setLoading(true);
    try {
      const res = await fetch("/api/mercadopago/checkout", { method: "POST" });
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

      <div className="mb-10 text-center">
        <p className="text-magenta text-sm font-bold uppercase tracking-widest mb-2">Roxier Fidelity</p>
        <h1 className="text-4xl font-black text-paper mb-3">Activa tu negocio</h1>
        <p className="text-mist text-lg">Un solo plan, sin complicaciones.</p>
      </div>

      {/* Card del plan */}
      <div className="w-full max-w-md rounded-2xl border-2 border-magenta bg-surface p-8 shadow-2xl">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full bg-magenta/15 px-4 py-1.5 mb-6">
          <span className="h-2 w-2 rounded-full bg-magenta animate-pulse" />
          <span className="text-magenta text-xs font-bold uppercase tracking-widest">Plan Único</span>
        </div>

        {/* Precio */}
        <div className="mb-2">
          <span className="text-5xl font-black text-paper">$1,499</span>
          <span className="text-mist ml-2">pago inicial</span>
        </div>
        <p className="text-mist text-sm mb-6">
          Después solo <span className="text-paper font-bold">$449/mes</span> — cancela cuando quieras
        </p>

        {/* Features */}
        <ul className="space-y-3 mb-8">
          {[
            "Tarjetas de lealtad digitales ilimitadas",
            "Sellos en tiempo real (sin apps)",
            "Notificaciones push a tus clientes",
            "Promociones y correos automáticos",
            "Panel de estadísticas",
            "Soporte por WhatsApp",
          ].map((f) => (
            <li key={f} className="flex items-center gap-3 text-sm text-paper">
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-magenta/20 text-magenta text-xs">✓</span>
              {f}
            </li>
          ))}
        </ul>

        <button
          onClick={activar}
          disabled={loading}
          className="btn-primary w-full py-4 text-base font-bold disabled:opacity-60"
        >
          {loading ? "Redirigiendo a Mercado Pago..." : "Activar mi negocio — $1,499"}
        </button>

        <p className="mt-4 text-center text-xs text-mist">
          Pago seguro con Mercado Pago · Tarjeta, OXXO o transferencia
        </p>
      </div>

      <p className="mt-8 text-mist text-sm">
        ¿Ya tienes cuenta?{" "}
        <Link href="/fidelity/login" className="text-magenta hover:underline">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
