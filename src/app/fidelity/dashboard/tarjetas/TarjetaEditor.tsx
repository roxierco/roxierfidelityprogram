"use client";

import { useState, useRef } from "react";
import type { CSSProperties } from "react";
import { createClient } from "@/lib/supabase/client";
import type { LoyaltyCard } from "@/types/database";
import { StampShape, StampGrid, shapeKeyForIcon } from "@/lib/stamp-shapes";
import { Icon } from "@/components/ui/Icon";

// ── Constantes ───────────────────────────────────────────────────

const DIRECTIONS = [
  { label: "↓", value: "to bottom" },
  { label: "↘", value: "to bottom right" },
  { label: "→", value: "to right" },
  { label: "↗", value: "to top right" },
  { label: "↑", value: "to top" },
];

const PALETTES = [
  { name: "Noche", bg: "#0E0E10", accent: "#FF2E63", text: "#F5F4F2" },
  { name: "Café", bg: "#2D1810", accent: "#D97706", text: "#FFF8F0" },
  { name: "Bosque", bg: "#0D2016", accent: "#16A34A", text: "#F0FFF4" },
  { name: "Océano", bg: "#0C1A2E", accent: "#3B82F6", text: "#EFF6FF" },
  { name: "Oro", bg: "#1C1400", accent: "#EAB308", text: "#FFFBEB" },
  { name: "Violeta", bg: "#130020", accent: "#A855F7", text: "#FAF5FF" },
  { name: "Rosa", bg: "#1A0010", accent: "#EC4899", text: "#FFF0F7" },
  { name: "Limpio", bg: "#FFFFFF", accent: "#0E0E10", text: "#0E0E10" },
];

const STAMP_ICONS = [
  "✓", "★", "♥", "☕", "🔥", "👑", "💎", "⚡",
  "🌟", "🎯", "🎁", "🍕", "🍔", "🌸", "💈", "🐾",
];

// ── Helpers ──────────────────────────────────────────────────────

