import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getArticleBriefByTopicKey } from "@/lib/intelligence/editorial-brief";
import type { QualityScoreResult } from "@/lib/intelligence/quality-score";
import { writeClient } from "@/sanity/write-client";

interface SaveScoreRequestBody {
  topicKey: string;
  qualityScore: QualityScoreResult;
}

// Session-gated by proxy.ts's normal /api/command-center middleware check.
// The only real write path for blogPost.qualityScore — a Verify Draft run
// alone never touches Sanity; this is the explicit, human-triggered "save
// this result" step, and only works once the brief has a real linked post.
export async function POST(req: NextRequest) {
  try {
    const body: SaveScoreRequestBody = await req.json();
    if (!body.topicKey || !body.qualityScore) {
      return NextResponse.json({ error: "topicKey and qualityScore are required" }, { status: 400 });
    }

    const brief = await getArticleBriefByTopicKey(body.topicKey);
    if (!brief) {
      return NextResponse.json({ error: `No content brief found for "${body.topicKey}".` }, { status: 404 });
    }
    if (!brief.linkedBlogPost?._ref) {
      return NextResponse.json(
        { error: "This brief has no linked blog post yet — set it in Studio once the article is published." },
        { status: 400 }
      );
    }

    await writeClient
      .patch(brief.linkedBlogPost._ref)
      .set({
        qualityScore: {
          weightedTotal: body.qualityScore.weightedTotal,
          publishable: body.qualityScore.publishable,
          floorViolations: body.qualityScore.floorViolations,
          categories: body.qualityScore.categories,
          computedAt: new Date().toISOString(),
        },
      })
      .commit();

    return NextResponse.json({ ok: true, blogPostId: brief.linkedBlogPost._ref });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
