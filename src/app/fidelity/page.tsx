import Link from "next/link";
import { RoxierLogo } from "@/components/brand/XMark";

function QRMockup() {
  return (
    <svg viewBox="0 0 33 33" fill="currentColor" className="h-full w-full">
      <rect x="0" y="0" width="9" height="9" /><rect x="1" y="1" width="7" height="7" fill="white" /><rect x="2" y="2" width="5" height="5" />
      <rect x="24" y="0" width="9" height="9" /><rect x="25" y="1" width="7" height="7" fill="white" /><rect x="26" y="2" width="5" height="5" />
      <rect x="0" y="24" width="9" height="9" /><rect x="1" y="25" width="7" height="7" fill="white" /><rect x="2" y="26" width="5" height="5" />
      <rect x="11" y="0" width="2" height="2" /><rect x="14" y="0" width="2" height="2" /><rect x="17" y="0" width="2" height="2" /><rect x="20" y="0" width="2" height="2" />
      <rect x="11" y="3" width="2" height="2" /><rect x="15" y="3" width="2" height="2" /><rect x="19" y="3" width="2" height="2" />
      <rect x="11" y="6" width="2" height="2" /><rect x="14" y="6" width="2" height="2" /><rect x="17" y="6" width="2" height="2" /><rect x="21" y="6" width="2" height="2" />
      <rect x="0" y="11" width="2" height="2" /><rect x="3" y="11" width="2" height="2" /><rect x="6" y="11" width="2" height="2" /><rect x="10" y="11" width="2" height="2" /><rect x="13" y="11" width="2" height="2" /><rect x="16" y="11" width="2" height="2" /><rect x="19" y="11" width="2" height="2" /><rect x="23" y="11" width="2" height="2" /><rect x="26" y="11" width="2" height="2" /><rect x="30" y="11" width="2" height="2" />
      <rect x="0" y="14" width="2" height="2" /><rect x="4" y="14" width="2" height="2" /><rect x="8" y="14" width="2" height="2" /><rect x="12" y="14" width="2" height="2" /><rect x="17" y="14" width="2" height="2" /><rect x="21" y="14" width="2" height="2" /><rect x="25" y="14" width="2" height="2" /><rect x="29" y="14" width="2" height="2" />
      <rect x="2" y="17" width="2" height="2" /><rect x="6" y="17" width="2" height="2" /><rect x="10" y="17" width="2" height="2" /><rect x="14" y="17" width="2" height="2" /><rect x="18" y="17" width="2" height="2" /><rect x="22" y="17" width="2" height="2" /><rect x="27" y="17" width="2" height="2" /><rect x="31" y="17" width="2" height="2" />
      <rect x="0" y="20" width="2" height="2" /><rect x="4" y="20" width="2" height="2" /><rect x="9" y="20" width="2" height="2" /><rect x="13" y="20" width="2" height="2" /><rect x="17" y="20" width="2" height="2" /><rect x="20" y="20" width="2" height="2" /><rect x="24" y="20" width="2" height="2" /><rect x="28" y="20" width="2" height="2" />
      <rect x="11" y="24" width="2" height="2" /><rect x="15" y="24" width="2" height="2" /><rect x="19" y="25" width="2" height="2" /><rect x="23" y="24" width="2" height="2" /><rect x="28" y="24" width="2" height="2" /><rect x="31" y="24" width="2" height="2" />
      <rect x="11" y="27" width="2" height="2" /><rect x="14" y="27" width="2" height="2" /><rect x="18" y="27" width="2" height="2" /><rect x="22" y="27" width="2" height="2" /><rect x="26" y="27" width="2" height="2" /><rect x="30" y="27" width="2" height="2" />
      <rect x="11" y="30" width="2" height="2" /><rect x="16" y="30" width="2" height="2" /><rect x="20" y="30" width="2" height="2" /><rect x="24" y="30" width="2" height="2" /><rect x="28" y="31" width="2" height="2" />
    </svg>
  );
}

type BannerType = "barber" | "waves" | "icecream" | "lotus" | "gym" | "pizza" | "fire" | "coffee";

