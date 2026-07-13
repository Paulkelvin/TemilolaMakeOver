import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { toggleRoadmapAction, setRoadmapObjectiveStatus } from "@/lib/intelligence/editorial-roadmap";

// Session-gated by proxy.ts's normal /api/command-center middleware check.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { objectiveId, action } = body;
    if (!objectiveId || typeof objectiveId !== "string") {
      return NextResponse.json({ error: "objectiveId is required" }, { status: 400 });
    }

    if (action === "toggle-action") {
      const { actionIndex } = body;
      if (typeof actionIndex !== "number") {
        return NextResponse.json({ error: "actionIndex is required" }, { status: 400 });
      }
      await toggleRoadmapAction(objectiveId, actionIndex);
      return NextResponse.json({ ok: true });
    }

    if (action === "set-status") {
      const { status } = body;
      if (status !== "new" && status !== "in_progress" && status !== "done") {
        return NextResponse.json({ error: 'status must be "new", "in_progress", or "done"' }, { status: 400 });
      }
      await setRoadmapObjectiveStatus(objectiveId, status);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: 'action must be "toggle-action" or "set-status"' }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
