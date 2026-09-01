import { GoogleAuth } from "google-auth-library";
import { sign } from "jsonwebtoken";

const API = "https://walletobjects.googleapis.com/walletobjects/v1";

// El chequeo de configuración vive en wallet-config.ts (sin deps pesadas).
// Se re-exporta aquí para no romper importaciones existentes.
export { isGoogleWalletConfigured } from "@/lib/wallet-config";

function sanitize(id: string) {
  return id.replace(/-/g, "_");
}

export function getClassId(cardId: string) {
  return `${process.env.GOOGLE_WALLET_ISSUER_ID}.card_${sanitize(cardId)}`;
}

export function getObjectId(customerId: string, cardId: string) {
  return `${process.env.GOOGLE_WALLET_ISSUER_ID}.cust_${sanitize(customerId)}_card_${sanitize(cardId)}`;
}

/**
 * Credenciales de la cuenta de servicio.
 *
 * Forma preferida: `GOOGLE_WALLET_SERVICE_ACCOUNT_JSON` con el archivo JSON que
 * descarga Google, en base64. Una llave PEM tiene saltos de línea y al pasarla
 * por una variable de entorno se mutila de mil formas (comillas que se quedan
 * pegadas, `\n` sin des-escapar, saltos convertidos en espacios), y el error que
 * suelta OpenSSL —"DECODER routines::unsupported"— no dice nada sobre la causa.
 * En base64 no hay nada que se pueda romper al copiar y pegar.
 *
 * Se mantienen las dos variables sueltas por compatibilidad.
 */
