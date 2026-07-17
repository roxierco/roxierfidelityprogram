import { createAdminClient } from "@/lib/supabase/admin";
import { isGoogleWalletConfigured, syncCashback } from "@/lib/google-wallet";
import { isAppleWalletConfigured, sendApnsPassUpdate } from "@/lib/apple-wallet";
import { logWalletEvent } from "@/lib/wallet-events";

/**
 * Propaga un cambio de saldo de cashback a todos los canales del cliente:
 *  1. Supabase Realtime → actualiza la tarjeta abierta en el navegador al instante.
 *  2. Google Wallet → actualiza el saldo (en micros) y manda notificación.
 *  3. Apple Wallet → APNs push; el dispositivo vuelve a pedir el pase, que ya
 *     renderiza el saldo nuevo (ver buildPassJson, rama cashback).
 *
 * Mismo patrón que el flujo de sellos en /api/stamp.
 */
export async function notifyCashbackUpdate(params: {
  customerId: string;
  cardId: string;
  customerName: string;
  balance: number;
  slug: string;
  title: string;
  body: string;
}) {
  const { customerId, cardId, customerName, balance, slug, title, body } = params;
  const admin = createAdminClient();
  const cardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/c/${slug}/u/${customerId}?card=${cardId}`;

  // 1. Realtime broadcast al navegador del cliente.
  fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/realtime/v1/api/broadcast`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    },
    body: JSON.stringify({
      messages: [
        {
          topic: `realtime:customer:${customerId}`,
          event: "cashback_updated",
          payload: { cashback_balance: balance },
        },
      ],
    }),
  }).catch(() => null);

  // 2. Google Wallet sync.
  if (isGoogleWalletConfigured()) {
    syncCashback({
      customerId,
      cardId,
      customerName,
      balance,
      cardUrl,
      message: { header: title, body },
    }).catch(() => null);
  }

  // 3. Apple Wallet APNs — awaited para que Vercel no mate la función antes de completar.
  if (isAppleWalletConfigured()) {
    try {
      const serialNumber = `${customerId}-${cardId}`;
      const { data: registrations } = await admin
        .from("apple_wallet_registrations")
        .select("push_token, device_library_id")
        .eq("serial_number", serialNumber);

      if (!registrations?.length) {
        await logWalletEvent("push_skipped_no_registration", serialNumber);
      } else {
        const results = await Promise.allSettled(
          registrations.map((r) => sendApnsPassUpdate(r.push_token)),
        );

        const deadTokens: string[] = [];
        await Promise.allSettled(
          results.map(async (r, i) => {
            const reg = registrations[i];
            if (r.status === "fulfilled") {
              const { ok, status, reason } = r.value;
              if (ok) {
                await logWalletEvent("push_sent", serialNumber, reg.device_library_id, { status: 200 });
              } else {
                await logWalletEvent("push_failed", serialNumber, reg.device_library_id, { status, reason });
                if (status === 410 || (status === 400 && reason === "BadDeviceToken")) {
                  deadTokens.push(reg.push_token);
                }
              }
            } else {
              await logWalletEvent("push_failed", serialNumber, reg.device_library_id, { error: String(r.reason) });
            }
          }),
        );

        if (deadTokens.length) {
          await admin
            .from("apple_wallet_registrations")
            .delete()
            .eq("serial_number", serialNumber)
            .in("push_token", deadTokens);
        }
      }
    } catch (e) {
      console.error("[cashback] apple push error:", e);
    }
  }
}
