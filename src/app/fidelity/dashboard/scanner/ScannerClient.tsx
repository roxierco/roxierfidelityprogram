"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";

interface ScanResult {
  success: boolean;
  customer: { id: string; full_name: string; current_stamps: number };
  rewarded: boolean;
  nearReward: boolean;
  rewardText: string;
  stampsRequired: number;
  cardType: "sellos" | "cupon" | "descuento";
  couponValue: string | null;
}

function playRewardSound() {
  try {
    const ctx = new AudioContext();
    const notes = [523, 659, 784, 1047]; // C5 E5 G5 C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.4);
      osc.start(ctx.currentTime + i * 0.12);
      osc.stop(ctx.currentTime + i * 0.12 + 0.4);
    });
  } catch {
    // audio not available
  }
}

export function ScannerClient({ businessId, businessName }: { businessId: string; businessName: string }) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState("");
  const [stamping, setStamping] = useState(false);
  const [scannedCustomerId, setScannedCustomerId] = useState<string | null>(null);
  const [scannedCardId, setScannedCardId] = useState<string | null>(null);

  async function startScanner() {
    setError("");
    setResult(null);
    setScannedCustomerId(null);
    setScannedCardId(null);

    // Parar instancia anterior si existe
    if (scannerRef.current) {
      await scannerRef.current.stop().catch(() => null);
      scannerRef.current = null;
    }

    const scanConfig = {
      fps: 25,
      // Sin qrbox = escanea todo el frame, sin cuadro visible
      videoConstraints: { width: { ideal: 1280 }, height: { ideal: 720 } },
    };

    // Obtener lista de cámaras disponibles (evita el bug de estado de html5-qrcode con constraints)
    let cameras: { id: string; label: string }[] = [];
    try {
      cameras = await Html5Qrcode.getCameras();
    } catch (e) {
      setError(`No se encontró cámara: ${String(e)}`);
      return;
    }
    if (!cameras.length) {
      setError("No se encontró ninguna cámara en este dispositivo.");
      return;
    }

    // En móvil la cámara trasera suele ser la primera (index 0), la frontal la última
    // Buscar por label primero, si no hay label usar cameras[0]
    const backCamera = cameras.find(c =>
      /back|rear|trasera|environment/i.test(c.label)
    ) ?? cameras.find(c =>
      !/front|frontal|user|selfie/i.test(c.label) && c.label !== ""
    );
    const cameraId = (backCamera ?? cameras[0]).id;

    const container = document.getElementById("qr-reader");
    if (container) container.innerHTML = "";

    const qr = new Html5Qrcode("qr-reader", {
      formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
      verbose: false,
    });
    scannerRef.current = qr;

    try {
      await qr.start(cameraId, scanConfig, (text) => handleScan(text, qr), undefined);
      setScanning(true);
    } catch (e) {
      const msg = String((e as { message?: string })?.message ?? e ?? "desconocido");
      setError(`Error al iniciar cámara: ${msg}`);
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
    // Extraer customerId de URL tipo /c/{slug}/u/{customerId}?card={cardId}
    const match = url.match(/\/u\/([a-f0-9-]{36})/);
    if (!match) {
      setError("QR inválido — no es una tarjeta de este sistema.");
      return;
    }

    const customerId = match[1];
    setScannedCustomerId(customerId);

    // Extraer cardId del query param ?card=xxx si está presente
    try {
      const parsed = new URL(url);
      const cardId = parsed.searchParams.get("card");
      if (cardId) setScannedCardId(cardId);
    } catch {
      // URL relativa — intentar con regex
      const cardMatch = url.match(/[?&]card=([a-f0-9-]{36})/);
      if (cardMatch) setScannedCardId(cardMatch[1]);
    }

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
      body: JSON.stringify({ customerId: scannedCustomerId, businessId, cardId: scannedCardId }),
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
    if (data.rewarded) playRewardSound();
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
        <div className="rounded-2xl overflow-hidden bg-near-black border border-surface-border">
          {/* Vista de cámara full-frame */}
          <div className="relative">
            <div
              id="qr-reader"
              className="w-full [&>video]:w-full [&>video]:block [&>*:not(video)]:hidden"
              style={{ minHeight: scanning ? 320 : 0 }}
            />
            {/* Overlay: esquinas estilo WhatsApp */}
            {scanning && (
              <div className="pointer-events-none absolute inset-0">
                {/* Línea de escaneo animada */}
                <div className="absolute inset-x-8 h-0.5 bg-magenta shadow-[0_0_10px_2px_rgba(255,46,99,0.7)] animate-scan-line" />
                {/* Esquinas */}
                <div className="absolute inset-8">
                  <div className="absolute left-0 top-0 h-7 w-7 border-l-2 border-t-2 border-white rounded-tl-md" />
                  <div className="absolute right-0 top-0 h-7 w-7 border-r-2 border-t-2 border-white rounded-tr-md" />
                  <div className="absolute left-0 bottom-0 h-7 w-7 border-l-2 border-b-2 border-white rounded-bl-md" />
                  <div className="absolute right-0 bottom-0 h-7 w-7 border-r-2 border-b-2 border-white rounded-br-md" />
                </div>
              </div>
            )}
          </div>
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
            <div className="p-3 flex justify-center">
              <button onClick={stopScanner} className="btn-secondary !py-2 text-sm">
                Cancelar
              </button>
            </div>
          )}
        </div>
      )}

      {/* QR escaneado — confirmar acción */}
      {scannedCustomerId && !result && (
        <div className="rounded-brand border border-surface-border bg-surface p-6 space-y-4">
          <div className="text-center">
            <div className="text-4xl mb-2">✅</div>
            <p className="font-bold text-paper">QR leído correctamente</p>
            <p className="text-sm text-mist mt-1">
              {scannedCardId ? "¿Confirmar acción para este cliente?" : "¿Dar sello a este cliente?"}
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setScannedCustomerId(null)} className="btn-secondary flex-1">
              Cancelar
            </button>
            <button onClick={darSello} disabled={stamping} className="btn-primary flex-1">
              {stamping ? "Procesando..." : "Confirmar ✓"}
            </button>
          </div>
        </div>
      )}

      {/* Resultado: cupón canjeado */}
      {result && result.cardType === "cupon" && (
        <div className="rounded-brand border border-purple-500 bg-purple-500/10 p-6 space-y-3 text-center">
          <div className="text-5xl">🎟️</div>
          <div>
            <p className="font-bold text-lg text-paper">{result.customer.full_name}</p>
            <p className="text-purple-400 font-semibold mt-1">¡Cupón canjeado!</p>
            {result.couponValue && <p className="text-sm text-mist mt-1">{result.couponValue}</p>}
          </div>
          <button onClick={() => { setResult(null); startScanner(); }} className="btn-primary w-full">
            Escanear otro cliente
          </button>
        </div>
      )}

      {/* Resultado: descuento aplicado */}
      {result && result.cardType === "descuento" && (
        <div className="rounded-brand border border-green-500 bg-green-500/10 p-6 space-y-3 text-center">
          <div className="text-5xl">%</div>
          <div>
            <p className="font-bold text-lg text-paper">{result.customer.full_name}</p>
            <p className="text-green-400 font-semibold mt-1">¡Descuento aplicado!</p>
            {result.couponValue && <p className="text-sm text-mist mt-1">{result.couponValue}</p>}
          </div>
          <button onClick={() => { setResult(null); startScanner(); }} className="btn-primary w-full">
            Escanear otro cliente
          </button>
        </div>
      )}

      {/* Resultado: sello normal */}
      {result && result.cardType === "sellos" && !result.rewarded && (
        <div className={`rounded-brand border p-6 space-y-3 text-center ${result.nearReward ? "border-yellow-500 bg-yellow-500/10" : "border-green-500 bg-green-500/10"}`}>
          <div className="text-5xl">{result.nearReward ? "🎯" : "✅"}</div>
          <div>
            <p className="font-bold text-lg text-paper">{result.customer.full_name}</p>
            <p className={`font-semibold mt-1 ${result.nearReward ? "text-yellow-400" : "text-green-400"}`}>
              Sello agregado · {result.customer.current_stamps}/{result.stampsRequired} sellos
            </p>
            {result.nearReward && (
              <p className="text-yellow-300 text-sm mt-2 font-bold">
                ¡Solo le falta 1 sello para ganar su premio!
              </p>
            )}
          </div>
          <button onClick={() => { setResult(null); startScanner(); }} className="btn-primary w-full">
            Escanear otro cliente
          </button>
        </div>
      )}

      {/* Pantalla completa de recompensa (solo sellos) */}
      {result && result.cardType === "sellos" && result.rewarded && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-yellow-400 animate-pulse-once">
          <div className="text-center px-8 space-y-6">
            <div className="text-8xl animate-bounce">🎉</div>
            <div>
              <p className="text-3xl font-black text-yellow-900 leading-tight">
                ¡RECOMPENSA<br />GANADA!
              </p>
              <p className="mt-3 text-xl font-bold text-yellow-800">{result.customer.full_name}</p>
            </div>
            <div className="rounded-2xl bg-yellow-900/20 px-6 py-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-yellow-800 mb-1">Premio a entregar</p>
              <p className="text-2xl font-extrabold text-yellow-900">{result.rewardText}</p>
            </div>
            <p className="text-sm text-yellow-800 opacity-75">Entrega el premio al cliente y luego continúa.</p>
            <button
              onClick={() => { setResult(null); startScanner(); }}
              className="w-full rounded-2xl bg-yellow-900 py-4 text-lg font-bold text-yellow-100 active:scale-95 transition-transform"
            >
              ✓ Premio entregado — Siguiente
            </button>
          </div>
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
