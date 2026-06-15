"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface ScanResult {
  success: boolean;
  customer: { id: string; full_name: string; current_stamps: number };
  rewarded: boolean;
  rewardText: string;
  stampsRequired: number;
}

export function ScannerClient({ businessId, businessName }: { businessId: string; businessName: string }) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState("");
  const [stamping, setStamping] = useState(false);
  const [scannedCustomerId, setScannedCustomerId] = useState<string | null>(null);

  async function startScanner() {
    setError("");
    setResult(null);
    setScannedCustomerId(null);

    const qr = new Html5Qrcode("qr-reader");
    scannerRef.current = qr;

    try {
      await qr.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => handleScan(decodedText, qr),
        undefined,
      );
      setScanning(true);
    } catch {
      setError("No se pudo acceder a la cámara. Verifica los permisos.");
    }
  }

  async function stopScanner() {
    if (scannerRef.current && scanning) {
      await scannerRef.current.stop();
      scannerRef.current = null;
    }
    setScanning(false);
  }

  async function handleScan(url: string, qr: Html5Qrcode) {
    // Extraer customerId de URL tipo /c/{slug}/u/{customerId}
    const match = url.match(/\/u\/([a-f0-9-]{36})/);
    if (!match) {
      setError("QR inválido — no es una tarjeta de este sistema.");
      return;
    }

    const customerId = match[1];
    setScannedCustomerId(customerId);

    await qr.stop();
    scannerRef.current = null;
    setScanning(false);
  }

  async function darSello() {
    if (!scannedCustomerId) return;
    setStamping(true);
    setError("");

    const res = await fetch("/api/stamp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId: scannedCustomerId, businessId }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Error al dar sello");
      setStamping(false);
      return;
    }

    setResult(data);
    setScannedCustomerId(null);
    setStamping(false);
  }

  useEffect(() => {
    return () => {
      scannerRef.current?.stop().catch(() => null);
    };
  }, []);

  return (
    <div className="mx-auto max-w-sm space-y-4">

      {/* Cámara */}
      {!result && !scannedCustomerId && (
        <div className="rounded-brand border border-surface-border bg-surface overflow-hidden">
          <div id="qr-reader" className="w-full" style={{ minHeight: scanning ? 300 : 0 }} />
          {!scanning && (
            <div className="p-6 flex flex-col items-center gap-3">
              <div className="h-16 w-16 rounded-full bg-magenta/10 flex items-center justify-center text-3xl">
                📷
              </div>
              <p className="text-sm text-mist text-center">
                Activa la cámara para escanear el QR del cliente
              </p>
              <button onClick={startScanner} className="btn-primary w-full">
                Activar cámara
              </button>
            </div>
          )}
          {scanning && (
            <div className="p-4 flex justify-center">
              <button onClick={stopScanner} className="btn-secondary !py-2 text-sm">
                Cancelar
              </button>
            </div>
          )}
        </div>
      )}

      {/* QR escaneado — confirmar sello */}
      {scannedCustomerId && !result && (
        <div className="rounded-brand border border-surface-border bg-surface p-6 space-y-4">
          <div className="text-center">
            <div className="text-4xl mb-2">✅</div>
            <p className="font-bold text-paper">QR leído correctamente</p>
            <p className="text-sm text-mist mt-1">¿Dar sello a este cliente?</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setScannedCustomerId(null)} className="btn-secondary flex-1">
              Cancelar
            </button>
            <button onClick={darSello} disabled={stamping} className="btn-primary flex-1">
              {stamping ? "Dando sello..." : "Dar sello ✓"}
            </button>
          </div>
        </div>
      )}

      {/* Resultado */}
      {result && (
        <div className={`rounded-brand border p-6 space-y-3 text-center ${
          result.rewarded
            ? "border-yellow-400 bg-yellow-400/10"
            : "border-green-500 bg-green-500/10"
        }`}>
          <div className="text-5xl">{result.rewarded ? "🎉" : "✅"}</div>
          <div>
            <p className="font-bold text-lg text-paper">{result.customer.full_name}</p>
            {result.rewarded ? (
              <>
                <p className="text-yellow-400 font-semibold mt-1">¡Recompensa ganada!</p>
                <p className="text-sm text-mist">{result.rewardText}</p>
              </>
            ) : (
              <p className="text-green-400 font-semibold mt-1">
                Sello agregado · {result.customer.current_stamps}/{result.stampsRequired} sellos
              </p>
            )}
          </div>
          <button
            onClick={() => { setResult(null); startScanner(); }}
            className="btn-primary w-full"
          >
            Escanear otro cliente
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-brand border border-red-500/30 bg-red-500/10 p-4">
          <p className="text-sm text-red-400">{error}</p>
          <button onClick={() => { setError(""); startScanner(); }} className="mt-2 text-xs underline text-mist">
            Intentar de nuevo
          </button>
        </div>
      )}
    </div>
  );
}
