"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { LoyaltyCard } from "@/types/database";

/**
 * Editor de tarjeta con vista previa en tiempo real.
 * Lo que el negocio ve aquí es lo que su cliente verá en el wallet.
 */
export function TarjetaEditor({
  initialCard,
  businessId,
}: {
  initialCard: Partial<LoyaltyCard>;
  businessId: string;
}) {
  const [card, setCard] = useState(initialCard);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function update<K extends keyof LoyaltyCard>(key: K, value: LoyaltyCard[K]) {
    setCard((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
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
    };

    if (card.id) {
      await supabase.from("loyalty_cards").update(payload).eq("id", card.id);
    } else {
      const { data } = await supabase.from("loyalty_cards").insert(payload).select().single();
      if (data) setCard(data);
    }
    setSaving(false);
    setSaved(true);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Controles */}
      <div className="space-y-4">
        <div>
          <label className="label">Título de la tarjeta</label>
          <input
            className="input"
            value={card.title ?? ""}
            onChange={(e) => update("title", e.target.value)}
          />
        </div>

        <div>
          <label className="label">Recompensa</label>
          <input
            className="input"
            value={card.reward_text ?? ""}
            onChange={(e) => update("reward_text", e.target.value)}
            placeholder="Ej: Un café gratis"
          />
        </div>

        <div>
          <label className="label">Sellos necesarios para la recompensa</label>
          <input
            type="number"
            min={1}
            max={20}
            className="input"
            value={card.stamps_required ?? 10}
            onChange={(e) => update("stamps_required", parseInt(e.target.value) || 10)}
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <ColorInput label="Acento" value={card.color_primary ?? "#FF2E63"} onChange={(v) => update("color_primary", v)} />
          <ColorInput label="Fondo" value={card.color_background ?? "#0E0E10"} onChange={(v) => update("color_background", v)} />
          <ColorInput label="Texto" value={card.text_color ?? "#F5F4F2"} onChange={(v) => update("text_color", v)} />
        </div>

        <button onClick={guardar} disabled={saving} className="btn-primary w-full">
          {saving ? "Guardando..." : saved ? "✓ Guardado" : "Guardar tarjeta"}
        </button>
      </div>

      {/* Vista previa */}
      <div>
        <p className="label">Vista previa</p>
        <div
          className="rounded-brand-lg border border-surface-border p-6 shadow-lg"
          style={{ backgroundColor: card.color_background, color: card.text_color }}
        >
          <div className="mb-6 flex items-center justify-between">
            <span className="text-lg font-extrabold">{card.title}</span>
            <div
              className="h-8 w-8 rounded"
              style={{ backgroundColor: card.color_primary }}
            />
          </div>
          <div className="mb-4 flex flex-wrap gap-2">
            {Array.from({ length: card.stamps_required ?? 10 }).map((_, i) => (
              <div
                key={i}
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold"
                style={{
                  borderColor: card.color_primary,
                  backgroundColor: i < 3 ? card.color_primary : "transparent",
                  color: i < 3 ? card.color_background : card.text_color,
                }}
              >
                {i < 3 ? "✓" : ""}
              </div>
            ))}
          </div>
          <p className="text-sm opacity-80">
            Junta {card.stamps_required} sellos y obtén: {card.reward_text}
          </p>
        </div>
        <p className="mt-3 text-xs text-mist">
          Así se verá la tarjeta en Apple Wallet y Google Wallet (aproximado).
        </p>
      </div>
    </div>
  );
}

function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="flex items-center gap-2 rounded-brand border border-surface-border bg-surface p-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-8 cursor-pointer rounded border-0 bg-transparent"
        />
        <span className="text-xs text-mist">{value}</span>
      </div>
    </div>
  );
}
