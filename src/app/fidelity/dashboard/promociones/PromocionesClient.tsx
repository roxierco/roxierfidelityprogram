"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";

interface Promo {
  id: string;
  title: string;
  message: string;
  is_active: boolean;
  created_at: string;
}

export function PromocionesClient({
  promos,
  businessId,
}: {
  promos: Promo[];
  businessId: string;
}) {
  const router = useRouter();
  const [lista, setLista] = useState<Promo[]>(promos);
  const [creando, setCreando] = useState(false);
  const [form, setForm] = useState({ title: "", message: "" });
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4000);
  }

  async function crear() {
    if (!form.title.trim() || !form.message.trim()) return;
    setSaving(true);
    const res = await fetch("/api/promociones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessId, ...form }),
    });
    const data = await res.json();
    if (res.ok) {
      setLista([data.promo, ...lista]);
      setForm({ title: "", message: "" });
      setCreando(false);
      showToast("Promoción creada");
    } else {
      showToast(data.error ?? "Error al crear", false);
    }
    setSaving(false);
  }

  async function toggleActiva(id: string, actual: boolean) {
    const res = await fetch(`/api/promociones/${id}/toggle`, { method: "PATCH" });
    if (res.ok) {
      setLista(lista.map((p) => p.id === id ? { ...p, is_active: !actual } : p));
    }
  }

  async function enviar(id: string) {
    setSending(id);
    const res = await fetch(`/api/promociones/${id}/enviar`, { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      showToast(`Enviado a ${data.sent} clientes`);
      router.refresh();
    } else {
      showToast(data.error ?? "Error al enviar", false);
    }
    setSending(null);
  }

  return (
    <div className="animate-fade-up space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 rounded-brand px-5 py-3 text-sm font-semibold shadow-xl ${
          toast.ok ? "bg-green-500 text-white" : "bg-red-500 text-white"
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-paper">Promociones</h1>
          <p className="mt-1 text-mist">Crea ofertas y envíalas por email a todos tus clientes.</p>
        </div>
        {!creando && (
          <button onClick={() => setCreando(true)} className="btn-primary !py-2 !px-5 text-sm">
            + Nueva promoción
          </button>
        )}
      </div>

      {/* Formulario nueva promo */}
      {creando && (
        <div className="card space-y-4">
          <h2 className="font-bold text-paper">Nueva promoción</h2>
          <div>
            <label className="label">Título</label>
            <input
              className="input"
              placeholder="ej: ¡Doble sellos esta semana!"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              maxLength={80}
            />
          </div>
          <div>
            <label className="label">Mensaje para tus clientes</label>
            <textarea
              className="input min-h-[100px] resize-none"
              placeholder="ej: Del lunes al viernes cada compra cuenta doble. ¡No te lo pierdas!"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              maxLength={500}
            />
            <p className="mt-1 text-right text-xs text-mist">{form.message.length}/500</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setCreando(false); setForm({ title: "", message: "" }); }}
              className="btn-secondary flex-1">
              Cancelar
            </button>
            <button onClick={crear} disabled={saving || !form.title.trim() || !form.message.trim()}
              className="btn-primary flex-1">
              {saving ? "Guardando..." : "Guardar promoción"}
            </button>
          </div>
        </div>
      )}

      {/* Lista de promociones */}
      {lista.length === 0 && !creando ? (
        <div className="card py-12 text-center">
          <Icon name="promocion" className="mx-auto mb-3 h-10 w-10 text-mist" />
          <p className="font-semibold text-paper mb-1">Sin promociones aún</p>
          <p className="text-sm text-mist">Crea tu primera promoción para avisarle a tus clientes.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {lista.map((p) => (
            <div key={p.id} className="card space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-paper truncate">{p.title}</h3>
                    <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      p.is_active
                        ? "bg-magenta/10 text-magenta"
                        : "bg-surface-raised text-mist"
                    }`}>
                      {p.is_active ? "Activa" : "Inactiva"}
                    </span>
                  </div>
                  <p className="text-sm text-mist leading-relaxed">{p.message}</p>
                  <p className="mt-2 text-xs text-mist opacity-60">
                    Creada {new Date(p.created_at).toLocaleDateString("es-MX", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 border-t border-surface-border pt-3">
                <button
                  onClick={() => toggleActiva(p.id, p.is_active)}
                  className="flex-1 rounded-brand border border-surface-border py-2 text-xs font-semibold text-mist hover:text-paper transition-colors"
                >
                  {p.is_active ? "Desactivar" : "Activar"}
                </button>
                <button
                  onClick={() => enviar(p.id)}
                  disabled={sending === p.id}
                  className="flex-1 rounded-brand bg-magenta/10 py-2 text-xs font-semibold text-magenta hover:bg-magenta/20 transition-colors disabled:opacity-50"
                >
                  {sending === p.id ? "Enviando..." : <span className="inline-flex items-center gap-1.5"><Icon name="correo" className="h-4 w-4" />Enviar a clientes</span>}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
