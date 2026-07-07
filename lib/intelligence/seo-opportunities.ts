import { client } from "@/sanity/client";
import { writeClient } from "@/sanity/write-client";
import {
  isSearchConsoleConfigured,
  getQueryPageMatrix,
  type QueryPageRow,
} from "./sources/search-console";
import { fetchAllTaxonomyNodes, detectThinContent, detectStaleContent, type FetchClient } from "./content";
import { TAXONOMY_TYPES } from "./registry";
import { createNotification } from "./notifications";

// ─── Types ──────────────────────────────────────────────────────────────────

export type Intent = "informational" | "commercial" | "transactional" | "navigational";
export type ContentCoverage = "none" | "thin" | "existing-strong";
export type RecommendedAction =
  | "improve_existing_page"
  | "create_new_blog_article"
  | "add_faqs"
  | "add_portfolio_examples"
  | "strengthen_internal_links"
  | "expand_pillar_page";
export type ConfidenceLevel = "high" | "medium" | "low";

export interface ScoreBreakdown {
  positionScore: number;
  impressionsScore: number;
  ctrGapScore: number;
  intentScore: number;
  commercialValueScore: number;
  topicalRelevanceScore: number;
  competitionProxyScore: number;
  contentCoverageScore: number;
  totalScore: number;
}

export interface SeoOpportunityTopic {
  topicKey: string;
  topicLabel: string;
  queries: QueryPageRow[];
  currentMetrics: { position: number; impressions: number; clicks: number; ctr: number };
  scoreBreakdown: ScoreBreakdown;
  confidenceLevel: ConfidenceLevel;
  confidenceReasons: string[];
  intent: Intent;
  isQuickWin: boolean;
  isSeasonal: boolean;
  seasonalPeriod?: string;
  contentCoverage: ContentCoverage;
  matchedContentPath?: string;
  recommendedAction: RecommendedAction;
  recommendedActionDetail: string;
}

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

function normalizeQuery(query: string): { tokens: string[]; raw: string } {
  const raw = query.toLowerCase().trim();
  const words = raw
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean)
    .filter((w) => !STOPWORDS.has(w));
  const expanded = words.flatMap((w) => (SYNONYMS[w] ? SYNONYMS[w].split(" ") : [w]));
  return { tokens: Array.from(new Set(expanded)).sort(), raw };
}

// ─── Aggregation (per-query, collapsing the query+page dimension) ─────────

interface AggregatedQuery {
  query: string;
  tokens: string[];
  topPage: string;
  clicks: number;
  impressions: number;
  position: number; // impression-weighted average
  ctr: number;
}

function aggregateByQuery(rows: QueryPageRow[]): AggregatedQuery[] {
  const byQuery = new Map<string, QueryPageRow[]>();
  for (const row of rows) {
    const list = byQuery.get(row.query) ?? [];
    list.push(row);
    byQuery.set(row.query, list);
  }

  const out: AggregatedQuery[] = [];
  for (const [query, group] of byQuery) {
    const clicks = group.reduce((s, r) => s + r.clicks, 0);
    const impressions = group.reduce((s, r) => s + r.impressions, 0);
    const positionWeighted = group.reduce((s, r) => s + r.position * r.impressions, 0);
    const position = impressions > 0 ? positionWeighted / impressions : group[0].position;
    const topPage = [...group].sort((a, b) => b.impressions - a.impressions)[0]?.page ?? "";
    out.push({
      query,
      tokens: normalizeQuery(query).tokens,
      topPage,
      clicks,
      impressions,
      position,
      ctr: impressions > 0 ? clicks / impressions : 0,
    });
  }
  return out;
}

// ─── Clustering ─────────────────────────────────────────────────────────────

function jaccard(a: string[], b: string[]): number {
  const setA = new Set(a);
  const setB = new Set(b);
  const intersection = [...setA].filter((t) => setB.has(t)).length;
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union;
}

