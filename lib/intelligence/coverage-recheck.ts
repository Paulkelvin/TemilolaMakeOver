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
  // A vacuous 100 (nothing was required) reads identically to "everything
  // required was actually covered" unless callers check these — an empty
  // brief must not be mistaken for a fully-covered one.
  subtopicsRequired: boolean;
  linksRequired: boolean;
}

const SUBTOPIC_COVERED_THRESHOLD = 0.25; // same floor internal-links.ts/editorial-brief.ts use for "real match"

function splitSections(draftHeadings: string[], draftBodyText: string): string[] {
  const paragraphs = draftBodyText
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  return [...draftHeadings, ...paragraphs];
}

export function recheckCoverage(
  brief: Pick<ArticleBrief, "requiredSubtopics" | "requiredInternalLinks">,
  draftHeadings: string[],
  draftBodyText: string,
  draftLinkedPaths: string[]
): CoverageRecheckResult {
  // Comparing a short subtopic label against each individual section
  // (heading or paragraph) rather than the whole flattened article keeps
  // overlapScore's subset-containment shortcut meaningful: it only fires
  // when the subtopic's words are concentrated together in one real section,
  // not merely scattered anywhere across a long draft.
  const sectionTokenSets = splitSections(draftHeadings, draftBodyText).map((s) => normalizeQuery(s).tokens);

  const subtopics: SubtopicCoverageResult[] = brief.requiredSubtopics.map((s) => {
    const subtopicTokens = normalizeQuery(s.label).tokens;
    const bestOverlap = sectionTokenSets.reduce(
      (max, sectionTokens) => Math.max(max, overlapScore(subtopicTokens, sectionTokens)),
      0
    );
    return { label: s.label, covered: bestOverlap >= SUBTOPIC_COVERED_THRESHOLD, bestOverlap: Math.round(bestOverlap * 100) / 100 };
  });

  const linkedPathSet = new Set(draftLinkedPaths.map((p) => p.replace(/\/$/, "")));
  const internalLinks: InternalLinkCoverageResult[] = brief.requiredInternalLinks.map((l) => ({
    targetPath: l.targetPath,
    targetLabel: l.targetLabel,
    linked: linkedPathSet.has(l.targetPath.replace(/\/$/, "")),
  }));

  const subtopicsRequired = subtopics.length > 0;
  const linksRequired = internalLinks.length > 0;
  const topicalCoverageScore = subtopicsRequired
    ? Math.round((subtopics.filter((s) => s.covered).length / subtopics.length) * 100)
    : 100;
  const internalLinkingScore = linksRequired
    ? Math.round((internalLinks.filter((l) => l.linked).length / internalLinks.length) * 100)
    : 100;

  return { subtopics, internalLinks, topicalCoverageScore, internalLinkingScore, subtopicsRequired, linksRequired };
}
