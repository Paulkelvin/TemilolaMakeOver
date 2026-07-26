import { fetchAllTaxonomyNodes, detectThinContent, detectStaleContent, computeCoverage, type FetchClient } from "./content";
import { TAXONOMY_TYPES } from "./registry";
import { COMPETITOR_SITES } from "./competitor-registry";
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
  // Folded so the makeup-specific vocabulary check sees them. Without this,
  // "Event Owambe Glams" — an actual service name on this site — scored as
  // generic-only vocabulary and was dropped as noise.
  glams: "glam",
  makeovers: "makeover",
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

// Word lists (not one big regex) so classifyIntentDetailed can report
// exactly which words fired — every detection is deterministic and
// individually checkable, never a black-box verdict.
const NAVIGATIONAL_TERMS = ["gleam", "temi", "gleam by temi"];
const TRANSACTIONAL_WORDS = ["book", "hire", "contact", "whatsapp", "price list", "quote"];
const COMMERCIAL_WORDS = ["price", "cost", "cheap", "affordable", "near me", "best", "top", "review", "package", "packages"];
const INFORMATIONAL_WORDS = ["how", "what", "why", "when", "does", "is", "can", "will", "guide", "tips", "difference", "meaning"];

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function findMatches(text: string, words: string[]): string[] {
  return words.filter((w) => new RegExp(`\\b${escapeRegExp(w)}\\b`).test(text));
}

export interface IntentClassification {
  intent: Intent;
  confidencePct: number;
  matchedWords: string[];
  ruleTriggered: string;
}

export function classifyIntentDetailed(rawQueries: string[]): IntentClassification {
  const joined = rawQueries.join(" | ").toLowerCase();

  const navMatches = findMatches(joined, NAVIGATIONAL_TERMS);
  if (navMatches.length > 0) {
    return { intent: "navigational", confidencePct: 95, matchedWords: navMatches, ruleTriggered: "navigational — contains brand/business name" };
  }
  const transactionalMatches = findMatches(joined, TRANSACTIONAL_WORDS);
  if (transactionalMatches.length > 0) {
    return { intent: "transactional", confidencePct: 90, matchedWords: transactionalMatches, ruleTriggered: "transactional — booking/contact language" };
  }
  const commercialMatches = findMatches(joined, COMMERCIAL_WORDS);
  if (commercialMatches.length > 0) {
    return { intent: "commercial", confidencePct: 85, matchedWords: commercialMatches, ruleTriggered: "commercial — price/comparison language" };
  }
  const informationalMatches = findMatches(joined, INFORMATIONAL_WORDS);
  if (informationalMatches.length > 0) {
    return { intent: "informational", confidencePct: 80, matchedWords: informationalMatches, ruleTriggered: "informational — question/guide language" };
  }
  return { intent: "informational", confidencePct: 40, matchedWords: [], ruleTriggered: "default — no specific pattern matched" };
}

export function classifyIntent(rawQueries: string[]): Intent {
  return classifyIntentDetailed(rawQueries).intent;
}

// Shared regexes for recommendation logic (each engine has its own
// recommendedAction vocabulary, but "is this a question" / "does this want
// visual proof" are generic query-text signals, not specific to either).
//
// Anchored at the start of a query on purpose. Matching an interrogative
// ANYWHERE (the old \b(how|what|...)\b applied to every query joined into one
// string) meant a single stray "is" or "can" in any one member of a large
// cluster flipped the whole cluster to add_faqs — which is how commercial
// clusters like "bridal makeup artist near me" ended up recommended as FAQ
// entries. A real question search leads with its interrogative.
export const QUESTION_PATTERN = /^(how|what|why|when|where|which|who|does|do|is|are|can|should)\b/;
export const VISUAL_PATTERN = /\b(photo|photos|picture|pictures|example|examples|before and after|look|looks)\b/;

/**
 * True when the searcher is actually asking a question, rather than when the
 * word "is" happens to appear somewhere in a cluster. Requires a *member
 * query* to lead with an interrogative, so the signal survives clustering.
 */
export function isQuestionCluster(rawQueries: string[]): boolean {
  return rawQueries.some((q) => QUESTION_PATTERN.test(q.trim().toLowerCase()));
}

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

