import JSZip from "jszip";
import forge from "node-forge";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { deflateSync } from "node:zlib";
import { connect } from "node:http2";

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

export function generateAuthToken(customerId: string, cardId: string): string {
  return createHmac("sha256", process.env.APPLE_WALLET_AUTH_SECRET!)
    .update(`${customerId}:${cardId}`)
    .digest("hex");
}

export function verifyAuthToken(token: string, customerId: string, cardId: string): boolean {
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
  colorBackground: string;
  colorPrimary: string;
  colorText: string;
  logoUrl: string | null;
  stripUrl: string | null;
}

// ─── PNG generator (no external deps) ───────────────────────────────────────

function crc32(buf: Buffer): number {
  let crc = 0xffffffff;
  for (const byte of buf) {
    crc ^= byte;
    for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type, "ascii");
  const crcVal = Buffer.alloc(4);
  crcVal.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
  return Buffer.concat([len, t, data, crcVal]);
}

function parseHex(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function makePng(width: number, height: number, pixels: (x: number, y: number) => [number, number, number, number]): Buffer {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;  // bit depth
  ihdrData[9] = 6;  // RGBA
  ihdrData[10] = 0; ihdrData[11] = 0; ihdrData[12] = 0;

  const rowSize = 1 + width * 4;
  const raw = Buffer.alloc(height * rowSize);
  for (let y = 0; y < height; y++) {
    raw[y * rowSize] = 0; // filter None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = pixels(x, y);
      const o = y * rowSize + 1 + x * 4;
      raw[o] = r; raw[o + 1] = g; raw[o + 2] = b; raw[o + 3] = a;
    }
  }

  return Buffer.concat([
    sig,
    pngChunk("IHDR", ihdrData),
    pngChunk("IDAT", deflateSync(raw)),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

function solidPng(w: number, h: number, hex: string, alpha = 255): Buffer {
  const [r, g, b] = parseHex(hex);
  return makePng(w, h, () => [r, g, b, alpha]);
}

function gradientPng(w: number, h: number, hexFrom: string, hexTo: string): Buffer {
  const [r1, g1, b1] = parseHex(hexFrom);
  const [r2, g2, b2] = parseHex(hexTo);
  return makePng(w, h, (x) => {
    const t = w > 1 ? x / (w - 1) : 0;
    return [
      Math.round(r1 + (r2 - r1) * t),
      Math.round(g1 + (g2 - g1) * t),
      Math.round(b1 + (b2 - b1) * t),
      255,
    ];
  });
}

// Draws a progress bar row into the PNG: a thin colored bar at the bottom
function progressStripPng(w: number, h: number, hexBg: string, hexFg: string, current: number, total: number): Buffer {
  const [br, bg, bb] = parseHex(hexBg);
  const [fr, fg, fb] = parseHex(hexFg);
  const filledW = total > 0 ? Math.round((current / total) * w) : 0;
  const barH = Math.max(4, Math.round(h * 0.06)); // 6% of height for the bar
  return makePng(w, h, (x, y) => {
    // Bottom bar zone
    if (y >= h - barH) {
      const inFilled = x < filledW;
      return inFilled ? [fr, fg, fb, 255] : [fr, fg, fb, 60];
    }
    // Gradient background
    const t = w > 1 ? x / (w - 1) : 0;
    const mix = 0.35;
    return [
      Math.round(br + (fr - br) * t * mix),
      Math.round(bg + (fg - bg) * t * mix),
      Math.round(bb + (fb - bb) * t * mix),
      255,
    ];
  });
}

async function fetchLogo(url: string): Promise<Buffer | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) return null;
    return Buffer.from(await res.arrayBuffer());
  } catch {
    return null;
  }
}

// ─── Pass generation ─────────────────────────────────────────────────────────

