import { normalizeQuery, overlapScore } from "./keyword-utils";
import type { ArticleBrief } from "./editorial-brief";

/**
 * Coverage Re-check — the actual scoring half of what the 10-phase proposal
 * called the "Topical Coverage Engine". A Content Brief (editorial-brief.ts)
 * is only a checklist; this is what diffs a real finished draft against
 * that checklist to see what was actually covered, reusing the exact
 * overlapScore() matching every other engine in this codebase already uses
 * — no separate scoring model invented for this one check.
 */

export interface SubtopicCoverageResult {
  label: string;
  covered: boolean;
  bestOverlap: number;
}

export interface InternalLinkCoverageResult {
  targetPath: string;
  targetLabel: string;
  linked: boolean;
}

export interface CoverageRecheckResult {
  subtopics: SubtopicCoverageResult[];
  internalLinks: InternalLinkCoverageResult[];
  topicalCoverageScore: number; // 0-100, % of required subtopics covered
  internalLinkingScore: number; // 0-100, % of required links present
}

const SUBTOPIC_COVERED_THRESHOLD = 0.25; // same floor internal-links.ts/editorial-brief.ts use for "real match"

export function recheckCoverage(
  brief: Pick<ArticleBrief, "requiredSubtopics" | "requiredInternalLinks">,
  draftHeadings: string[],
  draftBodyText: string,
  draftLinkedPaths: string[]
): CoverageRecheckResult {
  const draftTokens = normalizeQuery(`${draftHeadings.join(" ")} ${draftBodyText}`).tokens;

  const subtopics: SubtopicCoverageResult[] = brief.requiredSubtopics.map((s) => {
    const subtopicTokens = normalizeQuery(s.label).tokens;
    const overlap = overlapScore(subtopicTokens, draftTokens);
    return { label: s.label, covered: overlap >= SUBTOPIC_COVERED_THRESHOLD, bestOverlap: Math.round(overlap * 100) / 100 };
  });

  const linkedPathSet = new Set(draftLinkedPaths.map((p) => p.replace(/\/$/, "")));
  const internalLinks: InternalLinkCoverageResult[] = brief.requiredInternalLinks.map((l) => ({
    targetPath: l.targetPath,
    targetLabel: l.targetLabel,
    linked: linkedPathSet.has(l.targetPath.replace(/\/$/, "")),
  }));

  const topicalCoverageScore =
    subtopics.length === 0 ? 100 : Math.round((subtopics.filter((s) => s.covered).length / subtopics.length) * 100);
  const internalLinkingScore =
    internalLinks.length === 0 ? 100 : Math.round((internalLinks.filter((l) => l.linked).length / internalLinks.length) * 100);

  return { subtopics, internalLinks, topicalCoverageScore, internalLinkingScore };
}
