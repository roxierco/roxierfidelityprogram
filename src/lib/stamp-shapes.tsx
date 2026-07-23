/**
 * Figuras de los sellos, en SVG — son el espejo exacto de las que se dibujan
 * pixel a pixel en el pase de Apple Wallet (ver src/lib/apple-wallet.ts).
 * Sirven para que la vista previa del editor muestre lo mismo que verá el cliente.
 *
 * Coordenadas de -1 a 1 con la Y hacia ARRIBA (por eso el scale(1,-1)).
 */

export type StampShapeKey =
  | "circle" | "check" | "star" | "heart" | "crown" | "bolt" | "diamond"
  | "flame" | "slice" | "coffee" | "target" | "gift" | "paw" | "flower"
  | "persona";

function starPoints(tips = 5, inner = 0.45): string {
  const pts: string[] = [];
  for (let i = 0; i < tips * 2; i++) {
    const r = i % 2 === 0 ? 1 : inner;
    const a = Math.PI / 2 + (i * Math.PI) / tips;
    pts.push(`${(Math.cos(a) * r).toFixed(3)},${(Math.sin(a) * r).toFixed(3)}`);
  }
  return pts.join(" ");
}

function heartPoints(): string {
  const pts: string[] = [];
  for (let i = 0; i < 48; i++) {
    const t = (i / 48) * Math.PI * 2;
    const x = (16 * Math.sin(t) ** 3) / 17;
    const y = (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 17;
    pts.push(`${x.toFixed(3)},${y.toFixed(3)}`);
  }
  return pts.join(" ");
}

const POLY: Partial<Record<StampShapeKey, string>> = {
  check: "-0.85,0.05 -0.55,0.40 -0.10,-0.08 0.62,0.74 0.88,0.42 -0.10,-0.62",
  star: starPoints(),
  heart: heartPoints(),
  crown: "-0.9,-0.6 0.9,-0.6 0.78,0.55 0.42,0 0,0.7 -0.42,0 -0.78,0.55",
  bolt: "0.22,1 -0.62,0.1 -0.1,0.1 -0.28,-1 0.58,-0.06 0.06,-0.06",
  diamond: "0,1 0.72,0.02 0,-1 -0.72,0.02",
  flame: "0,1 0.46,0.22 0.52,-0.36 0.22,-0.82 -0.22,-0.82 -0.52,-0.36 -0.46,0.22",
  slice: "0,-0.92 0.86,0.68 -0.86,0.68",
  coffee: "-0.55,0.52 0.42,0.52 0.30,-0.62 -0.43,-0.62",
};

// Partes de la silueta de persona recostada (espejo de SHAPES.persona)
const PERSONA = {
  torso: "-0.70,0.05 -0.10,0.10 0.28,-0.28 0.28,-0.60 -0.55,-0.66 -0.75,-0.28",
  piernas: "0.05,-0.15 0.58,-0.10 0.93,-0.30 0.95,-0.52 0.56,-0.40 0.14,-0.62",
  brazo: "-0.18,0.12 0.26,0.44 0.40,0.30 -0.06,-0.02",
  popote: "0.48,0.72 0.60,0.98 0.68,0.95 0.56,0.70",
};

/** Traduce el ícono elegido en el editor a la figura que se dibuja. */
export function shapeKeyForIcon(icon: string | null | undefined): StampShapeKey {
  const map: Record<string, StampShapeKey> = {
    "✓": "check", "★": "star", "🌟": "star", "♥": "heart", "☕": "coffee",
    "🔥": "flame", "👑": "crown", "💎": "diamond", "⚡": "bolt", "🎯": "target",
    "🎁": "gift", "🍕": "slice", "🍹": "persona", "🍔": "circle", "🌸": "flower", "💈": "circle",
    "🐾": "paw",
  };
  return map[icon ?? ""] ?? "check";
}

export function StampShape({
  shape,
  color,
  filled = true,
  size = 24,
}: {
  shape: StampShapeKey;
  color: string;
  filled?: boolean;
  size?: number;
}) {
  const opacity = filled ? 1 : 0.42;

  return (
    <svg width={size} height={size} viewBox="-1.1 -1.1 2.2 2.2" aria-hidden="true">
      <g transform="scale(1,-1)" fill={color} fillOpacity={opacity} stroke="none">
        {POLY[shape] && <polygon points={POLY[shape]} />}

        {shape === "circle" && <circle cx="0" cy="0" r="1" />}

        {shape === "coffee" && (
          <circle cx="0.6" cy="0.1" r="0.27" fill="none" stroke={color} strokeOpacity={opacity} strokeWidth="0.14" />
        )}

        {shape === "target" && (
          <>
            <circle cx="0" cy="0" r="0.34" />
            <circle cx="0" cy="0" r="0.74" fill="none" stroke={color} strokeOpacity={opacity} strokeWidth="0.28" />
          </>
        )}

        {shape === "gift" && (
          <>
            <rect x="-0.82" y="-0.82" width="1.64" height="1.16" />
            <rect x="-0.92" y="0.34" width="1.84" height="0.28" />
            <rect x="-0.13" y="-0.82" width="0.26" height="1.44" />
          </>
        )}

        {shape === "paw" && (
          <>
            <circle cx="0" cy="-0.35" r="0.52" />
            <circle cx="-0.55" cy="0.35" r="0.26" />
            <circle cx="-0.2" cy="0.7" r="0.26" />
            <circle cx="0.2" cy="0.7" r="0.26" />
            <circle cx="0.55" cy="0.35" r="0.26" />
          </>
        )}

        {shape === "persona" && (
          <>
            <circle cx="-0.50" cy="0.38" r="0.36" />
            <polygon points={PERSONA.torso} />
            <polygon points={PERSONA.piernas} />
            <circle cx="0.93" cy="-0.41" r="0.13" />
            <polygon points={PERSONA.brazo} />
            <rect x="0.30" y="0.40" width="0.28" height="0.34" />
            <polygon points={PERSONA.popote} />
          </>
        )}

        {shape === "flower" && (
          <>
            <circle cx="0" cy="0" r="0.3" />
            {[0, 1, 2, 3, 4].map((i) => {
              const a = Math.PI / 2 + (i * 2 * Math.PI) / 5;
              return <circle key={i} cx={Math.cos(a) * 0.55} cy={Math.sin(a) * 0.55} r="0.42" />;
            })}
          </>
        )}
      </g>
    </svg>
  );
}

/** Cuadrícula de sellos igual a la del pase: ≤5 en una fila, más en dos. */
export function StampGrid({
  total,
  filled,
  icon,
  color,
  stampSize = 26,
}: {
  total: number;
  filled: number;
  icon: string | null | undefined;
  color: string;
  stampSize?: number;
}) {
  const n = Math.max(1, Math.min(total, 20));
  const rows = n <= 5 ? 1 : 2;
  const cols = Math.ceil(n / rows);
  const shape = shapeKeyForIcon(icon);

  const filas = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: Math.min(cols, n - r * cols) }, (_, c) => r * cols + c),
  );

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-1.5">
      {filas.map((fila, r) => (
        <div key={r} className="flex items-center justify-center gap-1.5">
          {fila.map((i) => (
            <StampShape key={i} shape={shape} color={color} filled={i < filled} size={stampSize} />
          ))}
        </div>
      ))}
    </div>
  );
}
