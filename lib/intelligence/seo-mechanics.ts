import { QUESTION_PATTERN, VISUAL_PATTERN } from "./keyword-utils";

/**
 * SEO Mechanics — the small, genuinely-new part of what the 10-phase
 * proposal called the "SEO Engine". Everything else that phase asked for
 * (internal linking, entity coverage, cannibalization) already exists as
 * its own engine; this covers only what those don't: readability, keyword
 * stuffing, and simple opportunity flags — cheap formulas, not a new engine
 * in its own right.
 */

export interface KeywordStuffingResult {
  stuffed: boolean;
  worstTerm?: string;
  worstRatio: number; // fraction of total words
}

const STUFFING_THRESHOLD = 0.03; // a single term making up >3% of the article reads as stuffed, not natural

export function checkKeywordStuffing(bodyText: string): KeywordStuffingResult {
  const words = bodyText.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return { stuffed: false, worstRatio: 0 };

  const counts = new Map<string, number>();
  for (const w of words) {
    const clean = w.replace(/[^\p{L}\p{N}]/gu, "");
    if (clean.length < 4) continue; // short/stop words naturally repeat, not a signal
    counts.set(clean, (counts.get(clean) ?? 0) + 1);
  }

  let worstTerm: string | undefined;
  let worstCount = 0;
  for (const [term, count] of counts) {
    if (count > worstCount) {
      worstCount = count;
      worstTerm = term;
    }
  }

  const worstRatio = words.length === 0 ? 0 : Math.round((worstCount / words.length) * 1000) / 1000;
  return { stuffed: worstRatio > STUFFING_THRESHOLD, worstTerm, worstRatio };
}

// Simplified Flesch Reading Ease — approximate syllable counting via vowel
// groups, which is standard for a dependency-free implementation. Accurate
// enough to flag "this reads dense" vs "this reads easily", not meant as a
// precise linguistic measurement.
function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (w.length === 0) return 0;
  const matches = w.match(/[aeiouy]+/g);
  let count = matches ? matches.length : 1;
  if (w.endsWith("e") && count > 1) count--;
  return Math.max(1, count);
}

export interface ReadabilityResult {
  fleschScore: number; // 0-100, higher = easier to read
  avgSentenceLength: number;
  avgSyllablesPerWord: number;
}

export function scoreReadability(bodyText: string): ReadabilityResult {
  const sentences = bodyText.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 0);
  const words = bodyText.split(/\s+/).filter(Boolean);
  if (sentences.length === 0 || words.length === 0) {
    return { fleschScore: 0, avgSentenceLength: 0, avgSyllablesPerWord: 0 };
  }

  const totalSyllables = words.reduce((sum, w) => sum + countSyllables(w), 0);
  const avgSentenceLength = words.length / sentences.length;
  const avgSyllablesPerWord = totalSyllables / words.length;

  const raw = 206.835 - 1.015 * avgSentenceLength - 84.6 * avgSyllablesPerWord;
  const fleschScore = Math.max(0, Math.min(100, Math.round(raw)));

  return {
    fleschScore,
    avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
    avgSyllablesPerWord: Math.round(avgSyllablesPerWord * 100) / 100,
  };
}

export interface OpportunityFlags {
  featuredSnippetOpportunity: boolean;
  faqOpportunity: boolean;
  imageOpportunity: boolean;
  videoOpportunity: boolean;
}

/**
 * Cheap, honest heuristics — a flag here means "worth considering", never
 * a claim that the opportunity is confirmed or that acting on it is
 * guaranteed to help.
 */
export function detectOpportunities(
  draftHeadings: string[],
  bodyText: string,
  hasFaqSection: boolean,
  imageCount: number,
  videoEmbedCount: number,
  targetQueries: string[]
): OpportunityFlags {
  const questionHeadings = draftHeadings.filter((h) => QUESTION_PATTERN.test(h.toLowerCase()));
  const questionQueries = targetQueries.filter((q) => QUESTION_PATTERN.test(q.toLowerCase()));

  return {
    featuredSnippetOpportunity: questionHeadings.length > 0,
    faqOpportunity: !hasFaqSection && questionQueries.length > 0,
    imageOpportunity: VISUAL_PATTERN.test(bodyText.toLowerCase()) && imageCount === 0,
    videoOpportunity: bodyText.toLowerCase().includes("step") && videoEmbedCount === 0,
  };
}
