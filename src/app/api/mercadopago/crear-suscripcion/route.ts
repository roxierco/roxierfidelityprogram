import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { crearSuscripcion } from "@/lib/mercadopago/client";

/**
 * POST /api/mercadopago/crear-suscripcion
 *
 * Crea la suscripción mensual del negocio autenticado y devuelve
 * la URL de Mercado Pago para que autorice el pago con su tarjeta.
 *
 * Seguridad: solo el dueño del negocio (sesión válida) puede llamar esto.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 1. Verificar que hay sesión válida
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // 2. Buscar el negocio del usuario (RLS garantiza que solo ve el suyo)
    const { data: business, error } = await supabase
      .from("businesses")
      .select("id, email, monthly_price")
      .eq("owner_id", user.id)
      .single();

    if (error || !business) {
      return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });
    }

    // 3. Crear la suscripción en Mercado Pago
    const { initPoint, subscriptionId } = await crearSuscripcion({
      businessEmail: business.email,
      monthlyPrice: business.monthly_price,
      businessId: business.id,
    });

    // 4. Guardar referencia de la suscripción en nuestra base de datos
    await supabase.from("subscriptions").insert({
      business_id: business.id,
      mercadopago_subscription_id: subscriptionId,
      status: "pending",
      amount: business.monthly_price,
    });

    return NextResponse.json({ initPoint });
  } catch (err) {
    console.error("Error al crear suscripción:", err);
    return NextResponse.json(
      { error: "No se pudo crear la suscripción. Intenta de nuevo." },
      { status: 500 },
    );
  }
}
