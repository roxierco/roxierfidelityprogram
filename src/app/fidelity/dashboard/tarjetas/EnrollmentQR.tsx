"use client";

import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";

export function EnrollmentQR({ enrollUrl, slug }: { enrollUrl: string; slug: string }) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    await navigator.clipboard.writeText(enrollUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-brand border border-surface-border bg-surface p-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        {/* QR */}
        <div className="flex-shrink-0 flex flex-col items-center gap-2">
          <div className="rounded-xl bg-white p-3">
            <QRCodeSVG value={enrollUrl} size={140} bgColor="#ffffff" fgColor="#0E0E10" level="M" />
          </div>
          <p className="text-xs text-mist">QR de inscripción</p>
        </div>

        {/* Info */}
        <div className="flex-1 space-y-3">
          <div>
            <h2 className="font-bold text-paper">Comparte este QR con tus clientes</h2>
            <p className="mt-1 text-sm text-mist">
              Ponlo en tu mostrador, menú o flyer. El cliente lo escanea, se registra y
              recibe su tarjeta digital con su código personal.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-brand border border-surface-border bg-surface px-3 py-2">
            <span className="flex-1 truncate text-xs text-mist">{enrollUrl}</span>
            <button
              onClick={copyLink}
              className="flex-shrink-0 text-xs font-semibold text-magenta hover:opacity-80"
            >
              {copied ? "¡Copiado!" : "Copiar"}
            </button>
          </div>

          <div className="flex gap-2">
            <a
              href={`/fidelity/dashboard/scanner`}
              className="btn-primary !py-2 !px-4 text-sm"
            >
              📷 Abrir escáner
            </a>
            <a
              href={enrollUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary !py-2 !px-4 text-sm"
            >
              Ver página del cliente
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
