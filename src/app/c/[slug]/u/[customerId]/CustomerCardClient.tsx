"use client";

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

export function CustomerCardClient({
  customer,
  card,
  business,
  cardUrl,
}: {
  customer: Customer;
  card: Card | null;
  business: Business;
  cardUrl: string;
}) {
  const primary = card?.color_primary ?? "#FF2E63";
  const bg = card?.color_background ?? "#0E0E10";
  const text = card?.text_color ?? "#F5F4F2";
  const stampsRequired = card?.stamps_required ?? 10;
  const progress = Math.min(customer.current_stamps, stampsRequired);

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: bg }}>
      <div className="w-full max-w-sm space-y-4">

        {/* Tarjeta de lealtad */}
        <div className="rounded-2xl p-5 shadow-2xl" style={{
          backgroundColor: bg,
          color: text,
          border: `2px solid ${primary}`,
        }}>
          <div className="flex items-center gap-3 mb-4">
            {card?.logo_url ? (
              <img src={card.logo_url} alt="Logo" className="h-10 w-10 rounded-lg object-contain" />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-lg font-bold text-sm"
                style={{ backgroundColor: primary, color: bg }}>
                {business.name[0]}
              </div>
            )}
            <div>
              <p className="font-bold">{card?.title ?? "Tarjeta de lealtad"}</p>
              <p className="text-xs" style={{ opacity: 0.6 }}>{customer.full_name}</p>
            </div>
          </div>

          <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ opacity: 0.6 }}>
            Sellos acumulados
          </p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {Array.from({ length: stampsRequired }).map((_, i) => (
              <div key={i}
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold"
                style={{
                  borderColor: primary,
                  backgroundColor: i < progress ? primary : "transparent",
                  color: i < progress ? bg : primary,
                }}
              >
                {i < progress ? "✓" : ""}
              </div>
            ))}
          </div>

          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ opacity: 0.6 }}>
                Recompensa
              </p>
              <p className="text-sm font-semibold">{card?.reward_text ?? "Premio especial"}</p>
            </div>
            <p className="text-xs" style={{ opacity: 0.6 }}>{progress}/{stampsRequired}</p>
          </div>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-white p-6 shadow-2xl">
          <p className="text-sm font-semibold text-gray-700">Tu código QR</p>
          <div className="rounded-xl border border-gray-100 p-3">
            <QRCodeSVG value={cardUrl} size={180} bgColor="#ffffff" fgColor="#0E0E10" level="M" />
          </div>
          <p className="text-center text-xs text-gray-400">
            Muéstraselo al cajero para agregar un sello
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl p-4 text-center" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
            <p className="text-2xl font-bold" style={{ color: primary }}>{customer.total_visits}</p>
            <p className="text-xs" style={{ color: text, opacity: 0.6 }}>Visitas totales</p>
          </div>
          <div className="rounded-2xl p-4 text-center" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
            <p className="text-2xl font-bold" style={{ color: primary }}>{customer.rewards_redeemed}</p>
            <p className="text-xs" style={{ color: text, opacity: 0.6 }}>Premios canjeados</p>
          </div>
        </div>

        <p className="text-center text-xs" style={{ color: text, opacity: 0.4 }}>
          Guarda esta página como favorito para acceder siempre a tu tarjeta
        </p>
      </div>
    </div>
  );
}
