"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { CSSProperties } from "react";
import { QRCodeSVG } from "qrcode.react";
import { createClient } from "@/lib/supabase/client";

interface Customer {
  id: string;
  full_name: string;
  current_stamps: number;
  total_visits: number;
  rewards_redeemed: number;
}

interface Card {
  title: string;
  stamps_required: number;
  reward_text: string;
  color_primary: string;
  color_background: string;
  text_color: string;
  logo_url: string | null;
  stamp_icon: string | null;
  bg_type: string | null;
  bg_image_url: string | null;
  color_gradient_end: string | null;
  gradient_direction: string | null;
  card_type: string | null;
  coupon_value: string | null;
}

function cardBgStyle(card: Card | null): CSSProperties {
  if (!card) return {};
  const type = card.bg_type ?? "solid";
  if (type === "gradient" && card.color_gradient_end) {
    return { background: `linear-gradient(${card.gradient_direction ?? "to bottom right"}, ${card.color_background}, ${card.color_gradient_end})` };
  }
  if (type === "image" && card.bg_image_url) {
    return { backgroundImage: `url(${card.bg_image_url})`, backgroundSize: "cover", backgroundPosition: "center" };
  }
  return { backgroundColor: card.color_background ?? "#0E0E10" };
}

interface Business {
  name: string;
  slug: string;
}

const TEN_MINUTES = 10 * 60 * 1000;

function lsKey(id: string) {
  return `rx_completed_${id}`;
}

