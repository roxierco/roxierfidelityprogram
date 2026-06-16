import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { businessId, name, email, phone } = body;

  if (!businessId || !name || !email || !phone) {
    return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
  }

  // Validaciones de formato
  if (!uuidRegex.test(businessId)) {
    return NextResponse.json({ error: "Negocio inválido" }, { status: 400 });
  }
  if (!emailRegex.test(email) || email.length > 254) {
    return NextResponse.json({ error: "Correo inválido" }, { status: 400 });
  }
  if (name.trim().length < 2 || name.trim().length > 100) {
    return NextResponse.json({ error: "Nombre inválido" }, { status: 400 });
  }
  if (phone.trim().length < 7 || phone.trim().length > 20) {
    return NextResponse.json({ error: "Teléfono inválido" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Verificar que el negocio existe y está activo
  const { data: business } = await supabase
    .from("businesses")
    .select("id, status")
    .eq("id", businessId)
    .single();

  if (!business) {
    return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });
  }
  if (business.status === "suspended" || business.status === "cancelled") {
    return NextResponse.json({ error: "Este programa de lealtad no está disponible" }, { status: 403 });
  }

  // Si ya existe el cliente en este negocio, devolver el existente
  const { data: existing } = await supabase
    .from("end_customers")
    .select("id")
    .eq("business_id", businessId)
    .eq("email", email.toLowerCase().trim())
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ customerId: existing.id, isNew: false });
  }

  const { data, error } = await supabase
    .from("end_customers")
    .insert({
      business_id: businessId,
      full_name: name.trim().slice(0, 100),
      email: email.toLowerCase().trim(),
      phone: phone.trim().slice(0, 20),
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: "Error al registrarse" }, { status: 500 });
  }

  return NextResponse.json({ customerId: data.id, isNew: true });
}
