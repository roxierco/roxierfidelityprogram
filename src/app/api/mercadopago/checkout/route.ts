import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { crearCheckoutInicial } from "@/lib/mercadopago/client";

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { data: business } = await supabase
      .from("businesses")
      .select("id, email, status")
      .eq("owner_id", user.id)
      .single();

    if (!business) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });
    if (business.status === "active") return NextResponse.json({ error: "Ya tienes un plan activo" }, { status: 400 });

    const { initPoint } = await crearCheckoutInicial({
      businessEmail: business.email,
      businessId: business.id,
    });

    return NextResponse.json({ initPoint });
  } catch (err) {
    console.error("MP checkout error:", err);
    return NextResponse.json({ error: "Error al crear el pago" }, { status: 500 });
  }
}
