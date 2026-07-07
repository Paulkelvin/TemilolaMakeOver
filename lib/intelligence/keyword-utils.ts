import { fetchAllTaxonomyNodes, detectThinContent, detectStaleContent, computeCoverage, type FetchClient } from "./content";
import { TAXONOMY_TYPES } from "./registry";
import { computeCoverageScore } from "./topical-authority";

/**
 * Shared "keyword science" used by both the SEO Opportunity Engine (real
 * Search Console queries) and the Keyword Discovery Engine (external
 * autocomplete suggestions) — query normalization, clustering, intent
 * classification, seasonal detection, and content-coverage matching against
 * the site's real taxonomy/content. Extracting this once keeps both engines'
 * topic-matching/keying identical, which is what makes merging a discovered
 * topic with a live GSC opportunity (once real traffic arrives) reliable.
 */

// ─── Normalization ──────────────────────────────────────────────────────────

const STOPWORDS = new Set([
  "a", "an", "the", "in", "on", "at", "for", "to", "of", "and", "or", "with",
  "near", "me", "is", "are", "do", "does", "much", "i", "my", "you", "your",
]);

// Domain-specific folding so obvious variants cluster together instead of
// splintering into near-duplicate topics.
const SYNONYMS: Record<string, string> = {
  mua: "makeup artist",
  muas: "makeup artist",
  makeupartist: "makeup artist",
  bridal: "wedding",
  weddings: "wedding",
  brides: "bride",
  gele: "gele",
  owambe: "owambe",
  glam: "glam",
};

export function normalizeQuery(query: string): { tokens: string[]; raw: string } {
  const raw = query.toLowerCase().trim();
  const words = raw
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean)
    .filter((w) => !STOPWORDS.has(w));
  const expanded = words.flatMap((w) => (SYNONYMS[w] ? SYNONYMS[w].split(" ") : [w]));
  return { tokens: Array.from(new Set(expanded)).sort(), raw };
}

// ─── Clustering ─────────────────────────────────────────────────────────────

export function jaccard(a: string[], b: string[]): number {
  const setA = new Set(a);
  const setB = new Set(b);
  const intersection = [...setA].filter((t) => setB.has(t)).length;
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union;
}

// Generic clustering input — engines populate the fields they have real data
// for and zero the rest (e.g. discovered-keyword rows have no real
// clicks/impressions/position, only tokens drive their clustering).
export interface ClusterableQuery {
  query: string;
  tokens: string[];
  topPage: string;
  clicks: number;
  impressions: number;
  position: number;
  ctr: number;
}

export interface QueryCluster<T extends ClusterableQuery = ClusterableQuery> {
  members: T[];
  sharedTokens: string[];
}

const CLUSTER_SIMILARITY_THRESHOLD = 0.4;

export function clusterQueries<T extends ClusterableQuery>(queries: T[]): QueryCluster<T>[] {
  const sorted = [...queries].sort((a, b) => b.impressions - a.impressions);
  const clusters: QueryCluster<T>[] = [];
  const used = new Set<string>();

  for (const q of sorted) {
    if (used.has(q.query)) continue;
    const members = [q];
    used.add(q.query);
    for (const other of sorted) {
      if (used.has(other.query)) continue;
      const sim = jaccard(q.tokens, other.tokens);
      const subsetMatch =
        q.tokens.length >= 2 &&
        other.tokens.length >= 2 &&
        (q.tokens.every((t) => other.tokens.includes(t)) || other.tokens.every((t) => q.tokens.includes(t)));
      if (sim >= CLUSTER_SIMILARITY_THRESHOLD || subsetMatch) {
        members.push(other);
        used.add(other.query);
      }
    }
    const tokenCounts = new Map<string, number>();
    for (const m of members) for (const t of m.tokens) tokenCounts.set(t, (tokenCounts.get(t) ?? 0) + 1);
    const sharedTokens = [...tokenCounts.entries()]
      .filter(([, count]) => count >= 1)
      .sort((a, b) => b[1] - a[1])
      .map(([t]) => t);
    clusters.push({ members, sharedTokens });
  }
  return clusters;
}

