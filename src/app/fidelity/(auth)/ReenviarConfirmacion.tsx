"use client";

import { useState, useEffect } from "react";
import { reenviarConfirmacion } from "./actions";

const ESPERA_SEGUNDOS = 60;

/**
 * Botón para reenviar el correo de confirmación, con contador de 1 minuto
 * para que no se pueda spamear (Supabase también limita del lado del servidor).
 */
export function ReenviarConfirmacion({ email }: { email: string }) {
  const [enviando, setEnviando] = useState(false);
  const [restante, setRestante] = useState(0);
  const [msg, setMsg] = useState<{ texto: string; ok: boolean } | null>(null);

  // Cuenta regresiva
  useEffect(() => {
    if (restante <= 0) return;
    const t = setTimeout(() => setRestante((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [restante]);

  async function reenviar() {
    if (enviando || restante > 0) return;
    setEnviando(true);
    setMsg(null);

    const res = await reenviarConfirmacion(email);
    setEnviando(false);

    if (res.error) {
      setMsg({ texto: res.error, ok: false });
      return;
    }
    setMsg({ texto: `Te reenviamos el correo a ${email}. Revisa también tu carpeta de spam.`, ok: true });
    setRestante(ESPERA_SEGUNDOS);
  }

  return (
    <div className="mt-5 rounded-brand border border-surface-border bg-surface px-4 py-3">
      <p className="text-xs text-mist">¿No te llegó el correo de confirmación?</p>

      <button
        type="button"
        onClick={reenviar}
        disabled={enviando || restante > 0}
        className="mt-1.5 text-sm font-semibold text-magenta hover:opacity-80 disabled:text-mist disabled:hover:opacity-100 disabled:cursor-not-allowed transition-opacity"
      >
        {enviando
          ? "Enviando..."
          : restante > 0
            ? `Podrás reenviarlo en ${restante}s`
            : "Reenviar correo de confirmación"}
      </button>

      {msg && (
        <p className={`mt-2 text-xs leading-relaxed ${msg.ok ? "text-green-400" : "text-magenta"}`}>
          {msg.texto}
        </p>
      )}
    </div>
  );
}
