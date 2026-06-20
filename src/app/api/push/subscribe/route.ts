import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const { customerId, subscription } = await req.json();

  if (!customerId || !subscription?.endpoint) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(customerId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Verificar que el cliente existe
  const { data: customer } = await admin
    .from("end_customers")
    .select("id")
    .eq("id", customerId)
    .single();
  if (!customer) return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });

  // Guardar o actualizar la suscripción
  await admin.from("push_subscriptions").upsert(
    {
      customer_id: customerId,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
    { onConflict: "endpoint" },
  );

  return NextResponse.json({ ok: true });
}
