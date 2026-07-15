"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateBusinessName(name: string): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autorizado");

  const trimmed = name.trim();
  if (trimmed.length < 2) throw new Error("El nombre debe tener al menos 2 caracteres");
  if (trimmed.length > 100) throw new Error("El nombre es muy largo");

  const { error } = await supabase
    .from("businesses")
    .update({ name: trimmed })
    .eq("owner_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/fidelity/dashboard/configuracion");
}
