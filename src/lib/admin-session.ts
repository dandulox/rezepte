import { createHmac } from "node:crypto";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin-constants";
import { getAdminSessionSecret } from "@/lib/admin-session-secret";

const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 7;

export { getAdminSessionSecret };

export function signAdminSessionToken(expSec: number, secret: string): string {
  const expStr = String(expSec);
  const sig = createHmac("sha256", secret).update(expStr).digest("hex");
  return `${expStr}:${sig}`;
}

function cookieBaseOptions() {
  return {
    httpOnly: true as const,
    sameSite: "lax" as const,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE_SEC,
  };
}

export async function setAdminSessionCookie(): Promise<void> {
  const secret = getAdminSessionSecret();
  const expSec = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SEC;
  const value = signAdminSessionToken(expSec, secret);
  const jar = await cookies();
  jar.set(ADMIN_SESSION_COOKIE, value, cookieBaseOptions());
}

export async function clearAdminSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.set(ADMIN_SESSION_COOKIE, "", {
    ...cookieBaseOptions(),
    maxAge: 0,
  });
}

export async function isAdminSessionValid(): Promise<boolean> {
  let secret: string;
  try {
    secret = getAdminSessionSecret();
  } catch {
    return false;
  }
  const { verifyAdminSessionToken } = await import("@/lib/admin-session-verify");
  const jar = await cookies();
  const token = jar.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return false;
  return verifyAdminSessionToken(token, secret);
}
