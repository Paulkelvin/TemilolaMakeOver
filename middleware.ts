import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function requireBasicAuth(
  request: NextRequest,
  password: string | undefined,
  realm: string
): NextResponse | null {
  if (!password) return null;

  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return new NextResponse("Authentication required", {
      status: 401,
      headers: { "WWW-Authenticate": `Basic realm="${realm}"` },
    });
  }

  const [, encoded] = authHeader.split(" ");
  const [, suppliedPassword] = atob(encoded ?? "").split(":");
  if (suppliedPassword !== password) {
    return new NextResponse("Invalid credentials", {
      status: 401,
      headers: { "WWW-Authenticate": `Basic realm="${realm}"` },
    });
  }

  return null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/studio")) {
    const denied = requireBasicAuth(request, process.env.SANITY_STUDIO_PASSWORD, "Sanity Studio");
    if (denied) return denied;
  }

  // Deliberately its own credential — never inherits SANITY_STUDIO_PASSWORD.
  // The Command Center will show revenue and customer data, so it gets its
  // own gate rather than being bolted onto the CMS editor's password.
  if (pathname.startsWith("/command-center") || pathname.startsWith("/api/command-center")) {
    if (pathname === "/api/command-center/snapshot" || pathname === "/api/command-center/weekly-review") return NextResponse.next();
    const denied = requireBasicAuth(request, process.env.COMMAND_CENTER_PASSWORD, "Business Command Center");
    if (denied) return denied;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/studio/:path*", "/command-center/:path*", "/api/command-center/:path*"],
};