// Stricter than CORE_BUSINESS_VOCAB — single-word tokens only (tokens from
// normalizeQuery are always single words, so multi-word CORE_BUSINESS_VOCAB
// entries like "makeup artist" can never match one anyway). Broad terms like
// "wedding"/"event"/"party" are legitimately core vocabulary but too generic
// alone to prove a candidate is actually ABOUT makeup — an autocomplete
// completion for a broad seed like "Corporate" or "Traditional Wedding" can
// easily return "corporate lawyer salary" or "wedding invitations", which
// share a taxonomy word but aren't makeup topics at all.
export const MAKEUP_SPECIFIC_VOCAB = new Set([
  "makeup", "glam", "beauty", "bridal", "bride", "gele", "cosmetics", "cosmetic",
  "lash", "lashes", "brow", "brows", "foundation", "concealer", "lipstick", "contour", "highlighter",
  "mua", "makeover", "eyeshadow", "eyeliner", "mascara", "blush", "bronzer", "primer",
]);

/**
 * Negative keywords — the standard way real keyword tools stop autocomplete
 * noise, and hand-maintained here by the same convention as PRIORITY_KEYWORDS
 * (registry.ts) and COMPETITOR_SITES (competitor-registry.ts).
 *
 * Necessary because a positive vocabulary check alone cannot separate these
 * from real demand: an e.l.f. product query like "soft glam satin foundation
 * elf" contains BOTH "glam" and "foundation" and so passes even the strict
 * MAKEUP_SPECIFIC_VOCAB above. All of the following were observed live at the
 * very top of the priority queue, ranked above real work:
 *
 *  - retail/product intent — this is a service business; someone shopping for
 *    a drugstore foundation shade is not a potential booking
 *  - adjacent wedding trades — "how much do wedding venues make" shares
 *    "wedding" but is someone researching the venue business
 *  - social-media filler — "baby girl makeup photoshoot quotes funny"
 *  - job seeking — a searcher looking for employment, not to hire
 *
 * Competitor business names are disqualified separately, off COMPETITOR_SITES,
 * so this list never has to be kept in sync with that one by hand.
 */
export const DISQUALIFYING_VOCAB = new Set([
  // Cosmetics brands that dominate autocomplete for any product-shaped query.
  // "elf" is deliberately included: in makeup autocomplete it is overwhelmingly
  // e.l.f. Cosmetics, and the cost of losing a hypothetical Halloween-elf look
  // is far lower than the cost of ranking SKU searches as top priorities.
  "elf", "maybelline", "nyx", "fenty", "mac", "revlon", "loreal", "huda", "morphe",
  "rimmel", "sephora", "ulta", "nars", "clinique", "estee", "lauder", "zaron", "zikel",
  // "Soft Glam" is both one of this site's own makeupStyle names AND the name
  // of Anastasia Beverly Hills' best-known palette, so seeding "soft glam"
  // pulls in a flood of palette-shade queries. The brand and product-form
  // tokens are what separate the two.
  "anastasia", "abh", "tarte", "colourpop", "jaclyn", "jeffree", "benefit", "smashbox",
  "palette", "palettes",
  // Product-shopping intent rather than service-hire intent. Deliberately NOT
  // including "shade"/"shades" — "best foundation shades for dark skin" is a
  // perfectly good article for a makeup artist to own; the brand tokens above
  // are what actually identify SKU noise.
  "swatch", "swatches", "dupe", "dupes", "ingredients", "spf",
  "amazon", "jumia", "konga", "aliexpress", "shein", "walmart", "boots", "superdrug",
  // Someone else's physical premises. "academy" is excluded on purpose: this
  // business teaches, so "makeup academy lagos" may well be its own service.
  "parlour", "parlor", "salon", "spa", "boutique",
  // Adjacent wedding trades — shares "wedding"/"event", not about makeup.
  "venue", "venues", "invitation", "invitations", "cake", "cakes", "decor",
  "caterer", "catering", "florist", "flowers", "usher", "ushers",
  // Other-business research, not a client.
  "salary", "salaries", "franchise", "wholesale", "wholesalers", "distributor",
  "supplier", "suppliers", "profit", "revenue",
  // Job seeking, not hiring.
  "job", "jobs", "vacancy", "vacancies", "hiring", "recruitment", "cv", "resume", "internship",
  // Wrong market. This is a Lagos business; "makeup artist long island ny" is
  // a real query with real volume and zero value here. Note the absence of
  // "island" — Victoria Island and Lagos Island are core local areas.
  "ny", "nyc", "nj", "usa", "uk", "london", "dubai", "atlanta", "houston",
  "chicago", "toronto", "canada", "america", "california", "texas", "florida",
  // Lagos prime areas (Lekki, Ikoyi, VI) are also prime property markets, so
  // location seeds pull in real-estate autocomplete.
  "estate", "rent", "apartment", "property", "duplex", "bedroom", "plot",
  // Social-media filler. "quote"/"quotes" are deliberately absent — "quote" is
  // already a TRANSACTIONAL_WORD ("get a quote"), so disqualifying it would
  // throw away the most valuable intent there is. The caption markers below
  // identify the filler on their own.
  "caption", "captions", "funny", "meme", "memes", "hashtag",
  "hashtags", "lyrics", "wallpaper", "pfp", "emoji", "anime", "cartoon", "drawing",
]);

