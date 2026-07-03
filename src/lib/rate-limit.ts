/**
 * Rate limiter en memoria por IP.
 * Funciona por instancia de servidor — protege contra bursts en producción (Vercel).
 * Cada ventana es independiente por combinación ip+ruta.
 */

interface Entry {
  count: number;
  reset: number;
}

const store = new Map<string, Entry>();

// Limpiar entradas vencidas cada 5 minutos para no acumular memoria
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [k, v] of store) {
      if (now > v.reset) store.delete(k);
    }
  }, 5 * 60 * 1000).unref?.();
}

/**
 * @returns true si la petición está permitida, false si supera el límite
 */
export function rateLimit(ip: string, route: string, limit: number, windowMs: number): boolean {
  const key = `${ip}:${route}`;
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.reset) {
    store.set(key, { count: 1, reset: now + windowMs });
    return true;
  }

  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

export function getClientIp(req: Request): string {
  const forwarded = (req.headers as Headers).get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}
