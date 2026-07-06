import { createAdminClient } from "@/lib/supabase/admin";

export type WalletEventType =
  | "registration"
  | "unregistration"
  | "push_sent"
  | "push_failed"
  | "push_skipped_no_registration"
  | "get_registrations";

export async function logWalletEvent(
  event_type: WalletEventType,
  serial_number: string,
  device_library_identifier?: string,
  detail?: Record<string, unknown>,
): Promise<void> {
  try {
    const admin = createAdminClient();
    await admin.from("wallet_events").insert({
      serial_number,
      device_library_identifier: device_library_identifier ?? null,
      event_type,
      detail: detail ?? null,
    });
  } catch (e) {
    console.error("[wallet-events] log failed:", e);
  }
}
