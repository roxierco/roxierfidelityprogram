"use client";

import { useRef, useState, useTransition } from "react";
import { Icon } from "@/components/ui/Icon";

export function LogoUpload({ currentLogoUrl, businessId }: { currentLogoUrl: string | null; businessId: string }) {
  const [logoUrl, setLogoUrl] = useState(currentLogoUrl);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [, startTransition] = useTransition();

  async function handleRemove() {
    setError("");
    setRemoving(true);

    const res = await fetch("/api/upload-business-logo", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessId }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError("Error al quitar el logo: " + (data.error ?? "desconocido"));
      setRemoving(false);
      return;
    }

    setLogoUrl(null);
    setRemoving(false);
    startTransition(() => { window.location.reload(); });
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Solo se permiten imágenes.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("La imagen no puede pesar más de 2 MB.");
      return;
    }

    setError("");
    setUploading(true);

    const form = new FormData();
    form.append("file", file);
    form.append("businessId", businessId);

    const res = await fetch("/api/upload-business-logo", { method: "POST", body: form });
    const data = await res.json();

    if (!res.ok) {
      setError("Error al subir la imagen: " + (data.error ?? "desconocido"));
      setUploading(false);
      return;
    }

    setLogoUrl(data.publicUrl);
    setUploading(false);
    startTransition(() => { window.location.reload(); });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        {/* Vista previa */}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl border-2 border-dashed border-surface-border bg-surface transition-colors hover:border-magenta focus:outline-none"
        >
          {logoUrl ? (
            <img src={logoUrl} alt="Logo del negocio" className="h-full w-full object-contain p-1" />
          ) : (
            <Icon name="tienda" className="h-7 w-7 text-mist" />
          )}
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-near-black/60">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-magenta border-t-transparent" />
            </div>
          )}
        </button>

        <div>
          <p className="text-sm font-semibold text-paper">
            {logoUrl ? "Cambiar logo" : "Subir logo"}
          </p>
          <p className="text-xs text-mist mt-0.5">
            PNG, JPG o SVG · máx 2 MB
          </p>
          <div className="mt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading || removing}
              className="text-xs font-semibold text-magenta hover:opacity-80 disabled:opacity-40"
            >
              {uploading ? "Subiendo..." : logoUrl ? "Cambiar imagen" : "Seleccionar imagen"}
            </button>
            {logoUrl && (
              <button
                type="button"
                onClick={handleRemove}
                disabled={uploading || removing}
                className="text-xs font-semibold text-mist hover:text-red-400 disabled:opacity-40"
              >
                {removing ? "Quitando..." : "Quitar foto"}
              </button>
            )}
          </div>
        </div>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}
