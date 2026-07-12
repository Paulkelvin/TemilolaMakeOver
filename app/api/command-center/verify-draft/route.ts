import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getArticleBriefByTopicKey } from "@/lib/intelligence/editorial-brief";
import { scoreOriginality, extractLikelyHeadings } from "@/lib/intelligence/originality";
import { parseDraftBody, scanBlogBodyForEvidenceGaps, summarizeEvidenceGaps } from "@/lib/intelligence/evidence-scan";
import { recheckCoverage } from "@/lib/intelligence/coverage-recheck";
import { checkKeywordStuffing, scoreReadability, detectOpportunities } from "@/lib/intelligence/seo-mechanics";
import { computeQualityScore } from "@/lib/intelligence/quality-score";
import { computeStrategicFit } from "@/lib/intelligence/strategic-fit";
import { simulateArticleImpact } from "@/lib/intelligence/authority-simulator";

interface VerifyRequestBody {
  topicKey: string;
  draftBodyText: string;
  draftLinkedPaths: string[];
  hasFaqSection: boolean;
  imageCount: number;
  videoEmbedCount: number;
  sourceTextOverride?: string;
}

// Session-gated by proxy.ts's normal /api/command-center middleware check.
export async function POST(req: NextRequest) {
  try {
    const body: VerifyRequestBody = await req.json();
    const brief = await getArticleBriefByTopicKey(body.topicKey);
    if (!brief) {
      return NextResponse.json({ error: `No content brief found for "${body.topicKey}" — compile one first.` }, { status: 404 });
    }

    // The writer marks section breaks with "## Heading" lines directly in the
    // body textarea, so headings and paragraphs are parsed in the real order
    // they were written — required for evidence-gap nearestHeading tracking
    // to attribute a gap to the section it actually appears in.
    const { headings: draftHeadings, blocks: draftBlocks, plainBodyText } = parseDraftBody(body.draftBodyText);

    // sourceTextOverride is sent as-is (including an explicit empty string
    // when the writer clears the field) — nullish coalescing only falls back
    // to the saved brief material when the field is truly absent.
    const sourceText = body.sourceTextOverride ?? brief.sourceMaterial ?? "";
    if (!sourceText.trim()) {
      return NextResponse.json(
        { error: "No source material to check originality against — paste it into the brief's Source Material field in Studio, or into this form." },
        { status: 400 }
      );
    }

    const originality = scoreOriginality({
      draftText: plainBodyText,
      draftHeadings,
      sourceTexts: [sourceText],
      sourceHeadings: extractLikelyHeadings(sourceText),
    });

    const evidenceGaps = scanBlogBodyForEvidenceGaps(draftBlocks);
    const evidenceSummary = summarizeEvidenceGaps(evidenceGaps);

    const coverage = recheckCoverage(brief, draftHeadings, plainBodyText, body.draftLinkedPaths);

    const strategicFit = await computeStrategicFit({
      clusterId: brief.clusterId,
      clusterLabel: brief.clusterLabel,
      topicLabel: brief.topicLabel,
      draftHeadings,
      draftBodyText: plainBodyText,
      draftLinkedPaths: body.draftLinkedPaths,
    });

    const simulation = await simulateArticleImpact({
      clusterId: brief.clusterId,
      clusterLabel: brief.clusterLabel,
      topicLabel: brief.topicLabel,
      draftHeadings,
      draftBodyText: plainBodyText,
      draftLinkedPaths: body.draftLinkedPaths,
    });

    const readability = scoreReadability(plainBodyText);
    const stuffing = checkKeywordStuffing(plainBodyText);
    const opportunities = detectOpportunities(
      draftHeadings,
      plainBodyText,
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
      draftHeadings,
      bodyText: plainBodyText,
      hasFaqSection: body.hasFaqSection,
      strategicFit,
    });

    return NextResponse.json({
      originality,
      evidenceGaps,
      evidenceSummary,
      coverage,
      readability,
      stuffing,
      opportunities,
      strategicFit,
      simulation,
      qualityScore,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
