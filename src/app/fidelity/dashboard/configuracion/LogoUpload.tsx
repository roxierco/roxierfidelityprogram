"use client";

import { useRef, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";

export function LogoUpload({ currentLogoUrl, businessId }: { currentLogoUrl: string | null; businessId: string }) {
  const [logoUrl, setLogoUrl] = useState(currentLogoUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [, startTransition] = useTransition();

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

    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `business-logos/${businessId}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("logos")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setError("Error al subir la imagen: " + uploadError.message);
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from("logos").getPublicUrl(path);

    const { error: updateError } = await supabase
      .from("businesses")
      .update({ logo_url: publicUrl })
      .eq("id", businessId);

    if (updateError) {
      setError("Error al guardar: " + updateError.message);
      setUploading(false);
      return;
    }

    setLogoUrl(publicUrl);
    setUploading(false);
    // Refresca para que el sidebar muestre el nuevo logo
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
            <span className="text-2xl">🏪</span>
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
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="mt-2 text-xs font-semibold text-magenta hover:opacity-80 disabled:opacity-40"
          >
            {uploading ? "Subiendo..." : logoUrl ? "Cambiar imagen" : "Seleccionar imagen"}
          </button>
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
