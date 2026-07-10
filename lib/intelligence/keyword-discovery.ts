import { client } from "@/sanity/client";
import { writeClient } from "@/sanity/write-client";
import { fetchAllTaxonomyNodes, type FetchClient } from "./content";
import { PRIORITY_KEYWORDS } from "./registry";
import type { TaxonomyNode } from "./types";
import { getGoogleAutocomplete, getYouTubeAutocomplete, getBingAutocomplete, getDuckDuckGoAutocomplete, generateAlphabetVariants } from "./sources/keyword-discovery-sources";
import {
  normalizeQuery,
  clusterQueries,
  classifyIntentDetailed,
  detectSeasonal,
  buildContentIndex,
  matchContent,
  topicKeyFor,
  computePriorityScore,
  QUESTION_PATTERN,
  VISUAL_PATTERN,
  type ClusterableQuery,
  type Intent,
  type IntentClassification,
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

const MAX_SEEDS = 60;

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
    seeds.add(`makeup artist near ${name}`);
  }

  const makeupQualifiedBase = [
    ...serviceLikeNames,
    ...[...eventNames].map((name) => `${name} makeup`),
  ];
  const priorityNames = makeupQualifiedBase
    .sort((a, b) => Number(isPriorityName(b)) - Number(isPriorityName(a)))
    .slice(0, 10);

  // Commercial-intent modifiers — trust, price, and booking signals real
  // clients type into search, applied to whatever services/events actually
  // exist in the taxonomy right now (never a hardcoded service name), so a
  // discontinued offering never gets re-seeded just because it's in this list.
  for (const name of priorityNames) {
    seeds.add(`${name} near me`);
    seeds.add(`how much does ${name} cost`);
    seeds.add(`${name} price`);
    seeds.add(`best ${name}`);
    seeds.add(`affordable ${name}`);
    seeds.add(`professional ${name}`);
    seeds.add(`${name} reviews`);
    seeds.add(`book ${name}`);
  }
  for (const name of priorityNames.slice(0, 5)) {
    seeds.add(`${name} tutorial`);
    seeds.add(`${name} before and after`);
  }

  // Nigerian bridal/event market anchors — real, observed local search culture
  // (owambe, aso-ebi, traditional vs. white wedding) rather than generic
  // Western bridal phrasing, since that's this business's actual market.
  seeds.add("makeup artist lagos");
  seeds.add("bridal makeup cost lagos");
  seeds.add("owambe makeup");
  seeds.add("owambe makeup artist");
  seeds.add("aso ebi makeup");
  seeds.add("traditional wedding makeup");
  seeds.add("white wedding makeup");
  seeds.add("engagement makeup");
  seeds.add("bridal party makeup");
  seeds.add("makeup for dark skin");
  seeds.add("makeup that lasts all day");

  return Array.from(seeds).slice(0, MAX_SEEDS);
}

// ─── Autocomplete fetching (bounded budget, polite delay) ──────────────────

const MAX_EXPANSION = 20;
const REQUEST_DELAY_MS = 150;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchAllAutocomplete(
  query: string
): Promise<{ google: string[]; youtube: string[]; bing: string[]; duckduckgo: string[] }> {
  const google = await getGoogleAutocomplete(query).catch(() => []);
  await delay(REQUEST_DELAY_MS);
  const youtube = await getYouTubeAutocomplete(query).catch(() => []);
  await delay(REQUEST_DELAY_MS);
  const bing = await getBingAutocomplete(query).catch(() => []);
  await delay(REQUEST_DELAY_MS);
  const duckduckgo = await getDuckDuckGoAutocomplete(query).catch(() => []);
  await delay(REQUEST_DELAY_MS);
  return { google, youtube, bing, duckduckgo };
}

// ─── Discovered-query accumulation ──────────────────────────────────────────

