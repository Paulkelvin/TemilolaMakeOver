import { NextResponse } from "next/server";
import { verifyPassword, createSessionToken, SESSION_COOKIE, SESSION_DURATION_MS } from "@/lib/command-center/session";
import { isRateLimited, getClientIp } from "@/lib/rate-limit";

// Every attempt counts against the same window (not just failures) — this
// is the login endpoint for a single shared password with no separate
// username, so there's nothing else to key a lockout on besides IP.
const LOGIN_WINDOW_MS = 15 * 60_000;
const LOGIN_MAX_ATTEMPTS = 5;

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (isRateLimited(`cc-login:${ip}`, { windowMs: LOGIN_WINDOW_MS, max: LOGIN_MAX_ATTEMPTS })) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again in 15 minutes." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const password = typeof body?.password === "string" ? body.password : "";

  const role = verifyPassword(password);
  if (!role) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true, role });
  res.cookies.set(SESSION_COOKIE, createSessionToken(role), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_MS / 1000,
  });
  return res;
}