// Words that appear inside competitor business names but identify nobody —
// "House of Tara" must not make "makeup house call" a competitor match, and
// this business genuinely does home service.
const GENERIC_NAME_WORDS = new Set([
  "house", "of", "the", "and", "by", "beauty", "makeup", "artist", "studio",
  "salon", "parlour", "parlor", "spa", "academy", "ltd", "limited", "nigeria", "lagos",
]);

// Competitor business names are legitimate *competitor* signals but must never
// become our own content recommendations ("add an FAQ about House of Tara").
// Derived from the curated registry so the two never drift apart, then reduced
// to each competitor's genuinely distinctive tokens.
const COMPETITOR_NAME_TOKENS: Set<string> = new Set(
  COMPETITOR_SITES.flatMap((site) =>
    [
      ...normalizeQuery(site.name).tokens,
      ...normalizeQuery(site.domain.replace(/\.[a-z.]+$/, "")).tokens,
    ].filter((t) => !GENERIC_NAME_WORDS.has(t) && t.length > 2)
  )
);

/**
 * A hard drop, not a score penalty — these aren't weak opportunities, they're
 * the wrong business entirely, and any weighted score can be outvoted by a
 * high enough commercial/coverage component.
 */
export function disqualifyingToken(tokenSets: string[][]): string | undefined {
  for (const tokens of tokenSets) {
    for (const t of tokens) {
      if (DISQUALIFYING_VOCAB.has(t)) return t;
      if (COMPETITOR_NAME_TOKENS.has(t)) return t;
    }
  }
  return undefined;
}

const THIN_THRESHOLD = 60;

// Three different questions, all answered by the same overlapScore() — named
// and centralized here instead of as unexplained magic numbers scattered
// across cluster-authority.ts/topic-suggestions.ts, so the relationship
// between them (contentMatch < clusterMembership... no: alreadyDuplicate is
// the strictest, contentMatch the loosest) is visible in one place.
export const OVERLAP_THRESHOLDS = {
  /** "Does an existing page already cover this topic?" — matchContent() below. */
  contentMatch: 0.3,
  /** "Which existing Topic Map cluster does this topic belong to?" — cluster-authority.ts's matchTopicToCluster(). */
  clusterMembership: 0.25,
  /** "Is this basically the same node as one that already exists?" — topic-suggestions.ts's isAlreadyCovered(). Stricter than clusterMembership on purpose: belonging to a cluster is a much lower bar than being a duplicate of it. */
  alreadyDuplicate: 0.45,
  /** "Does one of our existing FAQs already answer this question?" — findCoveringFaq() below. Between contentMatch and alreadyDuplicate: an FAQ needn't be a word-for-word duplicate to make a second one redundant, but a shared topic word isn't enough either. */
  faqAlreadyAnswers: 0.4,
} as const;

// ─── FAQ saturation ─────────────────────────────────────────────────────────

export interface FaqIndexEntry {
  question: string;
  tokens: string[];
}