export async function generateLoyaltyPass(data: LoyaltyPassData): Promise<Buffer> {
  const icon = solidPng(87, 87, data.colorPrimary);
  const icon2x = solidPng(174, 174, data.colorPrimary);

  let logoBuf: Buffer | null = null;
  if (data.logoUrl) logoBuf = await fetchLogo(data.logoUrl);
  const logo = logoBuf ?? solidPng(160, 50, data.colorPrimary, 0);

  let stripBuf: Buffer | null = null;
  if (data.stripUrl) stripBuf = await fetchLogo(data.stripUrl);
  const strip = stripBuf ?? progressStripPng(750, 246, data.colorBackground, data.colorPrimary, data.currentStamps, data.stampsRequired);

  const passJson = buildPassJson(data, true);

  const files: Record<string, Buffer> = {
    "pass.json": Buffer.from(JSON.stringify(passJson), "utf8"),
    "icon.png": icon,
    "icon@2x.png": icon2x,
    "strip.png": strip,
    "strip@2x.png": strip,
    "logo.png": logo,
    "logo@2x.png": logo,
  };

  const manifest: Record<string, string> = {};
  for (const [name, buf] of Object.entries(files)) {
    manifest[name] = createHash("sha1").update(buf).digest("hex");
  }
  const manifestStr = JSON.stringify(manifest);
  const signature = signManifest(manifestStr);

  const zip = new JSZip();
  for (const [name, buf] of Object.entries(files)) zip.file(name, buf);
  zip.file("manifest.json", manifestStr);
  zip.file("signature", signature);

  return zip.generateAsync({ type: "nodebuffer", compression: "STORE" });
}

function hexToRgb(hex: string): string {
  const [r, g, b] = parseHex(hex);
  return `rgb(${r}, ${g}, ${b})`;
}

function buildPassJson(data: LoyaltyPassData, hasStrip: boolean): object {
  const authToken = generateAuthToken(data.customerId, data.cardId);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
  const remaining = Math.max(0, data.stampsRequired - data.currentStamps);
  const stampBar = "●".repeat(Math.min(data.currentStamps, data.stampsRequired)) +
                   "○".repeat(Math.max(0, data.stampsRequired - data.currentStamps));

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
    foregroundColor: hexToRgb(data.colorText),
    backgroundColor: hexToRgb(data.colorBackground),
    labelColor: hexToRgb(data.colorText),
    stripColor: hexToRgb(data.colorPrimary),
    storeCard: {
      headerFields: [
        {
          key: "stamps",
          label: "SELLOS",
          value: `${Math.min(data.currentStamps, data.stampsRequired)}/${data.stampsRequired}`,
          textAlignment: "PKTextAlignmentRight",
        },
      ],
      secondaryFields: [
        {
          key: "member",
          label: "MIEMBRO",
          value: data.customerName,
        },
        {
          key: "progress",
          label: "PROGRESO",
          value: stampBar.length <= 8 ? stampBar : `${Math.min(data.currentStamps, data.stampsRequired)} de ${data.stampsRequired}`,
        },
        {
          key: "remaining",
          label: remaining === 0 ? "ESTADO" : "FALTAN",
          value: remaining === 0 ? "🎉 Premio listo" : `${remaining} sello${remaining !== 1 ? "s" : ""}`,
        },
      ],
      auxiliaryFields: [
        {
          key: "reward",
          label: "PREMIO",
          value: data.rewardText,
        },
      ],
      backFields: [
        {
          key: "instructions",
          label: "Cómo funciona",
          value: `Presenta este QR en ${data.businessName} en cada visita. Acumula ${data.stampsRequired} sellos y gana: ${data.rewardText}.`,
        },
        {
          key: "card",
          label: "Programa",
          value: data.cardTitle,
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

  void hasStrip;
}

// ─── Manifest signing ────────────────────────────────────────────────────────

function signManifest(manifestStr: string): Buffer {
  const decodePem = (b64: string) =>
    Buffer.from(b64, "base64").toString("utf-8").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
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

// ─── APNS push para actualizar passes en Apple Wallet ────────────────────────

export async function sendApnsPassUpdate(pushToken: string): Promise<void> {
  const decodePem = (b64: string) =>
    Buffer.from(b64, "base64").toString("utf-8").replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  const cert = decodePem(process.env.APPLE_WALLET_CERTIFICATE!);
  const key = decodePem(process.env.APPLE_WALLET_PRIVATE_KEY!);
  const topic = process.env.APPLE_WALLET_PASS_TYPE_ID!;

  return new Promise((resolve, reject) => {
    const session = connect("https://api.push.apple.com", { cert, key });
    session.on("error", reject);

    const req = session.request({
      ":method": "POST",
      ":path": `/3/device/${pushToken}`,
      "apns-topic": topic,
      "apns-push-type": "background",
      "apns-priority": "5",
      "content-type": "application/json",
    });

    req.write(JSON.stringify({}));
    req.end();

    req.on("response", (headers) => {
      session.close();
      headers[":status"] === 200 ? resolve() : reject(new Error(`APNS ${headers[":status"]}`));
    });

    req.on("error", (err) => { session.close(); reject(err); });
  });
}
