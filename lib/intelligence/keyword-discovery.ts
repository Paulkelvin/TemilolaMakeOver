import { client } from "@/sanity/client";
import { writeClient } from "@/sanity/write-client";
import { fetchAllTaxonomyNodes, type FetchClient } from "./content";
import { PRIORITY_KEYWORDS } from "./registry";
import type { TaxonomyNode } from "./types";
import { getGoogleAutocomplete, getYouTubeAutocomplete } from "./sources/keyword-discovery-sources";
import {
  normalizeQuery,
  clusterQueries,
  classifyIntent,
  detectSeasonal,
  buildContentIndex,
  matchContent,
  topicKeyFor,
  QUESTION_PATTERN,
  VISUAL_PATTERN,
  type ClusterableQuery,
  type Intent,
  type ContentCoverage,
} from "./keyword-utils";

/**
 * Discovers makeup-related content opportunities from free external
 * autocomplete sources — deliberately independent of Search Console, so it
 * works from day one. Shares topic-keying/scoring foundations with
 * seo-opportunities.ts (via keyword-utils.ts) so a topic discovered here can
 * later be matched to the same real topic once real GSC clicks confirm it.
 */

// ─── Seed generation ────────────────────────────────────────────────────────

const MAX_SEEDS = 35;

function isPriorityName(name: string): boolean {
  return PRIORITY_KEYWORDS.some((k) => name.includes(k));
}

// "&"/"/" read fine in a UI label but nobody actually types them into a
// search box — strip them so seeds read like real queries.
function sanitizeSeedName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\//g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Taxonomy names aren't uniformly makeup-specific: service/makeupStyle names
// already are ("Bridal Makeup", "Soft Glam"), but occasion/weddingType names
// are just event names ("Wedding", "Birthday") and location names are just
// place names ("Ikeja") — seeding those bare pulls in generic wedding-industry
// or local-business noise unrelated to makeup. Qualify each category so every
// seed stays anchored to the actual business.
function buildSeeds(taxonomyNodes: TaxonomyNode[]): string[] {
  const serviceLikeNames = new Set<string>();
  const eventNames = new Set<string>();
  const locationNames = new Set<string>();

  for (const node of taxonomyNodes) {
    if (node.type === "artist") continue; // personal names aren't useful generic SEO seeds
    const name = sanitizeSeedName(node.name);
    if (!name) continue;
    if (node.type === "service" || node.type === "makeupStyle") serviceLikeNames.add(name);
    else if (node.type === "occasion" || node.type === "weddingType") eventNames.add(name);
    else if (node.type === "location") locationNames.add(name);
  }

  const seeds = new Set<string>();
  for (const name of serviceLikeNames) seeds.add(name);
  for (const name of eventNames) seeds.add(`${name} makeup`);
  for (const name of locationNames) {
    seeds.add(`makeup artist ${name}`);
    seeds.add(`bridal makeup ${name}`);
  }

  const makeupQualifiedBase = [
    ...serviceLikeNames,
    ...[...eventNames].map((name) => `${name} makeup`),
  ];
  const priorityNames = makeupQualifiedBase
    .sort((a, b) => Number(isPriorityName(b)) - Number(isPriorityName(a)))
    .slice(0, 10);

  for (const name of priorityNames) {
    seeds.add(`${name} near me`);
    seeds.add(`how much does ${name} cost`);
  }
  for (const name of priorityNames.slice(0, 5)) seeds.add(`${name} tutorial`);
  seeds.add("makeup artist lagos");
  seeds.add("bridal makeup cost lagos");

  return Array.from(seeds).slice(0, MAX_SEEDS);
}

// ─── Autocomplete fetching (bounded budget, polite delay) ──────────────────

const MAX_EXPANSION = 15;
const REQUEST_DELAY_MS = 150;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchBothAutocomplete(query: string): Promise<{ google: string[]; youtube: string[] }> {
  const google = await getGoogleAutocomplete(query).catch(() => []);
  await delay(REQUEST_DELAY_MS);
  const youtube = await getYouTubeAutocomplete(query).catch(() => []);
  await delay(REQUEST_DELAY_MS);
  return { google, youtube };
}

