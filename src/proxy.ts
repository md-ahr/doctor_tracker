import { NextResponse, type NextRequest } from "next/server";

import { REFRESH_COOKIE, SESSION_MARKER_COOKIE } from "@/lib/auth/cookies";

export function proxy(request: NextRequest) {
  const hasSession =
    request.cookies.has(REFRESH_COOKIE) || request.cookies.has(SESSION_MARKER_COOKIE);
  const isLogin = request.nextUrl.pathname === "/login";
  const isRoot = request.nextUrl.pathname === "/";

  if (!hasSession && !isLogin) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (hasSession && (isLogin || isRoot)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/dashboard/:path*", "/doctors/:path*", "/patients/:path*"],
};
