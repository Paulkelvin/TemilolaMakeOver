// Shared in-memory rate limiter for public API routes. Per-instance and
// resets on cold start/redeploy — a deliberate tradeoff (no external store
// needed) rather than a real distributed limiter, but it's the same bar
// every route here already accepted before this was extracted from three
// separate byte-identical copies (booking, ask-question, paystack/initialize).
const buckets = new Map<string, { count: number; resetAt: number }>();

export function isRateLimited(key: string, opts: { windowMs: number; max: number }): boolean {
  const now = Date.now();
  const entry = buckets.get(key);

  if (!entry || now > entry.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + opts.windowMs });
    return false;
  }

  entry.count++;
  return entry.count > opts.max;
}

export function getClientIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}