// ─── Discovered-query accumulation ──────────────────────────────────────────

export type DiscoverySource = "google-autocomplete" | "youtube-autocomplete" | "seed";

interface DiscoveredQuery extends ClusterableQuery {
  sources: Set<DiscoverySource>;
  depth: number;
}

async function discoverQueries(
  seeds: string[],
  contentIndex: Awaited<ReturnType<typeof buildContentIndex>>
): Promise<DiscoveredQuery[]> {
  const discovered = new Map<string, DiscoveredQuery>();

  function addDiscovered(raw: string, source: DiscoverySource, depth: number): void {
    const { raw: normalizedRaw, tokens } = normalizeQuery(raw);
    if (tokens.length === 0) return;
    const existing = discovered.get(normalizedRaw);
    if (existing) {
      existing.sources.add(source);
      existing.depth = Math.min(existing.depth, depth);
      return;
    }
    discovered.set(normalizedRaw, {
      query: normalizedRaw,
      tokens,
      topPage: "",
      clicks: 0,
      impressions: 0,
      position: 0,
      ctr: 0,
      sources: new Set([source]),
      depth,
    });
  }

  const expansionCandidates: string[] = [];
  const seedSet = new Set(seeds.map((s) => normalizeQuery(s).raw));

  for (const seed of seeds) {
    const { google, youtube } = await fetchBothAutocomplete(seed);
    if (google.length === 0 && youtube.length === 0) {
      addDiscovered(seed, "seed", 0);
      continue;
    }
    for (const q of google) {
      addDiscovered(q, "google-autocomplete", 0);
      expansionCandidates.push(q);
    }
    for (const q of youtube) {
      addDiscovered(q, "youtube-autocomplete", 0);
      expansionCandidates.push(q);
    }
  }

  // Bounded recursive expansion: one more round on the most topically
  // relevant newly-discovered suggestions (mimics "People Also Ask" depth
  // without scraping it).
  const seenExpansion = new Set<string>();
  const rankedExpansion = expansionCandidates
    .map((q) => normalizeQuery(q))
    .filter((q) => !seedSet.has(q.raw) && !seenExpansion.has(q.raw) && seenExpansion.add(q.raw))
    .map((q) => ({ ...q, relevance: matchContent(q.tokens, contentIndex).topicalRelevanceScore }))
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, MAX_EXPANSION);

  for (const candidate of rankedExpansion) {
    const { google, youtube } = await fetchBothAutocomplete(candidate.raw);
    for (const q of google) addDiscovered(q, "google-autocomplete", 1);
    for (const q of youtube) addDiscovered(q, "youtube-autocomplete", 1);
  }

  return Array.from(discovered.values());
}

// ─── Types ──────────────────────────────────────────────────────────────────

export type QueryBreadth = "head" | "long-tail";
export type ConfidenceLevel = "high" | "medium" | "low";
export type RecommendedAction =
  | "create_new_pillar"
  | "create_cluster_article"
  | "improve_existing_page"
  | "add_faqs"
  | "add_portfolio"
  | "add_internal_links";

export interface KeywordScoreBreakdown {
  topicalRelevanceScore: number;
  commercialValueScore: number;
  seasonalBoostScore: number;
  contentCoverageScore: number;
  confidenceScore: number;
  totalScore: number;
}

export interface SampleQuery {
  query: string;
  source: DiscoverySource;
  depth: number;
}

export interface KeywordDiscoveryTopic {
  topicKey: string;
  topicLabel: string;
  sampleQueries: SampleQuery[];
  queryBreadth: QueryBreadth;
  intent: Intent;
  scoreBreakdown: KeywordScoreBreakdown;
  confidenceLevel: ConfidenceLevel;
  confidenceReasons: string[];
  isSeasonal: boolean;
  seasonalPeriod?: string;
  contentCoverage: ContentCoverage;
  matchedContentPath?: string;
  recommendedAction: RecommendedAction;
  recommendedActionDetail: string;
  linkedSeoOpportunityKey?: string;
}

// ─── Recommended action ─────────────────────────────────────────────────────

