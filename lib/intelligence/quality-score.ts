import { QUESTION_PATTERN } from "./keyword-utils";
import type { OriginalityResult } from "./originality";
import type { EvidenceSummary } from "./evidence-scan";
import type { ReadabilityResult, KeywordStuffingResult } from "./seo-mechanics";
import type { StrategicFitResult } from "./strategic-fit";

/**
 * Quality Score Aggregator — the consolidated 8-category score from the
 * Editorial System architecture review, replacing the originally-proposed
 * 10 categories (Research Quality had no signal independent of Topical
 * Coverage; "SEO" alone was too vague to score directly — both folded into
 * more specific, already-computed dimensions below).
 *
 * Strategic Fit was added later, per the explicit instruction that a draft
 * should be approved not only because it's well written, but because it
 * strategically strengthens the site's overall topical authority — the
 * other seven categories all judge the draft in isolation; this one judges
 * it against the Topic Map cluster it belongs to (see strategic-fit.ts).
 *
 * Per the confirmed rollout decision: this 85-point minimum gates new
 * content only. It is not applied retroactively to already-published
 * articles, which get a separate, scheduled remediation pass instead.
 */

export type QualityCategory =
  | "Topical Coverage"
  | "Originality"
  | "Evidence / E-E-A-T"
  | "User Value"
  | "Strategic Fit"
  | "Search Intent Match"
  | "Internal Linking"
  | "SEO Mechanics";

const WEIGHTS: Record<QualityCategory, number> = {
  "Topical Coverage": 20,
  Originality: 20,
  "Evidence / E-E-A-T": 15,
  "User Value": 15,
  "Strategic Fit": 15,
  "Search Intent Match": 5,
  "Internal Linking": 5,
  "SEO Mechanics": 5,
};

// Only these five are floor-protected, per your explicit instruction that a
// strong overall score must never hide a critical weakness in one of them.
// A well-written article that duplicates existing content or does nothing
// for the site's topical authority shouldn't pass just because it reads
// well — Search Intent Match / Internal Linking / SEO Mechanics are real
// signals but not load-bearing enough to block publication on their own.
const FLOORS: Partial<Record<QualityCategory, number>> = {
  "Topical Coverage": 60,
  Originality: 50,
  "Evidence / E-E-A-T": 50,
  "User Value": 50,
  "Strategic Fit": 50,
};

export const MIN_PUBLISHABLE_SCORE = 85;

export interface CategoryScore {
  category: QualityCategory;
  score: number; // 0-100
  weight: number;
  floor?: number;
  passesFloor: boolean;
}

export interface QualityScoreResult {
  categories: CategoryScore[];
  weightedTotal: number;
  floorViolations: QualityCategory[];
  publishable: boolean;
  reasonIfBlocked?: string;
}

function scoreUserValue(draftHeadings: string[], bodyText: string, hasFaqSection: boolean): number {
  const lower = bodyText.toLowerCase();
  const checks = [
    hasFaqSection,
    /\bstep \d|\bstep one\b|\bstep-by-step\b/.test(lower),
    /\bcompar(e|ison|ing)\b|\bvs\.?\b|\bversus\b/.test(lower),
    draftHeadings.some((h) => /checklist/i.test(h)) || /(^|\n)\s*[-•]/.test(bodyText),
    /\bmistake|\bavoid\b|\btip\b/.test(lower),
  ];
  const passed = checks.filter(Boolean).length;
  return Math.round((passed / checks.length) * 100);
}

function scoreSearchIntentMatch(
  searchIntent: string,
  draftHeadings: string[],
  bodyText: string,
  hasFaqSection: boolean
): number {
  const lower = bodyText.toLowerCase();
  switch (searchIntent) {
    case "informational":
      return hasFaqSection || draftHeadings.some((h) => QUESTION_PATTERN.test(h.toLowerCase())) ? 100 : 50;
    case "commercial":
      return /\bcompar(e|ison|ing)\b|\bvs\.?\b|\bversus\b/.test(lower) ? 100 : 50;
    case "transactional":
      return /₦|\bprice\b|\bbook\b|\bdeposit\b/.test(lower) ? 100 : 50;
    case "navigational":
      // Navigational intent is satisfied by ranking on the right URL for the
      // right brand/business query, not by any particular content structure.
      return 100;
    default:
      return 70;
  }
}

function scoreSeoMechanics(readability: ReadabilityResult, stuffing: KeywordStuffingResult): number {
  const readabilityComponent = readability.fleschScore; // already 0-100
  const stuffingComponent = stuffing.stuffed ? 40 : 100;
  return Math.round(0.6 * readabilityComponent + 0.4 * stuffingComponent);
}

export interface QualityScoreInput {
  topicalCoverageScore: number;
  internalLinkingScore: number;
  originality: OriginalityResult;
  evidenceSummary: EvidenceSummary;
  readability: ReadabilityResult;
  stuffing: KeywordStuffingResult;
  searchIntent: string;
  draftHeadings: string[];
  bodyText: string;
  hasFaqSection: boolean;
  strategicFit: StrategicFitResult;
}

export function computeQualityScore(input: QualityScoreInput): QualityScoreResult {
  const userValueScore = scoreUserValue(input.draftHeadings, input.bodyText, input.hasFaqSection);
  const intentScore = scoreSearchIntentMatch(input.searchIntent, input.draftHeadings, input.bodyText, input.hasFaqSection);
  const seoMechanicsScore = scoreSeoMechanics(input.readability, input.stuffing);

  const raw: Record<QualityCategory, number> = {
    "Topical Coverage": input.topicalCoverageScore,
    Originality: input.originality.paraphraseScore,
    "Evidence / E-E-A-T": input.evidenceSummary.eeatSupportScore,
    "User Value": userValueScore,
    "Strategic Fit": input.strategicFit.score,
    "Search Intent Match": intentScore,
    "Internal Linking": input.internalLinkingScore,
    "SEO Mechanics": seoMechanicsScore,
  };

  const categories: CategoryScore[] = (Object.keys(WEIGHTS) as QualityCategory[]).map((category) => {
    const score = raw[category];
    const floor = FLOORS[category];
    return {
      category,
      score,
      weight: WEIGHTS[category],
      floor,
      passesFloor: floor === undefined || score >= floor,
    };
  });

  const weightedTotal = Math.round(
    categories.reduce((sum, c) => sum + (c.score * c.weight) / 100, 0)
  );

  const floorViolations = categories.filter((c) => !c.passesFloor).map((c) => c.category);
  const meetsMinimum = weightedTotal >= MIN_PUBLISHABLE_SCORE;
  const publishable = meetsMinimum && floorViolations.length === 0;

  let reasonIfBlocked: string | undefined;
  if (!publishable) {
    if (floorViolations.length > 0) {
      reasonIfBlocked = `Below the required floor in: ${floorViolations.join(", ")} — a strong total can't offset a critical weakness in these.`;
    } else {
      reasonIfBlocked = `Total score ${weightedTotal} is below the ${MIN_PUBLISHABLE_SCORE}-point minimum for new content.`;
    }
  }

  return { categories, weightedTotal, floorViolations, publishable, reasonIfBlocked };
}
