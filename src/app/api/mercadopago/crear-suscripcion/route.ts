import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { crearSuscripcion, PLANS, type PlanKey } from "@/lib/mercadopago/client";

export async function POST(req: NextRequest) {
  try {
    const { plan } = await req.json() as { plan?: PlanKey };
    if (!plan || !PLANS[plan]) {
      return NextResponse.json({ error: "Plan inválido" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { data: business } = await supabase
      .from("businesses")
      .select("id, email, status")
      .eq("owner_id", user.id)
      .single();

    if (!business) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

    const { initPoint, subscriptionId } = await crearSuscripcion({
      businessEmail: business.email,
      businessId: business.id,
      plan,
    });

    await supabase.from("subscriptions").upsert({
      business_id: business.id,
      mercadopago_subscription_id: subscriptionId,
      status: "pending",
      amount: PLANS[plan].amount,
    }, { onConflict: "business_id" });

    return NextResponse.json({ initPoint });
  } catch (err) {
    console.error("MP suscripción error:", err);
    return NextResponse.json({ error: "Error al crear la suscripción" }, { status: 500 });
  }
}
