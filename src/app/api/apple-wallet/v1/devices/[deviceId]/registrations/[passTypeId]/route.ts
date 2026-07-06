import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logWalletEvent } from "@/lib/wallet-events";

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
    // Apple puede mandar un ISO string o un Unix timestamp en segundos como string.
    // new Date("1720043650") devuelve Invalid Date → RangeError en toISOString().
    const asNum = Number(since);
    const sinceDate = isNaN(asNum) ? new Date(since) : new Date(asNum * 1000);
    if (!isNaN(sinceDate.getTime())) {
      query = query.gte("updated_at", sinceDate.toISOString());
    }
    // Si el formato es desconocido, devolvemos todos los passes del dispositivo
  }

  const { data } = await query;
  if (!data?.length) return new NextResponse(null, { status: 204 });

  // Log cada serial para el que iOS pidió updates
  await Promise.allSettled(
    data.map((r) => logWalletEvent("get_registrations", r.serial_number, deviceId, { since: since ?? null })),
  );

  return NextResponse.json({
    serialNumbers: data.map((r) => r.serial_number),
    lastUpdated: data.reduce((max, r) => r.updated_at > max ? r.updated_at : max, ""),
  });
}
