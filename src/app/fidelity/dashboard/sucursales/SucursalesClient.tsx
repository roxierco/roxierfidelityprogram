"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Icon } from "@/components/ui/Icon";
import type { Sucursal } from "@/types/database";

export function SucursalesClient({
  businessId,
  initialSucursales,
}: {
  businessId: string;
  initialSucursales: Sucursal[];
}) {
  const [sucursales, setSucursales] = useState<Sucursal[]>(initialSucursales);
  const [nombre, setNombre] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const supabase = createClient();

  async function agregar() {
    const name = nombre.trim();
    if (!name) return;
    setSaving(true);
    setError("");
    const { data, error } = await supabase
      .from("sucursales")
      .insert({ business_id: businessId, name })
      .select("id, business_id, name, is_active, created_at")
      .single();
    setSaving(false);
    if (error || !data) {
      setError("No se pudo crear la sucursal.");
      return;
    }
    setSucursales((prev) => [...prev, data as Sucursal]);
    setNombre("");
  }

  async function eliminar(id: string) {
    const { error } = await supabase.from("sucursales").delete().eq("id", id);
    if (!error) {
      setSucursales((prev) => prev.filter((s) => s.id !== id));
      setConfirmId(null);
    }
  }

  const total = sucursales.length;
  const enPlanBase = total <= 3;

  return (
    <div className="animate-fade-up space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-extrabold text-paper">Sucursales</h1>
        <p className="mt-1 text-mist">
          Registra tus ubicaciones para ver en cuál se registran más visitas. Tus clientes acumulan en todas por igual.
        </p>
      </div>

      {/* Aviso de precio según cantidad */}
      <div className={`rounded-xl border px-4 py-3 text-sm ${enPlanBase ? "border-surface-border bg-surface text-mist" : "border-magenta/30 bg-magenta/10 text-paper"}`}>
        {enPlanBase ? (
          <>Tienes <strong className="text-paper">{total}</strong> sucursal{total !== 1 ? "es" : ""}. Con hasta 3 sucursales pagas el precio normal.</>
        ) : (
          <>Tienes <strong>{total}</strong> sucursales. Con 4 o más aplica el precio de multi-sucursal (desde <strong>$699/mes</strong>). El cambio de precio aplica en tu próxima suscripción.</>
        )}
      </div>

      {/* Agregar */}
      <div className="card space-y-3">
        <label className="label">Nombre de la sucursal</label>
        <div className="flex gap-2">
          <input
            className="input flex-1"
            placeholder="Ej: Centro, Plaza Norte, Sucursal Sur..."
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") agregar(); }}
          />
          <button onClick={agregar} disabled={saving || !nombre.trim()} className="btn-primary !py-2 !px-5 text-sm disabled:opacity-50">
            {saving ? "..." : "Agregar"}
          </button>
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>

      {/* Lista */}
      {sucursales.length === 0 ? (
        <div className="card text-center py-10">
          <Icon name="sucursal" className="mx-auto mb-3 h-10 w-10 text-mist" />
          <h3 className="text-lg font-bold text-paper">Aún no tienes sucursales</h3>
          <p className="mx-auto mt-2 max-w-sm text-mist text-sm">
            Agrega tu primera sucursal arriba. Si solo tienes una ubicación, no necesitas registrar sucursales — todo funciona igual.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {sucursales.map((s) => (
            <div key={s.id} className="card flex items-center gap-3 !py-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-magenta/10 text-magenta font-bold">
                {s.name[0]?.toUpperCase()}
              </div>
              <p className="flex-1 font-semibold text-paper truncate">{s.name}</p>
              {confirmId === s.id ? (
                <div className="flex items-center gap-2">
                  <button onClick={() => setConfirmId(null)} className="text-xs text-mist hover:text-paper">Cancelar</button>
                  <button onClick={() => eliminar(s.id)} className="rounded-lg bg-red-500/15 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/25">
                    Sí, borrar
                  </button>
                </div>
              ) : (
                <button onClick={() => setConfirmId(s.id)} className="rounded-lg p-2 text-red-400/40 hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Eliminar sucursal">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
