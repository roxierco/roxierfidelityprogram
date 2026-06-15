"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { iniciarSesion, type ActionState } from "../actions";
import { RoxierLogo } from "@/components/brand/XMark";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    iniciarSesion,
    undefined,
  );
  const searchParams = useSearchParams();
  const msg = searchParams.get("msg");

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <Link href="/fidelity" className="mb-10 flex justify-center">
          <RoxierLogo />
        </Link>

        <div className="card">
          <h1 className="mb-1 text-2xl font-extrabold text-paper">
            Inicia sesión
          </h1>
          <p className="mb-6 text-sm text-mist">
            Entra al panel de tu negocio.
          </p>

          {msg === "confirma-tu-email" && (
            <div className="mb-4 rounded-brand bg-green-500/10 border border-green-500/30 px-4 py-3 text-sm text-green-400">
              ✅ Cuenta creada. Revisa tu correo y confirma tu email antes de iniciar sesión.
            </div>
          )}

          <form action={formAction} className="space-y-4">
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
              <label htmlFor="password" className="label">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="input"
                placeholder="••••••••"
              />
            </div>

            {state?.error && (
              <p className="rounded-brand bg-magenta-muted px-4 py-3 text-sm text-magenta">
                {state.error}
              </p>
            )}

            <button type="submit" disabled={pending} className="btn-primary w-full">
              {pending ? "Entrando..." : "Iniciar sesión"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-mist">
          ¿No tienes cuenta?{" "}
          <Link href="/fidelity/registro" className="font-semibold text-magenta">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}
