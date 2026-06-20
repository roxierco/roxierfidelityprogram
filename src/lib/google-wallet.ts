import { GoogleAuth } from "google-auth-library";
import { sign } from "jsonwebtoken";

const API = "https://walletobjects.googleapis.com/walletobjects/v1";

export function isGoogleWalletConfigured() {
  return !!(
    process.env.GOOGLE_WALLET_ISSUER_ID &&
    process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL &&
    process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_PRIVATE_KEY
  );
}

function sanitize(id: string) {
  return id.replace(/-/g, "_");
}

export function getClassId(cardId: string) {
  return `${process.env.GOOGLE_WALLET_ISSUER_ID}.card_${sanitize(cardId)}`;
}

export function getObjectId(customerId: string, cardId: string) {
  return `${process.env.GOOGLE_WALLET_ISSUER_ID}.cust_${sanitize(customerId)}_card_${sanitize(cardId)}`;
}

async function getAccessToken(): Promise<string> {
  const auth = new GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/wallet_object.issuer"],
  });
  const client = await auth.getClient();
  const token = await client.getAccessToken();
  return token.token as string;
}

async function walletFetch(method: string, path: string, body?: object) {
  const token = await getAccessToken();
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return { ok: res.ok, status: res.status, data: await res.json().catch(() => null) };
}

export interface WalletCard {
  id: string;
  title: string;
  color_primary: string;
  color_background: string;
  logo_url: string | null;
  stamps_required: number;
  reward_text: string;
}

export async function upsertLoyaltyClass(card: WalletCard, businessName: string) {
  const id = getClassId(card.id);

  const loyaltyClass = {
    id,
    issuerName: businessName,
    programName: card.title,
    hexBackgroundColor: card.color_background,
    reviewStatus: "UNDER_REVIEW",
    loyaltyPoints: {
      label: "Sellos",
      balance: { string: `de ${card.stamps_required}` },
    },
    rewardsTier: card.reward_text,
    rewardsTierLabel: "Premio",
    ...(card.logo_url
      ? {
          programLogo: {
            sourceUri: { uri: card.logo_url },
            contentDescription: {
              defaultValue: { language: "es-MX", value: businessName },
            },
          },
        }
      : {}),
  };

  const existing = await walletFetch("GET", `/loyaltyClass/${encodeURIComponent(id)}`);
  if (existing.ok) {
    await walletFetch("PATCH", `/loyaltyClass/${encodeURIComponent(id)}`, loyaltyClass);
  } else {
    await walletFetch("POST", `/loyaltyClass`, loyaltyClass);
  }
}

export async function upsertLoyaltyObject(params: {
  customerId: string;
  cardId: string;
  customerName: string;
  currentStamps: number;
  stampsRequired: number;
  rewardText: string;
  cardUrl: string;
  rewarded?: boolean;
}) {
  const { customerId, cardId, customerName, currentStamps, stampsRequired, rewardText, cardUrl, rewarded } = params;
  const id = getObjectId(customerId, cardId);
  const classId = getClassId(cardId);

  const loyaltyObject = {
    id,
    classId,
    state: "ACTIVE",
    accountId: customerId,
    accountName: customerName,
    loyaltyPoints: {
      label: "Sellos",
      balance: { string: rewarded ? `¡Premio ganado! 🎉` : `${currentStamps} / ${stampsRequired}` },
    },
    textModulesData: [
      { header: "Premio al completar", body: rewardText, id: "reward" },
    ],
    barcode: {
      type: "QR_CODE",
      value: cardUrl,
      alternateText: "Mostrar al cajero",
    },
  };

  const existing = await walletFetch("GET", `/loyaltyObject/${encodeURIComponent(id)}`);
  if (existing.ok) {
    await walletFetch("PATCH", `/loyaltyObject/${encodeURIComponent(id)}`, loyaltyObject);
  } else {
    await walletFetch("POST", `/loyaltyObject`, loyaltyObject);
  }

  return id;
}

// Envía una notificación push al celular del cliente
async function addMessage(objectId: string, header: string, body: string) {
  await walletFetch("POST", `/loyaltyObject/${encodeURIComponent(objectId)}/addMessage`, {
    message: { header, body },
  });
}

// Envía mensaje de promoción a un cliente específico
export async function sendWalletPromoMessage(
  customerId: string,
  cardId: string,
  title: string,
  message: string,
) {
  const objectId = getObjectId(customerId, cardId);
  await addMessage(objectId, title, message);
}

// Actualiza sellos Y envía notificación — llamar después de cada sello
export async function syncAfterStamp(params: {
  customerId: string;
  cardId: string;
  customerName: string;
  currentStamps: number;
  stampsRequired: number;
  rewardText: string;
  cardUrl: string;
  rewarded: boolean;
}) {
  const objectId = await upsertLoyaltyObject(params);
  if (!objectId) return;

  const msg = params.rewarded
    ? { header: "🎉 ¡Premio ganado!", body: `${params.rewardText} — preséntalo al cajero` }
    : { header: "Nuevo sello agregado", body: `Llevas ${params.currentStamps} de ${params.stampsRequired} sellos` };

  await addMessage(objectId, msg.header, msg.body);
}

export function generateSaveLink(objectId: string): string {
  const privateKey = process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_PRIVATE_KEY!.replace(/\\n/g, "\n");

  const token = sign(
    {
      iss: process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL,
      aud: "google",
      typ: "savetowallet",
      iat: Math.floor(Date.now() / 1000),
      origins: [process.env.NEXT_PUBLIC_APP_URL ?? ""],
      payload: { loyaltyObjects: [{ id: objectId }] },
    },
    privateKey,
    { algorithm: "RS256" }
  );

  return `https://pay.google.com/gp/v/save/${token}`;
}
