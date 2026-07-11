/**
 * Originality Scorer — structural + lexical overlap between a drafted
 * article and the source material it was researched from. Deliberately no
 * embeddings/LLM call: pure heading-sequence and 5-word shingle (n-gram)
 * comparison, per the Editorial System's Component C design. Catches the
 * common failure mode — close paraphrasing — without a new paid dependency.
 * Genuine semantic/idea-level similarity (two differently-worded passages
 * expressing the same idea) is out of scope for this v1; it needs an
 * embeddings API, a deliberate future addition, not assumed here.
 */

export interface OriginalityInput {
  draftText: string;
  draftHeadings: string[];
  sourceTexts: string[];
  sourceHeadings: string[];
}

export interface OriginalityResult {
  structuralOriginality: number | null; // 0-100 — higher = less heading overlap with source; null when no source heading data exists to compare against
  lexicalOriginality: number; // 0-100 — higher = less verbatim/near-verbatim phrasing
  paraphraseScore: number; // 0-100 — equal blend of structural+lexical when structural data exists, else lexical alone
  matchedShingleCount: number;
  totalShingleCount: number;
  headingOverlapRatio: number; // 0-1, raw Jaccard
  flaggedSentences: string[]; // highest-overlap sentences, surfaced for human review — never auto-rewritten
}

const SHINGLE_SIZE = 5;
const FLAG_SENTENCE_MIN_RATIO = 0.3;
const MAX_FLAGGED_SENTENCES = 5;

function tokenizeWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function shingles(words: string[], size: number): string[] {
  if (words.length < size) return [];
  const result: string[] = [];
  for (let i = 0; i <= words.length - size; i++) {
    result.push(words.slice(i, i + size).join(" "));
  }
  return result;
}

function jaccardSet(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 0;
  let intersection = 0;
  for (const x of a) if (b.has(x)) intersection++;
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function normalizeHeading(h: string): string {
  return h.toLowerCase().trim().replace(/[^\p{L}\p{N}\s]/gu, "");
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export function scoreOriginality(input: OriginalityInput): OriginalityResult {
  const { draftText, draftHeadings, sourceTexts, sourceHeadings } = input;

  const draftHeadingSet = new Set(draftHeadings.map(normalizeHeading));
  const sourceHeadingSet = new Set(sourceHeadings.map(normalizeHeading));
  // An empty source-heading set means "no structure to compare against", not
  // "no overlap" — treating it as 0 overlap would silently report a perfect
  // structuralOriginality of 100 even for a verbatim-copied draft. Only score
  // this dimension when there's real source structure to diff against.
  const hasSourceStructure = sourceHeadingSet.size > 0;
  const headingOverlapRatio = hasSourceStructure ? jaccardSet(draftHeadingSet, sourceHeadingSet) : 0;
  const structuralOriginality = hasSourceStructure ? Math.round(100 * (1 - headingOverlapRatio)) : null;

  const sourceShingleSet = new Set(
    sourceTexts.flatMap((t) => shingles(tokenizeWords(t), SHINGLE_SIZE))
  );
  const draftShingles = shingles(tokenizeWords(draftText), SHINGLE_SIZE);

  let matchedShingleCount = 0;
  for (const s of draftShingles) {
    if (sourceShingleSet.has(s)) matchedShingleCount++;
  }
  const totalShingleCount = draftShingles.length;
  const rewriteRatio = totalShingleCount === 0 ? 0 : matchedShingleCount / totalShingleCount;
  const lexicalOriginality = Math.round(100 * (1 - rewriteRatio));

  const paraphraseScore =
    structuralOriginality === null ? lexicalOriginality : Math.round(0.5 * structuralOriginality + 0.5 * lexicalOriginality);

  const flaggedSentences = splitSentences(draftText)
    .map((sentence) => {
      const sShingles = shingles(tokenizeWords(sentence), SHINGLE_SIZE);
      if (sShingles.length === 0) return { sentence, ratio: 0 };
      const matched = sShingles.filter((s) => sourceShingleSet.has(s)).length;
      return { sentence, ratio: matched / sShingles.length };
    })
    .filter((s) => s.ratio >= FLAG_SENTENCE_MIN_RATIO)
    .sort((a, b) => b.ratio - a.ratio)
    .slice(0, MAX_FLAGGED_SENTENCES)
    .map((s) => s.sentence);

  return {
    structuralOriginality,
    lexicalOriginality,
    paraphraseScore,
    matchedShingleCount,
    totalShingleCount,
    headingOverlapRatio: Math.round(headingOverlapRatio * 100) / 100,
    flaggedSentences,
  };
}

// Conservative starting points — tune against real published articles once
// a baseline exists; see the architecture review's §2 for the reasoning.
export const ORIGINALITY_REVIEW_THRESHOLD = 70;
export const ORIGINALITY_BLOCK_THRESHOLD = 50;

const MAX_HEADING_WORDS = 12;
const MAX_HEADING_CHARS = 80;

/**
 * Deterministic, no-LLM heading extraction for hand-pasted source material —
 * matches explicit markdown headings ("## ...") or short standalone lines
 * with no sentence-ending punctuation, the same signal a human skims for
 * when scanning a pasted article's structure.
 */
export function extractLikelyHeadings(text: string): string[] {
  const headings: string[] = [];
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    const markdownMatch = line.match(/^#{1,6}\s+(.+)$/);
    const candidate = markdownMatch ? markdownMatch[1].trim() : line;
    const isMarkdownHeading = Boolean(markdownMatch);
    const looksLikeStandaloneTitle =
      candidate.length > 0 &&
      candidate.length <= MAX_HEADING_CHARS &&
      candidate.split(/\s+/).length <= MAX_HEADING_WORDS &&
      !/[.!?,;:]$/.test(candidate);
    if (isMarkdownHeading || looksLikeStandaloneTitle) headings.push(candidate);
  }
  return headings;
}
