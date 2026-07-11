import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getArticleBriefByTopicKey } from "@/lib/intelligence/editorial-brief";
import { scoreOriginality } from "@/lib/intelligence/originality";
import { scanBlogBodyForEvidenceGaps, summarizeEvidenceGaps, type PortableTextBlockLite } from "@/lib/intelligence/evidence-scan";
import { recheckCoverage } from "@/lib/intelligence/coverage-recheck";
import { checkKeywordStuffing, scoreReadability, detectOpportunities } from "@/lib/intelligence/seo-mechanics";
import { computeQualityScore } from "@/lib/intelligence/quality-score";

interface VerifyRequestBody {
  topicKey: string;
  draftHeadings: string[];
  draftBodyText: string;
  draftLinkedPaths: string[];
  hasFaqSection: boolean;
  imageCount: number;
  videoEmbedCount: number;
  sourceTextOverride?: string;
}

// Turns the plain paragraphs a writer pastes into the verification form into
// the same lightweight block shape the evidence scanner reads from real
// Portable Text — headings get their own "block" so nearestHeading tracking
// still works, without requiring the writer to already have real Sanity blocks.
function toPortableTextLite(headings: string[], bodyText: string): PortableTextBlockLite[] {
  const blocks: PortableTextBlockLite[] = [];
  headings.forEach((h, i) => {
    blocks.push({ _key: `h${i}`, _type: "block", style: "h2", children: [{ text: h }] });
  });
  bodyText
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .forEach((p, i) => {
      blocks.push({ _key: `p${i}`, _type: "block", style: "normal", children: [{ text: p }] });
    });
  return blocks;
}

// Session-gated by proxy.ts's normal /api/command-center middleware check.
export async function POST(req: NextRequest) {
  try {
    const body: VerifyRequestBody = await req.json();
    const brief = await getArticleBriefByTopicKey(body.topicKey);
    if (!brief) {
      return NextResponse.json({ error: `No content brief found for "${body.topicKey}" — compile one first.` }, { status: 404 });
    }

    const sourceText = body.sourceTextOverride ?? brief.sourceMaterial ?? "";
    if (!sourceText.trim()) {
      return NextResponse.json(
        { error: "No source material to check originality against — paste it into the brief's Source Material field in Studio, or into this form." },
        { status: 400 }
      );
    }

    const originality = scoreOriginality({
      draftText: body.draftBodyText,
      draftHeadings: body.draftHeadings,
      sourceTexts: [sourceText],
      sourceHeadings: [], // no structured heading extraction for hand-pasted source text yet — lexical check still runs fully
    });

    const evidenceGaps = scanBlogBodyForEvidenceGaps(toPortableTextLite(body.draftHeadings, body.draftBodyText));
    const evidenceSummary = summarizeEvidenceGaps(evidenceGaps);

    const coverage = recheckCoverage(brief, body.draftHeadings, body.draftBodyText, body.draftLinkedPaths);

    const readability = scoreReadability(body.draftBodyText);
    const stuffing = checkKeywordStuffing(body.draftBodyText);
    const opportunities = detectOpportunities(
      body.draftHeadings,
      body.draftBodyText,
      body.hasFaqSection,
      body.imageCount,
      body.videoEmbedCount,
      brief.targetQueries
    );

    const qualityScore = computeQualityScore({
      topicalCoverageScore: coverage.topicalCoverageScore,
      internalLinkingScore: coverage.internalLinkingScore,
      originality,
      evidenceSummary,
      readability,
      stuffing,
      searchIntent: brief.searchIntent,
      draftHeadings: body.draftHeadings,
      bodyText: body.draftBodyText,
      hasFaqSection: body.hasFaqSection,
    });

    return NextResponse.json({
      originality,
      evidenceGaps,
      evidenceSummary,
      coverage,
      readability,
      stuffing,
      opportunities,
      qualityScore,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
