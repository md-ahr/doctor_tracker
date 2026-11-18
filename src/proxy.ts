import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has("dt_refresh");
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
