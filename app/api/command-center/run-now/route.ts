import { NextResponse } from "next/server";
import { runSnapshot } from "@/app/api/command-center/snapshot/route";

export const dynamic = "force-dynamic";
// Force-recomputing all 6 intelligence engines can take a few minutes —
// well past Vercel's default function timeout, which was silently killing
// this request mid-flight (client saw it as a dropped-connection network
// error, not a clean response). Raise it as high as the plan allows; on
// plans with a lower hard cap this is simply clamped down, never an error.
export const maxDuration = 300;

// Manual trigger for the logged-in Command Center dashboard — reuses the
// exact same computation as the scheduled cron. Unlike /snapshot (which
// intentionally bypasses session auth so an external cron can call it with
// just CRON_SECRET), this route is gated by the normal /api/command-center
// session cookie check in proxy.ts, so no separate secret is needed here.
export async function POST() {
  try {
    const result = await runSnapshot({ force: true });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
