"use client";

import { useState, useRef } from "react";
import type { CSSProperties } from "react";
import { createClient } from "@/lib/supabase/client";
import type { LoyaltyCard } from "@/types/database";

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
  const icon = card.stamp_icon ?? "✓";
  const filledCount = Math.min(3, stamps);
  const isFullCover = card.bg_type === "image" && !!card.bg_image_url &&
    (!card.bg_image_position || card.bg_image_position === "cover");
  const primary = card.color_primary ?? "#FF2E63";

  if (isFullCover) {
    return (
      <div className="w-full relative overflow-hidden rounded-[20px] shadow-2xl" style={{ fontFamily: "-apple-system, sans-serif" }}>
        <img src={card.bg_image_url!} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative p-5 space-y-4">
          <div className="flex items-center gap-3">
            {card.logo_url
              ? <img src={card.logo_url} alt="" className="h-10 w-10 rounded-xl object-contain" style={{ backgroundColor: "rgba(255,255,255,0.15)" }} />
              : <div className="flex h-10 w-10 items-center justify-center rounded-xl font-black text-sm" style={{ backgroundColor: primary }}>{card.title?.[0] ?? "?"}</div>
            }
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/50">Tarjeta de fidelidad</p>
              <p className="font-bold text-white truncate">{card.title}</p>
            </div>
          </div>
          <div>
            <p className="mb-2 text-[9px] font-bold uppercase tracking-widest text-white/50">Sellos acumulados</p>
            <StampRow stamps={stamps} filledCount={filledCount} icon={icon} primary={primary} onDark={true} />
          </div>
          <div className="flex justify-between">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-white/50">Recompensa</p>
              <p className="text-sm font-semibold text-white">{card.reward_text}</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-bold uppercase tracking-widest text-white/50">Progreso</p>
              <p className="text-sm font-semibold text-white">{filledCount} / {stamps}</p>
            </div>
          </div>
          {/* QR con cuadro blanco */}
          <div className="flex flex-col items-center gap-1.5 rounded-xl bg-white p-3 shadow-lg">
            <div className="h-16 w-16"><QRPlaceholder color="#0E0E10" /></div>
            <p className="text-[10px] text-gray-400">Muestra este código al cajero</p>
          </div>
        </div>
      </div>
    );
  }

  // Layout estándar (sin imagen fondo completo)
  return (
    <div className="w-full overflow-hidden rounded-[20px] shadow-2xl" style={{ fontFamily: "-apple-system, sans-serif" }}>
      <div className="relative h-32 overflow-hidden" style={cardBgStyle(card)}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative flex h-full items-end gap-3 p-4">
          {card.logo_url
            ? <img src={card.logo_url} alt="" className="h-10 w-10 rounded-xl object-contain shadow-md" style={{ backgroundColor: "rgba(255,255,255,0.15)" }} />
            : <div className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-black shadow-md" style={{ backgroundColor: primary }}>{card.title?.[0] ?? "?"}</div>
          }
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/70">Tarjeta de fidelidad</p>
            <p className="font-bold text-white truncate">{card.title}</p>
          </div>
        </div>
      </div>
      <div className="bg-white px-5 py-4">
        <p className="mb-2 text-[9px] font-bold uppercase tracking-widest text-gray-400">Sellos</p>
        <StampRow stamps={stamps} filledCount={filledCount} icon={icon} primary={primary} onDark={false} />
        <div className="mt-3 flex justify-between">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Recompensa</p>
            <p className="text-sm font-semibold text-gray-800">{card.reward_text}</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Progreso</p>
            <p className="text-sm font-semibold text-gray-800">{filledCount} / {stamps}</p>
          </div>
        </div>
      </div>
      <div className="border-t border-dashed border-gray-200 bg-white px-5 pb-4 pt-3 flex flex-col items-center gap-1">
        <div className="h-16 w-16"><QRPlaceholder color="#0E0E10" /></div>
        <p className="text-[10px] text-gray-400">Muestra este código al cajero</p>
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
    { id: "web" as const, label: "📱 Web" },
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
  onSaved,
}: {
  initialCard: Partial<LoyaltyCard>;
  businessId: string;
  onSaved?: () => void;
}) {
  const [card, setCard] = useState<Partial<LoyaltyCard>>(initialCard);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBg, setUploadingBg] = useState(false);
  const [section, setSection] = useState<"info" | "design">("info");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

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
    const payload = {
      business_id: businessId,
      title: card.title,
      reward_text: card.reward_text,
      stamps_required: card.stamps_required,
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
    };

    let savedCardId = card.id;
    if (card.id) {
      await supabase.from("loyalty_cards").update(payload).eq("id", card.id);
    } else {
      const { data } = await supabase.from("loyalty_cards").insert(payload).select().single();
      if (data) { setCard(data); savedCardId = data.id; }
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
              <p className="label mb-3">Logo del negocio</p>
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
                  <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploadingLogo}
                    className="btn-secondary w-full !py-2 text-sm">
                    {uploadingLogo ? "Subiendo..." : card.logo_url ? "Cambiar logo" : "Subir logo"}
                  </button>
                  {card.logo_url && (
                    <button type="button" onClick={() => update("logo_url", null as unknown as string)}
                      className="w-full text-xs text-mist hover:text-magenta transition-colors">
                      Quitar logo
                    </button>
                  )}
                  <p className="text-xs text-mist text-center">PNG, JPG o SVG · Máx 2MB</p>
                </div>
              </div>
            </div>

            {/* Título y recompensa */}
            <div className="card space-y-4">
              <div>
                <label className="label">Nombre de la tarjeta</label>
                <input className="input mt-1" placeholder="Ej: Club Café Premium"
                  value={card.title ?? ""} onChange={(e) => update("title", e.target.value)} />
              </div>
              <div>
                <label className="label">Recompensa</label>
                <input className="input mt-1" placeholder="Ej: Un café gratis ☕"
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
              <p className="label mb-3">Icono del sello</p>
              <div className="grid grid-cols-8 gap-1.5">
                {STAMP_ICONS.map((icon) => (
                  <button key={icon} type="button" onClick={() => update("stamp_icon", icon)}
                    className={`flex h-9 w-full items-center justify-center rounded-xl text-lg transition-all border-2 ${
                      (card.stamp_icon ?? "✓") === icon
                        ? "border-magenta bg-magenta/15 scale-110"
                        : "border-surface-border bg-surface hover:border-surface-raised"
                    }`}>
                    {icon}
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
                          <p className={`text-sm font-bold ${(card.bg_image_position ?? "cover") === "cover" ? "text-magenta" : "text-paper"}`}>Fondo completo ✨</p>
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

        {/* Botón guardar */}
        <button onClick={guardar} disabled={saving || uploadingLogo || uploadingBg}
          className="btn-primary w-full py-3.5 text-base font-bold">
          {saving ? "Guardando..." : saved ? "✓ Guardado" : "Guardar tarjeta"}
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
