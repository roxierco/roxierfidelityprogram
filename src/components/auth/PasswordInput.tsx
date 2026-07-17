"use client";

import { useState } from "react";

/** Campo de contraseña con botón de "ojito" para mostrar/ocultar el texto. */
export function PasswordInput({
  id,
  name,
  placeholder,
  autoComplete,
  minLength,
  required,
  value,
  onChange,
}: {
  id: string;
  name: string;
  placeholder?: string;
  autoComplete?: string;
  minLength?: number;
  required?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={show ? "text" : "password"}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        className="input pr-11"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-mist hover:text-paper transition-colors"
      >
        {show ? (
          <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.774 3.162 10.066 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243L9.88 9.88" />
          </svg>
        ) : (
          <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )}
      </button>
    </div>
  );
}

const COMUNES = ["12345678", "123456789", "password", "contraseña", "qwerty", "11111111", "00000000", "abcdefgh", "letmein", "iloveyou"];

export type PasswordStrength = { score: number; label: string; color: string };

/** Heurística simple de fuerza de contraseña — sin dependencias externas. */
export function evaluarFuerza(pw: string): PasswordStrength {
  if (!pw) return { score: 0, label: "", color: "" };

  if (COMUNES.includes(pw.toLowerCase())) {
    return { score: 0, label: "Muy insegura — es una contraseña muy común", color: "#ef4444" };
  }

  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;

  const niveles: PasswordStrength[] = [
    { score: 0, label: "Muy insegura", color: "#ef4444" },
    { score: 1, label: "Insegura", color: "#f97316" },
    { score: 2, label: "Aceptable", color: "#eab308" },
    { score: 3, label: "Buena", color: "#84cc16" },
    { score: 4, label: "Fuerte", color: "#22c55e" },
    { score: 5, label: "Muy fuerte", color: "#16a34a" },
  ];

  return niveles[Math.min(score, 5)];
}

export function PasswordStrengthMeter({ password }: { password: string }) {
  const { score, label, color } = evaluarFuerza(password);
  if (!password) return null;

  return (
    <div className="mt-1.5 space-y-1">
      <div className="flex gap-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-colors"
            style={{ backgroundColor: i <= score ? color : "var(--surface-border)" }}
          />
        ))}
      </div>
      <p className="text-xs" style={{ color }}>{label}</p>
    </div>
  );
}