function BannerPattern({ type, accent }: { type: BannerType; accent: string }) {
  if (type === "barber") return (
    <svg width="100%" height="130" viewBox="0 0 300 130" preserveAspectRatio="xMidYMid slice">
      <defs>
        <pattern id="pat-barber" width="60" height="60" patternUnits="userSpaceOnUse" patternTransform="rotate(-45 150 65)">
          <rect width="20" height="60" fill="#4169A0" />
          <rect x="20" width="20" height="60" fill="#ffffff" />
          <rect x="40" width="20" height="60" fill="#D93025" />
        </pattern>
      </defs>
      <rect width="300" height="130" fill="url(#pat-barber)" />
    </svg>
  );

  if (type === "waves") return (
    <svg width="100%" height="130" viewBox="0 0 300 130" preserveAspectRatio="xMidYMid slice">
      <rect width="300" height="130" fill="#DBEAFE" />
      <circle cx="55" cy="46" r="26" fill="#93C5FD" opacity="0.55" stroke="#60A5FA" strokeWidth="2" />
      <circle cx="108" cy="24" r="17" fill="#BFDBFE" opacity="0.7" stroke="#93C5FD" strokeWidth="1.5" />
      <circle cx="152" cy="54" r="30" fill="#93C5FD" opacity="0.45" stroke="#60A5FA" strokeWidth="2" />
      <circle cx="204" cy="28" r="21" fill="#BFDBFE" opacity="0.6" stroke="#93C5FD" strokeWidth="1.5" />
      <circle cx="255" cy="50" r="24" fill="#93C5FD" opacity="0.5" stroke="#60A5FA" strokeWidth="2" />
      <circle cx="286" cy="18" r="15" fill="#BFDBFE" opacity="0.5" stroke="#93C5FD" strokeWidth="1.5" />
      <path d="M0 88 Q37 73 75 88 Q112 103 150 88 Q187 73 225 88 Q262 103 300 88 L300 130 L0 130 Z" fill="#60A5FA" opacity="0.35" />
      <path d="M0 106 Q50 91 100 106 Q150 121 200 106 Q250 91 300 106 L300 130 L0 130 Z" fill={accent} opacity="0.45" />
      <path d="M148 22 C144 15 139 9 139 5 A9 9 0 0 1 157 5 C157 9 152 15 148 22Z" fill={accent} opacity="0.7" />
    </svg>
  );

  if (type === "icecream") return (
    <svg width="100%" height="130" viewBox="0 0 300 130" preserveAspectRatio="xMidYMid slice">
      <rect width="300" height="130" fill="#CCFBF1" />
      <circle cx="55" cy="72" r="30" fill="#FBCFE8" />
      <path d="M28 73 L55 118 L82 73 Z" fill="#D4A14A" />
      <path d="M37 73 L55 107 L73 73 Z" fill="#B8862A" opacity="0.35" />
      <circle cx="42" cy="58" r="8" fill="white" opacity="0.55" />
      <circle cx="150" cy="60" r="35" fill={accent} opacity="0.8" />
      <circle cx="150" cy="60" r="22" fill={accent} opacity="0.45" />
      <path d="M118 61 L150 112 L182 61 Z" fill="#D4A14A" />
      <path d="M128 61 L150 101 L172 61 Z" fill="#B8862A" opacity="0.35" />
      <circle cx="137" cy="46" r="10" fill="white" opacity="0.5" />
      <circle cx="245" cy="72" r="28" fill="#FDE68A" />
      <path d="M220 73 L245 115 L270 73 Z" fill="#D4A14A" />
      <circle cx="234" cy="58" r="7" fill="white" opacity="0.55" />
    </svg>
  );

  if (type === "lotus") return (
    <svg width="100%" height="130" viewBox="0 0 300 130" preserveAspectRatio="xMidYMid slice">
      <rect width="300" height="130" fill="#F3E8FF" />
      <ellipse cx="150" cy="82" rx="18" ry="40" fill={accent} opacity="0.65" />
      <ellipse cx="150" cy="82" rx="18" ry="40" fill={accent} opacity="0.5" transform="rotate(42 150 82)" />
      <ellipse cx="150" cy="82" rx="18" ry="40" fill={accent} opacity="0.5" transform="rotate(-42 150 82)" />
      <ellipse cx="150" cy="82" rx="18" ry="40" fill={accent} opacity="0.35" transform="rotate(84 150 82)" />
      <ellipse cx="150" cy="82" rx="18" ry="40" fill={accent} opacity="0.35" transform="rotate(-84 150 82)" />
      <circle cx="150" cy="82" r="13" fill={accent} />
      <circle cx="150" cy="82" r="6" fill="white" opacity="0.45" />
      <ellipse cx="62" cy="90" rx="10" ry="24" fill={accent} opacity="0.35" />
      <ellipse cx="62" cy="90" rx="10" ry="24" fill={accent} opacity="0.25" transform="rotate(50 62 90)" />
      <ellipse cx="62" cy="90" rx="10" ry="24" fill={accent} opacity="0.25" transform="rotate(-50 62 90)" />
      <circle cx="62" cy="90" r="7" fill={accent} opacity="0.55" />
      <ellipse cx="238" cy="90" rx="10" ry="24" fill={accent} opacity="0.35" />
      <ellipse cx="238" cy="90" rx="10" ry="24" fill={accent} opacity="0.25" transform="rotate(50 238 90)" />
      <ellipse cx="238" cy="90" rx="10" ry="24" fill={accent} opacity="0.25" transform="rotate(-50 238 90)" />
      <circle cx="238" cy="90" r="7" fill={accent} opacity="0.55" />
      <ellipse cx="150" cy="120" rx="90" ry="10" fill={accent} opacity="0.1" />
    </svg>
  );

  if (type === "gym") return (
    <svg width="100%" height="130" viewBox="0 0 300 130" preserveAspectRatio="xMidYMid slice">
      <rect width="300" height="130" fill="#0A0A0F" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <line key={`gv${i}`} x1={i * 50} y1="0" x2={i * 50} y2="130" stroke={accent} strokeWidth="0.5" opacity="0.18" />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <line key={`gh${i}`} x1="0" y1={i * 44} x2="300" y2={i * 44} stroke={accent} strokeWidth="0.5" opacity="0.18" />
      ))}
      <path d="M162 8 L126 72 L152 72 L132 125 L186 52 L158 52 L176 8 Z" fill={accent} opacity="0.9" />
      <path d="M162 8 L126 72 L152 72 L132 125 L186 52 L158 52 L176 8 Z" fill="white" opacity="0.12" />
      <ellipse cx="154" cy="66" rx="60" ry="40" fill={accent} opacity="0.08" />
    </svg>
  );

  if (type === "pizza") return (
    <svg width="100%" height="130" viewBox="0 0 300 130" preserveAspectRatio="xMidYMid slice">
      <rect width="300" height="130" fill="#FEF3C7" />
      <circle cx="150" cy="65" r="55" fill="#FCA5A5" opacity="0.65" />
      <circle cx="150" cy="65" r="46" fill="#F87171" opacity="0.55" />
      <circle cx="150" cy="65" r="36" fill="#EF4444" opacity="0.2" />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const angle = (i * 45 * Math.PI) / 180;
        return <line key={i} x1="150" y1="65" x2={150 + 55 * Math.sin(angle)} y2={65 - 55 * Math.cos(angle)} stroke="#FEF3C7" strokeWidth="2" opacity="0.55" />;
      })}
      <circle cx="150" cy="34" r="5" fill="#7F1D1D" opacity="0.75" />
      <circle cx="168" cy="48" r="4.5" fill="#7F1D1D" opacity="0.75" />
      <circle cx="132" cy="48" r="4.5" fill="#7F1D1D" opacity="0.75" />
      <circle cx="172" cy="70" r="4.5" fill="#7F1D1D" opacity="0.75" />
      <circle cx="128" cy="70" r="4.5" fill="#7F1D1D" opacity="0.75" />
      <circle cx="152" cy="88" r="4.5" fill="#7F1D1D" opacity="0.75" />
      <circle cx="150" cy="65" r="4" fill="#7F1D1D" opacity="0.5" />
      <path d="M150 65 L150 10 A55 55 0 0 1 197.6 37.5 Z" fill="white" opacity="0.18" />
    </svg>
  );

  if (type === "fire") return (
    <svg width="100%" height="130" viewBox="0 0 300 130" preserveAspectRatio="xMidYMid slice">
      <rect width="300" height="130" fill="#1C0A00" />
      <ellipse cx="150" cy="110" rx="130" ry="55" fill={accent} opacity="0.12" />
      <path d="M150 8 C128 36 112 52 118 80 C102 62 98 36 114 14 C98 38 86 70 94 102 C74 80 78 48 96 26 C78 54 73 86 90 112 C90 112 116 128 140 130 L160 130 C184 128 210 112 210 112 C227 86 222 54 204 26 C222 48 226 80 206 102 C214 70 202 38 186 14 C202 36 198 62 182 80 C188 52 172 36 150 8 Z" fill={accent} opacity="0.88" />
      <path d="M150 30 C136 52 130 68 135 90 C122 74 121 52 133 36 C122 56 119 76 128 96 C128 96 140 114 150 118 C160 114 172 96 172 96 C181 76 178 56 167 36 C179 52 178 74 165 90 C170 68 164 52 150 30 Z" fill="#FCD34D" opacity="0.82" />
      <path d="M150 58 C144 70 142 80 145 93 C139 82 139 70 147 59 C142 70 140 83 145 96 C148 103 150 106 150 106 C150 106 152 103 155 96 C160 83 158 70 153 59 C161 70 161 82 155 93 C158 80 156 70 150 58 Z" fill="#FEF08A" opacity="0.9" />
    </svg>
  );

  return (
    <svg width="100%" height="130" viewBox="0 0 300 130" preserveAspectRatio="xMidYMid slice">
      <rect width="300" height="130" fill="#FDF6EE" />
      <path d="M32 124 C42 100 37 78 48 56 C58 36 52 20 58 10" fill="none" stroke={accent} strokeWidth="3.5" strokeLinecap="round" opacity="0.6" />
      <ellipse cx="52" cy="52" rx="12" ry="7" fill={accent} opacity="0.6" transform="rotate(-30 52 52)" />
      <ellipse cx="44" cy="72" rx="12" ry="7" fill={accent} opacity="0.55" transform="rotate(20 44 72)" />
      <ellipse cx="58" cy="35" rx="12" ry="7" fill={accent} opacity="0.6" transform="rotate(-15 58 35)" />
      <rect x="112" y="52" width="76" height="58" rx="9" fill={accent} opacity="0.85" />
      <rect x="118" y="58" width="64" height="46" rx="6" fill="#F5D8B0" opacity="0.85" />
      <path d="M150 72 C147 68 140 68 140 75 C140 82 150 91 150 91 C150 91 160 82 160 75 C160 68 153 68 150 72 Z" fill={accent} opacity="0.5" />
      <path d="M188 66 C200 66 203 80 200 92 C197 103 188 103 188 103" fill="none" stroke={accent} strokeWidth="5.5" strokeLinecap="round" opacity="0.8" />
      <ellipse cx="150" cy="113" rx="46" ry="8" fill={accent} opacity="0.4" />
      <path d="M136 48 C136 41 140 37 136 30" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" opacity="0.4" />
      <path d="M150 46 C150 39 154 35 150 28" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" opacity="0.4" />
      <path d="M164 48 C164 41 168 37 164 30" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" opacity="0.4" />
      <path d="M268 124 C258 100 263 78 252 56 C242 36 248 20 242 10" fill="none" stroke={accent} strokeWidth="3.5" strokeLinecap="round" opacity="0.6" />
      <ellipse cx="248" cy="52" rx="12" ry="7" fill={accent} opacity="0.6" transform="rotate(30 248 52)" />
      <ellipse cx="256" cy="72" rx="12" ry="7" fill={accent} opacity="0.55" transform="rotate(-20 256 72)" />
      <ellipse cx="242" cy="35" rx="12" ry="7" fill={accent} opacity="0.6" transform="rotate(15 242 35)" />
    </svg>
  );
}

