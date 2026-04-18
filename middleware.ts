import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin-constants";
import { getAdminSessionSecret } from "@/lib/admin-session-secret";
import { verifyAdminSessionToken } from "@/lib/admin-session-verify";

const VISITOR_COOKIE = "rezeptVisitor";

const visitorOpts = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 400,
  secure: process.env.NODE_ENV === "production",
};

function ensureVisitorCookie(response: NextResponse, request: NextRequest) {
  if (!request.cookies.get(VISITOR_COOKIE)?.value) {
    response.cookies.set(VISITOR_COOKIE, crypto.randomUUID(), visitorOpts);
  }
}

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  ensureVisitorCookie(res, request);

  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    let secret: string;
    try {
      secret = getAdminSessionSecret();
    } catch {
      const redirectRes = NextResponse.redirect(new URL("/admin/login", request.url));
      ensureVisitorCookie(redirectRes, request);
      return redirectRes;
    }
    const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    const ok = token ? await verifyAdminSessionToken(token, secret) : false;
    if (!ok) {
      const redirectRes = NextResponse.redirect(new URL("/admin/login", request.url));
      ensureVisitorCookie(redirectRes, request);
      return redirectRes;
    }
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