function cardBgStyle(card: Partial<LoyaltyCard>): CSSProperties {
  const type = card.bg_type ?? "solid";
  if (type === "gradient" && card.color_gradient_end) {
    return {
      background: `linear-gradient(${card.gradient_direction ?? "to bottom right"}, ${card.color_background ?? "#0E0E10"}, ${card.color_gradient_end})`,
    };
  }
  if (type === "image" && card.bg_image_url) {
    return {
      backgroundImage: `url(${card.bg_image_url})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  }
  return { backgroundColor: card.color_background ?? "#0E0E10" };
}

// ── QR placeholder ───────────────────────────────────────────────
function QRPlaceholder({ color = "#0E0E10" }: { color?: string }) {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" fill={color}>
      <rect x="5" y="5" width="28" height="28" rx="3" fill="none" stroke={color} strokeWidth="5" />
      <rect x="14" y="14" width="10" height="10" rx="1" />
      <rect x="67" y="5" width="28" height="28" rx="3" fill="none" stroke={color} strokeWidth="5" />
      <rect x="76" y="14" width="10" height="10" rx="1" />
      <rect x="5" y="67" width="28" height="28" rx="3" fill="none" stroke={color} strokeWidth="5" />
      <rect x="14" y="76" width="10" height="10" rx="1" />
      <rect x="40" y="5" width="7" height="7" /><rect x="50" y="5" width="7" height="7" />
      <rect x="40" y="16" width="7" height="7" /><rect x="58" y="16" width="7" height="7" />
      <rect x="50" y="27" width="7" height="7" /><rect x="58" y="5" width="7" height="7" />
      <rect x="40" y="40" width="7" height="7" /><rect x="60" y="40" width="7" height="7" />
      <rect x="80" y="40" width="7" height="7" /><rect x="40" y="50" width="7" height="7" />
      <rect x="60" y="50" width="7" height="7" /><rect x="80" y="50" width="7" height="7" />
      <rect x="40" y="60" width="7" height="7" /><rect x="70" y="60" width="7" height="7" />
      <rect x="5" y="40" width="7" height="7" /><rect x="16" y="40" width="7" height="7" />
      <rect x="27" y="50" width="7" height="7" /><rect x="5" y="60" width="7" height="7" />
    </svg>
  );
}

// ── Vista previa WEB (cómo ve el cliente) ───────────────────────
function WebCardPreview({ card }: { card: Partial<LoyaltyCard> }) {
  const primary = card.color_primary ?? "#FF2E63";
  const bg = card.color_background ?? "#0E0E10";
  const text = card.text_color ?? "#F5F4F2";
  const stamps = card.stamps_required ?? 10;
  const icon = card.stamp_icon ?? "✓";
  const filledCount = Math.min(3, stamps);
  const hasImageBg = card.bg_type === "image" && card.bg_image_url;

  return (
    <div className="w-full space-y-3" style={{ fontFamily: "system-ui, sans-serif" }}>

      {/* Tarjeta principal */}
      <div className="relative overflow-hidden rounded-2xl p-5 shadow-2xl" style={{
        ...cardBgStyle(card),
        color: text,
        border: `2px solid ${primary}`,
      }}>
        {hasImageBg && <div className="absolute inset-0 bg-black/30" />}
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            {card.logo_url ? (
              <img src={card.logo_url} alt="Logo" className="h-10 w-10 rounded-xl object-contain shadow-md"
                style={{ backgroundColor: `${bg}cc` }} />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl font-black text-sm shadow-md"
                style={{ backgroundColor: primary, color: bg }}>
                {card.title?.[0] ?? "R"}
              </div>
            )}
            <div>
              <p className="font-bold text-sm">{card.title || "Nombre de la tarjeta"}</p>
              <p className="text-xs opacity-50">Cliente de ejemplo</p>
            </div>
          </div>

          <p className="text-[10px] font-bold uppercase tracking-widest mb-2 opacity-50">Sellos acumulados</p>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {Array.from({ length: stamps }).map((_, i) => (
              <div key={i}
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-black transition-all"
                style={{
                  borderColor: primary,
                  backgroundColor: i < filledCount ? primary : "transparent",
                  color: i < filledCount ? bg : primary,
                  fontSize: icon.length > 1 ? "10px" : "12px",
                }}
              >
                {i < filledCount ? icon : ""}
              </div>
            ))}
          </div>

          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">Recompensa</p>
              <p className="text-sm font-semibold">{card.reward_text || "Premio especial"}</p>
            </div>
            <p className="text-xs font-bold opacity-70">{filledCount}/{stamps}</p>
          </div>
        </div>
      </div>

      {/* QR */}
      <div className="flex flex-col items-center gap-2 rounded-2xl bg-white p-5 shadow-xl">
        <p className="text-xs font-semibold text-gray-600">Código QR del cliente</p>
        <div className="h-[100px] w-[100px]">
          <QRPlaceholder color="#0E0E10" />
        </div>
        <p className="text-[10px] text-gray-400 text-center">Muéstraselo al cajero para agregar un sello</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2">
        {[["0", "Visitas totales"], ["0", "Tarjetas completadas"]].map(([val, lbl]) => (
          <div key={lbl} className="rounded-xl p-3 text-center" style={{ backgroundColor: `${primary}18` }}>
            <p className="text-xl font-black" style={{ color: primary }}>{val}</p>
            <p className="text-[10px] opacity-50" style={{ color: text }}>{lbl}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Shared stamp row ─────────────────────────────────────────────
function StampRow({ stamps, filledCount, icon, primary, onDark }: {
  stamps: number; filledCount: number; icon: string; primary: string; onDark: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {Array.from({ length: stamps }).map((_, i) => (
        <div key={i}
          className="flex h-7 w-7 items-center justify-center rounded-full border-2 text-[11px] font-black"
          style={{
            borderColor: i < filledCount ? primary : onDark ? "rgba(255,255,255,0.4)" : "#d1d5db",
            backgroundColor: i < filledCount ? primary : onDark ? "rgba(255,255,255,0.1)" : "transparent",
            color: i < filledCount ? "#fff" : onDark ? "rgba(255,255,255,0.5)" : "#9ca3af",
          }}>
          {i < filledCount ? icon : ""}
        </div>
      ))}
    </div>
  );
}

// ── Vista previa Wallet estilo Apple ────────────────────────────
function AppleWalletPreview({ card }: { card: Partial<LoyaltyCard> }) {
  const stamps = card.stamps_required ?? 10;
  const filledCount = Math.min(1, stamps);
  const bg = card.color_background ?? "#1a1a2e";
  const primary = card.color_primary ?? "#FF2E63";
  const text = card.text_color ?? "#ffffff";
  const hasStrip = !!card.apple_wallet_strip_url;
  const stampBar = "●".repeat(filledCount) + "○".repeat(Math.max(0, Math.min(stamps, 10) - filledCount));

  return (
    <div className="w-full overflow-hidden rounded-[20px] shadow-2xl border border-white/10" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif", backgroundColor: bg }}>
      {/* Header — logo + nombre + sellos */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          {card.logo_url
            ? <img src={card.logo_url} alt="" className="h-9 w-9 rounded-lg object-contain" style={{ backgroundColor: "rgba(255,255,255,0.1)" }} />
            : <div className="h-9 w-9 rounded-lg flex items-center justify-center font-black text-xs" style={{ backgroundColor: primary, color: bg }}>{(card.title ?? "?")[0]}</div>
          }
          <span className="text-sm font-bold truncate max-w-[120px]" style={{ color: text }}>{card.title ?? "Tu negocio"}</span>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: text, opacity: 0.5 }}>SELLOS</p>
          <p className="text-lg font-black leading-none" style={{ color: text }}>{filledCount}/{stamps}</p>
        </div>
      </div>

      {/* Strip: los sellos van encima de la imagen, o sobre el color liso */}
      <div className="relative w-full" style={{ height: 100, backgroundColor: bg }}>
        {hasStrip && (
          <img src={card.apple_wallet_strip_url!} alt="" className="absolute inset-0 h-full w-full object-cover" />
        )}
        <div className="relative h-full w-full">
          <StampGrid
            total={stamps}
            filled={filledCount}
            icon={card.stamp_icon}
            color={primary}
            stampSize={stamps <= 5 ? 34 : 26}
          />
        </div>
      </div>

      {/* Campos secundarios */}
      <div className="px-4 py-3 grid grid-cols-3 gap-2">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest mb-0.5" style={{ color: text, opacity: 0.5 }}>MIEMBRO</p>
          <p className="text-xs font-semibold truncate" style={{ color: text }}>Carlos</p>
        </div>
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest mb-0.5" style={{ color: text, opacity: 0.5 }}>PROGRESO</p>
          <p className="text-[10px] font-semibold" style={{ color: text }}>{stamps <= 8 ? stampBar : `${filledCount} de ${stamps}`}</p>
        </div>
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest mb-0.5" style={{ color: text, opacity: 0.5 }}>FALTAN</p>
          <p className="text-xs font-semibold" style={{ color: primary }}>{Math.max(0, stamps - filledCount)} sellos</p>
        </div>
      </div>

      {/* Premio */}
      <div className="px-4 pb-3">
        <p className="text-[9px] font-bold uppercase tracking-widest mb-0.5" style={{ color: text, opacity: 0.5 }}>PREMIO</p>
        <p className="text-xs font-semibold truncate" style={{ color: text }}>{card.reward_text ?? "Un producto gratis"}</p>
      </div>

      {/* QR */}
      <div className="mx-4 mb-4 flex flex-col items-center rounded-xl bg-white py-3 px-3 gap-1">
        <div className="h-14 w-14"><QRPlaceholder color="#0E0E10" /></div>
        <p className="text-[9px] text-gray-400">Muestra al cajero</p>
      </div>
    </div>
  );
}

// ── Vista previa Wallet estilo Google ───────────────────────────
function GoogleWalletPreview({ card }: { card: Partial<LoyaltyCard> }) {
  const stamps = card.stamps_required ?? 10;
  const icon = card.stamp_icon ?? "✓";
  const filledCount = Math.min(3, stamps);
  const isFullCover = card.bg_type === "image" && !!card.bg_image_url &&
    (!card.bg_image_position || card.bg_image_position === "cover");
  const primary = card.color_primary ?? "#FF2E63";

  if (isFullCover) {
    return (
      <div className="w-full relative overflow-hidden rounded-3xl shadow-2xl" style={{ fontFamily: "Google Sans, sans-serif" }}>
        <img src={card.bg_image_url!} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative px-5 py-5 space-y-4">
          <div className="flex items-center gap-3">
            {card.logo_url
              ? <img src={card.logo_url} alt="" className="h-12 w-12 rounded-2xl object-contain" style={{ backgroundColor: "rgba(255,255,255,0.15)" }} />
              : <div className="flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-black" style={{ backgroundColor: primary }}>{card.title?.[0] ?? "?"}</div>
            }
            <div>
              <p className="text-[10px] font-medium text-white/60">Tarjeta de fidelidad</p>
              <p className="text-xl font-bold text-white truncate">{card.title}</p>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[9px] font-bold uppercase tracking-wider text-white/50">Sellos</p>
              <p className="text-[9px] font-bold text-white/50">{filledCount} / {stamps}</p>
            </div>
            <StampRow stamps={stamps} filledCount={filledCount} icon={icon} primary={primary} onDark={true} />
          </div>
          <p className="text-xs text-white/70">Recompensa: <span className="font-semibold text-white">{card.reward_text}</span></p>
          {/* QR con cuadro blanco */}
          <div className="flex flex-col items-center gap-1.5 rounded-xl bg-white p-3 shadow-lg">
            <div className="h-16 w-16"><QRPlaceholder color="#0E0E10" /></div>
            <p className="text-[10px] text-gray-400">Escanea para registrar tu visita</p>
          </div>
        </div>
      </div>
    );
  }

  // Layout estándar
  return (
    <div className="w-full overflow-hidden rounded-3xl shadow-2xl" style={{ fontFamily: "Google Sans, sans-serif" }}>
      <div className="relative overflow-hidden px-5 py-5" style={cardBgStyle(card)}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative flex items-center gap-3">
          {card.logo_url
            ? <img src={card.logo_url} alt="" className="h-12 w-12 rounded-2xl object-contain" style={{ backgroundColor: "rgba(255,255,255,0.15)" }} />
            : <div className="flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-black" style={{ backgroundColor: primary }}>{card.title?.[0] ?? "?"}</div>
          }
          <div>
            <p className="text-[10px] font-medium text-white/70">Tarjeta de fidelidad</p>
            <p className="text-xl font-bold text-white truncate">{card.title}</p>
          </div>
        </div>
      </div>
      <div className="bg-white px-5 py-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Sellos</p>
          <p className="text-[9px] font-bold text-gray-400">{filledCount} / {stamps}</p>
        </div>
        <StampRow stamps={stamps} filledCount={filledCount} icon={icon} primary={primary} onDark={false} />
        <p className="mt-3 text-xs text-gray-500">Recompensa: <span className="font-semibold text-gray-800">{card.reward_text}</span></p>
      </div>
      <div className="flex flex-col items-center gap-1.5 bg-gray-50 px-5 pb-4 pt-3">
        <div className="h-16 w-16"><QRPlaceholder color="#0E0E10" /></div>
        <p className="text-[10px] text-gray-400">Escanea para registrar tu visita</p>
      </div>
    </div>
  );
}

// ── Panel de vista previa con tabs ──────────────────────────────
function CardPreview({ card }: { card: Partial<LoyaltyCard> }) {
  const [tab, setTab] = useState<"web" | "apple" | "google">("web");
  const tabs = [
    { id: "web" as const, label: "Web" },
    { id: "apple" as const, label: "Apple Wallet" },
    { id: "google" as const, label: "Google Wallet" },
  ];
  return (
    <div>
      <div className="mb-4 flex gap-1.5 rounded-xl bg-surface-raised p-1">
        {tabs.map((t) => (
          <button key={t.id} type="button" onClick={() => setTab(t.id)}
            className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
              tab === t.id
                ? "bg-surface text-paper shadow-sm"
                : "text-mist hover:text-paper"
            }`}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === "web" && <WebCardPreview card={card} />}
      {tab === "apple" && <AppleWalletPreview card={card} />}
      {tab === "google" && <GoogleWalletPreview card={card} />}
      <p className="mt-3 text-center text-xs text-mist">
        {tab === "web" ? "Así ve el cliente su tarjeta en el navegador" : "Vista aproximada — puede variar levemente"}
      </p>
    </div>
  );
}

