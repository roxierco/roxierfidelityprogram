/**
 * Detecta correos mal escritos y sugiere la corrección.
 * Ej: "juan@gmail.con" → "juan@gmail.com"
 *
 * Solo SUGIERE — nunca corrige solo, para no romperle el correo a alguien
 * que sí usa un dominio poco común.
 */

// Los dominios donde se equivoca casi toda la gente en México.
const DOMINIOS_COMUNES = [
  "gmail.com",
  "hotmail.com",
  "outlook.com",
  "yahoo.com",
  "yahoo.com.mx",
  "hotmail.es",
  "outlook.es",
  "live.com",
  "live.com.mx",
  "icloud.com",
  "me.com",
  "msn.com",
  "prodigy.net.mx",
];

/** Distancia de Levenshtein: cuántos cambios de letra hay entre dos palabras. */
function distancia(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);

  for (let i = 1; i <= m; i++) {
    const actual = [i];
    for (let j = 1; j <= n; j++) {
      actual[j] = a[i - 1] === b[j - 1]
        ? prev[j - 1]
        : 1 + Math.min(prev[j - 1], prev[j], actual[j - 1]);
    }
    prev = actual;
  }
  return prev[n];
}

/**
 * Devuelve el correo corregido si detecta un error de dedo, o null si el
 * correo se ve bien (o si el dominio no se parece a ninguno conocido).
 */
export function sugerirCorreo(email: string): string | null {
  const limpio = email.trim().toLowerCase();
  const partes = limpio.split("@");
  if (partes.length !== 2) return null;

  const [usuario, dominio] = partes;
  if (!usuario || !dominio || !dominio.includes(".")) return null;

  // Si ya es un dominio conocido, no hay nada que corregir.
  if (DOMINIOS_COMUNES.includes(dominio)) return null;

  // Dominios muy cortos se parecen a todo por accidente; mejor no opinar.
  if (dominio.length < 6) return null;

  let mejor: string | null = null;
  let mejorDist = Infinity;

  for (const candidato of DOMINIOS_COMUNES) {
    // Con dominios cortos (me.com, msn.com) exigimos casi coincidencia exacta,
    // porque si no cualquier cosa "se les parece" (gmx.com, zoho.com...).
    const maxDist = candidato.length <= 7 ? 1 : 2;
    if (Math.abs(dominio.length - candidato.length) > maxDist) continue;

    const d = distancia(dominio, candidato);
    if (d > 0 && d <= maxDist && d < mejorDist) {
      mejorDist = d;
      mejor = candidato;
    }
  }

  return mejor ? `${usuario}@${mejor}` : null;
}
