"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TarjetaEditor } from "./TarjetaEditor";
import type { LoyaltyCard } from "@/types/database";

function defaultCard(businessId: string): Partial<LoyaltyCard> {
  return {
    business_id: businessId,
    title: "Tarjeta de lealtad",
    color_primary: "#FF2E63",
    color_background: "#0E0E10",
    text_color: "#F5F4F2",
    stamps_required: 10,
    reward_text: "Un producto gratis",
  };
}

export function TarjetasClient({
  cards,
  businessId,
}: {
  cards: LoyaltyCard[];
  businessId: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<Partial<LoyaltyCard> | null>(
    cards.length === 0 ? defaultCard(businessId) : null
  );

  function handleSaved() {
    router.refresh();
    setEditing(null);
  }

  return (
    <div className="space-y-10">
      {/* Lista de tarjetas creadas */}
      {cards.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-paper">Tarjetas creadas</h2>
            <button
              onClick={() => setEditing(defaultCard(businessId))}
              className="btn-primary !py-2 !px-4 text-sm"
            >
              + Nueva tarjeta
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => (
              <div
                key={card.id}
                className="rounded-brand-lg border border-surface-border p-5 shadow transition-all"
                style={{ backgroundColor: card.color_background, color: card.text_color }}
              >
                <div className="mb-3 flex items-center gap-3">
                  {card.logo_url ? (
                    <img
                      src={card.logo_url}
                      alt="Logo"
                      className="h-9 w-9 rounded object-contain"
                    />
                  ) : (
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded text-sm font-bold"
                      style={{
                        backgroundColor: card.color_primary,
                        color: card.color_background,
                      }}
                    >
                      {card.title?.[0] ?? "?"}
                    </div>
                  )}
                  <span className="truncate font-bold">{card.title}</span>
                </div>

                <p className="text-xs opacity-70">
                  {card.stamps_required} sellos → {card.reward_text}
                </p>

                <div className="mt-3 flex flex-wrap gap-1">
                  {Array.from({ length: Math.min(card.stamps_required, 8) }).map((_, i) => (
                    <div
                      key={i}
                      className="flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-bold"
                      style={{
                        borderColor: card.color_primary,
                        backgroundColor: i < 2 ? card.color_primary : "transparent",
                        color: i < 2 ? card.color_background : card.text_color,
                      }}
                    >
                      {i < 2 ? "✓" : ""}
                    </div>
                  ))}
                  {card.stamps_required > 8 && (
                    <span className="text-xs opacity-50">+{card.stamps_required - 8}</span>
                  )}
                </div>

                <button
                  onClick={() => setEditing(card)}
                  className="mt-4 text-xs underline opacity-60 hover:opacity-100"
                  style={{ color: card.color_primary }}
                >
                  Editar
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Editor */}
      {editing !== null && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-paper">
              {editing.id ? "Editar tarjeta" : "Nueva tarjeta"}
            </h2>
            {cards.length > 0 && (
              <button
                onClick={() => setEditing(null)}
                className="text-sm text-mist hover:text-paper"
              >
                Cancelar
              </button>
            )}
          </div>
          <TarjetaEditor
            key={editing.id ?? "nueva"}
            initialCard={editing}
            businessId={businessId}
            onSaved={handleSaved}
          />
        </section>
      )}
    </div>
  );
}
