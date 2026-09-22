import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "./lib/auth/session-token";

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Protected paths
  const isProtectedPath = pathname.startsWith("/dashboard") || pathname.startsWith("/api/sbs");

  if (!isProtectedPath) {
    return NextResponse.next();
  }

  const token = req.cookies.get("sbs_session")?.value;

  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Unauthorized: Valid SBS authenticated session required" },
        { status: 401 }
      );
    }
    const loginUrl = new URL("/auth", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Cryptographically verify session token
  const payload = await verifySessionToken(token);
  if (!payload) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Unauthorized: Session token is invalid or expired" },
        { status: 401 }
      );
    }
    const loginUrl = new URL("/auth", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    loginUrl.searchParams.set("error", "session_expired");
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("sbs_session");
    return response;
  }

  // Session is authentic and unexpired
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/sbs/:path*"],
};