// ─── Intent classification ──────────────────────────────────────────────────

export type Intent = "informational" | "commercial" | "transactional" | "navigational";

const INFORMATIONAL_PATTERN = /\b(how|what|why|when|does|is|can|will|guide|tips|difference|meaning)\b/;
const COMMERCIAL_PATTERN = /\b(price|cost|cheap|affordable|near me|best|top|review|packages?)\b/;
const TRANSACTIONAL_PATTERN = /\b(book|hire|contact|whatsapp|price list|quote)\b/;
const NAVIGATIONAL_TERMS = ["gleam", "temi", "gleam by temi"];

export function classifyIntent(rawQueries: string[]): Intent {
  const joined = rawQueries.join(" | ");
  if (NAVIGATIONAL_TERMS.some((t) => joined.includes(t))) return "navigational";
  if (TRANSACTIONAL_PATTERN.test(joined)) return "transactional";
  if (COMMERCIAL_PATTERN.test(joined)) return "commercial";
  if (INFORMATIONAL_PATTERN.test(joined)) return "informational";
  return "informational";
}

// Shared regexes for recommendation logic (each engine has its own
// recommendedAction vocabulary, but "is this a question" / "does this want
// visual proof" are generic query-text signals, not specific to either).
export const QUESTION_PATTERN = /\b(how|what|why|when|does|is|can)\b/;
export const VISUAL_PATTERN = /\b(photo|photos|picture|pictures|example|examples|before and after|look|looks)\b/;

// ─── Seasonal detection ─────────────────────────────────────────────────────

export const SEASONAL_PERIODS: { period: string; markers: RegExp }[] = [
  { period: "Wedding season (Nov–Jan)", markers: /\bwedding season\b/ },
  { period: "Detty December", markers: /\bdetty december|december (party|glam|makeup)\b/ },
  { period: "Graduation season", markers: /\b(graduation|convocation)\b/ },
  { period: "Valentine's", markers: /\bvalentine/ },
  { period: "Easter", markers: /\beaster\b/ },
];

export function detectSeasonal(rawQueries: string[]): { isSeasonal: boolean; seasonalPeriod?: string } {
  const joined = rawQueries.join(" | ");
  for (const { period, markers } of SEASONAL_PERIODS) {
    if (markers.test(joined)) return { isSeasonal: true, seasonalPeriod: period };
  }
  return { isSeasonal: false };
}

// ─── Content index (what already exists on the site) ───────────────────────

export type ContentCoverage = "none" | "thin" | "existing-strong";

export interface ContentIndexEntry {
  tokens: string[];
  path: string;
  /**
   * 0-100. For taxonomy pages, the real evidence-based Coverage Score from
   * topical-authority.ts (portfolio/testimonials/FAQs/blog posts/internal
   * links/structured data/images — real Sanity counts, not a proxy). For
   * blog posts (which aren't taxonomy nodes and have no evidence of their
   * own attached), the existing real thin/stale detection re-expressed on
   * the same scale so one threshold applies uniformly in matchContent().
   */
  coverageScore: number;
}

export async function buildContentIndex(fetchClient: FetchClient): Promise<ContentIndexEntry[]> {
  const [taxonomyNodes, thin, stale, blogPosts] = await Promise.all([
    fetchAllTaxonomyNodes(fetchClient),
    detectThinContent(fetchClient),
    detectStaleContent(fetchClient),
    fetchClient.fetch<{ _id: string; title: string; slug?: string }[]>(
      `*[_type == "blogPost"]{ _id, title, "slug": slug.current }`
    ),
  ]);

  const thinIds = new Set(thin.map((t) => t.id));
  const staleIds = new Set(stale.map((s) => s.id));

  const index: ContentIndexEntry[] = [];

  const taxonomyEntries = await Promise.all(
    taxonomyNodes.map(async (node): Promise<ContentIndexEntry | null> => {
      const cfg = TAXONOMY_TYPES.find((t) => t.type === node.type);
      if (!cfg?.publicPath || !node.slug) return null;
      const coverage = await computeCoverage(fetchClient, node);
      const { totalScore } = computeCoverageScore(node, coverage);
      return {
        tokens: normalizeQuery(node.name).tokens,
        path: cfg.publicPath(node.slug),
        coverageScore: totalScore,
      };
    })
  );
  for (const entry of taxonomyEntries) if (entry) index.push(entry);

  for (const post of blogPosts) {
    if (!post.slug) continue;
    const isThin = thinIds.has(post._id);
    const isStale = staleIds.has(post._id);
    const coverageScore = isThin ? (isStale ? 25 : 45) : isStale ? 65 : 90;
    index.push({
      tokens: normalizeQuery(post.title).tokens,
      path: `/blog/${post.slug}`,
      coverageScore,
    });
  }

  return index;
}

