import { createHmac, timingSafeEqual } from "crypto";

export const SESSION_COOKIE = "cc_session";
export const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export type CommandCenterRole = "owner" | "staff";

// Stateless signed cookie — no session store needed. The signing key is
// derived from the two configured passwords, so it stays stable across
// requests/deploys without a dedicated secret env var, and changes (and
// invalidates all existing sessions) the moment either password is rotated.
function sessionSecret(): string {
  const owner = process.env.COMMAND_CENTER_PASSWORD ?? "";
  const staff = process.env.COMMAND_CENTER_STAFF_PASSWORD ?? "";
  return `${owner}|${staff}`;
}

function sign(payload: string): string {
  return createHmac("sha256", sessionSecret()).update(payload).digest("hex");
}

export function createSessionToken(role: CommandCenterRole): string {
  const expiresAt = Date.now() + SESSION_DURATION_MS;
  const payload = `${role}.${expiresAt}`;
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined | null): CommandCenterRole | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [role, expiresAtStr, signature] = parts;
  if (role !== "owner" && role !== "staff") return null;

  const expiresAt = Number(expiresAtStr);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return null;

  const expected = sign(`${role}.${expiresAtStr}`);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  return role;
}

export function verifyPassword(password: string): CommandCenterRole | null {
  const ownerPw = process.env.COMMAND_CENTER_PASSWORD;
  const staffPw = process.env.COMMAND_CENTER_STAFF_PASSWORD;
  if (ownerPw && password === ownerPw) return "owner";
  if (staffPw && password === staffPw) return "staff";
  return null;
}
