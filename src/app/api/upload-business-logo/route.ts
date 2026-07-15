import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const businessId = formData.get("businessId") as string | null;

  if (!file || !businessId) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  // Validar UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(businessId)) {
    return NextResponse.json({ error: "Negocio inválido" }, { status: 400 });
  }

  // Validar tipo MIME en el servidor (no confiar solo en el cliente)
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: "Tipo de archivo no permitido. Usa JPG, PNG, WEBP o SVG." }, { status: 400 });
  }

  // Límite de tamaño: 2 MB
  if (file.size > 2 * 1024 * 1024) {
    return NextResponse.json({ error: "La imagen no puede pesar más de 2 MB." }, { status: 400 });
  }

  const admin = createAdminClient();

  // Verificar que el negocio pertenece a este usuario
  const { data: business } = await admin
    .from("businesses")
    .select("id")
    .eq("id", businessId)
    .eq("owner_id", user.id)
    .single();

  if (!business) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const ext = file.name.split(".").pop() ?? "png";
  const path = `business-logos/${businessId}-${Date.now()}.${ext}`;
  const bytes = await file.arrayBuffer();

  const { error: uploadError } = await admin.storage
    .from("logos")
    .upload(path, bytes, { upsert: true, contentType: file.type });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: { publicUrl } } = admin.storage.from("logos").getPublicUrl(path);

  // Usar RPC para evitar problemas de caché de esquema de PostgREST
  const { error: rpcError } = await admin.rpc("set_business_logo", {
    p_business_id: businessId,
    p_logo_url: publicUrl,
    p_owner_id: user.id,
  });

  if (rpcError) {
    return NextResponse.json({ error: "Error al guardar: " + rpcError.message }, { status: 500 });
  }

  return NextResponse.json({ publicUrl });
}
