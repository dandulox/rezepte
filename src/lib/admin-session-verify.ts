/**
 * Reine Web-Crypto-Logik — lauffähig in Middleware (Edge) und auf dem Server.
 */

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let c = 0;
  for (let i = 0; i < a.length; i++) {
    c |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return c === 0;
}

async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sig), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function verifyAdminSessionToken(
  token: string,
  secret: string,
): Promise<boolean> {
  const idx = token.lastIndexOf(":");
  if (idx <= 0) return false;
  const expStr = token.slice(0, idx);
  const sigHex = token.slice(idx + 1);
  const expSec = Number(expStr);
  if (!Number.isFinite(expSec) || expSec * 1000 <= Date.now()) return false;
  const expected = await hmacSha256Hex(secret, expStr);
  return timingSafeEqualHex(expected, sigHex);
}
