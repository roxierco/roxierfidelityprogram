import webpush from "web-push";

let initialized = false;

function init() {
  if (initialized) return;
  if (!process.env.VAPID_PRIVATE_KEY || !process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) return;
  webpush.setVapidDetails(
    `mailto:${process.env.VAPID_EMAIL ?? "admin@roxierfidelity.com"}`,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY,
  );
  initialized = true;
}

export function isPushConfigured() {
  return !!(process.env.VAPID_PRIVATE_KEY && process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY);
}

export async function sendPush(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: { title: string; body: string; url?: string; icon?: string },
): Promise<"ok" | "expired"> {
  init();
  try {
    await webpush.sendNotification(
      { endpoint: subscription.endpoint, keys: { p256dh: subscription.p256dh, auth: subscription.auth } },
      JSON.stringify(payload),
    );
    return "ok";
  } catch (err: unknown) {
    if (typeof err === "object" && err !== null && "statusCode" in err) {
      const code = (err as { statusCode: number }).statusCode;
      if (code === 410 || code === 404) return "expired";
    }
    return "ok";
  }
}
