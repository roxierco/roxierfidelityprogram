"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { TarjetaEditor } from "./TarjetaEditor";
import type { LoyaltyCard } from "@/types/database";

function defaultCard(businessId: string, type: CardTypeKey = "sellos"): Partial<LoyaltyCard> {
  const base = {
    business_id: businessId,
    color_primary: "#FF2E63",
    color_background: "#0E0E10",
    text_color: "#F5F4F2",
    card_type: type as LoyaltyCard["card_type"],
  };
  if (type === "cupon") return { ...base, title: "Cupón especial", coupon_value: "20% de descuento", stamps_required: 1, reward_text: "Cupón canjeado" };
  if (type === "descuento") return { ...base, title: "Descuento especial", coupon_value: "15% de descuento en tu próxima compra", stamps_required: 1, reward_text: "Descuento aplicado" };
  if (type === "cashback") return { ...base, color_primary: "#16A34A", title: "Cashback", stamps_required: 1, reward_text: "Saldo de cashback", cashback_percent: 5, cashback_min_purchase: 0 };
  return { ...base, title: "Tarjeta de lealtad", stamps_required: 10, reward_text: "Un producto gratis" };
}

// ── Selector de tipo de tarjeta ──────────────────────────────────

type CardTypeKey = "sellos" | "cupon" | "cashback" | "descuento";

const CARD_TYPES: {
  key: CardTypeKey;
  title: string;
  description: string;
  available: boolean;
  icon: React.ReactNode;
}[] = [
  {
    key: "cupon",
    title: "Cupón",
    description: "Ofrece cupones digitales de un solo uso para atraer nuevos clientes.",
    available: true,
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a3 3 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
      </svg>
    ),
  },
  {
    key: "cashback",
    title: "Cashback",
    description: "Devuelve un porcentaje de cada compra a tus clientes. ¡Más compras, más beneficios!",
    available: false,
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
      </svg>
    ),
  },
  {
    key: "sellos",
    title: "Tarjeta de sellos",
    description: "Un sistema de sellos digitales para que tus clientes acumulen beneficios y reciban premios exclusivos.",
    available: true,
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
      </svg>
    ),
  },
  {
    key: "descuento",
    title: "Descuento",
    description: "Ofrece descuentos exclusivos en tus productos o servicios y haz que tus clientes vuelvan una y otra vez.",
    available: true,
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185zM9.75 9h.008v.008H9.75V9zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 4.5h.008v.008h-.008V13.5zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      </svg>
    ),
  },
];

// Preview del teléfono según tipo seleccionado
function PhonePreview({ selected }: { selected: CardTypeKey }) {
  if (selected === "sellos") {
    return (
      <div className="flex flex-col items-center gap-3">
        {/* Marco del teléfono */}
        <div className="relative w-44 rounded-[2rem] border-4 border-ink bg-ink shadow-2xl overflow-hidden">
          {/* Notch */}
          <div className="flex justify-center pt-2 pb-1">
            <div className="h-1.5 w-16 rounded-full bg-surface-border" />
          </div>
          {/* Pantalla */}
          <div className="bg-[#F4F4F5] pb-4 px-3">
            <div className="rounded-xl bg-white shadow-sm overflow-hidden">
              {/* Header de la tarjeta */}
              <div className="bg-[#0E0E10] p-3 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-6 w-6 rounded bg-[#FF2E63] flex items-center justify-center text-[9px] font-black">R</div>
                  <div>
                    <p className="text-[9px] font-bold leading-none">Tu Negocio</p>
                    <p className="text-[7px] text-white/50 leading-none mt-0.5">Tarjeta de sellos</p>
                  </div>
                </div>
                {/* Sellos mini */}
                <div className="flex gap-1 flex-wrap mb-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className={`h-4 w-4 rounded-full border border-[#FF2E63] flex items-center justify-center text-[7px] font-black ${i < 3 ? "bg-[#FF2E63]" : ""}`}>
                      {i < 3 ? "✓" : ""}
                    </div>
                  ))}
                </div>
                <p className="text-[7px] text-white/60">Premio: Un producto gratis</p>
              </div>
              {/* QR */}
              <div className="flex flex-col items-center py-3 gap-1">
                <div className="rounded-lg bg-white p-1.5 shadow">
                  <QRCodeSVG value="https://roxier.co" size={52} bgColor="#ffffff" fgColor="#0E0E10" level="M" />
                </div>
                <p className="text-[7px] text-gray-400">Escanear para sellar</p>
              </div>
            </div>
          </div>
        </div>
        <p className="text-xs text-mist text-center max-w-36">Así ve tu cliente su tarjeta en el celular</p>
      </div>
    );
  }

  // Preview genérico para tipos no disponibles
  const previews: Record<string, { label: string; content: React.ReactNode }> = {
    cupon: {
      label: "Cupón digital",
      content: (
        <div className="rounded-xl border-2 border-dashed border-[#3B82F6] bg-blue-50 p-3 text-center">
          <p className="text-lg font-black text-[#3B82F6]">10% OFF</p>
          <p className="text-[8px] text-gray-500 mt-1">Válido una sola vez</p>
          <div className="mt-2 flex justify-center">
            <QRCodeSVG value="https://roxier.co" size={40} bgColor="#eff6ff" fgColor="#1d4ed8" level="M" />
          </div>
        </div>
      ),
    },
    cashback: {
      label: "Cashback",
      content: (
        <div className="rounded-xl bg-gradient-to-br from-green-600 to-emerald-800 p-3 text-white text-center">
          <p className="text-[9px] font-bold uppercase tracking-widest opacity-60 mb-1">Saldo acumulado</p>
          <p className="text-2xl font-black">$34.50</p>
          <p className="text-[8px] opacity-60 mt-1">5% de cada compra</p>
        </div>
      ),
    },
    descuento: {
      label: "Descuento",
      content: (
        <div className="rounded-xl bg-gradient-to-br from-orange-500 to-red-600 p-3 text-white text-center">
          <p className="text-[9px] font-bold uppercase tracking-widest opacity-70 mb-1">Descuento especial</p>
          <p className="text-2xl font-black">-20%</p>
          <p className="text-[8px] opacity-60 mt-1">En tu próxima visita</p>
        </div>
      ),
    },
  };

  const p = previews[selected];
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-44 rounded-[2rem] border-4 border-ink bg-ink shadow-2xl overflow-hidden">
        <div className="flex justify-center pt-2 pb-1">
          <div className="h-1.5 w-16 rounded-full bg-surface-border" />
        </div>
        <div className="bg-[#F4F4F5] pb-4 px-3">
          <div className="rounded-xl bg-white shadow-sm overflow-hidden p-3">
            {p?.content}
          </div>
        </div>
      </div>
      <p className="text-xs text-mist text-center max-w-36">Vista previa · {p?.label}</p>
    </div>
  );
}

