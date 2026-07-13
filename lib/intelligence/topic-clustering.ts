import { normalizeQuery, overlapScore, deriveConfidenceLevel, CONFIDENCE_SCORE, type ConfidenceLevel } from "./keyword-utils";

/**
 * Shared candidate-clustering logic for anything that mines multiple
 * independent sources for Topic Map candidates and needs to merge
 * duplicate mentions of the same underlying topic into one scored result.
 * Originally built inside topic-suggestions.ts; extracted here so the
 * Initial Topic Map Wizard (a one-shot, whole-tree version of the same
 * mining+merging) reuses it instead of duplicating it.
 */

export type SuggestionSource =
  | "competitor-gap"
  | "search-console"
  | "keyword-discovery"
  | "autocomplete"
  | "recurring-entity"
  | "taxonomy";

export interface SuggestionEvidence {
  source: SuggestionSource;
  detail: string;
  priorityScore: number;
}

export interface RawCandidate {
  label: string;
  tokens: string[];
  source: SuggestionSource;
  detail: string;
  priorityScore: number;
}

export function candidate(label: string, source: SuggestionSource, detail: string, priorityScore: number): RawCandidate {
  return { label, tokens: normalizeQuery(label).tokens, source, detail, priorityScore: Math.round(Math.max(0, Math.min(100, priorityScore))) };
}

export interface CandidateBucket {
  representative: RawCandidate;
  evidence: SuggestionEvidence[];
  sources: Set<SuggestionSource>;
}

// Greedy single-pass clustering, same tradeoff matchContent's tiebreak
// documents elsewhere in this codebase: not exhaustive, but simple and
// transparent, and good enough given every source already scores its own
// candidates independently.
//
// Representative-label selection is NOT a pure highest-priority-score pick:
// a "taxonomy" candidate is the site's real, already-published, human-approved
// name for that topic (e.g. "Photoshoot Makeup"), so it always wins the
// representative slot over raw mined phrasing ("Baby Girl Makeup Photoshoot
// Quotes Funny") even when the mined candidate's own priority score is
// higher — otherwise the Topic Map ends up labeled with search-query noise
// instead of the real service/style/occasion name it's anchored to.
export function mergeCandidates(candidates: RawCandidate[], mergeOverlapThreshold: number): CandidateBucket[] {
  const buckets: CandidateBucket[] = [];
  for (const c of candidates) {
    const bucket = buckets.find((b) => overlapScore(c.tokens, b.representative.tokens) >= mergeOverlapThreshold);
    const target = bucket ?? { representative: c, evidence: [], sources: new Set<SuggestionSource>() };
    if (!bucket) buckets.push(target);
    target.evidence.push({ source: c.source, detail: c.detail, priorityScore: c.priorityScore });
    target.sources.add(c.source);
    const representativeIsTaxonomy = target.representative.source === "taxonomy";
    if (c.source === "taxonomy" && !representativeIsTaxonomy) {
      target.representative = c;
    } else if (!representativeIsTaxonomy && c.priorityScore > target.representative.priorityScore) {
      target.representative = c;
    }
  }
  return buckets;
}

// Distinct autocomplete completions (or SC query variants) from the same
// seed routinely merge into one bucket carrying the identical detail
// string several times over — real signal, but showing a human reviewer
// the same evidence line 6+ times reads as broken. One line per unique
// (source, detail) pair, counted, is the honest summary.
export function dedupeEvidence(evidence: SuggestionEvidence[]): SuggestionEvidence[] {
  const byKey = new Map<string, SuggestionEvidence & { count: number }>();
  for (const e of evidence) {
    const key = `${e.source}::${e.detail}`;
    const existing = byKey.get(key);
    if (existing) {
      existing.count += 1;
      existing.priorityScore = Math.max(existing.priorityScore, e.priorityScore);
    } else {
      byKey.set(key, { ...e, count: 1 });
    }
  }
  return Array.from(byKey.values()).map(({ count, ...e }) => ({
    ...e,
    detail: count > 1 ? `${e.detail} (×${count})` : e.detail,
  }));
}

export interface BucketScore {
  priorityScore: number;
  confidenceLabel: ConfidenceLevel;
  confidenceScore: number;
}

// Scored from the deduped evidence, not the raw bucket — otherwise a
// candidate that happened to collapse many identical autocomplete
// completions into one bucket would have its average pulled toward that
// one repeated score far more than its actual distinct signal warrants.
export function scoreBucket(dedupedEvidence: SuggestionEvidence[], sourceCount: number): BucketScore {
  const avg = dedupedEvidence.reduce((sum, e) => sum + e.priorityScore, 0) / dedupedEvidence.length;
  const convergenceBonus = Math.min(45, (sourceCount - 1) * 15);
  const priorityScore = Math.round(Math.min(100, avg + convergenceBonus));
  const confidenceLabel = deriveConfidenceLevel(sourceCount);
  const confidenceScore = CONFIDENCE_SCORE[confidenceLabel];
  return { priorityScore, confidenceLabel, confidenceScore };
}
