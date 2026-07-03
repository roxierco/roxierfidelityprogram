import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyAuthToken } from "@/lib/apple-wallet";

type Params = { deviceId: string; passTypeId: string; serialNumber: string };

// Apple llama este endpoint cuando el cliente agrega el pass a su Wallet
export async function POST(req: NextRequest, { params }: { params: Promise<Params> }) {
  const { deviceId, serialNumber } = await params;

  // Verificar auth token del header
  const auth = req.headers.get("authorization")?.replace("ApplePass ", "");
  const [customerId, cardId] = serialNumber.split("-").reduce<[string, string]>(
    (acc, part, i, arr) => i < 5 ? [acc[0] + (i > 0 ? "-" : "") + part, arr.slice(5).join("-")]
                                  : acc,
    ["", ""],
  );

  if (!auth || !verifyAuthToken(auth, customerId, cardId)) {
    console.error(`[apple-wallet] register 401 — serial=${serialNumber} customerId=${customerId} cardId=${cardId}`);
    return new NextResponse(null, { status: 401 });
  }

  const { pushToken } = await req.json().catch(() => ({}));
  if (!pushToken) {
    console.error("[apple-wallet] register 400 — missing pushToken");
    return new NextResponse(null, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin.from("apple_wallet_registrations").upsert({
    device_library_id: deviceId,
    push_token: pushToken,
    serial_number: serialNumber,
  }, { onConflict: "device_library_id,serial_number" });

  if (error) console.error("[apple-wallet] register DB error:", error);
  else console.log(`[apple-wallet] registered device=${deviceId.slice(0, 8)}... serial=${serialNumber}`);

  return new NextResponse(null, { status: 201 });
}

// Apple llama este endpoint cuando el cliente elimina el pass
export async function DELETE(req: NextRequest, { params }: { params: Promise<Params> }) {
  const { deviceId, serialNumber } = await params;

  const auth = req.headers.get("authorization")?.replace("ApplePass ", "");
  const [customerId, cardId] = serialNumber.split("-").reduce<[string, string]>(
    (acc, part, i, arr) => i < 5 ? [acc[0] + (i > 0 ? "-" : "") + part, arr.slice(5).join("-")]
                                  : acc,
    ["", ""],
  );

  if (!auth || !verifyAuthToken(auth, customerId, cardId)) {
    return new NextResponse(null, { status: 401 });
  }

  const admin = createAdminClient();
  await admin.from("apple_wallet_registrations")
    .delete()
    .eq("device_library_id", deviceId)
    .eq("serial_number", serialNumber);

  return new NextResponse(null, { status: 200 });
}
