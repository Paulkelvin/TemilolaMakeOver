import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/command-center/session";

type AuthResult = { denied: NextResponse } | { role: "owner" | "staff" } | null;

// Basic Auth has no "stay logged in" concept — it's entirely up to the
// browser to cache the Authorization header, and mobile browsers in
// particular drop that cache quickly after backgrounding a tab. A signed
// session cookie (set by /api/cc-login) gives an actual, controllable
// session length instead.
function checkCommandCenterAuth(request: NextRequest): AuthResult {
  const ownerPw = process.env.COMMAND_CENTER_PASSWORD;
  const staffPw = process.env.COMMAND_CENTER_STAFF_PASSWORD;
  if (!ownerPw && !staffPw) return { role: "owner" };

  const role = verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  if (!role) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/cc-login";
    loginUrl.search = `?next=${encodeURIComponent(request.nextUrl.pathname)}`;
    return { denied: NextResponse.redirect(loginUrl) };
  }

  return { role };
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

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.toLowerCase() === "/temilolashyllon" && pathname !== "/TemilolaShyllon") {
    const url = request.nextUrl.clone();
    url.pathname = "/TemilolaShyllon";
    return NextResponse.redirect(url, 308);
  }

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
  matcher: [
    "/studio/:path*",
    "/command-center/:path*",
    "/api/command-center/:path*",
    "/:page([Tt][Ee][Mm][Ii][Ll][Oo][Ll][Aa][Ss][Hh][Yy][Ll][Ll][Oo][Nn])",
  ],
};
