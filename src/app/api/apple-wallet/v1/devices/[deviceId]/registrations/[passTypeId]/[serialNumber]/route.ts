import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyAuthToken } from "@/lib/apple-wallet";
import { logWalletEvent } from "@/lib/wallet-events";

type Params = { deviceId: string; passTypeId: string; serialNumber: string };

function parseSerial(serialNumber: string): [string, string] {
  return serialNumber.split("-").reduce<[string, string]>(
    (acc, part, i, arr) => i < 5 ? [acc[0] + (i > 0 ? "-" : "") + part, arr.slice(5).join("-")]
                                  : acc,
    ["", ""],
  );
}

// Apple llama este endpoint cuando el cliente agrega el pass a su Wallet
export async function POST(req: NextRequest, { params }: { params: Promise<Params> }) {
  const { deviceId, serialNumber } = await params;

  const auth = req.headers.get("authorization")?.replace("ApplePass ", "");
  const [customerId, cardId] = parseSerial(serialNumber);

  if (!auth || !verifyAuthToken(auth, customerId, cardId)) {
    console.error(`[apple-wallet] register 401 — serial=${serialNumber}`);
    await logWalletEvent("registration", serialNumber, deviceId, { result: 401 });
    return new NextResponse(null, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { pushToken } = body as { pushToken?: string };
  if (!pushToken) {
    console.error("[apple-wallet] register 400 — missing pushToken");
    await logWalletEvent("registration", serialNumber, deviceId, { result: 400, error: "missing pushToken" });
    return new NextResponse(null, { status: 400 });
  }

  const admin = createAdminClient();

  // Verificar si ya existe para devolver 201 vs 200
  const { data: existing } = await admin
    .from("apple_wallet_registrations")
    .select("id")
    .eq("device_library_id", deviceId)
    .eq("serial_number", serialNumber)
    .maybeSingle();

  const { error } = await admin.from("apple_wallet_registrations").upsert({
    device_library_id: deviceId,
    push_token: pushToken,
    serial_number: serialNumber,
  }, { onConflict: "device_library_id,serial_number" });

  if (error) {
    console.error("[apple-wallet] register DB error:", error);
    await logWalletEvent("registration", serialNumber, deviceId, { result: 500, error: error.message });
    return new NextResponse(null, { status: 500 });
  }

  const isNew = !existing;
  const httpStatus = isNew ? 201 : 200;
  console.log(`[apple-wallet] ${isNew ? "new" : "updated"} registration device=${deviceId.slice(0, 8)}... serial=${serialNumber}`);
  await logWalletEvent("registration", serialNumber, deviceId, {
    result: httpStatus,
    isNew,
    pushToken: pushToken.slice(0, 8) + "...",
  });

  return new NextResponse(null, { status: httpStatus });
}

// Apple llama este endpoint cuando el cliente elimina el pass
export async function DELETE(req: NextRequest, { params }: { params: Promise<Params> }) {
  const { deviceId, serialNumber } = await params;

  const auth = req.headers.get("authorization")?.replace("ApplePass ", "");
  const [customerId, cardId] = parseSerial(serialNumber);

  if (!auth || !verifyAuthToken(auth, customerId, cardId)) {
    return new NextResponse(null, { status: 401 });
  }

  const admin = createAdminClient();
  await admin.from("apple_wallet_registrations")
    .delete()
    .eq("device_library_id", deviceId)
    .eq("serial_number", serialNumber);

  await logWalletEvent("unregistration", serialNumber, deviceId);
  console.log(`[apple-wallet] unregistered device=${deviceId.slice(0, 8)}... serial=${serialNumber}`);

  return new NextResponse(null, { status: 200 });
}