export async function buildFaqIndex(fetchClient: FetchClient): Promise<FaqIndexEntry[]> {
  const rows = await fetchClient.fetch<{ question?: string }[]>(`*[_type == "faq"]{ question }`);
  return rows
    .filter((r): r is { question: string } => Boolean(r.question))
    .map((r) => ({ question: r.question, tokens: normalizeQuery(r.question).tokens }));
}

/**
 * The existing FAQ that already answers this topic, if any.
 *
 * Every engine recommended add_faqs purely from query shape, never checking
 * what the site already answers — so three separate FAQs on wedding cost
 * ("How much does bridal makeup cost?", "…in Lagos?", "How much does a makeup
 * session cost in Lagos?") did nothing to stop a fourth being recommended.
 * Left unchecked that compounds indefinitely: an FAQ page of hundreds of
 * near-duplicates that competes with itself for the same query.
 */
export function findCoveringFaq(tokenSets: string[][], faqIndex: FaqIndexEntry[]): string | undefined {
  let best: string | undefined;
  let bestScore: number = OVERLAP_THRESHOLDS.faqAlreadyAnswers;
  for (const entry of faqIndex) {
    for (const tokens of tokenSets) {
      const score = overlapScore(tokens, entry.tokens);
      if (score >= bestScore) {
        bestScore = score;
        best = entry.question;
      }
    }
  }
  return best;
}

// Plain Jaccard penalizes a short real page name (e.g. "Bridal Makeup" ->
// {makeup, wedding}) against a much longer, keyword-stuffed query/title
// (e.g. a competitor's SEO-optimized page title with 8-12 tokens) even when
// every one of the short side's tokens is genuinely present in the long
// side — the union grows but the overlap doesn't, so Jaccard alone drops
// well below the match threshold. Full containment in either direction is
// itself strong evidence of a real match, so it's treated as one.
export function overlapScore(a: string[], b: string[]): number {
  const jaccardScore = jaccard(a, b);
  if (a.length >= 2 && b.length >= 2) {
    const aSubsetOfB = a.every((t) => b.includes(t));
    const bSubsetOfA = b.every((t) => a.includes(t));
    if (aSubsetOfB || bSubsetOfA) return Math.max(jaccardScore, 0.75);
  }
  return jaccardScore;
}

