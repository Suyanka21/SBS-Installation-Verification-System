export type SbsRole = "Installer" | "Lead Installer" | "QC Reviewer" | "Management";

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: SbsRole;
  exp: number; // UNIX timestamp in seconds
}

const DEFAULT_SECRET = "sbs-tanks-secure-identity-token-secret-key-32-chars-min";
const AUTH_SECRET = process.env.AUTH_SECRET || DEFAULT_SECRET;

function base64UrlEncode(buffer: Uint8Array | ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(str: string): Uint8Array {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) {
    str += "=";
  }
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function getHmacKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  return globalThis.crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

/**
 * Creates a cryptographically signed HMAC-SHA256 session token.
 * Defaults to 7 days expiration.
 */
export async function createSessionToken(
  user: { id: string; email: string; name: string; role: SbsRole },
  expiresInSeconds: number = 7 * 24 * 60 * 60
): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const payload: SessionPayload = {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    exp,
  };

  const header = { alg: "HS256", typ: "JWT" };
  const encoder = new TextEncoder();

  const encodedHeader = base64UrlEncode(encoder.encode(JSON.stringify(header)));
  const encodedPayload = base64UrlEncode(encoder.encode(JSON.stringify(payload)));
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  const key = await getHmacKey(AUTH_SECRET);
  const signatureBuffer = await globalThis.crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(dataToSign)
  );

  const encodedSignature = base64UrlEncode(signatureBuffer);
  return `${dataToSign}.${encodedSignature}`;
}

/**
 * Verifies and decodes an HMAC-SHA256 session token.
 * Returns null if the token is tampered with, expired, or invalid.
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    const dataToSign = `${encodedHeader}.${encodedPayload}`;
    const encoder = new TextEncoder();

    const key = await getHmacKey(AUTH_SECRET);
    const signatureBytes = base64UrlDecode(encodedSignature);

    const isValid = await globalThis.crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes.buffer.slice(signatureBytes.byteOffset, signatureBytes.byteOffset + signatureBytes.byteLength) as ArrayBuffer,
      encoder.encode(dataToSign)
    );

    if (!isValid) return null;

    const payloadJson = new TextDecoder().decode(base64UrlDecode(encodedPayload));
    const payload: SessionPayload = JSON.parse(payloadJson);

    // Expiration check
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
