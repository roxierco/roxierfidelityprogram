/**
 * Chequeos ligeros de configuración de wallets. Viven aparte a propósito: solo
 * leen variables de entorno y NO importan librerías pesadas (node-forge, jszip,
 * google-auth-library, etc.). Así las páginas que solo necesitan saber si una
 * wallet está activa —como la tarjeta pública del cliente— no arrastran todo el
 * peso de la generación de pases y arrancan rápido (menos cold start).
 */

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

export function isGoogleWalletConfigured(): boolean {
  return !!(
    process.env.GOOGLE_WALLET_ISSUER_ID &&
    process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL &&
    process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_PRIVATE_KEY
  );
}
