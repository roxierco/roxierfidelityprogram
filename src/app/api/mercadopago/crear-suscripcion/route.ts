import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { crearSuscripcion, PLANS, precioPlan, type PlanKey } from "@/lib/mercadopago/client";

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
      .select("id, email, status, trial_ends_at")
      .eq("owner_id", user.id)
      .single();

    if (!business) return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });

    // Días que le quedan de la prueba que empezó al registrarse. Se los
    // respetamos en Mercado Pago para que NO obtenga 7 días extra por pagar.
    const trialDaysRemaining =
      business.status === "trial" && business.trial_ends_at
        ? Math.ceil((new Date(business.trial_ends_at).getTime() - Date.now()) / 86_400_000)
        : 0;

    // El precio depende de cuántas sucursales activas tenga (4+ = tarifa multi-sucursal).
    const { count: sucursalCount } = await supabase
      .from("sucursales")
      .select("*", { count: "exact", head: true })
      .eq("business_id", business.id)
      .eq("is_active", true);

    const { initPoint, subscriptionId } = await crearSuscripcion({
      businessEmail: business.email,
      businessId: business.id,
      plan,
      sucursalCount: sucursalCount ?? 0,
      trialDaysRemaining,
    });

    await supabase.from("subscriptions").upsert({
      business_id: business.id,
      mercadopago_subscription_id: subscriptionId,
      status: "pending",
      amount: precioPlan(plan, sucursalCount ?? 0),
    }, { onConflict: "business_id" });

    return NextResponse.json({ initPoint });
  } catch (err) {
    console.error("MP suscripción error:", err);
    return NextResponse.json({ error: "Error al crear la suscripción" }, { status: 500 });
  }
}
