import { NextRequest, NextResponse } from "next/server";

import { DASHBOARD_HOME, TOKEN_COOKIE } from "@/lib/constants";
import { decodeJwtPayload, isTokenExpired } from "@/lib/jwt";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get(TOKEN_COOKIE)?.value;
  const payload = token ? decodeJwtPayload(token) : null;
  const isAuthenticated = payload !== null && !isTokenExpired(payload);

  // A token we can't decode (or that expired) is useless — drop it.
  const withClearedCookie = (res: NextResponse) => {
    if (token && !isAuthenticated) res.cookies.delete(TOKEN_COOKIE);
    return res;
  };

  if (pathname.startsWith("/auth")) {
    if (isAuthenticated) {
      return NextResponse.redirect(
        new URL(DASHBOARD_HOME[payload.role] ?? "/", request.url)
      );
    }
    return withClearedCookie(NextResponse.next());
  }

  if (pathname.startsWith("/dashboard")) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return withClearedCookie(NextResponse.redirect(loginUrl));
    }

    const roleHome = DASHBOARD_HOME[payload.role] ?? "/";

    const section = pathname.split("/")[2]; // tenant | landlord | admin | undefined
    const requiredRole = { tenant: "TENANT", landlord: "LANDLORD", admin: "ADMIN" }[
      section ?? ""
    ];

    if (!requiredRole || requiredRole !== payload.role) {
      // Bare /dashboard or a section for another role → own dashboard.
      return NextResponse.redirect(new URL(roleHome, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*"],
};
