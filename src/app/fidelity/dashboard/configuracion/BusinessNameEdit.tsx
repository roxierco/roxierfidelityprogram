"use client";

import { useState, useTransition, useRef } from "react";
import { updateBusinessName } from "./actions";

export function BusinessNameEdit({ currentName }: { currentName: string }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(currentName);
  const [draft, setDraft] = useState(currentName);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function startEdit() {
    setDraft(name);
    setError("");
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  }

  function cancel() {
    setEditing(false);
    setError("");
  }

  function save() {
    const trimmed = draft.trim();
    if (trimmed.length < 2) { setError("Mínimo 2 caracteres"); return; }
    setError("");
    startTransition(async () => {
      try {
        await updateBusinessName(trimmed);
        setName(trimmed);
        setEditing(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al guardar");
      }
    });
  }

  return (
    <div className="border-b border-surface-border pb-3 last:border-0 last:pb-0">
      <div className="flex items-center justify-between">
        <span className="text-mist">Negocio</span>

        {editing ? (
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") cancel(); }}
              maxLength={100}
              autoFocus
              className="w-48 rounded-lg border border-surface-border bg-surface px-3 py-1.5 text-sm text-paper focus:border-magenta focus:outline-none"
            />
            <button
              onClick={save}
              disabled={isPending}
              className="rounded-lg bg-magenta px-3 py-1.5 text-xs font-bold text-white hover:bg-magenta/90 disabled:opacity-50"
            >
              {isPending ? "..." : "Guardar"}
            </button>
            <button
              onClick={cancel}
              disabled={isPending}
              className="rounded-lg border border-surface-border px-3 py-1.5 text-xs font-semibold text-mist hover:text-paper disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="font-semibold capitalize text-paper">{name}</span>
            <button
              onClick={startEdit}
              title="Cambiar nombre"
              className="rounded p-1 text-mist hover:text-magenta transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-right text-xs text-red-400">{error}</p>}
    </div>
  );
}
