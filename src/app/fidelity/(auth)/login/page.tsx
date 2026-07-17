"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { iniciarSesion, type ActionState } from "../actions";
import { RoxierLogo } from "@/components/brand/XMark";
import { PasswordInput } from "@/components/auth/PasswordInput";

function EmailConfirmBanner() {
  const searchParams = useSearchParams();
  const msg = searchParams.get("msg");
  if (msg !== "confirma-tu-email") return null;
  return (
    <div className="mb-4 rounded-brand border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
      ✅ Cuenta creada. Revisa tu correo y confirma tu email antes de iniciar sesión.
    </div>
  );
}

export default function LoginPage() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    iniciarSesion,
    undefined,
  );

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

          <Suspense fallback={null}>
            <EmailConfirmBanner />
          </Suspense>

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
              <PasswordInput
                id="password"
                name="password"
                required
                autoComplete="current-password"
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
