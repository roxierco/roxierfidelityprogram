"use client";

import { useState, useEffect } from "react";

interface Business {
  id: string;
  name: string;
  status: string;
  plan: string;
  monthly_price: number;
  trial_ends_at: string | null;
}

interface Subscription {
  status: string;
  amount: number;
  next_payment_at: string | null;
  mercadopago_subscription_id: string | null;
}

export function BillingClient({
  business,
  subscription,
  paymentStatus,
}: {
  business: Business;
  subscription: Subscription | null;
  paymentStatus?: string;
}) {
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [loadingSub, setLoadingSub] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (paymentStatus === "success") setToast("✅ Pago recibido. ¡Tu cuenta está activa!");
    if (paymentStatus === "subscribed") setToast("✅ Suscripción mensual activada correctamente.");
    if (paymentStatus === "failure") setToast("❌ El pago no se completó. Intenta de nuevo.");
  }, [paymentStatus]);

  async function pagarActivacion() {
    setLoadingCheckout(true);
    const res = await fetch("/api/mercadopago/checkout", { method: "POST" });
    const data = await res.json();
    if (data.initPoint) window.location.href = data.initPoint;
    else { setToast("Error al crear el pago"); setLoadingCheckout(false); }
  }

  async function activarSuscripcion() {
    setLoadingSub(true);
    const res = await fetch("/api/mercadopago/crear-suscripcion", { method: "POST" });
    const data = await res.json();
    if (data.initPoint) window.location.href = data.initPoint;
    else { setToast("Error al crear la suscripción"); setLoadingSub(false); }
  }

  const isActive = business.status === "active";
  const isTrial = business.status === "trial";
  const isSuspended = business.status === "suspended";
  const trialEnds = business.trial_ends_at ? new Date(business.trial_ends_at) : null;
  const trialExpired = trialEnds ? trialEnds < new Date() : false;
  const hasActiveSub = subscription?.status === "authorized";

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-black text-paper">Facturación</h1>
        <p className="text-mist text-sm mt-1">Administra tu suscripción a Roxier Fidelity</p>
      </div>

      {toast && (
        <div className={`rounded-xl px-4 py-3 text-sm font-medium ${toast.startsWith("✅") ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"}`}>
          {toast}
        </div>
      )}

      {/* Estado actual */}
      <div className="card space-y-4">
        <p className="label">Estado de tu cuenta</p>
        <div className="flex items-center gap-3">
          <div className={`h-3 w-3 rounded-full ${isActive ? "bg-green-400" : isSuspended ? "bg-red-400" : "bg-yellow-400"} animate-pulse`} />
          <span className="font-bold text-paper text-lg">
            {isActive ? "Activa" : isSuspended ? "Suspendida" : "Prueba gratuita"}
          </span>
        </div>

        {isTrial && trialEnds && (
          <p className="text-sm text-mist">
            {trialExpired
              ? "⚠️ Tu período de prueba ha terminado."
              : `Tu prueba gratuita termina el ${trialEnds.toLocaleDateString("es-MX", { day: "numeric", month: "long" })}.`}
          </p>
        )}

        {isActive && trialEnds && (
          <p className="text-sm text-mist">
            {hasActiveSub
              ? `Próximo cobro: $449 MXN el ${trialEnds.toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })}`
              : `Acceso activo hasta el ${trialEnds.toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })}`}
          </p>
        )}
      </div>

      {/* Panel de pago */}
      {!isActive && (
        <div className="card border-2 border-magenta space-y-4">
          <div>
            <p className="font-black text-paper text-xl">Activa tu negocio</p>
            <p className="text-mist text-sm mt-1">Pago único de activación + primer mes incluido</p>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-paper">$1,499</span>
            <span className="text-mist">MXN</span>
          </div>

          <ul className="space-y-2 text-sm text-mist">
            <li>✓ Tarjetas de lealtad ilimitadas</li>
            <li>✓ Sellos en tiempo real</li>
            <li>✓ Notificaciones push</li>
            <li>✓ Después solo $449/mes</li>
          </ul>

          <button onClick={pagarActivacion} disabled={loadingCheckout} className="btn-primary w-full py-3 font-bold disabled:opacity-60">
            {loadingCheckout ? "Redirigiendo..." : "Pagar $1,499 con Mercado Pago"}
          </button>
          <p className="text-center text-xs text-mist">Tarjeta, OXXO o transferencia bancaria</p>
        </div>
      )}

      {/* Suscripción mensual — mostrar solo si ya pagaron la activación pero no tienen sub */}
      {isActive && !hasActiveSub && (
        <div className="card space-y-4">
          <div>
            <p className="font-bold text-paper">Activa pagos automáticos</p>
            <p className="text-mist text-sm mt-1">
              Configura tu suscripción mensual para que tu acceso se renueve automáticamente.
            </p>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-paper">$449</span>
            <span className="text-mist">MXN / mes</span>
          </div>
          <button onClick={activarSuscripcion} disabled={loadingSub} className="btn-primary w-full py-3 font-bold disabled:opacity-60">
            {loadingSub ? "Redirigiendo..." : "Activar suscripción mensual"}
          </button>
        </div>
      )}

      {/* Suscripción activa */}
      {isActive && hasActiveSub && (
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-bold text-paper">Suscripción mensual</p>
            <span className="rounded-full bg-green-500/15 px-3 py-1 text-xs font-bold text-green-400">Activa</span>
          </div>
          <p className="text-2xl font-black text-paper">$449 <span className="text-mist text-sm font-normal">/ mes</span></p>
          {subscription?.next_payment_at && (
            <p className="text-sm text-mist">
              Próximo cobro: {new Date(subscription.next_payment_at).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          )}
          <p className="text-xs text-mist">Para cancelar tu suscripción, escríbenos por WhatsApp.</p>
        </div>
      )}
    </div>
  );
}