function recommendAction(
  rawQueries: string[],
  coverage: ContentCoverage,
  matchedPath: string | undefined,
  breadth: QueryBreadth,
  topicalRelevanceScore: number
): { action: RecommendedAction; detail: string } {
  const joined = rawQueries.join(" | ");

  if (coverage === "none") {
    if (breadth === "head" && topicalRelevanceScore >= 70) {
      return {
        action: "create_new_pillar",
        detail: `Broad, highly relevant topic with no existing content. Build a dedicated pillar page targeting: ${rawQueries.slice(0, 5).join(", ")}.`,
      };
    }
    return {
      action: "create_cluster_article",
      detail: `Specific long-tail topic with no existing content. Write a supporting cluster article targeting: ${rawQueries.slice(0, 5).join(", ")}.`,
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
      action: "add_portfolio",
      detail: `Searchers want visual proof. Add tagged portfolio items for this topic${matchedPath ? ` and link them from ${matchedPath}` : ""}.`,
    };
  }
  if (coverage === "thin") {
    return {
      action: "improve_existing_page",
      detail: `${matchedPath ?? "The matching page"} is thin or stale for this topic — expand its content depth (more detail, FAQs, proof).`,
    };
  }
  return {
    action: "add_internal_links",
    detail: `${matchedPath ?? "The matching page"} already covers this well but appears isolated — add internal links to and from it.`,
  };
}

// ─── Scoring ─────────────────────────────────────────────────────────────────

const INTENT_VALUE: Record<Intent, number> = {
  transactional: 100,
  commercial: 90,
  informational: 55,
  navigational: 15,
};

const CONFIDENCE_SCORE: Record<ConfidenceLevel, number> = { high: 90, medium: 60, low: 30 };

// Favors genuine content gaps (nothing to lose by creating something new)
// over topics where strong content already exists — the opposite emphasis
// from the GSC-driven engine, which favors topics already ranking.
function contentCoverageScoreFor(coverage: ContentCoverage): number {
  return coverage === "none" ? 90 : coverage === "thin" ? 70 : 40;
}

const WEIGHTS = {
  topicalRelevance: 0.3,
  commercialValue: 0.2,
  contentCoverage: 0.3,
  confidence: 0.15,
  seasonalBoost: 0.05,
};

const MIN_TOPICAL_RELEVANCE = 30; // below this, treat as noise and drop entirely

// ─── Main computation ───────────────────────────────────────────────────────

