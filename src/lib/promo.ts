/**
 * Promo de lanzamiento: precio de $749 tachado → $599, por tiempo limitado.
 * El precio real ya es $599 (permanente); esto es solo el marco visual con
 * urgencia. Al pasar la fecha, las páginas dejan de mostrar el tachado y el
 * contador — el precio sigue igual.
 */

// Fin de la promo. Arranca el 22 de julio de 2026; dura 2 semanas.
export const PROMO_FIN = new Date("2026-08-05T23:59:59-06:00");

// Precio "de antes" que se muestra tachado durante la promo.
export const PRECIO_ANTERIOR = 749;

export function promoActiva(ahora: number = Date.now()): boolean {
  return ahora < PROMO_FIN.getTime();
}
