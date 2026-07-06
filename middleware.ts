import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type AuthResult = { denied: NextResponse } | { role: "owner" | "staff" } | null;

function checkCommandCenterAuth(request: NextRequest): AuthResult {
  const ownerPw = process.env.COMMAND_CENTER_PASSWORD;
  const staffPw = process.env.COMMAND_CENTER_STAFF_PASSWORD;
  if (!ownerPw && !staffPw) return { role: "owner" };

  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return {
      denied: new NextResponse("Authentication required", {
        status: 401,
        headers: { "WWW-Authenticate": `Basic realm="Business Command Center"` },
      }),
    };
  }

  const [, encoded] = authHeader.split(" ");
  const [, suppliedPassword] = atob(encoded ?? "").split(":");

  if (ownerPw && suppliedPassword === ownerPw) return { role: "owner" };
  if (staffPw && suppliedPassword === staffPw) return { role: "staff" };

  return {
    denied: new NextResponse("Invalid credentials", {
      status: 401,
      headers: { "WWW-Authenticate": `Basic realm="Business Command Center"` },
    }),
  };
}

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

  if (pathname.startsWith("/command-center") || pathname.startsWith("/api/command-center")) {
    if (pathname === "/api/command-center/snapshot" || pathname === "/api/command-center/weekly-review") return NextResponse.next();

    const result = checkCommandCenterAuth(request);
    if (result && "denied" in result) return result.denied;

    const role = result?.role ?? "owner";
    const headers = new Headers(request.headers);
    headers.set("x-cc-role", role);
    return NextResponse.next({ request: { headers } });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/studio/:path*", "/command-center/:path*", "/api/command-center/:path*"],
};
