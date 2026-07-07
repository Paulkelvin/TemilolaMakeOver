import { NextResponse } from "next/server";
import { runSnapshot } from "@/app/api/command-center/snapshot/route";

export const dynamic = "force-dynamic";

// Manual trigger for the logged-in Command Center dashboard — reuses the
// exact same computation as the scheduled cron. Unlike /snapshot (which
// intentionally bypasses session auth so an external cron can call it with
// just CRON_SECRET), this route is gated by the normal /api/command-center
// session cookie check in proxy.ts, so no separate secret is needed here.
export async function POST() {
  try {
    const result = await runSnapshot();
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