function CardTypeSelector({
  onSelect,
  onCancel,
}: {
  onSelect: (type: CardTypeKey) => void;
  onCancel: () => void;
}) {
  const [hovered, setHovered] = useState<CardTypeKey>("sellos");

  return (
    <div className="rounded-brand-lg border border-surface-border bg-surface overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border">
        <div>
          <h2 className="text-lg font-extrabold text-paper">Nueva tarjeta</h2>
          <p className="text-xs text-mist mt-0.5">Elige el tipo de tarjeta para tu negocio</p>
        </div>
        <button onClick={onCancel} className="rounded-brand p-1.5 text-mist hover:text-paper hover:bg-surface-border transition-colors">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex flex-col md:flex-row">
        {/* Lista de tipos */}
        <div className="flex-1 divide-y divide-surface-border">
          {CARD_TYPES.map((type) => (
            <button
              key={type.key}
              disabled={!type.available}
              onClick={() => type.available && onSelect(type.key)}
              onMouseEnter={() => setHovered(type.key)}
              className={`w-full flex items-center gap-4 px-6 py-5 text-left transition-all
                ${type.available
                  ? "hover:bg-magenta/5 cursor-pointer"
                  : "cursor-not-allowed opacity-50"
                }
                ${hovered === type.key && type.available ? "bg-magenta/5" : ""}
              `}
            >
              <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border transition-colors
                ${hovered === type.key && type.available
                  ? "border-magenta/40 bg-magenta/10 text-magenta"
                  : "border-surface-border bg-surface text-mist"
                }`}>
                {type.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-paper text-sm">{type.title}</p>
                  {!type.available && (
                    <span className="rounded-full bg-surface-border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-mist">
                      Próximamente
                    </span>
                  )}
                </div>
                <p className="text-xs text-mist leading-relaxed mt-0.5 line-clamp-2">{type.description}</p>
              </div>
              {type.available && (
                <svg viewBox="0 0 24 24" className="h-4 w-4 flex-shrink-0 text-mist" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              )}
            </button>
          ))}
        </div>

        {/* Preview lateral */}
        <div className="hidden md:flex w-64 flex-shrink-0 items-center justify-center border-l border-surface-border bg-surface/50 p-8">
          <PhonePreview selected={hovered} />
        </div>
      </div>
    </div>
  );
}

// ── Componente principal ─────────────────────────────────────────

type Step = "list" | "selecting" | "editing";

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
  const [step, setStep] = useState<Step>(cards.length === 0 ? "selecting" : "list");
  const [editing, setEditing] = useState<Partial<LoyaltyCard> | null>(
    cards.length === 0 ? defaultCard(businessId) : null
  );
  const [qrCardId, setQrCardId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  function handleSaved() {
    router.refresh();
    setStep("list");
    setEditing(null);
  }

  function handleTypeSelected(type: CardTypeKey) {
    setEditing(defaultCard(businessId, type));
    setStep("editing");
  }

  function startNew() {
    setQrCardId(null);
    setStep("selecting");
  }

  function startEdit(card: LoyaltyCard) {
    setEditing(card);
    setQrCardId(null);
    setStep("editing");
  }

  const qrCard = cards.find((c) => c.id === qrCardId) ?? null;
  const enrollUrl = qrCard ? `${appUrl}/c/${slug}?card=${qrCard.id}` : null;

  async function deleteCard(cardId: string) {
    setDeleting(true);
    const res = await fetch(`/api/cards/${cardId}`, { method: "DELETE" });
    setDeleting(false);
    if (res.ok) {
      setConfirmDeleteId(null);
      if (qrCardId === cardId) setQrCardId(null);
      router.refresh();
    }
  }

  async function copyLink() {
    if (!enrollUrl) return;
    await navigator.clipboard.writeText(enrollUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-10">

      {/* Selector de tipo */}
      {step === "selecting" && (
        <CardTypeSelector
          onSelect={handleTypeSelected}
          onCancel={cards.length > 0 ? () => setStep("list") : () => {}}
        />
      )}

      {/* Editor */}
      {step === "editing" && editing !== null && (
        <section>
          <div className="mb-4 flex items-center gap-3">
            <button
              onClick={() => { setStep(editing.id ? "list" : "selecting"); setEditing(null); }}
              className="flex items-center justify-center rounded-xl border border-surface-border bg-surface p-2 text-mist hover:text-paper hover:border-white/20 transition-all"
              aria-label="Regresar"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <h2 className="text-xl font-bold text-paper flex-1">
              {editing.id ? "Editar tarjeta" : editing.card_type === "cupon" ? "Nuevo cupón" : editing.card_type === "descuento" ? "Nueva tarjeta de descuento" : "Nueva tarjeta de sellos"}
            </h2>
            <button
              onClick={() => { setStep(editing.id ? "list" : "selecting"); setEditing(null); }}
              className="text-sm text-mist hover:text-paper"
            >
              Cancelar
            </button>
          </div>
          <TarjetaEditor
            key={editing.id ?? "nueva"}
            initialCard={editing}
            businessId={businessId}
            onSaved={handleSaved}
          />
        </section>
      )}

      {/* Lista de tarjetas */}
      {step === "list" && (
        <>
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-paper">Tarjetas creadas</h2>
              <button onClick={startNew} className="btn-primary !py-2 !px-4 text-sm">
                + Nueva tarjeta
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cards.map((card) => (
                <div key={card.id} className="overflow-hidden rounded-brand-lg border border-surface-border shadow transition-all">
                  {/* Vista previa */}
                  <div className="p-5" style={{ backgroundColor: card.color_background, color: card.text_color }}>
                    <div className="mb-3 flex items-center gap-3">
                      {card.logo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
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
                    {confirmDeleteId === card.id ? (
                      <div className="flex w-full items-center gap-2">
                        <span className="flex-1 text-xs text-paper font-medium">¿Borrar esta tarjeta?</span>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="rounded-brand border border-surface-border px-3 py-1.5 text-xs text-mist hover:text-paper transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => deleteCard(card.id)}
                          disabled={deleting}
                          className="rounded-brand bg-red-500/15 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/25 disabled:opacity-50 transition-colors"
                        >
                          {deleting ? "Borrando..." : "Sí, borrar"}
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => { setQrCardId(card.id); setStep("list"); }}
                          className="flex-1 rounded-brand bg-magenta/10 py-2 text-xs font-semibold text-magenta hover:bg-magenta/20"
                        >
                          📱 Generar QR
                        </button>
                        <button
                          onClick={() => startEdit(card)}
                          className="flex-1 rounded-brand border border-surface-border py-2 text-xs text-mist hover:text-paper"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => { setConfirmDeleteId(card.id); setQrCardId(null); }}
                          className="rounded-brand border border-red-500/20 px-3 py-2 text-xs text-red-400/60 hover:text-red-400 hover:border-red-500/40 transition-colors"
                          title="Eliminar tarjeta"
                        >
                          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* QR de inscripción */}
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
                <div className="flex flex-col items-center gap-2">
                  <div className="rounded-2xl bg-white p-4 shadow-lg">
                    <QRCodeSVG value={enrollUrl} size={180} bgColor="#ffffff" fgColor="#0E0E10" level="M" />
                  </div>
                  <p className="text-xs text-mist">Ponlo en tu mostrador o menú</p>
                </div>

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

                  <div className="flex flex-wrap gap-2">
                    <a href="/fidelity/dashboard/scanner" className="btn-primary inline-flex !py-2 !px-4 text-sm">
                      📷 Abrir escáner para dar sellos
                    </a>
                    <a href="/fidelity/dashboard/scanner?modo=pistola" className="btn-secondary inline-flex !py-2 !px-4 text-sm">
                      🔫 Usar pistola lectora
                    </a>
                  </div>
                </div>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