// Vocabulary that marks a cluster as genuinely on-topic even when it doesn't
// match a specific existing page — keeps obviously irrelevant noise (stray
// brand mentions, unrelated queries) out of either engine's roadmap.
export const CORE_BUSINESS_VOCAB = new Set([
  "makeup", "makeup artist", "wedding", "bridal", "bride", "glam", "beauty", "artist",
  "gele", "owambe", "event", "party", "trial", "training", "course", "mobile", "home service",
]);

const THIN_THRESHOLD = 60;

// Plain Jaccard penalizes a short real page name (e.g. "Bridal Makeup" ->
// {makeup, wedding}) against a much longer, keyword-stuffed query/title
// (e.g. a competitor's SEO-optimized page title with 8-12 tokens) even when
// every one of the short side's tokens is genuinely present in the long
// side — the union grows but the overlap doesn't, so Jaccard alone drops
// well below the match threshold. Full containment in either direction is
// itself strong evidence of a real match, so it's treated as one.
function overlapScore(a: string[], b: string[]): number {
  const jaccardScore = jaccard(a, b);
  if (a.length >= 2 && b.length >= 2) {
    const aSubsetOfB = a.every((t) => b.includes(t));
    const bSubsetOfA = b.every((t) => a.includes(t));
    if (aSubsetOfB || bSubsetOfA) return Math.max(jaccardScore, 0.75);
  }
  return jaccardScore;
}

export function matchContent(
  clusterTokens: string[],
  index: ContentIndexEntry[]
): { coverage: ContentCoverage; matchedPath?: string; topicalRelevanceScore: number; matchedCoverageScore?: number } {
  let best: ContentIndexEntry | null = null;
  let bestOverlap = 0;
  for (const entry of index) {
    const overlap = overlapScore(clusterTokens, entry.tokens);
    if (overlap > bestOverlap) {
      bestOverlap = overlap;
      best = entry;
    }
  }

  const matchesTaxonomyVocab = bestOverlap >= 0.3;
  const matchesCoreVocab = clusterTokens.some((t) => CORE_BUSINESS_VOCAB.has(t));
  const topicalRelevanceScore = matchesTaxonomyVocab ? 100 : matchesCoreVocab ? 70 : 15;

  if (!best || bestOverlap < 0.3) {
    return { coverage: "none", topicalRelevanceScore };
  }
  const coverage: ContentCoverage = best.coverageScore >= THIN_THRESHOLD ? "existing-strong" : "thin";
  return { coverage, matchedPath: best.path, topicalRelevanceScore, matchedCoverageScore: best.coverageScore };
}

// Stable, URL/id-safe key derived from a cluster's dominant shared tokens —
// used as the Sanity document id by both engines so a topic discovered
// externally and the same topic later confirmed by real GSC clicks converge
// on the same key.
export function topicKeyFor(sharedTokens: string[], fallbackLabel: string): string {
  const fromTokens = sharedTokens.slice(0, 4).join("-").toLowerCase().replace(/[^a-z0-9-]/g, "");
  if (fromTokens) return fromTokens;
  const fromLabel = fallbackLabel.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  return fromLabel || `topic-${Buffer.from(fallbackLabel).toString("hex").slice(0, 12)}`;
}