function getServiceAccount(): { client_email: string; private_key: string } {
  const raw = process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_JSON?.trim();

  if (raw) {
    const texto = raw.startsWith("{")
      ? raw
      : Buffer.from(raw.replace(/^["']|["']$/g, ""), "base64").toString("utf-8");

    let parsed: { client_email?: string; private_key?: string };
    try {
      parsed = JSON.parse(texto);
    } catch {
      throw new Error(
        "GOOGLE_WALLET_SERVICE_ACCOUNT_JSON no se pudo leer: debe ser el JSON de " +
          "la cuenta de servicio, en base64 o tal cual.",
      );
    }
    if (!parsed.client_email || !parsed.private_key) {
      throw new Error(
        "GOOGLE_WALLET_SERVICE_ACCOUNT_JSON no trae client_email y/o private_key.",
      );
    }
    return { client_email: parsed.client_email, private_key: parsed.private_key };
  }

  // Compatibilidad: las dos variables por separado.
  const email = process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL;
  const key = (process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_PRIVATE_KEY ?? "")
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/\\n/g, "\n");

  if (!email) throw new Error("Falta GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL.");
  if (!key.includes("BEGIN") || !key.includes("PRIVATE KEY")) {
    throw new Error(
      "GOOGLE_WALLET_SERVICE_ACCOUNT_PRIVATE_KEY no es una llave PEM válida: le " +
        "falta la línea -----BEGIN PRIVATE KEY----- o sus saltos de línea. " +
        "Lo más fácil es usar GOOGLE_WALLET_SERVICE_ACCOUNT_JSON en base64.",
    );
  }
  return { client_email: email, private_key: key };
}

async function getAccessToken(): Promise<string> {
  const auth = new GoogleAuth({
    credentials: getServiceAccount(),
    scopes: ["https://www.googleapis.com/auth/wallet_object.issuer"],
  });
  const client = await auth.getClient();
  const token = await client.getAccessToken();
  return token.token as string;
}

/**
 * Comprueba UNA vez que las credenciales sirven, antes de recorrer clientes.
 * Si la autenticación falla, falla para todos por igual: sin este chequeo se
 * intentaba tarjeta por tarjeta y se escribía el mismo error decenas de veces
 * en la bitácora, enterrando los fallos que sí son distintos entre sí.
 */
export async function checkGoogleWalletAuth(): Promise<{
  ok: boolean;
  error?: string;
  clientEmail?: string;
  issuerId?: string;
}> {
  // El correo de la cuenta de servicio y el issuer id NO son secretos (la llave
  // privada sí, y nunca se registra). Anotarlos convierte un "account not found"
  // indescifrable en algo que se diagnostica de un vistazo: casi siempre las
  // credenciales apuntan a un proyecto de Google distinto al que se cree.
  let clientEmail: string | undefined;
  try {
    clientEmail = getServiceAccount().client_email;
  } catch {
    // Credenciales ilegibles; el error de abajo lo explica.
  }
  const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID;

  try {
    await getAccessToken();
    return { ok: true, clientEmail, issuerId };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : String(e),
      clientEmail,
      issuerId,
    };
  }
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
      balance: { string: rewarded ? `¡Premio ganado!` : `${currentStamps} / ${stampsRequired}` },
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

// Envía una notificación push al celular del cliente.
// Devuelve el resultado: walletFetch NO lanza excepción cuando Google responde
// con error, así que quien llame tiene que mirar `ok` — si se ignora, un 404 o
// un 403 pasa por envío exitoso.
async function addMessage(objectId: string, header: string, body: string) {
  return walletFetch("POST", `/loyaltyObject/${encodeURIComponent(objectId)}/addMessage`, {
    message: { header, body },
  });
}

/**
 * Envía mensaje de promoción a un cliente específico.
 * Devuelve `{ ok, status }` para poder contar los envíos reales y registrar los
 * fallos; no confíes en que la promesa se resuelva como señal de éxito.
 */
export async function sendWalletPromoMessage(
  customerId: string,
  cardId: string,
  title: string,
  message: string,
): Promise<{ ok: boolean; status: number }> {
  const objectId = getObjectId(customerId, cardId);
  const { ok, status } = await addMessage(objectId, title, message);
  return { ok, status };
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
    ? { header: "¡Premio ganado!", body: `${params.rewardText} — preséntalo al cajero` }
    : { header: "Nuevo sello agregado", body: `Llevas ${params.currentStamps} de ${params.stampsRequired} sellos` };

  await addMessage(objectId, msg.header, msg.body);
}

// ─── CUPÓN / DESCUENTO (sin progreso) ─────────────────────────────────────────
export interface BenefitWalletCard {
  id: string;
  title: string;
  color_background: string;
  logo_url: string | null;
  card_type: string;
  coupon_value: string | null;
  reward_text: string;
}

export async function upsertBenefitClass(card: BenefitWalletCard, businessName: string) {
  const id = getClassId(card.id);
  const label = card.card_type === "cupon" ? "Cupón" : "Descuento";
  const value = card.coupon_value || card.reward_text;

  const benefitClass = {
    id,
    issuerName: businessName,
    programName: card.title,
    hexBackgroundColor: card.color_background,
    reviewStatus: "UNDER_REVIEW",
    loyaltyPoints: { label, balance: { string: value } },
    ...(card.logo_url
      ? {
          programLogo: {
            sourceUri: { uri: card.logo_url },
            contentDescription: { defaultValue: { language: "es-MX", value: businessName } },
          },
        }
      : {}),
  };

  const existing = await walletFetch("GET", `/loyaltyClass/${encodeURIComponent(id)}`);
  if (existing.ok) {
    await walletFetch("PATCH", `/loyaltyClass/${encodeURIComponent(id)}`, benefitClass);
  } else {
    await walletFetch("POST", `/loyaltyClass`, benefitClass);
  }
}

export async function upsertBenefitObject(params: {
  customerId: string;
  cardId: string;
  customerName: string;
  cardType: string;
  couponValue: string | null;
  rewardText: string;
  cardUrl: string;
}) {
  const { customerId, cardId, customerName, cardType, couponValue, rewardText, cardUrl } = params;
  const id = getObjectId(customerId, cardId);
  const classId = getClassId(cardId);
  const label = cardType === "cupon" ? "Cupón" : "Descuento";
  const value = couponValue || rewardText;

  const loyaltyObject = {
    id,
    classId,
    state: "ACTIVE",
    accountId: customerId,
    accountName: customerName,
    loyaltyPoints: { label, balance: { string: value } },
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

// ─── CASHBACK ────────────────────────────────────────────────────────────────
// Google Wallet maneja dinero en MICROS: 1 unidad = 1,000,000 micros.
// $85.50 MXN → 85_500_000 micros.
function toMicros(amount: number): number {
  return Math.round(amount * 1_000_000);
}

export interface CashbackWalletCard {
  id: string;
  title: string;
  color_background: string;
  logo_url: string | null;
}

export async function upsertCashbackClass(card: CashbackWalletCard, businessName: string) {
  const id = getClassId(card.id);
  const cashbackClass = {
    id,
    issuerName: businessName,
    programName: card.title,
    hexBackgroundColor: card.color_background,
    reviewStatus: "UNDER_REVIEW",
    loyaltyPoints: {
      label: "Saldo",
      balance: { money: { micros: 0, currencyCode: "MXN" } },
    },
    ...(card.logo_url
      ? {
          programLogo: {
            sourceUri: { uri: card.logo_url },
            contentDescription: { defaultValue: { language: "es-MX", value: businessName } },
          },
        }
      : {}),
  };

  const existing = await walletFetch("GET", `/loyaltyClass/${encodeURIComponent(id)}`);
  if (existing.ok) {
    await walletFetch("PATCH", `/loyaltyClass/${encodeURIComponent(id)}`, cashbackClass);
  } else {
    await walletFetch("POST", `/loyaltyClass`, cashbackClass);
  }
}

export async function upsertCashbackObject(params: {
  customerId: string;
  cardId: string;
  customerName: string;
  balance: number;
  cardUrl: string;
}) {
  const { customerId, cardId, customerName, balance, cardUrl } = params;
  const id = getObjectId(customerId, cardId);
  const classId = getClassId(cardId);

  const loyaltyObject = {
    id,
    classId,
    state: "ACTIVE",
    accountId: customerId,
    accountName: customerName,
    loyaltyPoints: {
      label: "Saldo",
      balance: { money: { micros: toMicros(balance), currencyCode: "MXN" } },
    },
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

// Actualiza el saldo de cashback en Google Wallet Y notifica al cliente.
export async function syncCashback(params: {
  customerId: string;
  cardId: string;
  customerName: string;
  balance: number;
  cardUrl: string;
  message?: { header: string; body: string };
}) {
  const objectId = await upsertCashbackObject(params);
  if (!objectId) return;
  if (params.message) {
    await addMessage(objectId, params.message.header, params.message.body);
  }
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