// ── ColorInput ───────────────────────────────────────────────────
function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="flex items-center gap-2 rounded-xl border border-surface-border bg-surface p-2.5">
        <div className="relative">
          <input type="color" value={value} onChange={(e) => onChange(e.target.value)}
            className="h-8 w-8 cursor-pointer rounded-lg border-0 bg-transparent opacity-0 absolute inset-0" />
          <div className="h-8 w-8 rounded-lg border border-white/10 shadow-inner pointer-events-none"
            style={{ backgroundColor: value }} />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) onChange(e.target.value); }}
          className="flex-1 bg-transparent text-xs font-mono text-paper outline-none"
          maxLength={7}
        />
      </div>
    </div>
  );
}

// ── TarjetaEditor principal ──────────────────────────────────────
export function TarjetaEditor({
  initialCard,
  businessId,
  businessLogoUrl = null,
  onSaved,
}: {
  initialCard: Partial<LoyaltyCard>;
  businessId: string;
  businessLogoUrl?: string | null;
  onSaved?: () => void;
}) {
  const [card, setCard] = useState<Partial<LoyaltyCard>>(initialCard);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBg, setUploadingBg] = useState(false);
  const [uploadingStrip, setUploadingStrip] = useState(false);
  const [section, setSection] = useState<"info" | "design">("info");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);
  const stripInputRef = useRef<HTMLInputElement>(null);

  const bgType = card.bg_type ?? "solid";

  function update<K extends keyof LoyaltyCard>(key: K, value: LoyaltyCard[K]) {
    setCard((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function applyPalette(p: typeof PALETTES[0]) {
    setCard((prev) => ({ ...prev, color_background: p.bg, color_primary: p.accent, text_color: p.text, bg_type: "solid", color_gradient_end: undefined, bg_image_url: undefined }));
    setSaved(false);
  }

  async function uploadFile(file: File, prefix: string): Promise<string | null> {
    if (!file.type.startsWith("image/")) return null;
    const ext = file.name.split(".").pop();
    const fileName = `${businessId}-${prefix}-${Date.now()}.${ext}`;
    const supabase = createClient();
    const { error } = await supabase.storage.from("logos").upload(fileName, file, { upsert: true });
    if (error) { alert("Error al subir imagen"); return null; }
    return supabase.storage.from("logos").getPublicUrl(fileName).data.publicUrl;
  }

  async function subirLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || file.size > 2 * 1024 * 1024) return;
    setUploadingLogo(true);
    const url = await uploadFile(file, "logo");
    if (url) update("logo_url", url);
    setUploadingLogo(false);
  }

  async function subirStrip(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || file.size > 3 * 1024 * 1024) return;
    setUploadingStrip(true);
    const url = await uploadFile(file, "strip");
    if (url) update("apple_wallet_strip_url", url);
    setUploadingStrip(false);
  }

  async function subirFondo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || file.size > 5 * 1024 * 1024) return;
    setUploadingBg(true);
    const url = await uploadFile(file, "bg");
    if (url) {
      update("bg_image_url", url);
      update("bg_type", "image");
      if (!card.bg_image_position) update("bg_image_position", "cover");
    }
    setUploadingBg(false);
  }

  async function guardar() {
    setSaving(true);
    const supabase = createClient();
    const cardType = card.card_type ?? "sellos";
    const payload = {
      business_id: businessId,
      title: card.title,
      reward_text: card.reward_text ?? (cardType === "cupon" ? "Cupón canjeado" : cardType === "descuento" ? "Descuento aplicado" : "Un producto gratis"),
      stamps_required: cardType === "cupon" ? 1 : cardType === "descuento" ? 1 : (card.stamps_required ?? 10),
      color_primary: card.color_primary,
      color_background: card.color_background,
      text_color: card.text_color,
      logo_url: card.logo_url ?? null,
      bg_type: card.bg_type ?? "solid",
      color_gradient_end: card.color_gradient_end ?? null,
      gradient_direction: card.gradient_direction ?? null,
      bg_image_url: card.bg_image_url ?? null,
      bg_image_position: card.bg_image_position ?? null,
      stamp_icon: card.stamp_icon ?? "✓",
      apple_wallet_strip_url: card.apple_wallet_strip_url ?? null,
      card_type: cardType,
      coupon_value: card.coupon_value ?? null,
      max_uses: cardType === "descuento" ? (card.max_uses ?? null) : null,
      // Config de cashback (0 / null cuando no aplica, para no ensuciar otras tarjetas)
      cashback_percent: cardType === "cashback" ? (card.cashback_percent ?? 0) : 0,
      cashback_min_purchase: cardType === "cashback" ? (card.cashback_min_purchase ?? 0) : 0,
      cashback_max_balance: cardType === "cashback" ? (card.cashback_max_balance ?? null) : null,
      cashback_expires_days: cardType === "cashback" ? (card.cashback_expires_days ?? null) : null,
    };

    let savedCardId = card.id;
    const isNewCard = !card.id;
    if (card.id) {
      await supabase.from("loyalty_cards").update(payload).eq("id", card.id);
    } else {
      const { data } = await supabase.from("loyalty_cards").insert(payload).select().single();
      if (data) { setCard(data); savedCardId = data.id; }
    }

    // Nueva tarjeta → resetear sellos de todos los clientes del negocio a 0
    if (isNewCard) {
      await fetch("/api/reset-stamps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId }),
      }).catch(() => null);
    }

    if (savedCardId) {
      fetch("/api/wallet/google/sync-class", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId: savedCardId }),
      }).catch(() => null);
    }

    setSaving(false);
    setSaved(true);
    onSaved?.();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">

      {/* ── Panel izquierdo: editor ──────────────────────────── */}
      <div className="space-y-5">

        {/* Tabs internos */}
        <div className="flex gap-1 rounded-xl bg-surface-raised p-1">
          {[
            { id: "info" as const, label: "Información" },
            { id: "design" as const, label: "Diseño" },
          ].map((t) => (
            <button key={t.id} type="button" onClick={() => setSection(t.id)}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${
                section === t.id ? "bg-surface text-paper shadow-sm" : "text-mist hover:text-paper"
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Sección: Información ── */}
        {section === "info" && (
          <div className="space-y-5">

            {/* Logo */}
            <div className="card">
              <p className="label mb-1">Logo de la tarjeta</p>
              <p className="text-xs text-mist mb-3">Aparece arriba a la izquierda en Apple/Google Wallet y en la tarjeta del cliente. Opcional — puedes dejarla sin logo.</p>
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-surface-border cursor-pointer hover:border-magenta transition-colors"
                  style={{ backgroundColor: card.color_background ?? "#0E0E10" }}
                  onClick={() => fileInputRef.current?.click()}>
                  {card.logo_url
                    ? <img src={card.logo_url} alt="Logo" className="h-full w-full object-contain p-2" />
                    : <div className="text-center">
                        <p className="text-2xl text-mist">+</p>
                        <p className="text-[10px] text-mist">Logo</p>
                      </div>
                  }
                </div>
                <div className="flex-1 space-y-2">
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={subirLogo} className="hidden" />

                  {/* Usar el logo del negocio (Configuración) */}
                  {businessLogoUrl && card.logo_url !== businessLogoUrl && (
                    <button type="button" onClick={() => update("logo_url", businessLogoUrl)}
                      className="btn-secondary w-full !py-2 text-sm flex items-center justify-center gap-2">
                      <img src={businessLogoUrl} alt="" className="h-4 w-4 rounded object-contain" />
                      Usar el logo de mi negocio
                    </button>
                  )}
                  {businessLogoUrl && card.logo_url === businessLogoUrl && (
                    <p className="rounded-lg bg-green-500/10 px-3 py-2 text-center text-xs font-semibold text-green-400">
                      Usando el logo de tu negocio
                    </p>
                  )}

                  <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploadingLogo}
                    className="btn-secondary w-full !py-2 text-sm">
                    {uploadingLogo
                      ? "Subiendo..."
                      : card.logo_url ? "Subir otro logo" : "Subir un logo"}
                  </button>
                  {card.logo_url && (
                    <button type="button" onClick={() => update("logo_url", null as unknown as string)}
                      className="w-full text-xs text-mist hover:text-magenta transition-colors">
                      Dejar sin logo
                    </button>
                  )}
                  <p className="text-xs text-mist text-center">PNG, JPG o SVG · Máx 2MB</p>
                </div>
              </div>
            </div>

            {/* Campos de Cupón */}
            {(card.card_type === "cupon") && (
              <div className="card space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <Icon name="cupon" className="h-5 w-5 text-magenta" />
                  <p className="font-bold text-paper text-sm">Configuración del cupón</p>
                  <span className="rounded-full bg-magenta/10 px-2 py-0.5 text-[10px] font-bold text-magenta uppercase tracking-wider">Un solo uso</span>
                </div>
                <div>
                  <label className="label">Nombre del cupón</label>
                  <input className="input mt-1" placeholder="Ej: Cupón bienvenida"
                    value={card.title ?? ""} onChange={(e) => update("title", e.target.value)} />
                </div>
                <div>
                  <label className="label">¿Qué ofrece el cupón?</label>
                  <input className="input mt-1" placeholder="Ej: 20% de descuento, Café gratis, 2x1 en postres..."
                    value={card.coupon_value ?? ""} onChange={(e) => update("coupon_value", e.target.value)} />
                  <p className="mt-1 text-xs text-mist">Esto es lo que verá el cliente en su cupón</p>
                </div>
                <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-400">
                  ℹ️ El cupón solo se puede canjear una vez por cliente. Después queda marcado como CANJEADO.
                </div>
              </div>
            )}

            {/* Campos de Descuento */}
            {(card.card_type === "descuento") && (
              <div className="card space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">%</span>
                  <p className="font-bold text-paper text-sm">Configuración del descuento</p>
                  <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-bold text-green-400 uppercase tracking-wider">
                    {card.max_uses ? `${card.max_uses} usos` : "Usos ilimitados"}
                  </span>
                </div>
                <div>
                  <label className="label">Nombre de la tarjeta</label>
                  <input className="input mt-1" placeholder="Ej: Tarjeta de cliente frecuente"
                    value={card.title ?? ""} onChange={(e) => update("title", e.target.value)} />
                </div>
                <div>
                  <label className="label">Descuento que ofreces</label>
                  <input className="input mt-1" placeholder="Ej: 15% de descuento en toda la tienda"
                    value={card.coupon_value ?? ""} onChange={(e) => update("coupon_value", e.target.value)} />
                  <p className="mt-1 text-xs text-mist">El cliente muestra el QR para obtener el descuento en cada visita</p>
                </div>
                <div>
                  <label className="label">Límite de usos por cliente</label>
                  <input className="input mt-1" type="number" min={1} placeholder="Vacío = ilimitado"
                    value={card.max_uses ?? ""}
                    onChange={(e) => update("max_uses", e.target.value ? Number(e.target.value) : (null as unknown as number))} />
                  <p className="mt-1 text-xs text-mist">Deja el campo vacío para permitir usos ilimitados.</p>
                </div>
                <div className="rounded-xl bg-green-500/10 border border-green-500/20 p-3 text-xs text-green-400">
                  {card.max_uses
                    ? `ℹ️ Cada cliente puede usar esta tarjeta hasta ${card.max_uses} ${card.max_uses === 1 ? "vez" : "veces"}.`
                    : "ℹ️ El cliente puede usar esta tarjeta en cada visita — sin límite de usos."}
                </div>
              </div>
            )}

            {/* Campos de Cashback */}
            {(card.card_type === "cashback") && (
              <div className="card space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <Icon name="cashback" className="h-5 w-5 text-green-400" />
                  <p className="font-bold text-paper text-sm">Configuración del cashback</p>
                  <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-bold text-green-400 uppercase tracking-wider">
                    {card.cashback_percent ?? 0}% por compra
                  </span>
                </div>
                <div>
                  <label className="label">Nombre de la tarjeta</label>
                  <input className="input mt-1" placeholder="Ej: Cashback Casa Veguero"
                    value={card.title ?? ""} onChange={(e) => update("title", e.target.value)} />
                </div>
                <div>
                  <label className="label">Porcentaje de cashback por compra</label>
                  <div className="mt-1 flex items-center gap-3">
                    <input type="range" min={1} max={30} step={1} value={card.cashback_percent ?? 5}
                      onChange={(e) => update("cashback_percent", parseInt(e.target.value))}
                      className="flex-1 accent-green-500" />
                    <span className="w-12 text-center text-lg font-black text-paper">{card.cashback_percent ?? 5}%</span>
                  </div>
                  <p className="mt-1 text-xs text-mist">De cada compra, este % se le devuelve al cliente como saldo.</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Compra mínima</label>
                    <input className="input mt-1" type="number" min={0} step="0.01" placeholder="0"
                      value={card.cashback_min_purchase ?? ""}
                      onChange={(e) => update("cashback_min_purchase", e.target.value ? Number(e.target.value) : 0)} />
                    <p className="mt-1 text-[11px] text-mist">Vacío = sin mínimo</p>
                  </div>
                  <div>
                    <label className="label">Tope de saldo</label>
                    <input className="input mt-1" type="number" min={0} step="0.01" placeholder="Sin tope"
                      value={card.cashback_max_balance ?? ""}
                      onChange={(e) => update("cashback_max_balance", e.target.value ? Number(e.target.value) : (null as unknown as number))} />
                    <p className="mt-1 text-[11px] text-mist">Máximo acumulable</p>
                  </div>
                </div>
                <div>
                  <label className="label">Vigencia del saldo (días)</label>
                  <input className="input mt-1" type="number" min={1} placeholder="Vacío = no expira"
                    value={card.cashback_expires_days ?? ""}
                    onChange={(e) => update("cashback_expires_days", e.target.value ? Number(e.target.value) : (null as unknown as number))} />
                  <p className="mt-1 text-xs text-mist">Si el cliente no usa la tarjeta en este tiempo, su saldo expira. Vacío = nunca expira.</p>
                </div>
                <div className="rounded-xl bg-green-500/10 border border-green-500/20 p-3 text-xs text-green-400">
                  El empleado captura el <strong>monto de la compra</strong> al escanear; el sistema calcula y acredita el {card.cashback_percent ?? 5}% automáticamente. El cliente redime su saldo desde la misma pantalla.
                </div>
              </div>
            )}

            {/* Campos de Sellos */}
            {(!card.card_type || card.card_type === "sellos") && (
              <div className="card space-y-4">
                <div>
                  <label className="label">Nombre de la tarjeta</label>
                  <input className="input mt-1" placeholder="Ej: Club Café Premium"
                    value={card.title ?? ""} onChange={(e) => update("title", e.target.value)} />
                </div>
                <div>
                  <label className="label">Recompensa</label>
                  <input className="input mt-1" placeholder="Ej: Un café gratis"
                    value={card.reward_text ?? ""} onChange={(e) => update("reward_text", e.target.value)} />
                  <p className="mt-1 text-xs text-mist">Lo que gana el cliente al completar la tarjeta</p>
                </div>
                <div>
                  <label className="label">Sellos para completar</label>
                  <div className="mt-1 flex items-center gap-3">
                    <input type="range" min={3} max={20} value={card.stamps_required ?? 10}
                      onChange={(e) => update("stamps_required", parseInt(e.target.value))}
                      className="flex-1 accent-magenta" />
                    <span className="w-10 text-center text-lg font-black text-paper">{card.stamps_required ?? 10}</span>
                  </div>
                  <div className="mt-2 flex justify-between text-[10px] text-mist">
                    <span>3 sellos</span><span>20 sellos</span>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ── Sección: Diseño ── */}
        {section === "design" && (
          <div className="space-y-5">

            {/* Paletas preset */}
            <div className="card">
              <p className="label mb-3">Paletas de color</p>
              <div className="grid grid-cols-4 gap-2">
                {PALETTES.map((p) => (
                  <button key={p.name} type="button" onClick={() => applyPalette(p)}
                    title={p.name}
                    className="group relative overflow-hidden rounded-xl border-2 border-transparent hover:border-magenta transition-all"
                    style={{ backgroundColor: p.bg }}>
                    <div className="p-3">
                      <div className="mx-auto h-4 w-4 rounded-full mb-1" style={{ backgroundColor: p.accent }} />
                      <p className="text-[9px] font-bold text-center truncate" style={{ color: p.text }}>{p.name}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Colores individuales */}
            <div className="card space-y-3">
              <p className="label">Colores</p>
              <ColorInput label="Color acento (sellos)" value={card.color_primary ?? "#FF2E63"} onChange={(v) => update("color_primary", v)} />
              <ColorInput label="Color texto" value={card.text_color ?? "#F5F4F2"} onChange={(v) => update("text_color", v)} />
            </div>

            {/* Icono de sello */}
            <div className="card">
              <p className="label mb-1">Icono del sello</p>
              <p className="text-xs text-mist mb-3">Así se dibujará cada sello en Apple Wallet.</p>
              <div className="grid grid-cols-8 gap-1.5">
                {STAMP_ICONS.map((icon) => (
                  <button key={icon} type="button" onClick={() => update("stamp_icon", icon)}
                    title={icon}
                    className={`flex h-10 w-full items-center justify-center rounded-xl transition-all border-2 ${
                      (card.stamp_icon ?? "✓") === icon
                        ? "border-magenta bg-magenta/15 scale-110"
                        : "border-surface-border bg-surface hover:border-surface-raised"
                    }`}>
                    <StampShape
                      shape={shapeKeyForIcon(icon)}
                      color={card.color_primary ?? "#FF2E63"}
                      size={22}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Fondo */}
            <div className="card space-y-4">
              <p className="label">Fondo de la tarjeta</p>

              <div className="flex gap-1.5">
                {(["solid", "gradient", "image"] as const).map((t) => (
                  <button key={t} type="button" onClick={() => update("bg_type", t)}
                    className={`flex-1 rounded-xl py-2 text-xs font-semibold border-2 transition-all ${
                      bgType === t
                        ? "border-magenta bg-magenta/10 text-magenta"
                        : "border-surface-border text-mist hover:text-paper"
                    }`}>
                    {t === "solid" ? "Sólido" : t === "gradient" ? "Gradiente" : "Imagen"}
                  </button>
                ))}
              </div>

              {bgType === "solid" && (
                <ColorInput label="Color de fondo" value={card.color_background ?? "#0E0E10"} onChange={(v) => update("color_background", v)} />
              )}

              {bgType === "gradient" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <ColorInput label="Color inicial" value={card.color_background ?? "#0E0E10"} onChange={(v) => update("color_background", v)} />
                    <ColorInput label="Color final" value={card.color_gradient_end ?? "#FF2E63"} onChange={(v) => update("color_gradient_end", v)} />
                  </div>
                  <div>
                    <p className="label mb-2">Dirección</p>
                    <div className="flex gap-1.5">
                      {DIRECTIONS.map(({ label, value }) => (
                        <button key={value} type="button" onClick={() => update("gradient_direction", value)}
                          className={`flex-1 rounded-xl py-2 text-sm border-2 transition-all ${
                            (card.gradient_direction ?? "to bottom right") === value
                              ? "border-magenta bg-magenta/10 text-magenta"
                              : "border-surface-border text-mist"
                          }`}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {bgType === "image" && (
                <div className="space-y-3">
                  <input ref={bgInputRef} type="file" accept="image/*" onChange={subirFondo} className="hidden" />
                  {card.bg_image_url ? (
                    <div className="relative overflow-hidden rounded-xl">
                      <img src={card.bg_image_url} alt="Fondo" className="h-28 w-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
                        <button type="button" onClick={() => bgInputRef.current?.click()} disabled={uploadingBg}
                          className="rounded-full bg-white px-3 py-1 text-xs font-bold text-black">
                          {uploadingBg ? "..." : "Cambiar"}
                        </button>
                        <button type="button" onClick={() => { update("bg_image_url", null as unknown as string); update("bg_type", "solid"); }}
                          className="rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">
                          Quitar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button type="button" onClick={() => bgInputRef.current?.click()} disabled={uploadingBg}
                      className="w-full rounded-xl border-2 border-dashed border-surface-border py-8 text-sm text-mist hover:border-magenta hover:text-magenta transition-colors">
                      {uploadingBg ? "Subiendo imagen..." : "+ Subir imagen de fondo"}
                    </button>
                  )}
                  <p className="text-xs text-mist">Recomendado: 800×400 px · Máx 5MB · JPG o PNG</p>

                  <div>
                    <p className="label mb-2">¿Cómo mostrar la imagen?</p>
                    <div className="space-y-1.5">
                      {/* Opción destacada: fondo completo */}
                      <button type="button" onClick={() => update("bg_image_position", "cover")}
                        className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 border-2 text-left transition-all ${
                          (card.bg_image_position ?? "cover") === "cover"
                            ? "border-magenta bg-magenta/10"
                            : "border-surface-border hover:border-surface-raised"
                        }`}>
                        <div className={`h-5 w-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${(card.bg_image_position ?? "cover") === "cover" ? "border-magenta" : "border-surface-border"}`}>
                          {(card.bg_image_position ?? "cover") === "cover" && <div className="h-2.5 w-2.5 rounded-full bg-magenta" />}
                        </div>
                        <div>
                          <p className={`text-sm font-bold ${(card.bg_image_position ?? "cover") === "cover" ? "text-magenta" : "text-paper"}`}>Fondo completo</p>
                          <p className="text-xs text-mist">La imagen cubre toda la tarjeta con el texto encima</p>
                        </div>
                      </button>

                      {/* Otras posiciones */}
                      <div className="grid grid-cols-3 gap-1.5">
                      {([
                        { value: "top", label: "Solo arriba" },
                        { value: "center", label: "Solo centro" },
                        { value: "bottom", label: "Solo abajo" },
                      ] as const).map(({ value, label }) => (
                        <button key={value} type="button" onClick={() => update("bg_image_position", value)}
                          className={`rounded-xl py-2 text-xs border-2 transition-all ${
                            (card.bg_image_position ?? "cover") === value
                              ? "border-magenta bg-magenta/10 text-magenta"
                              : "border-surface-border text-mist"
                          }`}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              )}
            </div>

          </div>
        )}

        {/* Apple Wallet strip */}
        {section === "design" && (
          <div className="card space-y-3">
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-mist" fill="currentColor"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.459 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/></svg>
              <p className="text-sm font-bold text-paper">Imagen para Apple Wallet</p>
            </div>
            <p className="text-xs text-mist">Imagen de fondo del pase de Apple Wallet — <strong className="text-paper">los sellos se dibujan encima</strong>. Si no subes ninguna, se usa el color de la tarjeta. Recomendado: 750×246 px, JPG o PNG.</p>
            <input ref={stripInputRef} type="file" accept="image/jpeg,image/png" onChange={subirStrip} className="hidden" />
            {card.apple_wallet_strip_url ? (
              <div className="relative overflow-hidden rounded-xl">
                <img src={card.apple_wallet_strip_url} alt="Strip" className="h-20 w-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
                  <button type="button" onClick={() => stripInputRef.current?.click()} disabled={uploadingStrip}
                    className="rounded-full bg-white px-3 py-1 text-xs font-bold text-black">
                    {uploadingStrip ? "..." : "Cambiar"}
                  </button>
                  <button type="button" onClick={() => update("apple_wallet_strip_url", null as unknown as string)}
                    className="rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">
                    Quitar
                  </button>
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => stripInputRef.current?.click()} disabled={uploadingStrip}
                className="w-full rounded-xl border-2 border-dashed border-surface-border py-6 text-sm text-mist hover:border-magenta hover:text-magenta transition-colors">
                {uploadingStrip ? "Subiendo..." : "+ Subir imagen de banner"}
              </button>
            )}
          </div>
        )}

        {/* Botón guardar */}
        <button onClick={guardar} disabled={saving || uploadingLogo || uploadingBg}
          className="btn-primary w-full py-3.5 text-base font-bold">
          {saving ? "Guardando..." : saved ? "Guardado" : "Guardar tarjeta"}
        </button>
      </div>

      {/* ── Panel derecho: vista previa sticky ──────────────── */}
      <div className="xl:sticky xl:top-6 xl:self-start">
        <p className="label mb-3">Vista previa en tiempo real</p>
        <CardPreview card={card} />
      </div>

    </div>
  );
}
