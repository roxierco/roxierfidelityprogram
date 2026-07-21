"use client";

import { useState } from "react";
import Link from "next/link";
import { useActionState } from "react";
import { registrarNegocio, type ActionState } from "../actions";
import { RoxierLogo } from "@/components/brand/XMark";
import { PasswordInput, PasswordStrengthMeter } from "@/components/auth/PasswordInput";

export default function RegistroPage() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    registrarNegocio,
    undefined,
  );
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const mismatch = confirmPassword.length > 0 && password !== confirmPassword;
  const canSubmit = password.length >= 8 && confirmPassword.length > 0 && !mismatch;

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <Link href="/fidelity" className="mb-10 flex justify-center">
          <RoxierLogo />
        </Link>

        <div className="card">
          <h1 className="mb-1 text-2xl font-extrabold text-paper">
            Crea tu cuenta
          </h1>
          <p className="mb-6 text-sm text-mist">
            <strong className="text-green-400">7 días gratis, sin tarjeta.</strong> Después $749 MXN/mes. Sin cuota de activación.
          </p>

          <form action={formAction} className="space-y-4">
            <div>
              <label htmlFor="businessName" className="label">
                Nombre de tu negocio
              </label>
              <input
                id="businessName"
                name="businessName"
                type="text"
                required
                className="input"
                placeholder="Café La Paloma"
              />
            </div>

            <div>
              <label htmlFor="email" className="label">
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="input"
                placeholder="tucorreo@ejemplo.com"
              />
            </div>

            <div>
              <label htmlFor="phone" className="label">
                Teléfono <span className="font-normal text-mist">(opcional)</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                className="input"
                placeholder="871 123 4567"
              />
            </div>

            <div>
              <label htmlFor="password" className="label">
                Contraseña
              </label>
              <PasswordInput
                id="password"
                name="password"
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <PasswordStrengthMeter password={password} />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="label">
                Confirma tu contraseña
              </label>
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                required
                autoComplete="new-password"
                placeholder="Escríbela de nuevo"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {mismatch && (
                <p className="mt-1.5 text-xs text-magenta">Las contraseñas no coinciden</p>
              )}
            </div>

            {state?.error && (
              <p className="rounded-brand bg-magenta-muted px-4 py-3 text-sm text-magenta">
                {state.error}
              </p>
            )}

            <button type="submit" disabled={pending || !canSubmit} className="btn-primary w-full disabled:opacity-50">
              {pending ? "Creando cuenta..." : "Empezar 7 días gratis"}
            </button>
            <p className="text-center text-xs text-mist">
              No pedimos tarjeta. Al terminar los 7 días necesitarás un plan para seguir entrando.
            </p>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-mist">
          ¿Ya tienes cuenta?{" "}
          <Link href="/fidelity/login" className="font-semibold text-magenta">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
