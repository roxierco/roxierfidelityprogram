"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/utils";

/**
 * Acciones de servidor para autenticación.
 * Al correr en el servidor, las credenciales nunca se exponen al navegador.
 */

const registroSchema = z.object({
  businessName: z.string().min(2, "El nombre del negocio es muy corto"),
  email: z.string().email("Correo inválido"),
  phone: z.string().min(8, "Teléfono inválido").optional().or(z.literal("")),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export type ActionState = { error?: string } | undefined;

/**
 * Registra un nuevo negocio: crea el usuario y su registro de negocio.
 */
export async function registrarNegocio(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = registroSchema.safeParse({
    businessName: formData.get("businessName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Datos inválidos" };
  }

  const { businessName, email, phone, password } = parsed.data;
  const supabase = await createClient();

  // 1. Crear la cuenta de usuario
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://roxier-fidelity.vercel.app";
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${appUrl}/auth/callback`,
    },
  });

  if (authError || !authData.user) {
    return { error: authError?.message ?? "No se pudo crear la cuenta" };
  }

  // 2. Crear el registro del negocio con el cliente admin (bypasa RLS)
  // Necesario cuando la confirmación de email está activa y el usuario no tiene sesión aún.
  const admin = createAdminClient();
  const { error: bizError } = await admin.from("businesses").insert({
    owner_id: authData.user.id,
    name: businessName,
    slug: `${slugify(businessName)}-${authData.user.id.slice(0, 6)}`,
    email,
    phone: phone || null,
    status: "trial",
    plan: "basico",
    monthly_price: 549,
    trial_ends_at: null,
  });

  if (bizError) {
    // Si falla, eliminar el usuario creado para no dejar datos huérfanos
    await admin.auth.admin.deleteUser(authData.user.id);
    return { error: "No se pudo crear el negocio: " + bizError.message };
  }

  // Si no hay sesión activa es porque Supabase requiere confirmación de email
  if (!authData.session) {
    redirect("/fidelity/login?msg=confirma-tu-email");
  }

  revalidatePath("/fidelity/dashboard");
  redirect("/fidelity/dashboard");
}

const loginSchema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(1, "Ingresa tu contraseña"),
});

/**
 * Inicia sesión.
 */
export async function iniciarSesion(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: "Correo o contraseña incorrectos" };
  }

  revalidatePath("/fidelity/dashboard");
  redirect("/fidelity/dashboard");
}

/**
 * Cierra sesión.
 */
export async function cerrarSesion() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/fidelity/login");
}