export async function computeKeywordDiscoveryTopics(fetchClient: FetchClient = client): Promise<KeywordDiscoveryTopic[]> {
  const [taxonomyNodes, contentIndex] = await Promise.all([
    fetchAllTaxonomyNodes(fetchClient),
    buildContentIndex(fetchClient),
  ]);

  const seeds = buildSeeds(taxonomyNodes);
  const discovered = await discoverQueries(seeds, contentIndex);
  const clusters = clusterQueries(discovered);

  const topics: KeywordDiscoveryTopic[] = [];

  for (const cluster of clusters) {
    const rawQueries = cluster.members.map((m) => m.query);
    const clusterTokens = cluster.sharedTokens.length > 0 ? cluster.sharedTokens : cluster.members[0].tokens;
    const { coverage, matchedPath, topicalRelevanceScore } = matchContent(clusterTokens, contentIndex);
    if (topicalRelevanceScore < MIN_TOPICAL_RELEVANCE) continue; // drop noise

    const intent = classifyIntent(rawQueries);
    const seasonal = detectSeasonal(rawQueries);

    const allSources = new Set<DiscoverySource>();
    let minDepth = Infinity;
    for (const m of cluster.members) {
      for (const s of m.sources) allSources.add(s);
      minDepth = Math.min(minDepth, m.depth);
    }
    const confirmedByGoogle = allSources.has("google-autocomplete");
    const confirmedByYoutube = allSources.has("youtube-autocomplete");

    let confidenceLevel: ConfidenceLevel;
    if (confirmedByGoogle && confirmedByYoutube) confidenceLevel = "high";
    else if (confirmedByGoogle || confirmedByYoutube) confidenceLevel = "medium";
    else confidenceLevel = "low";

    const confidenceReasons: string[] = [];
    if (confidenceLevel === "high") {
      confidenceReasons.push("Confirmed independently by both Google and YouTube autocomplete.");
    } else if (confidenceLevel === "medium") {
      confidenceReasons.push(`Confirmed by ${confirmedByGoogle ? "Google" : "YouTube"} autocomplete only.`);
    } else {
      confidenceReasons.push("Seed topic generated from site taxonomy — not yet confirmed by any autocomplete source.");
    }
    if (minDepth >= 1) confidenceReasons.push("Surfaced via one round of recursive expansion, not a direct seed suggestion.");
    confidenceReasons.push(`Based on ${cluster.members.length} distinct sample quer${cluster.members.length === 1 ? "y" : "ies"}.`);
    if (matchedPath) confidenceReasons.push(`Matched to existing content at ${matchedPath}.`);
    else confidenceReasons.push("No matching content found on the site — flagged as a content gap.");

    const topLabelMember = [...cluster.members].sort((a, b) => {
      const aOverlap = a.tokens.filter((t) => clusterTokens.includes(t)).length;
      const bOverlap = b.tokens.filter((t) => clusterTokens.includes(t)).length;
      if (aOverlap !== bOverlap) return bOverlap - aOverlap;
      return a.query.length - b.query.length;
    })[0];
    const topLabel = topLabelMember.query;
    const breadth: QueryBreadth = topLabelMember.tokens.length <= 3 ? "head" : "long-tail";

    const commercialValueScore = INTENT_VALUE[intent];
    const contentCovScore = contentCoverageScoreFor(coverage);
    const confidenceScore = CONFIDENCE_SCORE[confidenceLevel];
    const seasonalBoostScore = seasonal.isSeasonal ? 90 : 50;

    const totalScore =
      topicalRelevanceScore * WEIGHTS.topicalRelevance +
      commercialValueScore * WEIGHTS.commercialValue +
      contentCovScore * WEIGHTS.contentCoverage +
      confidenceScore * WEIGHTS.confidence +
      seasonalBoostScore * WEIGHTS.seasonalBoost;

    const { action, detail } = recommendAction(rawQueries, coverage, matchedPath, breadth, topicalRelevanceScore);

    const sampleQueries: SampleQuery[] = cluster.members.flatMap((m) =>
      Array.from(m.sources).map((source) => ({ query: m.query, source, depth: m.depth }))
    );

    topics.push({
      topicKey: topicKeyFor(cluster.sharedTokens, topLabel),
      topicLabel: topLabel.replace(/\b\w/g, (c) => c.toUpperCase()),
      sampleQueries,
      queryBreadth: breadth,
      intent,
      scoreBreakdown: {
        topicalRelevanceScore,
        commercialValueScore,
        seasonalBoostScore,
        contentCoverageScore: contentCovScore,
        confidenceScore,
        totalScore,
      },
      confidenceLevel,
      confidenceReasons,
      isSeasonal: seasonal.isSeasonal,
      seasonalPeriod: seasonal.seasonalPeriod,
      contentCoverage: coverage,
      matchedContentPath: matchedPath,
      recommendedAction: action,
      recommendedActionDetail: detail,
    });
  }

  return topics.sort((a, b) => b.scoreBreakdown.totalScore - a.scoreBreakdown.totalScore);
}

// ─── Persistence (merge with live SEO Opportunity data, never replace) ─────

interface StoredKeywordTopic {
  _id: string;
  topicKey: string;
  status?: string;
  actionedAt?: string;
  history?: { date: string; score: number; confidenceLevel: string }[];
  firstSeenAt?: string;
  linkedSeoOpportunityKey?: string;
}

function docIdForTopic(topicKey: string): string {
  return `keyword-discovery-${topicKey}`;
}

function bumpConfidence(level: ConfidenceLevel): ConfidenceLevel {
  return level === "low" ? "medium" : level === "medium" ? "high" : "high";
}

