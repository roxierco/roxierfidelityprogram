import { NextResponse } from "next/server";

// El pago único fue reemplazado por suscripciones con trial.
// Este endpoint ya no se usa — redirigir al nuevo flujo.
export async function POST() {
  return NextResponse.json(
    { error: "Usa /api/mercadopago/crear-suscripcion con { plan: 'basico' | 'pro' }" },
    { status: 410 }
  );
}
