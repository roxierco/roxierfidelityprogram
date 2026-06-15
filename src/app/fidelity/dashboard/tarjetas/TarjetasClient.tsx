"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
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
  slug,
  appUrl,
}: {
  cards: LoyaltyCard[];
  businessId: string;
  slug: string;
  appUrl: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<Partial<LoyaltyCard> | null>(
    cards.length === 0 ? defaultCard(businessId) : null
  );
  const [qrCardId, setQrCardId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function handleSaved() {
    router.refresh();
    setEditing(null);
  }

  const qrCard = cards.find((c) => c.id === qrCardId) ?? null;
  const enrollUrl = qrCard
    ? `${appUrl}/c/${slug}?card=${qrCard.id}`
    : null;

  async function copyLink() {
    if (!enrollUrl) return;
    await navigator.clipboard.writeText(enrollUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-10">
      {/* Lista de tarjetas creadas */}
      {cards.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-paper">Tarjetas creadas</h2>
            <button
              onClick={() => { setEditing(defaultCard(businessId)); setQrCardId(null); }}
              className="btn-primary !py-2 !px-4 text-sm"
            >
              + Nueva tarjeta
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => (
              <div key={card.id} className="overflow-hidden rounded-brand-lg border border-surface-border shadow transition-all">
                {/* Vista previa de la tarjeta */}
                <div className="p-5" style={{ backgroundColor: card.color_background, color: card.text_color }}>
                  <div className="mb-3 flex items-center gap-3">
                    {card.logo_url ? (
                      <img src={card.logo_url} alt="Logo" className="h-9 w-9 rounded object-contain" />
                    ) : (
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded text-sm font-bold"
                        style={{ backgroundColor: card.color_primary, color: card.color_background }}
                      >
                        {card.title?.[0] ?? "?"}
                      </div>
                    )}
                    <span className="truncate font-bold">{card.title}</span>
                  </div>

                  <p className="text-xs opacity-70">{card.stamps_required} sellos → {card.reward_text}</p>

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
                </div>

                {/* Acciones */}
                <div className="flex gap-2 border-t border-surface-border bg-surface px-4 py-3">
                  <button
                    onClick={() => { setQrCardId(card.id); setEditing(null); }}
                    className="flex-1 rounded-brand bg-magenta/10 py-2 text-xs font-semibold text-magenta hover:bg-magenta/20"
                  >
                    📱 Generar QR
                  </button>
                  <button
                    onClick={() => { setEditing(card); setQrCardId(null); }}
                    className="flex-1 rounded-brand border border-surface-border py-2 text-xs text-mist hover:text-paper"
                  >
                    Editar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* QR de inscripción para la tarjeta seleccionada */}
      {qrCard && enrollUrl && (
        <section className="rounded-brand border border-magenta/30 bg-magenta/5 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-paper">QR para clientes</h2>
              <p className="text-sm text-mist">
                Tarjeta: <span className="font-semibold text-paper">{qrCard.title}</span>
              </p>
            </div>
            <button onClick={() => setQrCardId(null)} className="text-xs text-mist hover:text-paper">
              Cerrar
            </button>
          </div>

          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            {/* QR grande */}
            <div className="flex flex-col items-center gap-2">
              <div className="rounded-2xl bg-white p-4 shadow-lg">
                <QRCodeSVG value={enrollUrl} size={180} bgColor="#ffffff" fgColor="#0E0E10" level="M" />
              </div>
              <p className="text-xs text-mist">Ponlo en tu mostrador o menú</p>
            </div>

            {/* Info */}
            <div className="flex-1 space-y-4">
              <div className="rounded-brand border border-surface-border bg-surface p-3 text-xs">
                <p className="mb-1 font-semibold text-mist uppercase tracking-wider text-[10px]">Cómo funciona</p>
                <ol className="space-y-1 text-mist list-decimal list-inside">
                  <li>El cliente escanea este QR con su cámara</li>
                  <li>Llena su nombre, correo y teléfono</li>
                  <li>Recibe su tarjeta digital con <strong className="text-paper">tu diseño</strong></li>
                  <li>Tú escaneas su QR para darle sellos</li>
                </ol>
              </div>

              <div>
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-mist">Enlace directo</p>
                <div className="flex items-center gap-2 rounded-brand border border-surface-border bg-surface px-3 py-2">
                  <span className="flex-1 truncate text-xs text-mist">{enrollUrl}</span>
                  <button onClick={copyLink} className="flex-shrink-0 text-xs font-semibold text-magenta hover:opacity-80">
                    {copied ? "¡Copiado!" : "Copiar"}
                  </button>
                </div>
              </div>

              <a
                href={`/fidelity/dashboard/scanner`}
                className="btn-primary inline-flex !py-2 !px-4 text-sm"
              >
                📷 Abrir escáner para dar sellos
              </a>
            </div>
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
              <button onClick={() => setEditing(null)} className="text-sm text-mist hover:text-paper">
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