export type DiscoverySource = "google-autocomplete" | "youtube-autocomplete" | "bing-autocomplete" | "duckduckgo-autocomplete" | "seed";

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
    const { google, youtube, bing, duckduckgo } = await fetchAllAutocomplete(seed);
    if (google.length === 0 && youtube.length === 0 && bing.length === 0 && duckduckgo.length === 0) {
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
    for (const q of bing) {
      addDiscovered(q, "bing-autocomplete", 0);
      expansionCandidates.push(q);
    }
    for (const q of duckduckgo) {
      addDiscovered(q, "duckduckgo-autocomplete", 0);
      expansionCandidates.push(q);
    }
  }

  // Alphabet expansion on the top 15 highest-priority seeds for deeper
  // long-tail discovery (15 × 26 = 390 Google-only requests at 150ms ≈ 58s).
  const ALPHABET_EXPANSION_SEEDS = 15;
  const prioritySeeds = seeds.slice(0, ALPHABET_EXPANSION_SEEDS);
  for (const seed of prioritySeeds) {
    const variants = generateAlphabetVariants(seed);
    for (const variant of variants) {
      const results = await getGoogleAutocomplete(variant).catch(() => []);
      await delay(REQUEST_DELAY_MS);
      for (const q of results) {
        addDiscovered(q, "google-autocomplete", 0);
        expansionCandidates.push(q);
      }
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
    const { google, youtube, bing, duckduckgo } = await fetchAllAutocomplete(candidate.raw);
    for (const q of google) addDiscovered(q, "google-autocomplete", 1);
    for (const q of youtube) addDiscovered(q, "youtube-autocomplete", 1);
    for (const q of bing) addDiscovered(q, "bing-autocomplete", 1);
    for (const q of duckduckgo) addDiscovered(q, "duckduckgo-autocomplete", 1);
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
  intentClassification: IntentClassification;
  priorityScore: number;
  scoreBreakdown: KeywordScoreBreakdown;
  confidenceLevel: ConfidenceLevel;
  confidenceReasons: string[];
  isSeasonal: boolean;
  seasonalPeriod?: string;
  contentCoverage: ContentCoverage;
  matchedContentPath?: string;
  recommendedAction: RecommendedAction;
  recommendedActionDetail: string;
  decisionTrace: string[];
  linkedSeoOpportunityKey?: string;
}

// ─── Recommended action ─────────────────────────────────────────────────────

function recommendAction(
  rawQueries: string[],
  coverage: ContentCoverage,
  matchedPath: string | undefined,
  breadth: QueryBreadth,
  topicalRelevanceScore: number
): { action: RecommendedAction; detail: string; trace: string[] } {
  const joined = rawQueries.join(" | ");
  const trace: string[] = [];

  trace.push(`1. Coverage === "none"? ${coverage === "none" ? "YES" : "no"} (coverage = "${coverage}")`);
  if (coverage === "none") {
    const isHeadAndRelevant = breadth === "head" && topicalRelevanceScore >= 70;
    trace.push(`2. Breadth === "head" AND topical relevance >= 70? ${isHeadAndRelevant ? "YES" : "no"} (breadth = "${breadth}", relevance = ${topicalRelevanceScore})`);
    if (isHeadAndRelevant) {
      trace.push("-> create_new_pillar (broad + highly relevant + no content = worth a dedicated page)");
      return {
        action: "create_new_pillar",
        detail: `Broad, highly relevant topic with no existing content. Build a dedicated pillar page targeting: ${rawQueries.slice(0, 5).join(", ")}.`,
        trace,
      };
    }
    trace.push("-> create_cluster_article (long-tail or lower relevance = a supporting article, not a pillar)");
    return {
      action: "create_cluster_article",
      detail: `Specific long-tail topic with no existing content. Write a supporting cluster article targeting: ${rawQueries.slice(0, 5).join(", ")}.`,
      trace,
    };
  }

  const isQuestion = QUESTION_PATTERN.test(joined);
  trace.push(`2. Question-form query? ${isQuestion ? "YES" : "no"}`);
  if (isQuestion) {
    trace.push("-> add_faqs");
    return {
      action: "add_faqs",
      detail: `These are question-form searches. Add FAQ entries answering them directly${matchedPath ? ` on ${matchedPath}` : ""}.`,
      trace,
    };
  }

  const wantsVisual = VISUAL_PATTERN.test(joined);
  trace.push(`3. Visual/proof language? ${wantsVisual ? "YES" : "no"}`);
  if (wantsVisual) {
    trace.push("-> add_portfolio");
    return {
      action: "add_portfolio",
      detail: `Searchers want visual proof. Add tagged portfolio items for this topic${matchedPath ? ` and link them from ${matchedPath}` : ""}.`,
      trace,
    };
  }

  trace.push(`4. Coverage === "thin"? ${coverage === "thin" ? "YES" : "no"}`);
  if (coverage === "thin") {
    trace.push("-> improve_existing_page");
    return {
      action: "improve_existing_page",
      detail: `${matchedPath ?? "The matching page"} is thin or stale for this topic — expand its content depth (more detail, FAQs, proof).`,
      trace,
    };
  }
  trace.push('5. Coverage is "existing-strong" and no other rule fired -> add_internal_links (well-covered but isolated)');
  return {
    action: "add_internal_links",
    detail: `${matchedPath ?? "The matching page"} already covers this well but appears isolated — add internal links to and from it.`,
    trace,
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

    const intentClassification = classifyIntentDetailed(rawQueries);
    const intent = intentClassification.intent;
    const seasonal = detectSeasonal(rawQueries);

    const allSources = new Set<DiscoverySource>();
    let minDepth = Infinity;
    for (const m of cluster.members) {
      for (const s of m.sources) allSources.add(s);
      minDepth = Math.min(minDepth, m.depth);
    }
    const confirmedByGoogle = allSources.has("google-autocomplete");
    const confirmedByYoutube = allSources.has("youtube-autocomplete");
    const confirmedByBing = allSources.has("bing-autocomplete");
    const confirmedByDuckDuckGo = allSources.has("duckduckgo-autocomplete");
    const sourceCount = [confirmedByGoogle, confirmedByYoutube, confirmedByBing, confirmedByDuckDuckGo].filter(Boolean).length;
    const sourceNames = [
      confirmedByGoogle && "Google",
      confirmedByYoutube && "YouTube",
      confirmedByBing && "Bing",
      confirmedByDuckDuckGo && "DuckDuckGo",
    ].filter(Boolean) as string[];

    let confidenceLevel: ConfidenceLevel;
    if (sourceCount >= 2) confidenceLevel = "high";
    else if (sourceCount === 1) confidenceLevel = "medium";
    else confidenceLevel = "low";

    const confidenceReasons: string[] = [];
    if (sourceCount >= 4) {
      confidenceReasons.push("Confirmed independently by all four autocomplete sources (Google, YouTube, Bing, DuckDuckGo).");
    } else if (sourceCount >= 2) {
      confidenceReasons.push(`Confirmed independently by ${sourceNames.join(" and ")} autocomplete.`);
    } else if (sourceCount === 1) {
      confidenceReasons.push(`Confirmed by ${sourceNames[0]} autocomplete only.`);
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

    const { action, detail, trace } = recommendAction(rawQueries, coverage, matchedPath, breadth, topicalRelevanceScore);
    const priorityScore = computePriorityScore(totalScore, action);

    const sampleQueries: SampleQuery[] = cluster.members.flatMap((m) =>
      Array.from(m.sources).map((source) => ({ query: m.query, source, depth: m.depth }))
    );

    topics.push({
      topicKey: topicKeyFor(cluster.sharedTokens, topLabel),
      topicLabel: topLabel.replace(/\b\w/g, (c) => c.toUpperCase()),
      sampleQueries,
      queryBreadth: breadth,
      intent,
      intentClassification,
      priorityScore,
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
      decisionTrace: trace,
    });
  }

  // Priority queue = value ÷ effort, not value alone — a 30-minute FAQ
  // addition can rank above a multi-day pillar page even at a lower raw score.
  return topics.sort((a, b) => b.priorityScore - a.priorityScore);
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
      intentClassification: topic.intentClassification,
      priorityScore: topic.priorityScore,
      scoreBreakdown: topic.scoreBreakdown,
      confidenceLevel,
      confidenceReasons,
      isSeasonal: topic.isSeasonal,
      seasonalPeriod: topic.seasonalPeriod,
      contentCoverage: topic.contentCoverage,
      matchedContentPath: topic.matchedContentPath,
      recommendedAction: topic.recommendedAction,
      recommendedActionDetail: topic.recommendedActionDetail,
      decisionTrace: topic.decisionTrace,
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
  topicKey, topicLabel, sampleQueries, queryBreadth, intent, intentClassification,
  priorityScore, scoreBreakdown, confidenceLevel, confidenceReasons, isSeasonal,
  seasonalPeriod, contentCoverage, matchedContentPath, recommendedAction,
  recommendedActionDetail, decisionTrace,
  linkedSeoOpportunityKey, status, actionedAt, history, firstSeenAt, lastComputedAt
}`;

export async function getKeywordDiscoveryTopics(): Promise<StoredKeywordDiscoveryTopic[]> {
  return client.fetch<StoredKeywordDiscoveryTopic[]>(
    `*[_type == "keywordDiscoveryTopic"] | order(priorityScore desc) ${KEYWORD_TOPIC_PROJECTION}`
  );
}

export async function getKeywordDiscoveryTopicByKey(topicKey: string): Promise<StoredKeywordDiscoveryTopic | null> {
  return client.fetch<StoredKeywordDiscoveryTopic | null>(
    `*[_type == "keywordDiscoveryTopic" && topicKey == $topicKey][0] ${KEYWORD_TOPIC_PROJECTION}`,
    { topicKey }
  );
}
