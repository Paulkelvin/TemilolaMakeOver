import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { computeArticleBrief, persistArticleBrief } from "@/lib/intelligence/editorial-brief";

// Session-gated by proxy.ts's normal /api/command-center middleware check —
// no separate secret needed, same pattern as /api/command-center/run-now.
export async function POST(req: NextRequest) {
  try {
    const { topicKey } = await req.json();
    if (!topicKey || typeof topicKey !== "string") {
      return NextResponse.json({ error: "topicKey is required" }, { status: 400 });
    }

    const brief = await computeArticleBrief(topicKey);
    const { id } = await persistArticleBrief(brief);

    return NextResponse.json({ id, topicKey: brief.topicKey });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
