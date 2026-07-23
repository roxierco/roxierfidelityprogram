import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

// GET /api/admin/wallet-events?serial=XXXX
// Autenticación SOLO por header: x-admin-secret: YYY
// (no por query string: la URL queda registrada en logs e historial).
export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-admin-secret") ?? "";
  const esperado = process.env.ADMIN_SECRET ?? "";

  const ok =
    esperado.length > 0 &&
    secret.length === esperado.length &&
    timingSafeEqual(Buffer.from(secret), Buffer.from(esperado));

  if (!ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const serial = req.nextUrl.searchParams.get("serial");
  if (!serial) {
    return NextResponse.json({ error: "Falta el parámetro serial" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("wallet_events")
    .select("id, created_at, event_type, device_library_identifier, detail")
    .eq("serial_number", serial)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ serial, count: data?.length ?? 0, events: data ?? [] });
}
