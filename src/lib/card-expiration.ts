/**
 * Vigencia de las tarjetas de lealtad.
 *
 * Una sola función calcula la fecha para que los dos wallets, el pase y el
 * panel digan exactamente lo mismo. Si esto se duplica, tarde o temprano un
 * lado muestra una fecha y el otro muestra otra.
 */

export interface ExpirationConfig {
  expiration_enabled?: boolean | null;
  expiration_type?: string | null;
  expiration_days?: number | null;
  expiration_date?: string | null;
}

/**
 * Fecha en que caduca la tarjeta de UN cliente concreto, o null si no caduca.
 *
 * - `fecha`: el mismo día para todos los clientes.
 * - `dias`: N días contados desde que ESE cliente se registró, así que cada
 *   quien tiene la suya. Se usa el final del día (23:59:59) para que la tarjeta
 *   siga sirviendo durante todo su último día.
 */
export function calcularExpiracion(
  card: ExpirationConfig | null | undefined,
  enrolledAt: string | Date | null | undefined,
): Date | null {
  if (!card?.expiration_enabled) return null;

  if (card.expiration_type === "fecha") {
    if (!card.expiration_date) return null;
    // 'YYYY-MM-DD' se interpreta como UTC si se pasa directo a new Date();
    // se arma a mano para que el día sea el que el negocio eligió.
    const [y, m, d] = card.expiration_date.split("-").map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d, 23, 59, 59);
  }

  if (card.expiration_type === "dias") {
    if (!card.expiration_days || !enrolledAt) return null;
    const base = new Date(enrolledAt);
    if (isNaN(base.getTime())) return null;
    const fin = new Date(base);
    fin.setDate(fin.getDate() + card.expiration_days);
    fin.setHours(23, 59, 59, 999);
    return fin;
  }

  return null;
}

/** "15 de marzo de 2027" — para mostrarle al cliente. */
export function formatearExpiracion(fecha: Date): string {
  return fecha.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * "30 nov 2026" — para los campos del FRENTE del pase, que son angostos.
 * La fecha larga no cabe y se corta con puntos suspensivos.
 */
export function fechaCorta(fecha: Date): string {
  return fecha.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Texto corto para el pase: "Vence el 15 de marzo de 2027". */
export function textoVigencia(fecha: Date): string {
  return `Vence el ${formatearExpiracion(fecha)}`;
}

/** Si ya pasó la fecha. */
export function estaExpirada(fecha: Date | null): boolean {
  return fecha !== null && fecha.getTime() < Date.now();
}

/**
 * Lee la config de vigencia de una tarjeta SIN romperse si las columnas todavía
 * no existen (supabase/expiracion.sql sin correr).
 *
 * Va en una consulta aparte a propósito. Si estas columnas se pidieran en el
 * mismo `select` que el resto de la tarjeta, un despliegue anterior a la
 * migración haría fallar la consulta entera: se caerían los pases y el sellado,
 * no solo la vigencia. Mismo criterio que `latest_promo_text` en las rutas del
 * pase de Apple.
 */
export async function cargarExpiracion(
  admin: { from: (t: string) => any }, // eslint-disable-line @typescript-eslint/no-explicit-any
  cardId: string,
): Promise<ExpirationConfig | null> {
  try {
    const { data, error } = await admin
      .from("loyalty_cards")
      .select("expiration_enabled, expiration_type, expiration_days, expiration_date")
      .eq("id", cardId)
      .maybeSingle();
    if (error || !data) return null;
    return data as ExpirationConfig;
  } catch {
    return null;
  }
}
