import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { approveTopicSuggestion, rejectTopicSuggestion } from "@/lib/intelligence/topic-suggestions";

// Session-gated by proxy.ts's normal /api/command-center middleware check —
// no separate secret needed, same pattern as /api/command-center/compile-brief.
export async function POST(req: NextRequest) {
  try {
    const { suggestionId, action } = await req.json();
    if (!suggestionId || typeof suggestionId !== "string") {
      return NextResponse.json({ error: "suggestionId is required" }, { status: 400 });
    }
    if (action !== "approve" && action !== "reject") {
      return NextResponse.json({ error: 'action must be "approve" or "reject"' }, { status: 400 });
    }

    if (action === "approve") {
      const { createdTopicNodeId } = await approveTopicSuggestion(suggestionId);
      return NextResponse.json({ createdTopicNodeId });
    }

    await rejectTopicSuggestion(suggestionId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    // err.message here is always our own deliberately-authored, safe text
    // (e.g. "Suggestion is already approved.") — logged too so a genuinely
    // unexpected exception is still visible server-side.
    console.error("[topic-suggestion-action]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
