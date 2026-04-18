import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const SCRYPT_KEYLEN = 64;

export function hashAdminPin(pin: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(pin, salt, SCRYPT_KEYLEN);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

export function verifyAdminPin(pin: string, stored: string): boolean {
  const parts = stored.split(":");
  if (parts.length !== 2) return false;
  const [saltHex, hashHex] = parts;
  let salt: Buffer;
  let hash: Buffer;
  try {
    salt = Buffer.from(saltHex, "hex");
    hash = Buffer.from(hashHex, "hex");
  } catch {
    return false;
  }
  if (salt.length === 0 || hash.length !== SCRYPT_KEYLEN) return false;
  const test = scryptSync(pin, salt, SCRYPT_KEYLEN);
  return timingSafeEqual(hash, test);
}
