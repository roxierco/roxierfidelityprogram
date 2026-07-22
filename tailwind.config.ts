import type { Config } from "tailwindcss";

/**
 * Sistema de diseño Roxier Co.
 * Todos los colores y tipografías de la marca viven aquí.
 * Si algún día cambia el branding, se cambia en este solo archivo.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Paleta oficial Roxier — referencia CSS variables para soporte de temas
        "near-black": "var(--near-black)",
        "paper":      "var(--paper)",
        "mist":       "var(--mist)",
        surface: {
          DEFAULT: "var(--surface)",
          raised:  "var(--surface-raised)",
          border:  "var(--surface-border)",
        },
        magenta: {
          DEFAULT: "#FF2E63",
          hover: "#FF1F58",
          muted: "rgba(255, 46, 99, 0.12)",
        },
      },
      fontFamily: {
        // Syne es la tipografía oficial de la marca
        sans: ["var(--font-syne)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        brand: "12px",
        "brand-lg": "16px",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "pulse-once": {
          "0%": { transform: "scale(1)" },
          "15%": { transform: "scale(1.04)" },
          "30%": { transform: "scale(1)" },
          "45%": { transform: "scale(1.02)" },
          "60%": { transform: "scale(1)" },
        },
        "scan-line": {
          "0%": { top: "0%" },
          "50%": { top: "100%" },
          "100%": { top: "0%" },
        },
        // Manecilla del reloj: da la vuelta a saltitos, como un segundero real
        tick: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "fade-in": "fade-in 0.4s ease forwards",
        "pulse-once": "pulse-once 0.6s ease-out forwards",
        "scan-line": "scan-line 2s ease-in-out infinite",
        tick: "tick 12s steps(12) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