export function matchContent(
  tokenSets: string[][],
  index: ContentIndexEntry[]
): { coverage: ContentCoverage; matchedPath?: string; topicalRelevanceScore: number; matchedCoverageScore?: number; disqualifiedBy?: string } {
  // Multiple token sets (e.g. a topic's broad shared vocabulary AND its own
  // specific representative query) are checked against every indexed page —
  // a narrow shared-vocabulary set alone can under-match: two words shared
  // across a huge, diverse query cluster will lose to a short exact page
  // name even when a longer, more specific existing page is the real match.
  // overlapScore floors every containment match (one side's tokens fully
  // inside the other's) to the same 0.75, so a short exact page name and a
  // longer, more specific page can tie exactly on overlap — and even their
  // raw Jaccard can tie too (a 2-token page inside a 4-token cluster scores
  // identically to a 4-token cluster inside an 8-token page: 2/4 = 4/8).
  // Without a further tiebreaker, whichever happened to be pushed into the
  // index first always wins, regardless of which is the more relevant page.
  // The final tiebreaker is the matched page's own specificity — a longer,
  // more detailed title is stronger evidence of a genuine dedicated match
  // than a short, broad one.
  let best: ContentIndexEntry | null = null;
  let bestOverlap = 0;
  let bestJaccard = 0;
  let bestSpecificity = 0;
  for (const entry of index) {
    for (const tokens of tokenSets) {
      const overlap = overlapScore(tokens, entry.tokens);
      if (overlap < bestOverlap) continue;
      const rawJaccard = jaccard(tokens, entry.tokens);
      if (overlap === bestOverlap && rawJaccard < bestJaccard) continue;
      const specificity = entry.tokens.length;
      const isBetter =
        overlap > bestOverlap ||
        rawJaccard > bestJaccard ||
        (rawJaccard === bestJaccard && specificity > bestSpecificity);
      if (!best || isBetter) {
        bestOverlap = overlap;
        bestJaccard = rawJaccard;
        bestSpecificity = specificity;
        best = entry;
      }
    }
  }

  // Four tiers, not three. The old middle tier scored any topic containing a
  // single CORE_BUSINESS_VOCAB word at 70 — comfortably above every engine's
  // relevance floor — which is what let "how much do wedding venues make"
  // ("wedding") and "baby girl makeup photoshoot quotes funny" ("makeup")
  // through as top-priority recommendations. Generic business vocabulary alone
  // now scores below the floor; proving a topic is about *makeup* requires
  // makeup-specific vocabulary or a real matching page.
  const disqualifier = disqualifyingToken(tokenSets);
  const matchesTaxonomyVocab = bestOverlap >= OVERLAP_THRESHOLDS.contentMatch;
  const matchesMakeupVocab = tokenSets.some((tokens) => tokens.some((t) => MAKEUP_SPECIFIC_VOCAB.has(t)));
  const matchesCoreVocab = tokenSets.some((tokens) => tokens.some((t) => CORE_BUSINESS_VOCAB.has(t)));
  // The top tier requires a matching page AND makeup vocabulary, not a page
  // match alone. Location pages match on the place name by itself, so
  // "picture of house in lekki" scored a perfect 100 off /locations/lekki
  // without containing a single makeup word — real-estate noise ranked as a
  // top content opportunity.
  const topicalRelevanceScore = disqualifier
    ? 0
    : matchesTaxonomyVocab && matchesMakeupVocab
      ? 100
      : matchesMakeupVocab
        ? 70
        : matchesCoreVocab
          ? 25 // generic ("wedding", "event", "party") with nothing makeup-specific
          : 15;

  if (disqualifier) {
    // Reported so the drop is explainable in a decision trace rather than a
    // topic silently vanishing from the roadmap.
    return { coverage: "none", topicalRelevanceScore, disqualifiedBy: disqualifier };
  }
  if (!best || bestOverlap < OVERLAP_THRESHOLDS.contentMatch) {
    return { coverage: "none", topicalRelevanceScore };
  }
  const coverage: ContentCoverage = best.coverageScore >= THIN_THRESHOLD ? "existing-strong" : "thin";
  return { coverage, matchedPath: best.path, topicalRelevanceScore, matchedCoverageScore: best.coverageScore };
}

// ─── Priority (value ÷ effort, not value alone) ─────────────────────────────

// Ordinal effort scale, shared across all three engines' recommendedAction
// vocabularies (they overlap in meaning even where the exact string
// differs) — a 30-minute FAQ addition and a multi-day new pillar page
// shouldn't be ranked on the same scale as pure "value" alone implies.
export const EFFORT_WEIGHTS: Record<string, number> = {
  // Writing a genuinely good FAQ answer is not as cheap as adding a link, and
  // at weight 1 it was mathematically unbeatable: since priority is value ÷
  // effort, an 87-value FAQ scored 87 while an identical-value cluster article
  // (weight 5) scored 17.4. add_faqs held 12 of the top 15 slots while being
  // only 13% of all recommendations. Weight 2 keeps it correctly cheap without
  // letting it monopolise the queue.
  add_faqs: 2,
  improve_existing_faq: 1,
  add_internal_links: 1,
  strengthen_internal_links: 1,
  strengthen_primary_links: 1,
  add_portfolio: 2,
  add_portfolio_examples: 2,
  improve_existing_page: 3,
  differentiate_secondary: 5,
  create_cluster_article: 5,
  create_new_blog_article: 5,
  expand_pillar_page: 5,
  create_new_pillar: 8,
  consolidate_into_primary: 8,
};

const DEFAULT_EFFORT_WEIGHT = 3;

export function effortWeightFor(action: string): number {
  return EFFORT_WEIGHTS[action] ?? DEFAULT_EFFORT_WEIGHT;
}

/**
 * Value ÷ effort — not a percentage, a relative ranking number. Naturally
 * bounded roughly 0-100 since totalScore maxes at 100 and the lowest
 * effort weight is 1 (a 90-value FAQ addition scores 90; a 90-value new
 * pillar page, effort 8, scores 11.25 — reflecting that the FAQ is the
 * better use of the next 30 minutes even though the pillar page has
 * identical raw value).
 */
