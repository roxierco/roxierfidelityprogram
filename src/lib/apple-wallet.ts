import JSZip from "jszip";
import forge from "node-forge";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";

// Minimal 1×1 PNG placeholder — replace with real 29×29/58×58/87×87 icons after
// getting the Apple Developer account and Pass Type ID certificate.
const ICON_PLACEHOLDER = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQI12NgAAIABQAABjE+ibYAAAAASUVORK5CYII=",
  "base64",
);

export function isAppleWalletConfigured(): boolean {
  return !!(
    process.env.APPLE_WALLET_TEAM_ID &&
    process.env.APPLE_WALLET_PASS_TYPE_ID &&
    process.env.APPLE_WALLET_CERTIFICATE &&
    process.env.APPLE_WALLET_PRIVATE_KEY &&
    process.env.APPLE_WALLET_WWDR_CERTIFICATE &&
    process.env.APPLE_WALLET_AUTH_SECRET
  );
}

// Derives an auth token tied to a specific customer+card pair.
// Used by Apple devices to authenticate pass-update requests.
export function generateAuthToken(customerId: string, cardId: string): string {
  return createHmac("sha256", process.env.APPLE_WALLET_AUTH_SECRET!)
    .update(`${customerId}:${cardId}`)
    .digest("hex");
}

// Constant-time comparison to prevent timing attacks on auth tokens.
export function verifyAuthToken(
  token: string,
  customerId: string,
  cardId: string,
): boolean {
  const expected = generateAuthToken(customerId, cardId);
  try {
    return timingSafeEqual(Buffer.from(token, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}

export interface LoyaltyPassData {
  customerId: string;
  cardId: string;
  customerName: string;
  businessName: string;
  cardTitle: string;
  currentStamps: number;
  stampsRequired: number;
  rewardText: string;
  cardUrl: string;
}

export async function generateLoyaltyPass(data: LoyaltyPassData): Promise<Buffer> {
  const passJson = buildPassJson(data);

  const files: Record<string, Buffer> = {
    "pass.json": Buffer.from(JSON.stringify(passJson), "utf8"),
    "icon.png": ICON_PLACEHOLDER,
    "icon@2x.png": ICON_PLACEHOLDER,
    "icon@3x.png": ICON_PLACEHOLDER,
    "logo.png": ICON_PLACEHOLDER,
    "logo@2x.png": ICON_PLACEHOLDER,
  };

  // SHA-1 hash of every pass file — required by Apple
  const manifest: Record<string, string> = {};
  for (const [name, buf] of Object.entries(files)) {
    manifest[name] = createHash("sha1").update(buf).digest("hex");
  }
  const manifestStr = JSON.stringify(manifest);

  const signature = signManifest(manifestStr);

  const zip = new JSZip();
  for (const [name, buf] of Object.entries(files)) {
    zip.file(name, buf);
  }
  zip.file("manifest.json", manifestStr);
  zip.file("signature", signature);

  return zip.generateAsync({ type: "nodebuffer", compression: "STORE" });
}

function buildPassJson(data: LoyaltyPassData): object {
  const authToken = generateAuthToken(data.customerId, data.cardId);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

  return {
    formatVersion: 1,
    passTypeIdentifier: process.env.APPLE_WALLET_PASS_TYPE_ID!,
    serialNumber: `${data.customerId}-${data.cardId}`,
    teamIdentifier: process.env.APPLE_WALLET_TEAM_ID!,
    webServiceURL: `${appUrl}/api/apple-wallet/`,
    authenticationToken: authToken,
    organizationName: data.businessName,
    description: data.cardTitle,
    logoText: data.businessName,
    foregroundColor: "rgb(255, 255, 255)",
    backgroundColor: "rgb(20, 20, 30)",
    labelColor: "rgb(160, 160, 180)",
    storeCard: {
      headerFields: [
        {
          key: "stamps",
          label: "Sellos",
          value: `${data.currentStamps}/${data.stampsRequired}`,
          textAlignment: "PKTextAlignmentRight",
        },
      ],
      primaryFields: [
        {
          key: "member",
          label: "CLIENTE",
          value: data.customerName,
        },
      ],
      secondaryFields: [
        {
          key: "reward",
          label: "PREMIO",
          value: data.rewardText,
        },
        {
          key: "loyalty",
          label: "PROGRAMA",
          value: data.cardTitle,
        },
      ],
      backFields: [
        {
          key: "instructions",
          label: "Cómo funciona",
          value: `Presenta este QR en ${data.businessName} en cada visita. Acumula ${data.stampsRequired} sellos y gana: ${data.rewardText}.`,
        },
        {
          key: "powered",
          label: "",
          value: "Powered by Roxier Fidelity · roxierco.com",
        },
      ],
    },
    barcodes: [
      {
        message: data.cardUrl,
        format: "PKBarcodeFormatQR",
        messageEncoding: "iso-8859-1",
        altText: data.customerName,
      },
    ],
  };
}

// Generates a detached PKCS7/CMS signature of the manifest — required by Apple.
function signManifest(manifestStr: string): Buffer {
  const decodePem = (b64: string) => Buffer.from(b64, "base64").toString("utf-8").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const certPem = decodePem(process.env.APPLE_WALLET_CERTIFICATE!);
  const keyPem = decodePem(process.env.APPLE_WALLET_PRIVATE_KEY!);
  const wwdrPem = decodePem(process.env.APPLE_WALLET_WWDR_CERTIFICATE!);

  let cert, privateKey, wwdrCert;
  try { cert = forge.pki.certificateFromPem(certPem); } catch (e) { throw new Error(`CERTIFICATE parse failed: ${e}`); }
  try { privateKey = forge.pki.privateKeyFromPem(keyPem) as forge.pki.rsa.PrivateKey; } catch (e) { throw new Error(`PRIVATE_KEY parse failed: ${e}`); }
  try { wwdrCert = forge.pki.certificateFromPem(wwdrPem); } catch (e) { throw new Error(`WWDR_CERTIFICATE parse failed: ${e}`); }

  const p7 = forge.pkcs7.createSignedData();
  p7.content = forge.util.createBuffer(manifestStr, "utf8");
  p7.addCertificate(wwdrCert);
  p7.addCertificate(cert);
  p7.addSigner({
    key: privateKey,
    certificate: cert,
    digestAlgorithm: forge.pki.oids.sha256,
    authenticatedAttributes: [
      { type: forge.pki.oids.contentType, value: forge.pki.oids.data },
      { type: forge.pki.oids.messageDigest },
      { type: forge.pki.oids.signingTime },
    ],
  });
  p7.sign({ detached: true });

  const der = forge.asn1.toDer(p7.toAsn1()).getBytes();
  return Buffer.from(der, "binary");
}