export function CustomerCardClient({
  customer: initialCustomer,
  card,
  business,
  cardUrl,
  cardId,
  googleWalletEnabled,
  appleWalletEnabled,
  vapidPublicKey,
}: {
  customer: Customer;
  card: Card | null;
  business: Business;
  cardUrl: string;
  cardId?: string;
  googleWalletEnabled: boolean;
  appleWalletEnabled: boolean;
  vapidPublicKey?: string;
}) {
  const [customer, setCustomer] = useState(initialCustomer);
  const [walletLoading, setWalletLoading] = useState(false);
  const [pushState, setPushState] = useState<"idle" | "asking" | "subscribed" | "denied" | "unsupported">("idle");
  const [justStamped, setJustStamped] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [celebrationReward, setCelebrationReward] = useState("");
  const prevStampsRef = useRef(initialCustomer.current_stamps);
  const prevRewardsRef = useRef(initialCustomer.rewards_redeemed);
  const celebTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stampsRequired = card?.stamps_required ?? 10;

  // Restaurar celebración si el cliente recargó la página dentro de los 10 minutos
  useEffect(() => {
    const saved = localStorage.getItem(lsKey(initialCustomer.id));
    if (!saved) return;
    try {
      const data = JSON.parse(saved);
      const remaining = TEN_MINUTES - (Date.now() - data.at);
      if (remaining <= 0) {
        localStorage.removeItem(lsKey(initialCustomer.id));
        return;
      }
      setCustomer((prev) => ({
        ...prev,
        current_stamps: data.stamps_required,
        total_visits: data.total_visits,
        rewards_redeemed: data.rewards_redeemed,
      }));
      prevStampsRef.current = data.current_stamps_after;
      prevRewardsRef.current = data.rewards_redeemed;
      setCelebrationReward(data.reward_text);
      setCelebrating(true);
      celebTimerRef.current = setTimeout(() => endCelebration(data.current_stamps_after, initialCustomer.id), remaining);
    } catch {
      localStorage.removeItem(lsKey(initialCustomer.id));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function endCelebration(stampsAfter: number, customerId: string) {
    setCelebrating(false);
    setCustomer((prev) => ({ ...prev, current_stamps: stampsAfter }));
    setJustStamped(false);
    localStorage.removeItem(lsKey(customerId));
  }

  const applyUpdate = useCallback((data: {
    current_stamps: number;
    total_visits: number;
    rewards_redeemed: number;
    rewarded?: boolean;
    reward_text?: string;
    stamps_required?: number;
  }) => {
    const justRewarded = data.rewarded || data.rewards_redeemed > prevRewardsRef.current;
    if (!justRewarded && data.current_stamps === prevStampsRef.current) return;

    prevStampsRef.current = data.current_stamps;
    prevRewardsRef.current = data.rewards_redeemed;

    if (justRewarded) {
      const totalStamps = data.stamps_required ?? stampsRequired;
      const rewardText = data.reward_text ?? card?.reward_text ?? "¡Premio especial!";

      // Mostrar tarjeta completa
      setCustomer((prev) => ({
        ...prev,
        current_stamps: totalStamps,
        total_visits: data.total_visits,
        rewards_redeemed: data.rewards_redeemed,
      }));
      setCelebrationReward(rewardText);
      setCelebrating(true);
      setJustStamped(true);

      // Guardar en localStorage para que persista si recarga
      localStorage.setItem(lsKey(initialCustomer.id), JSON.stringify({
        at: Date.now(),
        reward_text: rewardText,
        stamps_required: totalStamps,
        current_stamps_after: data.current_stamps,
        total_visits: data.total_visits,
        rewards_redeemed: data.rewards_redeemed,
      }));

      // Auto-reiniciar después de 10 minutos
      if (celebTimerRef.current) clearTimeout(celebTimerRef.current);
      celebTimerRef.current = setTimeout(
        () => endCelebration(data.current_stamps, initialCustomer.id),
        TEN_MINUTES,
      );
    } else {
      setCustomer((prev) => ({ ...prev, ...data }));
      setJustStamped(true);
      setTimeout(() => setJustStamped(false), 2000);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card?.reward_text, stampsRequired, initialCustomer.id]);

  // Polling cada 5 segundos — funciona en todos los navegadores incluyendo Safari/iPhone
  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch(`/api/customer-status?customerId=${initialCustomer.id}`, { cache: "no-store" });
        if (res.ok) applyUpdate(await res.json());
      } catch { /* sin conexión */ }
    };
    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, [initialCustomer.id, applyUpdate]);

  // Broadcast Supabase Realtime como camino rápido (Chrome/Android)
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`customer:${initialCustomer.id}`)
      .on("broadcast", { event: "stamp_added" }, (msg) => {
        applyUpdate(msg.payload as { current_stamps: number; total_visits: number; rewards_redeemed: number });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [initialCustomer.id, applyUpdate]);

  // Estado inicial del permiso de notificaciones
  useEffect(() => {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      setPushState("unsupported");
      return;
    }
    if (Notification.permission === "granted") setPushState("subscribed");
    else if (Notification.permission === "denied") setPushState("denied");
  }, []);

  async function subscribePush() {
    if (!vapidPublicKey) return;
    setPushState("asking");
    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;
      const permission = await Notification.requestPermission();
      if (permission !== "granted") { setPushState("denied"); return; }
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: customer.id, subscription: sub.toJSON() }),
      });
      setPushState("subscribed");
    } catch {
      setPushState("idle");
    }
  }

  async function saveToGoogleWallet() {
    if (!cardId) return;
    setWalletLoading(true);
    try {
      const res = await fetch("/api/wallet/google/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: customer.id, cardId }),
      });
      const data = await res.json();
      if (data.saveUrl) window.location.href = data.saveUrl;
    } finally {
      setWalletLoading(false);
    }
  }

  const primary = card?.color_primary ?? "#FF2E63";
  const bg = card?.color_background ?? "#0E0E10";
  const text = card?.text_color ?? "#F5F4F2";
  const stampIcon = card?.stamp_icon ?? "✓";
  const progress = Math.min(customer.current_stamps, stampsRequired);

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: bg }}>

      {/* Pantalla de celebración — dura 10 minutos */}
      {celebrating && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center text-center px-8"
          style={{ backgroundColor: primary }}
        >
          <div className="text-7xl mb-4 animate-bounce">🎉</div>
          <h1 className="text-3xl font-extrabold text-white mb-2">
            ¡Tarjeta completada!
          </h1>
          <p className="text-white text-lg font-semibold mb-1" style={{ opacity: 0.9 }}>
            Tu recompensa:
          </p>
          <p className="text-white text-2xl font-black mb-8">
            {celebrationReward}
          </p>
          <p className="text-white text-sm mb-8" style={{ opacity: 0.7 }}>
            Muestra esta pantalla al cajero
          </p>
          <button
            onClick={() => {
              if (celebTimerRef.current) clearTimeout(celebTimerRef.current);
              endCelebration(prevStampsRef.current, initialCustomer.id);
            }}
            className="rounded-full bg-white px-8 py-3 font-bold text-sm"
            style={{ color: primary }}
          >
            Entendido
          </button>
        </div>
      )}

      <div className="w-full max-w-sm space-y-4">

        {/* ── Cupón ── */}
        {card?.card_type === "cupon" && (() => {
          const isRedeemed = customer.rewards_redeemed > 0;
          return (
            <div className="relative overflow-hidden rounded-2xl shadow-2xl" style={{ ...cardBgStyle(card), color: text, border: `2px solid ${primary}` }}>
              {card?.bg_type === "image" && card?.bg_image_url && <div className="absolute inset-0 bg-black/45" />}
              <div className="relative p-5">
                <div className="flex items-center gap-3 mb-4">
                  {card?.logo_url
                    ? <img src={card.logo_url} alt="Logo" className="h-10 w-10 rounded-lg object-contain shadow" />
                    : <div className="flex h-10 w-10 items-center justify-center rounded-lg font-bold text-sm shadow" style={{ backgroundColor: primary, color: bg }}>{business.name[0]}</div>
                  }
                  <div>
                    <p className="font-bold">{card?.title ?? "Cupón"}</p>
                    <p className="text-xs" style={{ opacity: 0.6 }}>{customer.full_name}</p>
                  </div>
                  <span className={`ml-auto rounded-full px-3 py-1 text-xs font-black uppercase tracking-widest ${isRedeemed ? "bg-white/20 text-white/50" : "bg-white text-black"}`}>
                    {isRedeemed ? "CANJEADO" : "VÁLIDO"}
                  </span>
                </div>
                <div className="rounded-xl bg-white/10 p-4 text-center mb-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ opacity: 0.6 }}>Oferta especial</p>
                  <p className={`text-2xl font-extrabold ${isRedeemed ? "line-through opacity-40" : ""}`}>{card.coupon_value ?? "Beneficio especial"}</p>
                </div>
                {isRedeemed && (
                  <p className="text-center text-xs opacity-50">Este cupón ya fue canjeado</p>
                )}
              </div>
            </div>
          );
        })()}

        {/* ── Descuento ── */}
        {card?.card_type === "descuento" && (
          <div className="relative overflow-hidden rounded-2xl shadow-2xl" style={{ ...cardBgStyle(card), color: text, border: `2px solid ${primary}` }}>
            {card?.bg_type === "image" && card?.bg_image_url && <div className="absolute inset-0 bg-black/45" />}
            <div className="relative p-5">
              <div className="flex items-center gap-3 mb-4">
                {card?.logo_url
                  ? <img src={card.logo_url} alt="Logo" className="h-10 w-10 rounded-lg object-contain shadow" />
                  : <div className="flex h-10 w-10 items-center justify-center rounded-lg font-bold text-sm shadow" style={{ backgroundColor: primary, color: bg }}>{business.name[0]}</div>
                }
                <div>
                  <p className="font-bold">{card?.title ?? "Tarjeta de descuento"}</p>
                  <p className="text-xs" style={{ opacity: 0.6 }}>{customer.full_name}</p>
                </div>
                {justStamped && <span className="ml-auto text-lg animate-bounce">✨</span>}
              </div>
              <div className="rounded-xl bg-white/10 p-4 text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ opacity: 0.6 }}>Tu descuento</p>
                <p className="text-2xl font-extrabold">{card.coupon_value ?? "Descuento especial"}</p>
                <p className="text-xs mt-1" style={{ opacity: 0.5 }}>Muestra el QR al cajero en cada visita</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Tarjeta de sellos (default) ── */}
        {(!card?.card_type || card?.card_type === "sellos") && (
          <div
            className={`relative overflow-hidden rounded-2xl p-5 shadow-2xl transition-all duration-500 ${justStamped ? "scale-105" : ""}`}
            style={{ ...cardBgStyle(card), color: text, border: `2px solid ${primary}` }}
          >
            {card?.bg_type === "image" && card?.bg_image_url && (
              <div className="absolute inset-0 bg-black/45" />
            )}
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                {card?.logo_url ? (
                  <img src={card.logo_url} alt="Logo" className="h-10 w-10 rounded-lg object-contain shadow" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg font-bold text-sm shadow"
                    style={{ backgroundColor: primary, color: bg }}>
                    {business.name[0]}
                  </div>
                )}
                <div>
                  <p className="font-bold">{card?.title ?? "Tarjeta de lealtad"}</p>
                  <p className="text-xs" style={{ opacity: 0.6 }}>{customer.full_name}</p>
                </div>
                {justStamped && <span className="ml-auto text-lg animate-bounce">✨</span>}
              </div>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ opacity: 0.6 }}>
                Sellos acumulados
              </p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {Array.from({ length: stampsRequired }).map((_, i) => (
                  <div key={i}
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 font-bold transition-all duration-300 ${justStamped && i === progress - 1 ? "scale-125" : ""}`}
                    style={{
                      borderColor: primary,
                      backgroundColor: i < progress ? primary : "transparent",
                      color: i < progress ? bg : primary,
                      fontSize: stampIcon.length > 1 ? "10px" : "14px",
                    }}
                  >
                    {i < progress ? stampIcon : ""}
                  </div>
                ))}
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider" style={{ opacity: 0.6 }}>Recompensa</p>
                  <p className="text-sm font-semibold">{card?.reward_text ?? "Premio especial"}</p>
                </div>
                <p className="text-xs font-bold" style={{ opacity: 0.8 }}>{progress}/{stampsRequired}</p>
              </div>
            </div>
          </div>
        )}

        {/* QR Code */}
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-white p-6 shadow-2xl">
          <p className="text-sm font-semibold text-gray-700">Tu código QR</p>
          <div className="rounded-xl border border-gray-100 p-3">
            <QRCodeSVG value={cardUrl} size={180} bgColor="#ffffff" fgColor="#0E0E10" level="M" />
          </div>
          <p className="text-center text-xs text-gray-400">Muéstraselo al cajero para agregar un sello</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl p-4 text-center" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
            <p className="text-2xl font-bold" style={{ color: primary }}>{customer.total_visits}</p>
            <p className="text-xs" style={{ color: text, opacity: 0.6 }}>Visitas totales</p>
          </div>
          <div className="rounded-2xl p-4 text-center" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
            <p className="text-2xl font-bold" style={{ color: primary }}>{customer.rewards_redeemed}</p>
            <p className="text-xs" style={{ color: text, opacity: 0.6 }}>Tarjetas completadas</p>
          </div>
        </div>

        {/* Botón notificaciones push */}
        {pushState !== "unsupported" && vapidPublicKey && (
          <button
            onClick={pushState === "idle" ? subscribePush : undefined}
            disabled={pushState === "asking" || pushState === "subscribed" || pushState === "denied"}
            className="w-full flex items-center justify-center gap-2 rounded-2xl px-6 py-3 shadow-lg transition-all"
            style={{
              backgroundColor: pushState === "subscribed" ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.1)",
              color: pushState === "subscribed" ? "#22c55e" : text,
              opacity: pushState === "denied" ? 0.4 : 1,
            }}
          >
            <span className="text-lg">{pushState === "denied" ? "🔕" : "🔔"}</span>
            <span className="text-sm font-semibold">
              {pushState === "subscribed" ? "Notificaciones activadas"
                : pushState === "denied" ? "Notificaciones bloqueadas"
                : pushState === "asking" ? "Activando..."
                : "Activar notificaciones"}
            </span>
          </button>
        )}

        {/* Botón Google Wallet */}
        {googleWalletEnabled && cardId && (
          <button
            onClick={saveToGoogleWallet}
            disabled={walletLoading}
            className="w-full flex items-center justify-center gap-3 rounded-2xl bg-white px-6 py-3 shadow-lg active:scale-95 transition-transform disabled:opacity-60"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
              <path d="M21.5 12c0-5.25-4.25-9.5-9.5-9.5S2.5 6.75 2.5 12s4.25 9.5 9.5 9.5 9.5-4.25 9.5-9.5z" fill="#4285F4"/>
              <path d="M21.5 12c0 5.25-4.25 9.5-9.5 9.5" stroke="#34A853" strokeWidth="1.5"/>
              <path d="M12 7v5l3 3" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span className="text-sm font-semibold text-gray-800">
              {walletLoading ? "Abriendo Google Wallet..." : "Guardar en Google Wallet"}
            </span>
          </button>
        )}

        {/* Botón Apple Wallet — enlace directo para que iOS lo abra automáticamente */}
        {appleWalletEnabled && cardId && (
          <a
            href={`/api/apple-wallet/pass?customerId=${customer.id}&cardId=${cardId}`}
            className="w-full flex items-center justify-center gap-3 rounded-2xl bg-black px-6 py-3 shadow-lg active:scale-95 transition-transform"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            <span className="text-sm font-semibold text-white">Guardar en Apple Wallet</span>
          </a>
        )}

        <p className="text-center text-xs" style={{ color: text, opacity: 0.4 }}>
          Guarda esta página como favorito para acceder siempre a tu tarjeta
        </p>
      </div>
    </div>
  );
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}
