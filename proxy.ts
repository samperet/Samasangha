import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  DEEPENING_COOKIE,
  verifyDeepeningToken,
  verifySessionToken,
} from "@/lib/admin-token";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Mureed-only PDFs — unlocked by the deepening password (or an admin session).
  // Unauthenticated requests land on the gate page instead of the file.
  if (pathname.startsWith("/assets/deepening/")) {
    const ok =
      (await verifyDeepeningToken(request.cookies.get(DEEPENING_COOKIE)?.value)) ||
      (await verifySessionToken(request.cookies.get(ADMIN_COOKIE)?.value));
    if (!ok) {
      return NextResponse.redirect(new URL("/teachings/deepening", request.url));
    }
    return NextResponse.next();
  }

  // Admin pages
  const isLoginPage = pathname === "/admin/login";
  if (isLoginPage) return NextResponse.next();

  const ok = await verifySessionToken(request.cookies.get(ADMIN_COOKIE)?.value);
  if (!ok) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/assets/deepening/:path*"],
};
