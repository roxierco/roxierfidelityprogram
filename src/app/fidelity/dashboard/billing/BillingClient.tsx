"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

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

const PLANES = {
  mensual:   { name: "Mensual", amount: 749,  amountPlus: 999,  period: "/ mes",     nota: "" },
  semestral: { name: "6 meses", amount: 3999, amountPlus: 5299, period: "/ 6 meses", nota: "Ahorras ~11%" },
  anual:     { name: "Anual",   amount: 7490, amountPlus: 9990, period: "/ año",     nota: "2 meses gratis" },
} as const;

type PlanKey = keyof typeof PLANES;

/** Describe una suscripción activa a partir del monto cobrado. */
function describirSuscripcion(amount: number): { name: string; period: string } {
  const found = Object.values(PLANES).find((p) => p.amount === amount || p.amountPlus === amount);
  return found ? { name: found.name, period: found.period } : { name: "Activo", period: "" };
}

export function BillingClient({
  business,
  subscription,
  paymentStatus,
  multiSucursal = false,
}: {
  business: Business;
  subscription: Subscription | null;
  paymentStatus?: string;
  multiSucursal?: boolean;
}) {
  const [loading, setLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  useEffect(() => {
    if (paymentStatus === "subscribed") setToast({ msg: "¡Suscripción activada!", ok: true });
    if (paymentStatus === "failure") setToast({ msg: "El pago no se completó. Intenta de nuevo.", ok: false });
  }, [paymentStatus]);

  async function suscribir(plan: PlanKey) {
    setLoading(plan);
    const res = await fetch("/api/mercadopago/crear-suscripcion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    const data = await res.json();
    if (data.initPoint) window.location.href = data.initPoint;
    else { setToast({ msg: "Error al crear la suscripción", ok: false }); setLoading(null); }
  }

  const isActive = business.status === "active";
  const isTrial = business.status === "trial";
  const isSuspended = business.status === "suspended";
  const hasActiveSub = subscription?.status === "authorized";
  const subInfo = subscription ? describirSuscripcion(subscription.amount) : null;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-black text-paper">Facturación</h1>
        <p className="text-mist text-sm mt-1">Administra tu suscripción a Roxier Fidelity</p>
      </div>

      {toast && (
        <div className={`rounded-xl px-4 py-3 text-sm font-medium ${toast.ok ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"}`}>
          {toast.msg}
        </div>
      )}

      {/* Estado actual */}
      <div className="card space-y-3">
        <p className="label">Estado de tu cuenta</p>
        <div className="flex items-center gap-3">
          <div className={`h-3 w-3 rounded-full animate-pulse ${isActive ? "bg-green-400" : isSuspended ? "bg-red-400" : "bg-yellow-400"}`} />
          <span className="font-bold text-paper text-lg">
            {isActive && hasActiveSub ? `Plan ${subInfo?.name ?? ""} — Activo` :
             isSuspended ? "Suspendida" : "Pendiente de pago"}
          </span>
        </div>

        {isActive && hasActiveSub && subscription?.next_payment_at && (
          <p className="text-sm text-mist">
            Próximo cobro: ${subscription.amount.toLocaleString("es-MX")} MXN el{" "}
            {new Date(subscription.next_payment_at).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        )}

        {isTrial && (
          <p className="text-sm text-mist">
            Activa tu suscripción para empezar a usar tu dashboard.
          </p>
        )}
      </div>

      {/* Seleccionar plan — pendiente de pago o suspendido */}
      {(isTrial || isSuspended || !hasActiveSub) && (
        <div className="space-y-4">
          <p className="font-bold text-paper">
            {isTrial ? "Activa tu plan" : "Reactiva tu cuenta"}
          </p>
          {multiSucursal && (
            <p className="text-xs text-magenta font-semibold">Precio multi-sucursal (4+ sucursales)</p>
          )}
          <div className="grid gap-3 sm:grid-cols-3">
            {(Object.entries(PLANES) as [PlanKey, typeof PLANES[PlanKey]][]).map(([key, plan]) => {
              const precio = multiSucursal ? plan.amountPlus : plan.amount;
              return (
              <div key={key} className={`card space-y-3 ${key === "anual" ? "border-2 border-magenta" : "border border-white/10"}`}>
                <div>
                  <p className="font-black text-paper">{plan.name}</p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black text-paper">${precio.toLocaleString("es-MX")}</span>
                    <span className="text-mist text-xs">{plan.period}</span>
                  </div>
                  {plan.nota && <p className="text-xs font-bold text-green-400 mt-0.5">{plan.nota}</p>}
                </div>
                <button
                  onClick={() => suscribir(key)}
                  disabled={loading !== null}
                  className={`w-full py-2.5 rounded-lg font-bold text-sm disabled:opacity-60 transition-all ${
                    key === "anual" ? "bg-magenta text-white hover:bg-magenta/90" : "border border-magenta text-magenta hover:bg-magenta/10"
                  }`}
                >
                  {loading === key ? "..." : isTrial ? "Elegir" : "Reactivar"}
                </button>
              </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Plan activo */}
      {isActive && hasActiveSub && (
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-bold text-paper">Tu suscripción</p>
            <span className="rounded-full bg-green-500/15 px-3 py-1 text-xs font-bold text-green-400">Activa</span>
          </div>
          <p className="text-2xl font-black text-paper">
            ${subscription?.amount.toLocaleString("es-MX")} <span className="text-mist text-sm font-normal">MXN {subInfo?.period}</span>
          </p>
          <p className="text-xs text-mist">
            Para cancelar o cambiar de plan escríbenos por WhatsApp.
          </p>
        </div>
      )}

      <div className="pt-2">
        <Link href="/fidelity/dashboard" className="text-sm text-mist hover:text-paper transition-colors">
          ← Volver al dashboard
        </Link>
      </div>
    </div>
  );
}
