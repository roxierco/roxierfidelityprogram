import { NextResponse } from "next/server";

/**
 * GET /api/health
 * Endpoint simple para verificar que la app está viva.
 * Útil para monitoreo y para confirmar que el despliegue funcionó.
 */
export function GET() {
  return NextResponse.json({ status: "ok", service: "roxier-fidelity" });
}