interface QueryCluster {
  members: AggregatedQuery[];
  sharedTokens: string[];
}

const CLUSTER_SIMILARITY_THRESHOLD = 0.4;

export function clusterQueries(queries: AggregatedQuery[]): QueryCluster[] {
  const sorted = [...queries].sort((a, b) => b.impressions - a.impressions);
  const clusters: QueryCluster[] = [];
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

const INFORMATIONAL_PATTERN = /\b(how|what|why|when|does|is|can|will|guide|tips|difference|meaning)\b/;
const COMMERCIAL_PATTERN = /\b(price|cost|cheap|affordable|near me|best|top|review|packages?)\b/;
const TRANSACTIONAL_PATTERN = /\b(book|hire|contact|whatsapp|price list|quote)\b/;
const NAVIGATIONAL_TERMS = ["gleam", "temi", "gleam by temi"];

function classifyIntent(rawQueries: string[]): Intent {
  const joined = rawQueries.join(" | ");
  if (NAVIGATIONAL_TERMS.some((t) => joined.includes(t))) return "navigational";
  if (TRANSACTIONAL_PATTERN.test(joined)) return "transactional";
  if (COMMERCIAL_PATTERN.test(joined)) return "commercial";
  if (INFORMATIONAL_PATTERN.test(joined)) return "informational";
  return "informational";
}

// ─── Seasonal detection ─────────────────────────────────────────────────────

const SEASONAL_PERIODS: { period: string; markers: RegExp }[] = [
  { period: "Wedding season (Nov–Jan)", markers: /\bwedding season\b/ },
  { period: "Detty December", markers: /\bdetty december|december (party|glam|makeup)\b/ },
  { period: "Graduation season", markers: /\b(graduation|convocation)\b/ },
  { period: "Valentine's", markers: /\bvalentine/ },
  { period: "Easter", markers: /\beaster\b/ },
];

function detectSeasonal(rawQueries: string[]): { isSeasonal: boolean; seasonalPeriod?: string } {
  const joined = rawQueries.join(" | ");
  for (const { period, markers } of SEASONAL_PERIODS) {
    if (markers.test(joined)) return { isSeasonal: true, seasonalPeriod: period };
  }
  return { isSeasonal: false };
}

// ─── Position / impressions / CTR-gap scoring ──────────────────────────────

function scorePosition(position: number): number {
  if (position <= 3) return 25; // already winning — limited upside left
  if (position <= 8) return 25 + ((position - 3) / 5) * 45; // ramps to 70
  if (position <= 20) return 100 - Math.abs(position - 12) * 2.5; // quick-win band peak
  if (position <= 40) return Math.max(20, 70 - (position - 20) * 2);
  return 15;
}

function scoreImpressions(impressions: number): number {
  if (impressions <= 0) return 0;
  return Math.min(100, Math.log10(impressions + 1) * 28);
}

// Rough, widely-cited industry CTR-by-position benchmarks — used only to spot
// a gap, not treated as ground truth.
const EXPECTED_CTR_BY_POSITION: [number, number][] = [
  [1, 0.28], [2, 0.15], [3, 0.11], [5, 0.07], [8, 0.04], [10, 0.025], [20, 0.012], [50, 0.005],
];

function expectedCtr(position: number): number {
  for (let i = 0; i < EXPECTED_CTR_BY_POSITION.length; i++) {
    const [pos, ctr] = EXPECTED_CTR_BY_POSITION[i];
    if (position <= pos) return ctr;
  }
  return 0.003;
}

function scoreCtrGap(position: number, ctr: number): number {
  const expected = expectedCtr(position);
  if (expected <= 0) return 0;
  const gap = (expected - ctr) / expected;
  return Math.max(0, Math.min(100, gap * 100));
}

const INTENT_VALUE: Record<Intent, number> = {
  transactional: 100,
  commercial: 90,
  informational: 55,
  navigational: 15,
};

// ─── Content index (what already exists on the site) ───────────────────────

interface ContentIndexEntry {
  tokens: string[];
  path: string;
  isThin: boolean;
  isStale: boolean;
}

async function buildContentIndex(fetchClient: FetchClient): Promise<ContentIndexEntry[]> {
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

  for (const node of taxonomyNodes) {
    const cfg = TAXONOMY_TYPES.find((t) => t.type === node.type);
    if (!cfg?.publicPath || !node.slug) continue;
    index.push({
      tokens: normalizeQuery(node.name).tokens,
      path: cfg.publicPath(node.slug),
      isThin: !node.hasDescription || node.descriptionLength < 60,
      isStale: false,
    });
  }

  for (const post of blogPosts) {
    if (!post.slug) continue;
    index.push({
      tokens: normalizeQuery(post.title).tokens,
      path: `/blog/${post.slug}`,
      isThin: thinIds.has(post._id),
      isStale: staleIds.has(post._id),
    });
  }

  return index;
}

// Vocabulary that marks a cluster as genuinely on-topic even when it doesn't
// match a specific existing page — keeps obviously irrelevant GSC noise
// (stray brand mentions, unrelated queries) out of the roadmap.
const CORE_BUSINESS_VOCAB = new Set([
  "makeup", "makeup artist", "wedding", "bridal", "bride", "glam", "beauty", "artist",
  "gele", "owambe", "event", "party", "trial", "training", "course", "mobile", "home service",
]);

function matchContent(
  clusterTokens: string[],
  index: ContentIndexEntry[]
): { coverage: ContentCoverage; matchedPath?: string; topicalRelevanceScore: number } {
  let best: ContentIndexEntry | null = null;
  let bestOverlap = 0;
  for (const entry of index) {
    const overlap = jaccard(clusterTokens, entry.tokens);
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
  const coverage: ContentCoverage = best.isThin || best.isStale ? "thin" : "existing-strong";
  return { coverage, matchedPath: best.path, topicalRelevanceScore };
}

// ─── Recommended action ─────────────────────────────────────────────────────

const QUESTION_PATTERN = /\b(how|what|why|when|does|is|can)\b/;
const VISUAL_PATTERN = /\b(photo|photos|picture|pictures|example|examples|before and after|look|looks)\b/;

function recommendAction(
  rawQueries: string[],
  coverage: ContentCoverage,
  matchedPath: string | undefined
): { action: RecommendedAction; detail: string } {
  const joined = rawQueries.join(" | ");

  if (coverage === "none") {
    return {
      action: "create_new_blog_article",
      detail: `No existing page or post covers this topic. Write a new blog article targeting: ${rawQueries.slice(0, 5).join(", ")}.`,
    };
  }
  if (QUESTION_PATTERN.test(joined)) {
    return {
      action: "add_faqs",
      detail: `These are question-form searches. Add FAQ entries answering them directly${matchedPath ? ` on ${matchedPath}` : ""}.`,
    };
  }
  if (VISUAL_PATTERN.test(joined)) {
    return {
      action: "add_portfolio_examples",
      detail: `Searchers want visual proof. Add tagged portfolio items that match this topic${matchedPath ? ` and link them from ${matchedPath}` : ""}.`,
    };
  }
  if (coverage === "thin") {
    const isPillar = matchedPath && !matchedPath.startsWith("/blog/");
    return isPillar
      ? { action: "expand_pillar_page", detail: `${matchedPath} is thin for this topic — expand its content depth (more detail, FAQs, proof).` }
      : { action: "strengthen_internal_links", detail: `Existing content on this topic is thin and scattered. Link related posts to each other and to the relevant service/location page.` };
  }
  return {
    action: "improve_existing_page",
    detail: `${matchedPath ?? "The matching page"} already ranks reasonably — improve its title/meta description and on-page depth to close the remaining gap.`,
  };
}

// ─── Scoring weights ────────────────────────────────────────────────────────

const WEIGHTS = {
  position: 0.22,
  impressions: 0.14,
  ctrGap: 0.12,
  commercialValue: 0.16,
  topicalRelevance: 0.12,
  competitionProxy: 0.08,
  contentCoverage: 0.16,
};

function contentCoverageScore(coverage: ContentCoverage): number {
  return coverage === "existing-strong" ? 90 : coverage === "thin" ? 65 : 40;
}

// ─── Main computation ───────────────────────────────────────────────────────

const MIN_TOPICAL_RELEVANCE = 30; // below this, treat as noise and drop entirely

export async function computeSeoOpportunities(fetchClient: FetchClient = client): Promise<SeoOpportunityTopic[]> {
  if (!isSearchConsoleConfigured()) return [];

  const [matrix, contentIndex] = await Promise.all([
    getQueryPageMatrix(90),
    buildContentIndex(fetchClient),
  ]);

  const aggregated = aggregateByQuery(matrix.current);
  const priorAggregated = aggregateByQuery(matrix.prior);
  const priorByQuery = new Map(priorAggregated.map((q) => [q.query, q]));

  const clusters = clusterQueries(aggregated);
  const topics: SeoOpportunityTopic[] = [];

  for (const cluster of clusters) {
    const rawQueries = cluster.members.map((m) => m.query);
    const impressions = cluster.members.reduce((s, m) => s + m.impressions, 0);
    const clicks = cluster.members.reduce((s, m) => s + m.clicks, 0);
    const positionWeighted = cluster.members.reduce((s, m) => s + m.position * m.impressions, 0);
    const position = impressions > 0 ? positionWeighted / impressions : cluster.members[0].position;
    const ctr = impressions > 0 ? clicks / impressions : 0;

    const clusterTokens = cluster.sharedTokens.length > 0 ? cluster.sharedTokens : cluster.members[0].tokens;
    const { coverage, matchedPath, topicalRelevanceScore } = matchContent(clusterTokens, contentIndex);
    if (topicalRelevanceScore < MIN_TOPICAL_RELEVANCE) continue; // drop noise

    const intent = classifyIntent(rawQueries);
    const seasonal = detectSeasonal(rawQueries);

    const positionScore = scorePosition(position);
    const impressionsScore = scoreImpressions(impressions);
    const ctrGapScore = scoreCtrGap(position, ctr);
    const intentScore = INTENT_VALUE[intent];
    const commercialValueScore = intentScore;
    const contentCovScore = contentCoverageScore(coverage);
    // Weak proxy: pages already performing reasonably near this cluster
    // suggest we're not starting from zero against competitors on this term.
    const competitionProxyScore = position <= 20 && impressions > 10 ? 55 : 45;

    const totalScore =
      positionScore * WEIGHTS.position +
      impressionsScore * WEIGHTS.impressions +
      ctrGapScore * WEIGHTS.ctrGap +
      commercialValueScore * WEIGHTS.commercialValue +
      topicalRelevanceScore * WEIGHTS.topicalRelevance +
      competitionProxyScore * WEIGHTS.competitionProxy +
      contentCovScore * WEIGHTS.contentCoverage;

    const confidenceReasons: string[] = [
      `Based on ${cluster.members.length} distinct quer${cluster.members.length === 1 ? "y" : "ies"} and ${impressions.toLocaleString()} impressions over the last 90 days.`,
      "Competition score is a proxy derived from our own ranking/CTR data, not verified keyword-difficulty data from a paid tool.",
    ];
    if (matchedPath) confidenceReasons.push(`Matched to existing content at ${matchedPath}.`);
    else confidenceReasons.push("No matching content found on the site — flagged as a content gap.");

    let confidenceLevel: ConfidenceLevel = "low";
    if (impressions >= 50 && cluster.members.length >= 2 && topicalRelevanceScore >= 70) confidenceLevel = "high";
    else if (impressions >= 15 && topicalRelevanceScore >= 70) confidenceLevel = "medium";

    const { action, detail } = recommendAction(rawQueries, coverage, matchedPath);
    const isQuickWin = position >= 8 && position <= 20;

    const topLabel = [...cluster.members].sort((a, b) => b.impressions - a.impressions)[0].query;
    const topicKey = (cluster.sharedTokens.slice(0, 4).join("-") || topLabel.replace(/\s+/g, "-"))
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "");

    topics.push({
      topicKey: topicKey || `topic-${Buffer.from(topLabel).toString("hex").slice(0, 12)}`,
      topicLabel: topLabel.replace(/\b\w/g, (c) => c.toUpperCase()),
      queries: cluster.members.map((m) => ({
        query: m.query,
        page: m.topPage,
        clicks: m.clicks,
        impressions: m.impressions,
        ctr: m.ctr,
        position: m.position,
      })),
      currentMetrics: { position, impressions, clicks, ctr },
      scoreBreakdown: {
        positionScore,
        impressionsScore,
        ctrGapScore,
        intentScore,
        commercialValueScore,
        topicalRelevanceScore,
        competitionProxyScore,
        contentCoverageScore: contentCovScore,
        totalScore,
      },
      confidenceLevel,
      confidenceReasons,
      intent,
      isQuickWin,
      isSeasonal: seasonal.isSeasonal,
      seasonalPeriod: seasonal.seasonalPeriod,
      contentCoverage: coverage,
      matchedContentPath: matchedPath,
      recommendedAction: action,
      recommendedActionDetail: detail,
    });
  }

  // Silence unused-var lint for priorByQuery until persistence layer's delta
  // notifications consume it (kept here since it's computed from the same
  // matrix fetch and persistence needs prior-period position for deltas).
  void priorByQuery;

  return topics.sort((a, b) => b.scoreBreakdown.totalScore - a.scoreBreakdown.totalScore);
}

// ─── Persistence ────────────────────────────────────────────────────────────

interface StoredOpportunity {
  _id: string;
  topicKey: string;
  status?: string;
  actionedAt?: string;
  history?: { date: string; position: number; impressions: number; clicks: number; ctr: number; score: number }[];
  firstSeenAt?: string;
  isQuickWin?: boolean;
  currentMetrics?: { position: number };
}

function docIdForTopic(topicKey: string): string {
  return `seo-opportunity-${topicKey}`;
}

export async function persistSeoOpportunities(
  topics: SeoOpportunityTopic[]
): Promise<{ upserted: number; notifications: number }> {
  const today = new Date().toISOString().slice(0, 10);
  const nowIso = new Date().toISOString();

  const existing = await client.fetch<StoredOpportunity[]>(
    `*[_type == "seoOpportunity"]{ _id, topicKey, status, actionedAt, history, firstSeenAt, isQuickWin, currentMetrics }`
  );
  const existingByKey = new Map(existing.map((e) => [e.topicKey, e]));

  let notifications = 0;
  let tx = writeClient.transaction();

  for (const topic of topics) {
    const prior = existingByKey.get(topic.topicKey);
    const history = [...(prior?.history ?? [])];
    if (history[history.length - 1]?.date !== today) {
      history.push({
        date: today,
        position: topic.currentMetrics.position,
        impressions: topic.currentMetrics.impressions,
        clicks: topic.currentMetrics.clicks,
        ctr: topic.currentMetrics.ctr,
        score: topic.scoreBreakdown.totalScore,
      });
    }

    tx = tx.createOrReplace({
      _id: docIdForTopic(topic.topicKey),
      _type: "seoOpportunity",
      topicKey: topic.topicKey,
      topicLabel: topic.topicLabel,
      queries: topic.queries,
      currentMetrics: topic.currentMetrics,
      scoreBreakdown: topic.scoreBreakdown,
      confidenceLevel: topic.confidenceLevel,
      confidenceReasons: topic.confidenceReasons,
      intent: topic.intent,
      isQuickWin: topic.isQuickWin,
      isSeasonal: topic.isSeasonal,
      seasonalPeriod: topic.seasonalPeriod,
      contentCoverage: topic.contentCoverage,
      matchedContentPath: topic.matchedContentPath,
      recommendedAction: topic.recommendedAction,
      recommendedActionDetail: topic.recommendedActionDetail,
      status: prior?.status ?? "new",
      actionedAt: prior?.actionedAt,
      history,
      firstSeenAt: prior?.firstSeenAt ?? nowIso,
      lastComputedAt: nowIso,
    });

    // New content gap.
    if (!prior && topic.contentCoverage === "none" && topic.scoreBreakdown.topicalRelevanceScore >= 70) {
      await createNotification({
        kind: "content_gap",
        severity: "info",
        title: `Content gap found: "${topic.topicLabel}"`,
        body: topic.recommendedActionDetail,
        metadata: { topicKey: topic.topicKey },
      });
      notifications++;
    }

    // New quick win.
    if (topic.isQuickWin && !prior?.isQuickWin) {
      await createNotification({
        kind: "seo_opportunity",
        severity: "info",
        title: `New quick-win opportunity: "${topic.topicLabel}"`,
        body: `Currently at position ${topic.currentMetrics.position.toFixed(1)} — ${topic.recommendedActionDetail}`,
        metadata: { topicKey: topic.topicKey, position: topic.currentMetrics.position },
      });
      notifications++;
    }

    // Crossed into top 10 (milestone).
    const priorPosition = prior?.currentMetrics?.position;
    if (priorPosition !== undefined && priorPosition > 10 && topic.currentMetrics.position <= 10) {
      await createNotification({
        kind: "seo_opportunity",
        severity: "info",
        title: `"${topic.topicLabel}" reached page 1`,
        body: `Position moved from ${priorPosition.toFixed(1)} to ${topic.currentMetrics.position.toFixed(1)}.`,
        metadata: { topicKey: topic.topicKey },
      });
      notifications++;
    }

    // Regressed out of the quick-win band.
    if (prior?.isQuickWin && !topic.isQuickWin && topic.currentMetrics.position > 20) {
      await createNotification({
        kind: "ranking_drop",
        severity: "warning",
        title: `"${topic.topicLabel}" dropped out of the quick-win range`,
        body: `Position moved to ${topic.currentMetrics.position.toFixed(1)} (was tracked between 8–20).`,
        metadata: { topicKey: topic.topicKey, position: topic.currentMetrics.position },
      });
      notifications++;
    }
  }

  await tx.commit();
  return { upserted: topics.length, notifications };
}

// ─── Read helpers (for the UI — no recomputation, just what's stored) ──────

export interface StoredSeoOpportunity extends SeoOpportunityTopic {
  status: "new" | "acknowledged" | "in_progress" | "done" | "dismissed";
  actionedAt?: string;
  history: { date: string; position: number; impressions: number; clicks: number; ctr: number; score: number }[];
  firstSeenAt: string;
  lastComputedAt: string;
}

const OPPORTUNITY_PROJECTION = `{
  topicKey, topicLabel, queries, currentMetrics, scoreBreakdown, confidenceLevel,
  confidenceReasons, intent, isQuickWin, isSeasonal, seasonalPeriod, contentCoverage,
  matchedContentPath, recommendedAction, recommendedActionDetail, status, actionedAt,
  history, firstSeenAt, lastComputedAt
}`;

export async function getSeoOpportunities(): Promise<StoredSeoOpportunity[]> {
  return client.fetch<StoredSeoOpportunity[]>(
    `*[_type == "seoOpportunity"] | order(scoreBreakdown.totalScore desc) ${OPPORTUNITY_PROJECTION}`
  );
}

export async function getSeoOpportunityByKey(topicKey: string): Promise<StoredSeoOpportunity | null> {
  return client.fetch<StoredSeoOpportunity | null>(
    `*[_type == "seoOpportunity" && topicKey == $topicKey][0] ${OPPORTUNITY_PROJECTION}`,
    { topicKey }
  );
}
