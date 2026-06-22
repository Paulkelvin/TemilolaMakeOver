import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/studio")) {
    const authHeader = request.headers.get("authorization");
    const studioPassword = process.env.SANITY_STUDIO_PASSWORD;

    if (studioPassword && !authHeader) {
      return new NextResponse("Authentication required", {
        status: 401,
        headers: { "WWW-Authenticate": 'Basic realm="Sanity Studio"' },
      });
    }

    if (studioPassword && authHeader) {
      const [, encoded] = authHeader.split(" ");
      const [, password] = atob(encoded ?? "").split(":");
      if (password !== studioPassword) {
        return new NextResponse("Invalid credentials", {
          status: 401,
          headers: { "WWW-Authenticate": 'Basic realm="Sanity Studio"' },
        });
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/studio/:path*"],
};