function CardDemo({
  accent,
  dark,
  business,
  slogan,
  customer,
  customerFull,
  stamped,
  total,
  reward,
  bannerType,
  initial,
}: {
  accent: string;
  dark: boolean;
  business: string;
  slogan: string;
  customer: string;
  customerFull: string;
  stamped: number;
  total: number;
  reward: string;
  bannerType: BannerType;
  initial: string;
}) {
  const bg = dark ? (bannerType === "gym" ? "#0A0A12" : "#1A0804") : "#FFFFFF";
  const textMain = dark ? "#F9FAFB" : "#111827";
  const textMuted = dark ? "rgba(249,250,252,0.45)" : "rgba(17,24,39,0.42)";
  const border = dark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.07)";
  const dotSize = total <= 6 ? 14 : total <= 8 ? 12 : 10;

  return (
    <div
      style={{
        background: bg,
        width: 290,
        borderRadius: 18,
        overflow: "hidden",
        flexShrink: 0,
        boxShadow: dark
          ? "0 24px 56px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05)"
          : "0 20px 50px rgba(0,0,0,0.16), 0 0 0 1px rgba(0,0,0,0.06)",
      }}
    >
      {/* Header */}
      <div style={{ padding: "16px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0, flex: 1 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              fontSize: 20,
              fontWeight: 900,
              color: "white",
              letterSpacing: "-0.5px",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            {initial}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ color: textMain, fontWeight: 800, fontSize: 17, margin: 0, lineHeight: 1.2, fontFamily: "system-ui, sans-serif" }}>{business}</p>
            {slogan && (
              <p style={{ color: textMuted, fontSize: 11, margin: "3px 0 0", lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{slogan}</p>
            )}
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
          <p style={{ color: textMuted, fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.14em", margin: 0, fontFamily: "system-ui, sans-serif" }}>SELLOS</p>
          <p style={{ color: textMain, fontWeight: 900, fontSize: 28, lineHeight: 1, margin: "2px 0 0", fontFamily: "system-ui, sans-serif" }}>
            {stamped}
            <span style={{ fontSize: 16, fontWeight: 500, color: textMuted }}>/{total}</span>
          </p>
        </div>
      </div>

      {/* Banner */}
      <div style={{ width: "100%", overflow: "hidden" }}>
        <BannerPattern type={bannerType} accent={accent} />
      </div>

      {/* Info strip: MIEMBRO | PROGRESO | FALTAN | PREMIO */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "48px 1fr 52px 72px",
          gap: 6,
          padding: "14px",
          borderTop: border,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div>
          <p style={{ color: textMuted, fontSize: 8, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>Miembro</p>
          <p style={{ color: textMain, fontWeight: 700, fontSize: 13, margin: "5px 0 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{customer}</p>
        </div>
        <div>
          <p style={{ color: textMuted, fontSize: 8, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>Progreso</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
            {Array.from({ length: total }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: dotSize,
                  height: dotSize,
                  borderRadius: "50%",
                  flexShrink: 0,
                  background: i < stamped ? accent : "transparent",
                  border: `2px solid ${i < stamped ? accent : textMuted}`,
                }}
              />
            ))}
          </div>
        </div>
        <div>
          <p style={{ color: textMuted, fontSize: 8, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>Faltan</p>
          <p style={{ color: textMain, fontWeight: 700, fontSize: 12, margin: "5px 0 0" }}>{total - stamped} sel.</p>
        </div>
        <div>
          <p style={{ color: textMuted, fontSize: 8, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>Premio</p>
          <p style={{ color: textMain, fontWeight: 700, fontSize: 11, margin: "5px 0 0", lineHeight: 1.35 }}>{reward}</p>
        </div>
      </div>

      {/* QR */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "18px 18px 26px",
          borderTop: border,
        }}
      >
        <div
          style={{
            background: "white",
            borderRadius: 14,
            padding: 12,
            boxShadow: dark ? "0 4px 28px rgba(0,0,0,0.6)" : "0 2px 14px rgba(0,0,0,0.10)",
          }}
        >
          <div style={{ width: 88, height: 88, color: "black" }}>
            <QRMockup />
          </div>
        </div>
        <p style={{ color: textMuted, fontSize: 13, fontWeight: 500, margin: "10px 0 0", fontFamily: "system-ui, sans-serif" }}>{customerFull}</p>
      </div>
    </div>
  );
}

const CARD_EXAMPLES: Array<{
  accent: string;
  dark: boolean;
  business: string;
  slogan: string;
  customer: string;
  customerFull: string;
  stamped: number;
  total: number;
  reward: string;
  bannerType: BannerType;
  initial: string;
}> = [
  { accent: "#2D4179", dark: false, business: "Barber King", slogan: "Estilo que impone", initial: "B", customer: "Carlos", customerFull: "Carlos Vega", stamped: 0, total: 6, reward: "Corte de cabello gratis", bannerType: "barber" },
  { accent: "#5C2D07", dark: true, business: "Carnitas El Güero", slogan: "Tradición en cada bocado", initial: "C", customer: "David", customerFull: "David Morales", stamped: 0, total: 5, reward: "1 kg de carnitas", bannerType: "fire" },
  { accent: "#1D6FA4", dark: false, business: "AquaShine", slogan: "Tu auto como nuevo", initial: "A", customer: "Roberto", customerFull: "Roberto Díaz", stamped: 3, total: 6, reward: "Lavado premium gratis", bannerType: "waves" },
  { accent: "#2BA896", dark: false, business: "Ártico Heladería", slogan: "Frío que se antoja", initial: "Á", customer: "Sofía", customerFull: "Sofía Herrera", stamped: 4, total: 7, reward: "Nieve doble gratis", bannerType: "icecream" },
  { accent: "#7C3AED", dark: false, business: "Zen Spa", slogan: "Respira. Relaja. Renace.", initial: "Z", customer: "Valentina", customerFull: "Valentina Cruz", stamped: 2, total: 5, reward: "Masaje relajante gratis", bannerType: "lotus" },
  { accent: "#FF2D6B", dark: true, business: "IronBox Gym", slogan: "Entrena. Supera. Repite.", initial: "I", customer: "Miguel", customerFull: "Miguel Torres", stamped: 5, total: 10, reward: "1 mes de membresía", bannerType: "gym" },
  { accent: "#C0392B", dark: false, business: "Nápoli Pizza", slogan: "La verdadera pizza al horno", initial: "N", customer: "Andrea", customerFull: "Andrea Montes", stamped: 3, total: 8, reward: "Pizza mediana gratis", bannerType: "pizza" },
  { accent: "#7B4F2E", dark: false, business: "Café Norte", slogan: "Tu momento, nuestro café.", initial: "C", customer: "Diego", customerFull: "Diego Ramírez", stamped: 0, total: 6, reward: "Café americano gratis", bannerType: "coffee" },
];

export default function FidelityLanding() {
  return (
    <div className="min-h-screen bg-[#09090B] text-white overflow-x-hidden">

      {/* ── Navbar ────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#09090B]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <RoxierLogo />
          <nav className="flex items-center gap-6">
            <Link href="#ejemplos" className="hidden text-sm font-medium text-white/50 hover:text-white transition-colors sm:block">
              Ejemplos
            </Link>
            <Link href="#como-funciona" className="hidden text-sm font-medium text-white/50 hover:text-white transition-colors sm:block">
              Cómo funciona
            </Link>
            <Link href="#precios" className="hidden text-sm font-medium text-white/50 hover:text-white transition-colors sm:block">
              Precios
            </Link>
            <Link href="/fidelity/login" className="text-sm font-semibold text-white/70 hover:text-white transition-colors">
              Iniciar sesión
            </Link>
            <Link href="/fidelity/registro"
              className="rounded-full bg-[#FF2E63] px-5 py-2 text-sm font-bold text-white hover:bg-[#e0254f] transition-colors">
              Empieza gratis
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative mx-auto max-w-6xl px-6 pt-20 pb-28 text-center">
        <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-[#FF2E63]/10 blur-[120px]" />

        <div className="relative z-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#FF2E63]/30 bg-[#FF2E63]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#FF2E63]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#FF2E63] animate-pulse" />
            Roxier Co. · Agencia Digital
          </span>

          <h1 className="mx-auto mt-8 max-w-4xl text-5xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl">
            El programa de lealtad{" "}
            <span className="bg-gradient-to-r from-[#FF2E63] to-[#ff6b91] bg-clip-text text-transparent">
              más simple
            </span>{" "}
            para tu negocio.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/50 leading-relaxed">
            Crea tarjetas de lealtad digitales en minutos. Tus clientes las guardan en Google Wallet
            directamente desde su celular — sin apps, sin fricciones.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/fidelity/registro"
              className="group flex items-center gap-2 rounded-full bg-[#FF2E63] px-8 py-3.5 text-base font-bold text-white hover:bg-[#e0254f] transition-all hover:scale-105 shadow-lg shadow-[#FF2E63]/25">
              Regístrate ahora
              <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link href="/fidelity/login"
              className="rounded-full border border-white/10 px-8 py-3.5 text-base font-semibold text-white/70 hover:border-white/30 hover:text-white transition-all">
              Ya tengo cuenta
            </Link>
          </div>
          <p className="mt-4 text-sm text-white/30">Sin compromisos · Cancela cuando quieras</p>
        </div>
      </section>

      {/* ── Galería de tarjetas ───────────────────────────────────── */}
      <section id="ejemplos" className="py-20 overflow-hidden">
        <div className="mx-auto max-w-6xl px-6 mb-12 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-[#FF2E63] mb-3">Para cualquier negocio</p>
          <h2 className="text-4xl font-extrabold text-white mb-4">Así se ve tu tarjeta</h2>
          <p className="text-white/40 text-lg max-w-xl mx-auto">
            Tus clientes escanean el QR, acumulan sellos y reciben su recompensa — todo desde su celular.
          </p>
        </div>

        <div className="relative">
          <div className="flex gap-5 px-6 overflow-x-auto pb-4 scrollbar-hide md:justify-center">
            {CARD_EXAMPLES.map((card, i) => (
              <CardDemo key={i} {...card} />
            ))}
          </div>
          <div className="pointer-events-none absolute left-0 top-0 bottom-4 w-20 bg-gradient-to-r from-[#09090B] to-transparent md:hidden" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-4 w-20 bg-gradient-to-l from-[#09090B] to-transparent md:hidden" />
        </div>

        <div className="text-center mt-10">
          <p className="text-white/30 text-sm mb-4">Elige colores, íconos y recompensas según tu negocio</p>
          <Link href="/fidelity/registro"
            className="inline-flex items-center gap-2 rounded-full border border-[#FF2E63]/40 px-6 py-3 text-sm font-bold text-[#FF2E63] hover:bg-[#FF2E63]/10 transition-all">
            Crea la tuya gratis →
          </Link>
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────────────────── */}
      <section className="border-y border-white/[0.06] bg-white/[0.02]">
        <div className="mx-auto max-w-6xl px-6 py-14 grid grid-cols-2 gap-8 md:grid-cols-4">
          {[
            { value: "4s", label: "Para registrar un cliente nuevo" },
            { value: "0", label: "Apps que instalar" },
            { value: "100%", label: "Digital y en tiempo real" },
            { value: "∞", label: "Clientes sin límite" },
          ].map((s) => (
            <div key={s.value} className="text-center">
              <p className="text-4xl font-extrabold text-white">{s.value}</p>
              <p className="mt-1 text-sm text-white/40 leading-snug">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Cómo funciona ──────────────────────────────────────────── */}
      <section id="como-funciona" className="mx-auto max-w-6xl px-6 py-28">
        <div className="text-center mb-16">
          <p className="text-xs font-bold uppercase tracking-widest text-[#FF2E63] mb-3">Simple y rápido</p>
          <h2 className="text-4xl font-extrabold text-white">Listo en 3 pasos</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            { num: "01", icon: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z", title: "Diseña tu tarjeta", text: "Crea tu tarjeta de lealtad digital con tu logo, colores y recompensas en menos de 5 minutos." },
            { num: "02", icon: "M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8H2a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2v-4a2 2 0 00-2-2h-1m-3-6V4a2 2 0 00-2-2H6a2 2 0 00-2 2v10", title: "Tus clientes escanean", text: "El cliente escanea el QR en tu negocio y su tarjeta queda guardada en Google Wallet al instante." },
            { num: "03", icon: "M13 10V3L4 14h7v7l9-11h-7z", title: "Sella y recompensa", text: "Escanea su tarjeta en cada visita. Al completarla, le llega una notificación con su premio automáticamente." },
          ].map((step) => (
            <div key={step.num} className="group relative rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 hover:border-[#FF2E63]/30 hover:bg-white/[0.05] transition-all">
              <div className="mb-6 flex items-center gap-4">
                <span className="text-4xl font-extrabold text-white/10">{step.num}</span>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF2E63]/10">
                  <svg className="h-5 w-5 text-[#FF2E63]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={step.icon} />
                  </svg>
                </div>
              </div>
              <h3 className="mb-3 text-xl font-bold text-white">{step.title}</h3>
              <p className="text-white/50 leading-relaxed">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Características ────────────────────────────────────────── */}
      <section id="caracteristicas" className="relative py-28 overflow-hidden">
        <div className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-[#FF2E63]/5 blur-[100px]" />
        <div className="mx-auto max-w-6xl px-6 relative z-10">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-[#FF2E63] mb-3">Todo incluido</p>
            <h2 className="text-4xl font-extrabold text-white">Herramientas que tu negocio necesita</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: "M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z", title: "Google Wallet integrado", text: "Tus clientes guardan su tarjeta directamente en Google Wallet con un toque." },
              { icon: "M13 10V3L4 14h7v7l9-11h-7z", title: "Actualización en tiempo real", text: "La tarjeta del cliente se actualiza al instante cuando escaneas su QR. Sin recargar nada." },
              { icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9", title: "Notificaciones push gratis", text: "Avisa a tus clientes de sellos y promociones directamente en su celular, sin costo extra." },
              { icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", title: "Dashboard de analytics", text: "Ve en tiempo real cuántos clientes tienes, visitas del mes y recompensas canjeadas." },
              { icon: "M20 12l-8 8-8-8 8-8z", title: "Promociones masivas", text: "Crea una promo y envíala por email y notificación a todos tus clientes con un clic." },
              { icon: "M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4", title: "Sin apps que instalar", text: "Todo funciona desde el navegador. Ni tú ni tus clientes necesitan descargar nada." },
            ].map((feat) => (
              <div key={feat.title} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 hover:border-white/[0.12] hover:bg-white/[0.04] transition-all">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF2E63]/10">
                  <svg className="h-5 w-5 text-[#FF2E63]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={feat.icon} />
                  </svg>
                </div>
                <h3 className="mb-2 font-bold text-white">{feat.title}</h3>
                <p className="text-sm text-white/45 leading-relaxed">{feat.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Precios ────────────────────────────────────────────────── */}
      <section id="precios" className="relative py-28 overflow-hidden">
        <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[500px] w-[700px] rounded-full bg-[#FF2E63]/8 blur-[120px]" />
        <div className="mx-auto max-w-6xl px-6 relative z-10">

          <div className="text-center mb-4">
            <p className="text-xs font-bold uppercase tracking-widest text-[#FF2E63] mb-4">Planes y precios</p>
            <h2 className="text-4xl font-extrabold text-white mb-4">
              Invierte en lealtad,<br />
              <span className="bg-gradient-to-r from-[#FF2E63] to-[#ff6b91] bg-clip-text text-transparent">
                no en publicidad.
              </span>
            </h2>
            <p className="text-white/40 text-lg max-w-lg mx-auto">
              Un cliente fiel vale más que diez nuevos. Por eso lo hacemos sencillo y accesible para cualquier negocio.
            </p>
          </div>

          {/* Card de plan único */}
          <div className="max-w-md mx-auto">
            <div className="relative rounded-2xl border border-[#FF2E63]/50 bg-gradient-to-b from-[#FF2E63]/10 to-transparent p-8 flex flex-col">
              <div className="mb-6">
                <p className="text-xs font-bold uppercase tracking-widest text-[#FF2E63]/70 mb-1">Plan</p>
                <h3 className="text-2xl font-extrabold text-white mb-1">Roxier Fidelity</h3>
                <p className="text-white/40 text-sm">Todo lo que necesitas para fidelizar a tus clientes</p>
              </div>
              <div className="flex items-end gap-1 mb-8">
                <span className="text-5xl font-extrabold text-white">$749</span>
                <span className="text-white/40 text-sm mb-2">/mes MXN</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {[
                  "Tarjetas de lealtad ilimitadas",
                  "Clientes ilimitados",
                  "QR para sellos en segundos",
                  "Guardado en Google Wallet",
                  "Notificaciones push",
                  "Promociones ilimitadas",
                  "Dashboard con analytics",
                  "Soporte prioritario por WhatsApp",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-white/70">
                    <svg className="h-4 w-4 flex-shrink-0 text-[#FF2E63]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/fidelity/registro"
                className="w-full rounded-xl bg-[#FF2E63] py-3 text-center text-sm font-bold text-white hover:bg-[#e0254f] transition-all shadow-lg shadow-[#FF2E63]/25">
                Crear mi cuenta
              </Link>
            </div>
          </div>

          {/* Garantía / tranquilidad */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-12 text-sm text-white/30">
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              Sin contrato de permanencia
            </span>
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
              Pago seguro vía Mercado Pago
            </span>
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
              Cancela cuando quieras
            </span>
          </div>
        </div>
      </section>

      {/* ── CTA final ──────────────────────────────────────────────── */}
      <section className="relative mx-auto max-w-6xl px-6 py-28">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FF2E63] to-[#8B0028] p-12 text-center shadow-2xl shadow-[#FF2E63]/20">
          <div className="relative z-10">
            <h2 className="text-4xl font-extrabold text-white mb-4">¿Listo para fidelizar a tus clientes?</h2>
            <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">
              Únete a los negocios que ya están construyendo clientes leales con Roxier Fidelity.
            </p>
            <Link href="/fidelity/registro"
              className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-base font-bold text-[#FF2E63] hover:bg-white/90 transition-all hover:scale-105 shadow-xl">
              Crear mi cuenta
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <p className="mt-4 text-white/40 text-sm">Cancela cuando quieras</p>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.06]">
        <div className="mx-auto max-w-6xl px-6 py-10 flex flex-col items-center justify-between gap-6 sm:flex-row">
          <RoxierLogo />
          <div className="flex items-center gap-6 text-sm text-white/30">
            <Link href="/fidelity/login" className="hover:text-white/60 transition-colors">Iniciar sesión</Link>
            <Link href="/fidelity/registro" className="hover:text-white/60 transition-colors">Registrarse</Link>
          </div>
          <p className="text-sm text-white/20">© {new Date().getFullYear()} Roxier Co.</p>
        </div>
      </footer>
    </div>
  );
}
