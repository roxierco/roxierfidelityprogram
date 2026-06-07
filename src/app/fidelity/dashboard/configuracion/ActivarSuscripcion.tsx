"use client";

import { useState } from "react";

/**
 * Botón que inicia el flujo de pago con Mercado Pago.
 * Llama a nuestra API, que crea la suscripción y devuelve la URL
 * de Mercado Pago donde el cliente autoriza el cobro.
 */
export function ActivarSuscripcion() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function activar() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/mercadopago/crear-suscripcion", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error");
      // Redirigir a Mercado Pago para autorizar el pago
      window.location.href = data.initPoint;
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo iniciar el pago");
      setLoading(false);
    }
  }

  return (
    <div>
      <button onClick={activar} disabled={loading} className="btn-primary">
        {loading ? "Conectando con Mercado Pago..." : "Pagar con Mercado Pago"}
      </button>
      {error && <p className="mt-3 text-sm text-magenta">{error}</p>}
    </div>
  );
}
