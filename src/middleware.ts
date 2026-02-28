// middleware.ts
import { NextRequest, NextResponse } from "next/server";
const PUBLIC_PATHS = ["/login", "/register", "/_next", "/api/public","/verify_Email","/forgot-password","/reset-password"]; // Add other public paths as needed
export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const { pathname } = req.nextUrl;
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }
  console.log("Middleware checking authentication for path:", pathname);
  if (!req.cookies.has("access_token")) {
  url.pathname = "/login";
  return NextResponse.redirect(url);
}
}

export const config = {
  matcher: ["/:path*"],
};
