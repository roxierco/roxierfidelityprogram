"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { Icon } from "@/components/ui/Icon";

interface ScanResult {
  success: boolean;
  customer: { id: string; full_name: string; current_stamps: number };
  rewarded: boolean;
  nearReward: boolean;
  rewardText: string;
  stampsRequired: number;
  cardType: "sellos" | "cupon" | "descuento" | "cashback" | string;
  couponValue: string | null;
}

interface CameraDevice {
  id: string;
  label: string;
}

interface CashbackInfo {
  customerId: string;
  cardId: string;
  businessId: string;
  customerName: string;
  balance: number;
  cashbackPercent: number;
  minPurchase: number;
}

const newIdempotencyKey = () => `${Date.now()}-${crypto.randomUUID()}`;

function playRewardSound() {
  try {
    const ctx = new AudioContext();
    const notes = [523, 659, 784, 1047];
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

/** Extrae customerId y cardId de la URL codificada en el QR (cámara o pistola). */
function parseQrUrl(url: string): { customerId: string; cardId: string | null } | null {
  const match = url.match(/\/u\/([a-f0-9-]{36})/);
  if (!match) return null;

  const customerId = match[1];
  let cardId: string | null = null;
  try {
    const parsed = new URL(url);
    cardId = parsed.searchParams.get("card");
  } catch {
    const cardMatch = url.match(/[?&]card=([a-f0-9-]{36})/);
    if (cardMatch) cardId = cardMatch[1];
  }
  return { customerId, cardId };
}

function pickBestCamera(cameras: CameraDevice[]): CameraDevice {
  if (!cameras.length) throw new Error("No cameras found");
  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (isMobile) {
    // prefer back camera
    const back = cameras.find((c) =>
      /back|rear|trasera|posterior|environment/i.test(c.label),
    );
    if (back) return back;
  }
  return cameras[0];
}

export function ScannerClient({
  businessId,
  sucursales = [],
}: {
  businessId: string;
  businessName: string;
  sucursales?: { id: string; name: string }[];
}) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState("");
  const [stamping, setStamping] = useState(false);
  const [scannedCustomerId, setScannedCustomerId] = useState<string | null>(null);
  const [scannedCardId, setScannedCardId] = useState<string | null>(null);
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [activeCameraId, setActiveCameraId] = useState<string | null>(null);
  const [loadingCameras, setLoadingCameras] = useState(false);
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"camera" | "gun">(
    searchParams.get("modo") === "pistola" ? "gun" : "camera",
  );
  const [gunInput, setGunInput] = useState("");
  const gunInputRef = useRef<HTMLInputElement | null>(null);

  // Sucursal activa del escáner (se recuerda en el dispositivo)
  const [sucursalId, setSucursalId] = useState<string>("");
  useEffect(() => {
    if (!sucursales.length) return;
    const saved = localStorage.getItem(`roxier-sucursal-${businessId}`);
    if (saved && sucursales.some((s) => s.id === saved)) setSucursalId(saved);
    else setSucursalId(sucursales[0].id);
  }, [sucursales, businessId]);

  function cambiarSucursal(id: string) {
    setSucursalId(id);
    localStorage.setItem(`roxier-sucursal-${businessId}`, id);
  }

  // Estado de cashback (cuando la tarjeta escaneada es de tipo cashback)
  const [cashback, setCashback] = useState<CashbackInfo | null>(null);
  const [cashbackAmount, setCashbackAmount] = useState("");
  const [cashbackBusy, setCashbackBusy] = useState(false);
  const [cashbackMsg, setCashbackMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // Load camera list on mount
  useEffect(() => {
    Html5Qrcode.getCameras()
      .then((devs) => {
        if (devs.length) {
          setCameras(devs);
          setActiveCameraId(pickBestCamera(devs).id);
        }
      })
      .catch(() => null);
  }, []);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      await scannerRef.current.stop().catch(() => null);
      scannerRef.current = null;
    }
    setScanning(false);
  }, []);

  async function switchCamera(cameraId: string) {
    setActiveCameraId(cameraId);
    if (scanning) {
      await stopScanner();
      startWithCamera(cameraId);
    }
  }

  async function startWithCamera(cameraId: string) {
    setError("");
    setResult(null);
    setScannedCustomerId(null);
    setScannedCardId(null);
    setLoadingCameras(true);

    await stopScanner();

    const container = document.getElementById("qr-reader");
    if (container) container.innerHTML = "";

    const qr = new Html5Qrcode("qr-reader", {
      formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
      verbose: false,
    });
    scannerRef.current = qr;

    try {
      const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      if (isMobile) {
        // En móvil: facingMode environment fuerza la cámara trasera.
        // NO pasar videoConstraints en config — html5-qrcode los usa en vez
        // del facingMode del primer argumento y lo ignora.
        await qr.start(
          { facingMode: "environment" } as MediaTrackConstraints,
          { fps: 30 },
          (text) => handleScan(text, qr),
          undefined,
        );
      } else {
        // En desktop: usar camera ID con resolución HD para leer QRs pequeños.
        await qr.start(
          cameraId,
          {
            fps: 30,
            videoConstraints: {
              width: { min: 640, ideal: 1280, max: 1920 },
              height: { min: 480, ideal: 720, max: 1080 },
            },
          },
          (text) => handleScan(text, qr),
          undefined,
        );
      }
      setScanning(true);
    } catch (e) {
      const msg = String((e as { message?: string })?.message ?? e ?? "desconocido");
      setError(`Error al iniciar cámara: ${msg}`);
    } finally {
      setLoadingCameras(false);
    }
  }

  async function startScanner() {
    if (!activeCameraId) {
      // Si no se cargaron cámaras, intentar enumerar de nuevo
      try {
        setLoadingCameras(true);
        const devs = await Html5Qrcode.getCameras();
        if (!devs.length) {
          setError("No se encontró ninguna cámara. Verifica que tienes cámara y que diste permiso.");
          setLoadingCameras(false);
          return;
        }
        setCameras(devs);
        const best = pickBestCamera(devs);
        setActiveCameraId(best.id);
        await startWithCamera(best.id);
      } catch {
        setError("No se pudo acceder a la cámara. Revisa los permisos del navegador.");
        setLoadingCameras(false);
      }
      return;
    }
    await startWithCamera(activeCameraId);
  }

  async function handleScan(url: string, qr: Html5Qrcode) {
    const parsed = parseQrUrl(url);
    if (!parsed) {
      setError("QR inválido — no es una tarjeta de este sistema.");
      return;
    }

    await qr.stop();
    scannerRef.current = null;
    setScanning(false);

    await routeScan(parsed.customerId, parsed.cardId, false);
  }

  /**
   * Decide qué hacer con el QR escaneado: si la tarjeta es de cashback abre el
   * panel de monto; si no, sigue el flujo normal de sellos.
   * autoStamp=true (pistola) sella al instante para tarjetas que no son cashback.
   */
  async function routeScan(customerId: string, cardId: string | null, autoStamp: boolean) {
    if (cardId) {
      try {
        const res = await fetch(`/api/cashback/card/${customerId}?card=${cardId}`);
        if (res.ok) {
          const info = (await res.json()) as CashbackInfo;
          setCashback(info);
          setCashbackAmount("");
          setCashbackMsg(null);
          return;
        }
      } catch {
        // si falla la consulta de cashback, caemos al flujo normal
      }
    }

    if (autoStamp) {
      await darSelloDirecto(customerId, cardId);
    } else {
      setScannedCustomerId(customerId);
      setScannedCardId(cardId);
    }
  }

  async function aplicarCashback(kind: "apply" | "redeem") {
    if (!cashback) return;
    const monto = Number(cashbackAmount);
    if (!monto || monto <= 0) {
      setCashbackMsg({ text: "Ingresa un monto válido", ok: false });
      return;
    }
    setCashbackBusy(true);
    setCashbackMsg(null);

    const endpoint = kind === "apply" ? "/api/cashback/apply" : "/api/cashback/redeem";
    const body =
      kind === "apply"
        ? { customerId: cashback.customerId, cardId: cashback.cardId, businessId: cashback.businessId, purchaseAmount: monto, idempotencyKey: newIdempotencyKey(), sucursalId: sucursalId || null }
        : { customerId: cashback.customerId, cardId: cashback.cardId, businessId: cashback.businessId, redeemAmount: monto, idempotencyKey: newIdempotencyKey(), sucursalId: sucursalId || null };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setCashbackBusy(false);

    if (!res.ok) {
      setCashbackMsg({ text: data.error ?? "Error al procesar", ok: false });
      return;
    }

    setCashback({ ...cashback, balance: data.balance });
    setCashbackAmount("");
    setCashbackMsg({
      text:
        kind === "apply"
          ? `+$${Number(data.earned).toFixed(2)} de cashback acreditado`
          : `Se usaron $${monto.toFixed(2)} del saldo`,
      ok: true,
    });
    playRewardSound();
  }

  function cerrarCashback() {
    setCashback(null);
    setCashbackMsg(null);
    setCashbackAmount("");
    if (mode === "camera") startScanner();
  }

  /** Da el sello/canje directamente con los IDs recibidos (usado por la pistola lectora). */
  async function darSelloDirecto(customerId: string, cardId: string | null) {
    setStamping(true);
    setError("");

    const res = await fetch("/api/stamp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId, businessId, cardId, sucursalId: sucursalId || null }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Error al registrar el escaneo");
      setStamping(false);
      return;
    }

    setResult(data);
    setStamping(false);
    if (data.rewarded) playRewardSound();
  }

  /** Reinicia la pantalla para el siguiente escaneo, respetando el modo activo. */
  function continuar() {
    setResult(null);
    setError("");
    if (mode === "camera") startScanner();
  }

  function handleGunSubmit(raw: string) {
    const value = raw.trim();
    setGunInput("");
    if (!value) return;

    const parsed = parseQrUrl(value);
    if (!parsed) {
      setError("Código inválido — no es una tarjeta de este sistema.");
      return;
    }
    setError("");
    routeScan(parsed.customerId, parsed.cardId, true);
  }

  // Mantiene el input de la pistola siempre enfocado para capturar el escaneo (modo teclado/HID).
  // Se desactiva cuando hay un panel de cashback abierto para que puedan escribir el monto.
  useEffect(() => {
    if (mode !== "gun" || result || stamping || cashback) return;
    gunInputRef.current?.focus();
    const refocus = () => gunInputRef.current?.focus();
    window.addEventListener("click", refocus);
    return () => window.removeEventListener("click", refocus);
  }, [mode, result, stamping, cashback]);

  async function darSello() {
    if (!scannedCustomerId) return;
    setStamping(true);
    setError("");

    const res = await fetch("/api/stamp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId: scannedCustomerId, businessId, cardId: scannedCardId, sucursalId: sucursalId || null }),
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
    <div className="mx-auto max-w-lg space-y-4">

      {/* Selector de sucursal — solo si el negocio tiene sucursales registradas */}
      {sucursales.length > 0 && (
        <div className="flex items-center gap-2 rounded-xl border border-surface-border bg-surface px-3 py-2.5">
          <span className="flex flex-shrink-0 items-center gap-1.5 text-sm text-mist"><Icon name="sucursal" className="h-4 w-4" />Sucursal:</span>
          <select
            value={sucursalId}
            onChange={(e) => cambiarSucursal(e.target.value)}
            className="flex-1 rounded-lg border border-surface-border bg-near-black text-paper text-sm px-2 py-1.5 focus:outline-none focus:border-magenta"
          >
            {sucursales.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Selector de modo: cámara o pistola lectora */}
      {!result && !scannedCustomerId && !cashback && (
        <div className="flex rounded-xl border border-surface-border bg-surface p-1">
          <button
            onClick={() => { setMode("camera"); setError(""); }}
            className={`flex-1 rounded-lg py-2 text-sm font-bold transition-colors ${mode === "camera" ? "bg-magenta text-white" : "text-mist"}`}
          >
            <span className="inline-flex items-center justify-center gap-1.5"><Icon name="camara" className="h-4 w-4" />Cámara</span>
          </button>
          <button
            onClick={async () => { await stopScanner(); setMode("gun"); setError(""); }}
            className={`flex-1 rounded-lg py-2 text-sm font-bold transition-colors ${mode === "gun" ? "bg-magenta text-white" : "text-mist"}`}
          >
            <span className="inline-flex items-center justify-center gap-1.5"><Icon name="pistola" className="h-4 w-4" />Pistola lectora</span>
          </button>
        </div>
      )}

      {/* Pistola lectora de códigos (modo teclado/HID) */}
      {mode === "gun" && !result && !scannedCustomerId && !cashback && (
        <div className="rounded-2xl border border-surface-border bg-surface p-6 space-y-4 text-center">
          <div className="h-16 w-16 mx-auto rounded-full bg-magenta/10 flex items-center justify-center text-3xl">
            <Icon name="pistola" className="h-7 w-7 text-magenta" />
          </div>
          <div>
            <p className="font-bold text-paper">Listo para escanear</p>
            <p className="text-sm text-mist mt-1">
              {stamping ? "Procesando..." : "Escanea el código QR del cliente con la pistola lectora"}
            </p>
          </div>
          <input
            ref={gunInputRef}
            type="text"
            value={gunInput}
            autoFocus
            disabled={stamping}
            onChange={(e) => setGunInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleGunSubmit(gunInput);
              }
            }}
            onBlur={() => gunInputRef.current?.focus()}
            className="w-full rounded-lg border border-surface-border bg-near-black text-paper px-3 py-2 text-center text-sm focus:outline-none focus:border-magenta"
            placeholder="Esperando escaneo..."
          />
          <p className="text-xs text-mist">
            Conecta la pistola por USB o Bluetooth a esta computadora — funciona como un teclado, no necesita instalación.
          </p>
        </div>
      )}

      {/* Panel de CASHBACK — capturar monto para acumular o redimir */}
      {cashback && (
        <div className="rounded-2xl border-2 border-green-500/40 bg-surface p-6 space-y-5">
          <div className="text-center">
            <p className="text-sm text-mist">{cashback.customerName}</p>
            <p className="mt-1 text-4xl font-black text-paper tabular-nums tracking-tight">
              ${cashback.balance.toFixed(2)}
              <span className="ml-2 text-base font-normal text-mist">MXN</span>
            </p>
            <p className="mt-1 text-xs text-green-400 font-semibold">Saldo de cashback · devuelve {cashback.cashbackPercent}% por compra</p>
          </div>

          <div>
            <label className="label">Monto</label>
            <div className="relative mt-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-mist">$</span>
              <input
                autoFocus
                inputMode="decimal"
                value={cashbackAmount}
                onChange={(e) => setCashbackAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                placeholder="0.00"
                className="w-full rounded-xl border border-surface-border bg-near-black pl-8 pr-4 py-3 text-lg text-paper focus:border-green-500 focus:outline-none tabular-nums"
              />
            </div>
            <p className="mt-1.5 text-xs text-mist">
              Para acumular, captura el <strong>monto de la compra</strong>. Para redimir, el monto que el cliente quiere usar de su saldo.
            </p>
          </div>

          {cashbackMsg && (
            <div className={`rounded-xl px-4 py-2.5 text-sm font-medium text-center ${cashbackMsg.ok ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"}`}>
              {cashbackMsg.text}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => aplicarCashback("apply")}
              disabled={cashbackBusy || !cashbackAmount}
              className="rounded-xl bg-green-600 py-3.5 font-bold text-sm text-white hover:bg-green-700 disabled:opacity-40 transition-colors"
            >
              {cashbackBusy ? "..." : "Agregar cashback"}
            </button>
            <button
              onClick={() => aplicarCashback("redeem")}
              disabled={cashbackBusy || !cashbackAmount}
              className="rounded-xl bg-magenta py-3.5 font-bold text-sm text-white hover:bg-magenta/90 disabled:opacity-40 transition-colors"
            >
              {cashbackBusy ? "..." : "Redimir saldo"}
            </button>
          </div>

          <button onClick={cerrarCashback} className="w-full text-sm text-mist hover:text-paper transition-colors">
            Escanear otra tarjeta
          </button>
        </div>
      )}

      {/* Cámara */}
      {mode === "camera" && !result && !scannedCustomerId && !cashback && (
        <div className="rounded-2xl overflow-hidden bg-near-black border border-surface-border">
          <div className="relative">
            <div
              id="qr-reader"
              className="w-full [&>video]:w-full [&>video]:block [&>*:not(video)]:hidden"
              style={{ minHeight: scanning ? 360 : 0 }}
            />
            {scanning && (
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-x-8 h-0.5 bg-magenta shadow-[0_0_10px_2px_rgba(255,46,99,0.7)] animate-scan-line" />
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
                <Icon name="camara" className="h-7 w-7 text-magenta" />
              </div>
              <p className="text-sm text-mist text-center">
                Apunta la cámara al QR del cliente para agregar un sello
              </p>
              <button
                onClick={startScanner}
                disabled={loadingCameras}
                className="btn-primary w-full disabled:opacity-60"
              >
                {loadingCameras ? "Iniciando cámara..." : "Activar cámara"}
              </button>
            </div>
          )}

          {/* Tip de escaneo */}
          {scanning && (
            <div className="px-4 pt-3 pb-1">
              <p className="text-xs text-mist text-center">
                Sube el brillo de la pantalla del cliente al máximo · Acerca el QR a la cámara
              </p>
            </div>
          )}

          {/* Controles activos: cambiar cámara + cancelar */}
          {scanning && (
            <div className="p-3 flex items-center gap-2">
              {cameras.length > 1 && (
                <select
                  value={activeCameraId ?? ""}
                  onChange={(e) => switchCamera(e.target.value)}
                  className="flex-1 rounded-lg border border-surface-border bg-surface text-xs text-paper px-2 py-2 focus:outline-none focus:border-magenta"
                >
                  {cameras.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label || `Cámara ${cameras.indexOf(c) + 1}`}
                    </option>
                  ))}
                </select>
              )}
              <button onClick={stopScanner} className="btn-secondary !py-2 text-sm flex-shrink-0">
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
            <Icon name="check-circulo" className="mx-auto mb-2 h-10 w-10 text-green-400" />
            <p className="font-bold text-paper">QR leído correctamente</p>
            <p className="text-sm text-mist mt-1">¿Confirmar acción para este cliente?</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setScannedCustomerId(null); startScanner(); }} className="btn-secondary flex-1">
              Cancelar
            </button>
            <button onClick={darSello} disabled={stamping} className="btn-primary flex-1">
              {stamping ? "Procesando..." : "Confirmar"}
            </button>
          </div>
        </div>
      )}

      {/* Resultado: cupón canjeado */}
      {result && result.cardType === "cupon" && (
        <div className="rounded-brand border border-purple-500 bg-purple-500/10 p-6 space-y-3 text-center">
          <Icon name="cupon" className="mx-auto h-12 w-12 text-purple-400" />
          <div>
            <p className="font-bold text-lg text-paper">{result.customer.full_name}</p>
            <p className="text-purple-400 font-semibold mt-1">¡Cupón canjeado!</p>
            {result.couponValue && <p className="text-sm text-mist mt-1">{result.couponValue}</p>}
          </div>
          <button onClick={continuar} className="btn-primary w-full">
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
          <button onClick={continuar} className="btn-primary w-full">
            Escanear otro cliente
          </button>
        </div>
      )}

      {/* Resultado: sello normal */}
      {result && result.cardType === "sellos" && !result.rewarded && (
        <div className={`rounded-brand border p-6 space-y-3 text-center ${result.nearReward ? "border-yellow-500 bg-yellow-500/10" : "border-green-500 bg-green-500/10"}`}>
          <Icon name={result.nearReward ? "diana" : "check-circulo"} className={`mx-auto h-12 w-12 ${result.nearReward ? "text-yellow-400" : "text-green-400"}`} />
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
          <button onClick={continuar} className="btn-primary w-full">
            Escanear otro cliente
          </button>
        </div>
      )}

      {/* Pantalla completa de recompensa */}
      {result && result.cardType === "sellos" && result.rewarded && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
          style={{ background: "linear-gradient(135deg, #0a0a0f 0%, #1a1200 50%, #0a0a0f 100%)" }}>

          {/* Destellos decorativos */}
          <div className="pointer-events-none absolute inset-0">
            {[
              { top: "8%",  left: "12%", size: 180, opacity: 0.07 },
              { top: "70%", left: "80%", size: 220, opacity: 0.06 },
              { top: "50%", left: "5%",  size: 140, opacity: 0.05 },
              { top: "15%", left: "75%", size: 160, opacity: 0.06 },
            ].map((c, i) => (
              <div key={i} className="absolute rounded-full"
                style={{
                  top: c.top, left: c.left,
                  width: c.size, height: c.size,
                  background: "radial-gradient(circle, #f59e0b, transparent 70%)",
                  opacity: c.opacity,
                  transform: "translate(-50%, -50%)",
                }} />
            ))}
          </div>

          <div className="relative w-full max-w-sm px-6 flex flex-col items-center gap-6">

            {/* Trofeo */}
            <div className="relative flex items-center justify-center">
              <div className="absolute rounded-full"
                style={{ width: 120, height: 120, background: "radial-gradient(circle, rgba(251,191,36,0.25) 0%, transparent 70%)" }} />
              <Icon name="trofeo" className="h-16 w-16" strokeWidth={1.2} />
            </div>

            {/* Título */}
            <div className="text-center space-y-1">
              <p className="text-xs font-bold uppercase tracking-[0.3em]"
                style={{ color: "#f59e0b" }}>
                ¡Premio ganado!
              </p>
              <p className="text-4xl font-black text-white leading-tight">
                {result.customer.full_name}
              </p>
              <p className="text-sm text-white/50">completó su tarjeta de lealtad</p>
            </div>

            {/* Card del premio */}
            <div className="w-full rounded-2xl border px-6 py-5 text-center"
              style={{
                borderColor: "rgba(251,191,36,0.3)",
                background: "rgba(251,191,36,0.08)",
              }}>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] mb-2"
                style={{ color: "rgba(251,191,36,0.6)" }}>
                Premio a entregar
              </p>
              <p className="text-2xl font-extrabold" style={{ color: "#fbbf24" }}>
                {result.rewardText}
              </p>
            </div>

            {/* Separador */}
            <p className="text-xs text-white/30 text-center">
              Entrega el premio al cliente y marca como completado
            </p>

            {/* CTA */}
            <button
              onClick={continuar}
              className="w-full rounded-2xl py-4 text-base font-bold active:scale-95 transition-transform"
              style={{ background: "#f59e0b", color: "#0a0a0f" }}
            >
              Premio entregado — Continuar
            </button>
          </div>
        </div>
      )}

      {/* Resultado genérico — respaldo para que nunca quede en blanco
          (ej. QR viejo sin ?card= que resuelve a otro tipo de tarjeta) */}
      {result && result.cardType !== "sellos" && result.cardType !== "cupon" && result.cardType !== "descuento" && (
        <div className="rounded-brand border border-green-500 bg-green-500/10 p-6 space-y-3 text-center">
          <Icon name="check-circulo" className="mx-auto h-12 w-12 text-green-400" />
          <div>
            <p className="font-bold text-lg text-paper">{result.customer.full_name}</p>
            <p className="text-green-400 font-semibold mt-1">Visita registrada</p>
          </div>
          <button onClick={continuar} className="btn-primary w-full">
            Escanear otro cliente
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-brand border border-red-500/30 bg-red-500/10 p-4">
          <p className="text-sm text-red-400">{error}</p>
          <button onClick={continuar} className="mt-2 text-xs underline text-mist">
            Intentar de nuevo
          </button>
        </div>
      )}
    </div>
  );
}
