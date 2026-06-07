"use client";

import { useState, useRef } from "react";
import type { CSSProperties } from "react";
import { createClient } from "@/lib/supabase/client";
import type { LoyaltyCard } from "@/types/database";

const DIRECTIONS = [
  { label: "↓", value: "to bottom" },
  { label: "↘", value: "to bottom right" },
  { label: "→", value: "to right" },
  { label: "↗", value: "to top right" },
  { label: "↑", value: "to top" },
];

function cardBgStyle(card: Partial<LoyaltyCard>): CSSProperties {
  const type = card.bg_type ?? "solid";
  if (type === "gradient" && card.color_gradient_end) {
    return {
      background: `linear-gradient(${card.gradient_direction ?? "to bottom right"}, ${card.color_background ?? "#0E0E10"}, ${card.color_gradient_end})`,
    };
  }
  if (type === "image" && card.bg_image_url && card.bg_image_position === "cover") {
    return {
      backgroundImage: `url(${card.bg_image_url})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  }
  return { backgroundColor: card.color_background ?? "#0E0E10" };
}

// ── QR Code placeholder ──────────────────────────────────────────
function QRCode() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" fill="currentColor">
      {/* Finder TL */}
      <rect x="5" y="5" width="28" height="28" rx="3" fill="none" stroke="currentColor" strokeWidth="5" />
      <rect x="14" y="14" width="10" height="10" rx="1" />
      {/* Finder TR */}
      <rect x="67" y="5" width="28" height="28" rx="3" fill="none" stroke="currentColor" strokeWidth="5" />
      <rect x="76" y="14" width="10" height="10" rx="1" />
      {/* Finder BL */}
      <rect x="5" y="67" width="28" height="28" rx="3" fill="none" stroke="currentColor" strokeWidth="5" />
      <rect x="14" y="76" width="10" height="10" rx="1" />
      {/* Data */}
      <rect x="40" y="5" width="7" height="7" /><rect x="50" y="5" width="7" height="7" />
      <rect x="40" y="16" width="7" height="7" /><rect x="58" y="16" width="7" height="7" />
      <rect x="50" y="27" width="7" height="7" /><rect x="58" y="5" width="7" height="7" />
      <rect x="40" y="40" width="7" height="7" /><rect x="50" y="40" width="7" height="7" />
      <rect x="60" y="40" width="7" height="7" /><rect x="70" y="40" width="7" height="7" />
      <rect x="80" y="40" width="7" height="7" /><rect x="90" y="40" width="7" height="7" />
      <rect x="40" y="50" width="7" height="7" /><rect x="60" y="50" width="7" height="7" />
      <rect x="80" y="50" width="7" height="7" /><rect x="40" y="60" width="7" height="7" />
      <rect x="50" y="60" width="7" height="7" /><rect x="70" y="60" width="7" height="7" />
      <rect x="90" y="60" width="7" height="7" /><rect x="60" y="70" width="7" height="7" />
      <rect x="80" y="70" width="7" height="7" /><rect x="40" y="80" width="7" height="7" />
      <rect x="50" y="80" width="7" height="7" /><rect x="70" y="80" width="7" height="7" />
      <rect x="90" y="80" width="7" height="7" /><rect x="60" y="90" width="7" height="7" />
      <rect x="80" y="90" width="7" height="7" /><rect x="90" y="90" width="7" height="7" />
      <rect x="5" y="40" width="7" height="7" /><rect x="16" y="40" width="7" height="7" />
      <rect x="27" y="40" width="7" height="7" /><rect x="5" y="50" width="7" height="7" />
      <rect x="27" y="50" width="7" height="7" /><rect x="5" y="60" width="7" height="7" />
      <rect x="16" y="60" width="7" height="7" /><rect x="5" y="70" width="7" height="7" />
      <rect x="27" y="70" width="7" height="7" /><rect x="5" y="80" width="7" height="7" />
      <rect x="16" y="80" width="7" height="7" /><rect x="27" y="90" width="7" height="7" />
    </svg>
  );
}

// ── Apple Wallet card ────────────────────────────────────────────
function AppleWalletCard({ card }: { card: Partial<LoyaltyCard> }) {
  const bgType = card.bg_type ?? "solid";
  const hasImage = bgType === "image" && !!card.bg_image_url;
  const pos = card.bg_image_position ?? "cover";
  const stamps = card.stamps_required ?? 10;

  return (
    <div className="w-full overflow-hidden rounded-[20px] shadow-2xl" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>

      {/* Strip / header */}
      <div className="relative h-36 overflow-hidden" style={cardBgStyle(card)}>
        {hasImage && (pos === "top" || pos === "cover") && (
          <img src={card.bg_image_url!} alt="" className="absolute inset-0 h-full w-full object-cover" />
        )}
        {(bgType !== "image" || pos === "cover") && hasImage && (
          <div className="absolute inset-0 bg-black/25" />
        )}
        {hasImage && pos === "top" && (
          <div className="absolute inset-0 bg-black/20" />
        )}
        <div className="relative flex h-full items-end gap-3 p-4">
          {card.logo_url ? (
            <img src={card.logo_url} alt="Logo"
              className="h-11 w-11 flex-shrink-0 rounded-xl object-contain shadow-md"
              style={{ backgroundColor: card.color_background }} />
          ) : (
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-sm font-bold shadow-md"
              style={{ backgroundColor: card.color_primary, color: card.color_background }}>
              {card.title?.[0] ?? "?"}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: card.text_color, opacity: 0.7 }}>
              Tarjeta de fidelidad
            </p>
            <p className="truncate text-base font-bold leading-tight" style={{ color: card.text_color }}>
              {card.title}
            </p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="bg-white px-5 py-4">
        {hasImage && pos === "center" && (
          <img src={card.bg_image_url!} alt="" className="mb-4 h-24 w-full rounded-xl object-cover" />
        )}

        <p className="mb-2 text-[9px] font-bold uppercase tracking-widest text-gray-400">Sellos acumulados</p>
        <div className="mb-3 flex flex-wrap gap-1.5">
          {Array.from({ length: stamps }).map((_, i) => (
            <div key={i}
              className="flex h-7 w-7 items-center justify-center rounded-full border-2 text-[10px] font-bold transition-colors"
              style={{
                borderColor: card.color_primary,
                backgroundColor: i < 3 ? card.color_primary : "transparent",
                color: i < 3 ? "#fff" : card.color_primary,
              }}
            >
              {i < 3 ? "✓" : ""}
            </div>
          ))}
        </div>

        <div className="flex items-start justify-between">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Recompensa</p>
            <p className="text-sm font-semibold text-gray-800">{card.reward_text}</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Progreso</p>
            <p className="text-sm font-semibold text-gray-800">3 / {stamps}</p>
          </div>
        </div>
      </div>

      {/* QR section */}
      <div className="border-t border-dashed border-gray-200 bg-white px-5 pb-5 pt-4">
        {hasImage && pos === "bottom" && (
          <img src={card.bg_image_url!} alt="" className="mb-3 h-20 w-full rounded-xl object-cover" />
        )}
        <div className="flex flex-col items-center gap-1.5">
          <div className="h-[72px] w-[72px] text-gray-800">
            <QRCode />
          </div>
          <p className="text-[10px] text-gray-400">Muestra este código al cajero</p>
        </div>
      </div>
    </div>
  );
}

// ── Google Wallet card ───────────────────────────────────────────
function GoogleWalletCard({ card }: { card: Partial<LoyaltyCard> }) {
  const bgType = card.bg_type ?? "solid";
  const hasImage = bgType === "image" && !!card.bg_image_url;
  const pos = card.bg_image_position ?? "cover";
  const stamps = card.stamps_required ?? 10;

  return (
    <div className="w-full overflow-hidden rounded-3xl shadow-2xl" style={{ fontFamily: "Google Sans, sans-serif" }}>

      {/* Hero header */}
      <div className="relative overflow-hidden px-5 pb-5 pt-5" style={cardBgStyle(card)}>
        {hasImage && (pos === "cover" || pos === "top") && (
          <img src={card.bg_image_url!} alt="" className="absolute inset-0 h-full w-full object-cover" />
        )}
        {hasImage && (pos === "cover" || pos === "top") && (
          <div className="absolute inset-0 bg-black/40" />
        )}
        <div className="relative flex items-center gap-3">
          {card.logo_url ? (
            <img src={card.logo_url} alt="Logo"
              className="h-12 w-12 flex-shrink-0 rounded-2xl object-contain"
              style={{ backgroundColor: `${card.color_background}cc` }} />
          ) : (
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl text-lg font-bold"
              style={{ backgroundColor: card.color_primary, color: card.color_background }}>
              {card.title?.[0] ?? "?"}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-[10px] font-medium" style={{ color: card.text_color, opacity: 0.75 }}>
              Tarjeta de fidelidad
            </p>
            <p className="truncate text-xl font-bold" style={{ color: card.text_color }}>
              {card.title}
            </p>
          </div>
        </div>
      </div>

      {/* Center image */}
      {hasImage && pos === "center" && (
        <img src={card.bg_image_url!} alt="" className="h-28 w-full object-cover" />
      )}

      {/* Stamps */}
      <div className="bg-white px-5 py-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Sellos</p>
          <p className="text-[9px] font-bold text-gray-400">3 / {stamps}</p>
        </div>
        <div className="mb-1 flex flex-wrap gap-1.5">
          {Array.from({ length: stamps }).map((_, i) => (
            <div key={i}
              className="flex h-7 w-7 items-center justify-center rounded-full border-2 text-[10px] font-bold"
              style={{
                borderColor: card.color_primary,
                backgroundColor: i < 3 ? card.color_primary : "transparent",
                color: i < 3 ? "#fff" : card.color_primary,
              }}
            >
              {i < 3 ? "✓" : ""}
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Recompensa: <span className="font-semibold text-gray-800">{card.reward_text}</span>
        </p>
      </div>

      {/* Bottom image */}
      {hasImage && pos === "bottom" && (
        <img src={card.bg_image_url!} alt="" className="h-24 w-full object-cover" />
      )}

      {/* QR */}
      <div className="flex flex-col items-center gap-1.5 bg-gray-50 px-5 pb-5 pt-4">
        <div className="h-[72px] w-[72px] text-gray-800">
          <QRCode />
        </div>
        <p className="text-[10px] text-gray-400">Escanea para registrar tu visita</p>
      </div>
    </div>
  );
}

// ── CardPreview con tabs ─────────────────────────────────────────
function CardPreview({ card }: { card: Partial<LoyaltyCard> }) {
  const [wallet, setWallet] = useState<"apple" | "google">("apple");

  return (
    <div>
      <div className="mb-4 flex gap-2">
        {(["apple", "google"] as const).map((w) => (
          <button key={w} type="button" onClick={() => setWallet(w)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-brand py-2 text-xs font-semibold border transition-colors ${
              wallet === w
                ? "border-magenta bg-magenta/10 text-magenta"
                : "border-surface-border bg-surface text-mist hover:text-paper"
            }`}
          >
            {w === "apple" ? "Apple Wallet" : "Google Wallet"}
          </button>
        ))}
      </div>

      {wallet === "apple" ? <AppleWalletCard card={card} /> : <GoogleWalletCard card={card} />}

      <p className="mt-3 text-xs text-mist">Vista aproximada — el diseño final puede variar levemente.</p>
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
  const [card, setCard] = useState(initialCard);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBg, setUploadingBg] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

  const bgType = card.bg_type ?? "solid";

  function update<K extends keyof LoyaltyCard>(key: K, value: LoyaltyCard[K]) {
    setCard((prev: Partial<LoyaltyCard>) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function uploadFile(file: File, prefix: string): Promise<string | null> {
    if (!file.type.startsWith("image/")) { alert("Solo se permiten imágenes"); return null; }
    const ext = file.name.split(".").pop();
    const fileName = `${businessId}-${prefix}-${Date.now()}.${ext}`;
    const supabase = createClient();
    const { error } = await supabase.storage.from("logos").upload(fileName, file, { upsert: true });
    if (error) { alert("Error al subir la imagen. Intenta de nuevo."); return null; }
    return supabase.storage.from("logos").getPublicUrl(fileName).data.publicUrl;
  }

  async function subirLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert("El logo no puede pesar más de 2MB"); return; }
    setUploadingLogo(true);
    const url = await uploadFile(file, "logo");
    if (url) update("logo_url", url);
    setUploadingLogo(false);
  }

  async function subirFondo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert("La imagen no puede pesar más de 5MB"); return; }
    setUploadingBg(true);
    const url = await uploadFile(file, "bg");
    if (url) update("bg_image_url", url);
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
    };

    if (card.id) {
      await supabase.from("loyalty_cards").update(payload).eq("id", card.id);
    } else {
      const { data } = await supabase.from("loyalty_cards").insert(payload).select().single();
      if (data) setCard(data);
    }
    setSaving(false);
    setSaved(true);
    onSaved?.();
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* ── Formulario ── */}
      <div className="space-y-5">

        {/* Logo */}
        <div>
          <label className="label">Logo del negocio</label>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-brand border border-surface-border"
              style={{ backgroundColor: card.color_background }}>
              {card.logo_url
                ? <img src={card.logo_url} alt="Logo" className="h-full w-full object-contain p-1" />
                : <span className="text-xs text-mist">Sin logo</span>}
            </div>
            <div className="flex-1">
              <input ref={fileInputRef} type="file" accept="image/*" onChange={subirLogo} className="hidden" />
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploadingLogo}
                className="btn-secondary w-full !py-2 text-sm">
                {uploadingLogo ? "Subiendo..." : "Subir logo"}
              </button>
              <p className="mt-1 text-xs text-mist">PNG, JPG o SVG · Máx 2MB</p>
            </div>
            {card.logo_url && (
              <button type="button" onClick={() => update("logo_url", null as unknown as string)}
                className="text-xs text-mist hover:text-magenta">Quitar</button>
            )}
          </div>
        </div>

        {/* Título */}
        <div>
          <label className="label">Título de la tarjeta</label>
          <input className="input" value={card.title ?? ""} onChange={(e) => update("title", e.target.value)} />
        </div>

        {/* Recompensa */}
        <div>
          <label className="label">Recompensa</label>
          <input className="input" value={card.reward_text ?? ""} onChange={(e) => update("reward_text", e.target.value)} placeholder="Ej: Un café gratis" />
        </div>

        {/* Sellos */}
        <div>
          <label className="label">Sellos para la recompensa</label>
          <input type="number" min={1} max={20} className="input" value={card.stamps_required ?? 10}
            onChange={(e) => update("stamps_required", parseInt(e.target.value) || 10)} />
        </div>

        {/* Colores */}
        <div className="grid grid-cols-2 gap-3">
          <ColorInput label="Color acento" value={card.color_primary ?? "#FF2E63"} onChange={(v) => update("color_primary", v)} />
          <ColorInput label="Color texto" value={card.text_color ?? "#F5F4F2"} onChange={(v) => update("text_color", v)} />
        </div>

        {/* ══ Fondo ══ */}
        <div className="rounded-brand border border-surface-border p-4 space-y-4">
          <label className="label">Fondo de la tarjeta</label>

          <div className="flex gap-2">
            {(["solid", "gradient", "image"] as const).map((t) => (
              <button key={t} type="button" onClick={() => update("bg_type", t)}
                className={`flex-1 rounded-brand py-2 text-xs font-semibold border transition-colors ${
                  bgType === t
                    ? "border-magenta bg-magenta/10 text-magenta"
                    : "border-surface-border bg-surface text-mist hover:text-paper"
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
                <div className="flex gap-2">
                  {DIRECTIONS.map(({ label, value }) => (
                    <button key={value} type="button" onClick={() => update("gradient_direction", value)}
                      className={`flex-1 rounded-brand py-2 text-sm border transition-colors ${
                        (card.gradient_direction ?? "to bottom right") === value
                          ? "border-magenta bg-magenta/10 text-magenta"
                          : "border-surface-border bg-surface text-mist"
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
              <div className="flex items-center gap-3">
                <input ref={bgInputRef} type="file" accept="image/*" onChange={subirFondo} className="hidden" />
                <button type="button" onClick={() => bgInputRef.current?.click()} disabled={uploadingBg}
                  className="btn-secondary !py-2 text-sm flex-1">
                  {uploadingBg ? "Subiendo..." : card.bg_image_url ? "Cambiar imagen" : "Subir imagen de fondo"}
                </button>
                {card.bg_image_url && (
                  <button type="button" onClick={() => update("bg_image_url", null as unknown as string)}
                    className="text-xs text-mist hover:text-magenta">Quitar</button>
                )}
              </div>
              <p className="text-xs text-mist">Recomendado: 800×500 px · Máx 5MB</p>

              <div>
                <p className="label mb-2">Posición de la imagen</p>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { value: "cover", label: "Toda la tarjeta" },
                    { value: "top", label: "Arriba" },
                    { value: "center", label: "Al centro" },
                    { value: "bottom", label: "Abajo" },
                  ] as const).map(({ value, label }) => (
                    <button key={value} type="button" onClick={() => update("bg_image_position", value)}
                      className={`rounded-brand py-2 text-xs border transition-colors ${
                        (card.bg_image_position ?? "cover") === value
                          ? "border-magenta bg-magenta/10 text-magenta"
                          : "border-surface-border bg-surface text-mist"
                      }`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <button onClick={guardar} disabled={saving || uploadingLogo || uploadingBg} className="btn-primary w-full">
          {saving ? "Guardando..." : saved ? "✓ Guardado" : "Guardar tarjeta"}
        </button>
      </div>

      {/* ── Vista previa ── */}
      <div>
        <p className="label mb-3">Vista previa</p>
        <CardPreview card={card} />
      </div>
    </div>
  );
}

function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="flex items-center gap-2 rounded-brand border border-surface-border bg-surface p-2">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)}
          className="h-8 w-8 cursor-pointer rounded border-0 bg-transparent" />
        <span className="text-xs text-mist">{value}</span>
      </div>
    </div>
  );
}
