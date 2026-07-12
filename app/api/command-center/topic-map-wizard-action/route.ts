import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  computeInitialTopicMapProposal,
  persistWizardProposal,
  approveWizardProposal,
  discardWizardProposal,
} from "@/lib/intelligence/topic-map-wizard";

// Session-gated by proxy.ts's normal /api/command-center middleware check —
// no separate secret needed, same pattern as /api/command-center/compile-brief.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "generate") {
      const nodes = await computeInitialTopicMapProposal();
      const { id } = await persistWizardProposal(nodes);
      return NextResponse.json({ id, nodeCount: nodes.length });
    }

    if (action === "approve" || action === "discard") {
      const { proposalId } = body;
      if (!proposalId || typeof proposalId !== "string") {
        return NextResponse.json({ error: "proposalId is required" }, { status: 400 });
      }
      if (action === "approve") {
        const { createdNodeCount } = await approveWizardProposal(proposalId);
        return NextResponse.json({ createdNodeCount });
      }
      await discardWizardProposal(proposalId);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: 'action must be "generate", "approve", or "discard"' }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