export async function persistKeywordDiscoveryTopics(
  topics: KeywordDiscoveryTopic[]
): Promise<{ upserted: number; linked: number }> {
  const today = new Date().toISOString().slice(0, 10);
  const nowIso = new Date().toISOString();

  const [existing, seoOpportunityKeys] = await Promise.all([
    client.fetch<StoredKeywordTopic[]>(
      `*[_type == "keywordDiscoveryTopic"]{ _id, topicKey, status, actionedAt, history, firstSeenAt, linkedSeoOpportunityKey }`
    ),
    client.fetch<string[]>(`*[_type == "seoOpportunity"].topicKey`),
  ]);
  const existingByKey = new Map(existing.map((e) => [e.topicKey, e]));
  const seoOpportunityKeySet = new Set(seoOpportunityKeys);

  let linked = 0;
  let tx = writeClient.transaction();

  for (const topic of topics) {
    const prior = existingByKey.get(topic.topicKey);
    const history = [...(prior?.history ?? [])];
    if (history[history.length - 1]?.date !== today) {
      history.push({ date: today, score: topic.scoreBreakdown.totalScore, confidenceLevel: topic.confidenceLevel });
    }

    const isLinked = seoOpportunityKeySet.has(topic.topicKey);
    let confidenceLevel = topic.confidenceLevel;
    const confidenceReasons = [...topic.confidenceReasons];
    if (isLinked) {
      confidenceLevel = bumpConfidence(confidenceLevel);
      confidenceReasons.push("Confirmed by real Search Console click data — the same topic was independently detected by the SEO Opportunity Engine.");
      if (!prior?.linkedSeoOpportunityKey) linked++;
    }

    tx = tx.createOrReplace({
      _id: docIdForTopic(topic.topicKey),
      _type: "keywordDiscoveryTopic",
      topicKey: topic.topicKey,
      topicLabel: topic.topicLabel,
      sampleQueries: topic.sampleQueries,
      queryBreadth: topic.queryBreadth,
      intent: topic.intent,
      scoreBreakdown: topic.scoreBreakdown,
      confidenceLevel,
      confidenceReasons,
      isSeasonal: topic.isSeasonal,
      seasonalPeriod: topic.seasonalPeriod,
      contentCoverage: topic.contentCoverage,
      matchedContentPath: topic.matchedContentPath,
      recommendedAction: topic.recommendedAction,
      recommendedActionDetail: topic.recommendedActionDetail,
      linkedSeoOpportunityKey: isLinked ? topic.topicKey : undefined,
      status: prior?.status ?? "new",
      actionedAt: prior?.actionedAt,
      history,
      firstSeenAt: prior?.firstSeenAt ?? nowIso,
      lastComputedAt: nowIso,
    });
  }

  await tx.commit();
  return { upserted: topics.length, linked };
}

// ─── Read helpers (for the UI — no recomputation, just what's stored) ──────

export interface StoredKeywordDiscoveryTopic extends KeywordDiscoveryTopic {
  status: "new" | "acknowledged" | "in_progress" | "done" | "dismissed";
  actionedAt?: string;
  history: { date: string; score: number; confidenceLevel: string }[];
  firstSeenAt: string;
  lastComputedAt: string;
}

const KEYWORD_TOPIC_PROJECTION = `{
  topicKey, topicLabel, sampleQueries, queryBreadth, intent, scoreBreakdown,
  confidenceLevel, confidenceReasons, isSeasonal, seasonalPeriod, contentCoverage,
  matchedContentPath, recommendedAction, recommendedActionDetail,
  linkedSeoOpportunityKey, status, actionedAt, history, firstSeenAt, lastComputedAt
}`;

export async function getKeywordDiscoveryTopics(): Promise<StoredKeywordDiscoveryTopic[]> {
  return client.fetch<StoredKeywordDiscoveryTopic[]>(
    `*[_type == "keywordDiscoveryTopic"] | order(scoreBreakdown.totalScore desc) ${KEYWORD_TOPIC_PROJECTION}`
  );
}

export async function getKeywordDiscoveryTopicByKey(topicKey: string): Promise<StoredKeywordDiscoveryTopic | null> {
  return client.fetch<StoredKeywordDiscoveryTopic | null>(
    `*[_type == "keywordDiscoveryTopic" && topicKey == $topicKey][0] ${KEYWORD_TOPIC_PROJECTION}`,
    { topicKey }
  );
}