export function computePriorityScore(totalScore: number, action: string): number {
  const effort = effortWeightFor(action);
  return Math.round((totalScore / effort) * 10) / 10;
}

// Stable, URL/id-safe key derived from a cluster's dominant shared tokens —
// used as the Sanity document id by both engines so a topic discovered
// externally and the same topic later confirmed by real GSC clicks converge
// on the same key.
export function topicKeyFor(sharedTokens: string[], fallbackLabel: string): string {
  // Sorted before slicing: token ORDER used to change the key, so one topic
  // could occupy several rows under permutations of the same words — live
  // examples were "how-cost-makeup-wedding" and "cost-makeup-wedding-how",
  // both the same {how, cost, makeup, wedding} set, each recommending its own
  // separate FAQ. Sorting also makes cross-engine convergence order-independent.
  const fromTokens = [...sharedTokens].sort().slice(0, 4).join("-").toLowerCase().replace(/[^a-z0-9-]/g, "");
  if (fromTokens) return fromTokens;
  const fromLabel = fallbackLabel.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  return fromLabel || `topic-${Buffer.from(fallbackLabel).toString("hex").slice(0, 12)}`;
}

// ─── Evidence-source confidence ────────────────────────────────────────────
// Shared by keyword-discovery.ts and topic-suggestions.ts, which both ask the
// same underlying question — "how many independent evidence sources support
// this candidate" — even though each surfaces its own richer, source-specific
// reasons alongside the level. Deliberately NOT shared with seo-opportunities.ts
// (whose own ConfidenceLevel is derived from impressions/cluster-size/relevance,
// not source count) or health-score.ts's sample-size-based ConfidenceTier —
// those measure genuinely different things, and forcing one scale on all three
// would lose information rather than simplify anything.

export type ConfidenceLevel = "high" | "medium" | "low";
export const CONFIDENCE_SCORE: Record<ConfidenceLevel, number> = { high: 90, medium: 60, low: 30 };

export function deriveConfidenceLevel(sourceCount: number): ConfidenceLevel {
  if (sourceCount >= 2) return "high";
  if (sourceCount === 1) return "medium";
  return "low";
}

// ─── Cross-engine convergence (C2) ────────────────────────────────────────

export interface ConvergenceResult {
  topicKey: string;
  engines: string[];
  convergenceMultiplier: number;
  evidence: string[];
}

const ENGINE_TYPE_MAP: Record<string, string> = {
  seoOpportunity: "seo-opportunities",
  keywordDiscoveryTopic: "keyword-discovery",
  competitorGapTopic: "competitor-gaps",
};

const ENGINE_LABEL: Record<string, string> = {
  "seo-opportunities": "SEO Opportunities (real GSC data)",
  "keyword-discovery": "Keyword Discovery (autocomplete signals)",
  "competitor-gaps": "Competitor Gaps (competitor crawl)",
};

export async function computeConvergence(fetchClient: FetchClient): Promise<ConvergenceResult[]> {
  const rows = await fetchClient.fetch<{ topicKey: string; _type: string }[]>(
    `*[_type in ["seoOpportunity", "keywordDiscoveryTopic", "competitorGapTopic"]]{ topicKey, _type }`
  );

  const byKey = new Map<string, Set<string>>();
  for (const row of rows) {
    if (!row.topicKey) continue;
    const engine = ENGINE_TYPE_MAP[row._type];
    if (!engine) continue;
    if (!byKey.has(row.topicKey)) byKey.set(row.topicKey, new Set());
    byKey.get(row.topicKey)!.add(engine);
  }

  const results: ConvergenceResult[] = [];
  for (const [topicKey, engines] of byKey) {
    if (engines.size < 2) continue;
    const engineList = [...engines].sort();
    const multiplier = engines.size >= 3 ? 1.6 : 1.3;
    const evidence = engineList.map((e) => ENGINE_LABEL[e] ?? e);
    results.push({ topicKey, engines: engineList, convergenceMultiplier: multiplier, evidence });
  }

  return results.sort((a, b) => b.engines.length - a.engines.length || a.topicKey.localeCompare(b.topicKey));
}
