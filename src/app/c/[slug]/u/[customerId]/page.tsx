"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

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
}

interface Business {
  name: string;
  slug: string;
}

export default function CustomerCardPage({
  params,
}: {
  params: { slug: string; customerId: string };
}) {
  const { slug, customerId } = params;
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [card, setCard] = useState<Card | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  const cardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/c/${slug}/u/${customerId}`;

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/customer/${customerId}`);
      if (!res.ok) { setLoading(false); return; }
      const data = await res.json();
      setCustomer(data.customer);
      setCard(data.card);
      setBusiness(data.business);
      setLoading(false);
    }
    load();
  }, [customerId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <p className="text-white opacity-50">Cargando...</p>
      </div>
    );
  }

  if (!customer || !card) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <p className="text-white">Tarjeta no encontrada.</p>
      </div>
    );
  }

  const stampsRequired = card.stamps_required;
  const progress = Math.min(customer.current_stamps, stampsRequired);

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: card.color_background }}>
      <div className="w-full max-w-sm space-y-4">

        {/* Loyalty card */}
        <div className="rounded-2xl p-5 shadow-2xl" style={{
          backgroundColor: card.color_background,
          color: card.text_color,
          border: `2px solid ${card.color_primary}`,
        }}>
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            {card.logo_url ? (
              <img src={card.logo_url} alt="Logo" className="h-10 w-10 rounded-lg object-contain" />
            ) : (
              <div className="h-10 w-10 rounded-lg flex items-center justify-center font-bold text-sm"
                style={{ backgroundColor: card.color_primary, color: card.color_background }}>
                {business?.name[0] ?? "?"}
              </div>
            )}
            <div>
              <p className="font-bold">{card.title}</p>
              <p className="text-xs opacity-60">{customer.full_name}</p>
            </div>
          </div>

          {/* Stamps */}
          <p className="text-[10px] font-bold uppercase tracking-wider mb-2 opacity-60">
            Sellos acumulados
          </p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {Array.from({ length: stampsRequired }).map((_, i) => (
              <div key={i}
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold"
                style={{
                  borderColor: card.color_primary,
                  backgroundColor: i < progress ? card.color_primary : "transparent",
                  color: i < progress ? card.color_background : card.color_primary,
                }}
              >
                {i < progress ? "✓" : ""}
              </div>
            ))}
          </div>

          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">Recompensa</p>
              <p className="text-sm font-semibold">{card.reward_text}</p>
            </div>
            <p className="text-xs opacity-60">
              {progress}/{stampsRequired}
            </p>
          </div>
        </div>

        {/* QR Code card */}
        <div className="rounded-2xl bg-white p-6 shadow-2xl flex flex-col items-center gap-3">
          <p className="text-sm font-semibold text-gray-700">Tu código QR</p>
          <div className="p-3 rounded-xl border border-gray-100">
            <QRCodeSVG
              value={cardUrl}
              size={180}
              bgColor="#ffffff"
              fgColor="#0E0E10"
              level="M"
            />
          </div>
          <p className="text-xs text-gray-400 text-center">
            Muéstraselo al cajero para agregar un sello
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white/10 p-4 text-center">
            <p className="text-2xl font-bold" style={{ color: card.color_primary }}>
              {customer.total_visits}
            </p>
            <p className="text-xs opacity-60" style={{ color: card.text_color }}>Visitas totales</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-4 text-center">
            <p className="text-2xl font-bold" style={{ color: card.color_primary }}>
              {customer.rewards_redeemed}
            </p>
            <p className="text-xs opacity-60" style={{ color: card.text_color }}>Premios canjeados</p>
          </div>
        </div>

        <p className="text-center text-xs opacity-40" style={{ color: card.text_color }}>
          Guarda esta página como favorito para acceder siempre a tu tarjeta
        </p>
      </div>
    </div>
  );
}
