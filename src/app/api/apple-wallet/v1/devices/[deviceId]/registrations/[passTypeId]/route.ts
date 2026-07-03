import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Apple pregunta qué passes del dispositivo han sido actualizados
export async function GET(req: NextRequest, { params }: { params: Promise<{ deviceId: string; passTypeId: string }> }) {
  const { deviceId } = await params;
  const since = req.nextUrl.searchParams.get("passesUpdatedSince");

  const admin = createAdminClient();

  let query = admin
    .from("apple_wallet_registrations")
    .select("serial_number, updated_at")
    .eq("device_library_id", deviceId);

  if (since) {
    query = query.gte("updated_at", new Date(since).toISOString());
  }

  const { data } = await query;
  if (!data?.length) return new NextResponse(null, { status: 204 });

  return NextResponse.json({
    serialNumbers: data.map((r) => r.serial_number),
    lastUpdated: data.reduce((max, r) => r.updated_at > max ? r.updated_at : max, ""),
  });
}
