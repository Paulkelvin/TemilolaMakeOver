import { client } from "@/sanity/client";
import { writeClient } from "@/sanity/write-client";
import { type FetchClient } from "./content";
import { COMPETITOR_SITES, DEFAULT_CRAWL_DELAY_MS, MAX_PAGES_PER_COMPETITOR } from "./competitor-registry";
import {
  fetchRobotsRules,
  fetchSitemapUrls,
  fetchHomepageLinks,
  fetchPageSignal,
  isDisallowed,
} from "./sources/competitor-sites";
import {
  normalizeQuery,
  buildContentIndex,
  matchContent,
  topicKeyFor,
  QUESTION_PATTERN,
  VISUAL_PATTERN,
} from "./keyword-utils";

/**
 * Competitor Content Gap — crawls real, curated competitor sites
 * (lib/intelligence/competitor-registry.ts) respecting their robots.txt
 * (crawl-delay honored, Disallow paths skipped), and flags topics they
 * cover that this site genuinely doesn't. Reuses the exact same
 * clustering/matching pipeline as the other two engines (matchContent
 * against the real-evidence content index from Phase 1) so results are
 * directly comparable. Never suggests copying the competitor — only ever
 * recommends creating original content on a topic they've proven has
 * real-world demand.
 */

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type RecommendedAction = "create_new_pillar" | "create_cluster_article" | "add_faqs" | "add_portfolio";

export interface CompetitorGapTopic {
  topicKey: string;
  topicLabel: string;
  competitorName: string;
  competitorUrl: string;
  sampleTitle: string;
  topicalRelevanceScore: number;
  recommendedAction: RecommendedAction;
  recommendedActionDetail: string;
}

const MIN_TOPICAL_RELEVANCE = 30; // same noise floor as the other two engines

function recommendAction(title: string, h1: string, breadth: "head" | "long-tail"): { action: RecommendedAction; detail: string } {
  const joined = `${title} ${h1}`;
  const label = title || h1;
  if (QUESTION_PATTERN.test(joined)) {
    return { action: "add_faqs", detail: `A competitor answers this as a question that this site doesn't yet. Add an FAQ entry covering: ${label}.` };
  }
  if (VISUAL_PATTERN.test(joined)) {
    return { action: "add_portfolio", detail: `A competitor uses this as a visual/proof angle. Add tagged portfolio items covering: ${label}.` };
  }
  if (breadth === "head") {
    return { action: "create_new_pillar", detail: `A competitor has a dedicated page for this broad topic that this site doesn't have. Consider a pillar page covering: ${label}.` };
  }
  return { action: "create_cluster_article", detail: `A competitor covers this specific topic that this site doesn't. Consider a cluster article covering: ${label}.` };
}

async function crawlCompetitor(
  competitor: (typeof COMPETITOR_SITES)[number],
  ourContentIndex: Awaited<ReturnType<typeof buildContentIndex>>
): Promise<CompetitorGapTopic[]> {
  const robots = await fetchRobotsRules(competitor.domain, DEFAULT_CRAWL_DELAY_MS);

  const [sitemapUrls, homepageLinks] = await Promise.all([
    fetchSitemapUrls(competitor.domain, robots.sitemapUrl),
    fetchHomepageLinks(competitor.domain),
  ]);
  const seen = new Set<string>();
  const candidateUrls = [...sitemapUrls, ...homepageLinks].filter((url) => {
    if (seen.has(url)) return false;
    seen.add(url);
    return !isDisallowed(url, robots.disallowedPaths);
  });
  const urls = candidateUrls.slice(0, MAX_PAGES_PER_COMPETITOR);

  const gaps: CompetitorGapTopic[] = [];
  const gapKeysSeen = new Set<string>();

  for (let i = 0; i < urls.length; i++) {
    if (i > 0) await delay(robots.crawlDelayMs);

    let signal;
    try {
      signal = await fetchPageSignal(urls[i]);
    } catch {
      continue; // dead link or fetch error — skip, not fatal to the run
    }

    const label = signal.title || signal.h1;
    if (!label) continue;
    const { tokens } = normalizeQuery(`${signal.title} ${signal.h1}`);
    if (tokens.length === 0) continue;

    const { coverage, topicalRelevanceScore } = matchContent(tokens, ourContentIndex);
    if (coverage !== "none" || topicalRelevanceScore < MIN_TOPICAL_RELEVANCE) continue; // not a gap, or not genuinely on-topic

    const topicKey = topicKeyFor(tokens, label);
    if (gapKeysSeen.has(topicKey)) continue; // same topic already recorded from another competitor page
    gapKeysSeen.add(topicKey);

    const breadth: "head" | "long-tail" = tokens.length <= 3 ? "head" : "long-tail";
    const { action, detail } = recommendAction(signal.title, signal.h1, breadth);

    gaps.push({
      topicKey,
      topicLabel: label.replace(/\b\w/g, (c) => c.toUpperCase()),
      competitorName: competitor.name,
      competitorUrl: urls[i],
      sampleTitle: label,
      topicalRelevanceScore,
      recommendedAction: action,
      recommendedActionDetail: detail,
    });
  }

  return gaps;
}

export async function computeCompetitorGaps(fetchClient: FetchClient = client): Promise<CompetitorGapTopic[]> {
  const ourContentIndex = await buildContentIndex(fetchClient);
  const results = await Promise.all(COMPETITOR_SITES.map((c) => crawlCompetitor(c, ourContentIndex)));
  return results.flat().sort((a, b) => b.topicalRelevanceScore - a.topicalRelevanceScore);
}

// ─── Persistence ────────────────────────────────────────────────────────────

interface StoredGapDoc {
  _id: string;
  topicKey: string;
  status?: string;
  actionedAt?: string;
  history?: { date: string; topicalRelevanceScore: number }[];
  firstSeenAt?: string;
}

function docIdForTopic(topicKey: string): string {
  return `competitor-gap-${topicKey}`;
}

export async function persistCompetitorGaps(gaps: CompetitorGapTopic[]): Promise<{ upserted: number }> {
  const today = new Date().toISOString().slice(0, 10);
  const nowIso = new Date().toISOString();

  const existing = await client.fetch<StoredGapDoc[]>(
    `*[_type == "competitorGapTopic"]{ _id, topicKey, status, actionedAt, history, firstSeenAt }`
  );
  const existingByKey = new Map(existing.map((e) => [e.topicKey, e]));

  let tx = writeClient.transaction();

  for (const gap of gaps) {
    const prior = existingByKey.get(gap.topicKey);
    const history = [...(prior?.history ?? [])];
    if (history[history.length - 1]?.date !== today) {
      history.push({ date: today, topicalRelevanceScore: gap.topicalRelevanceScore });
    }

    tx = tx.createOrReplace({
      _id: docIdForTopic(gap.topicKey),
      _type: "competitorGapTopic",
      topicKey: gap.topicKey,
      topicLabel: gap.topicLabel,
      competitorName: gap.competitorName,
      competitorUrl: gap.competitorUrl,
      sampleTitle: gap.sampleTitle,
      topicalRelevanceScore: gap.topicalRelevanceScore,
      recommendedAction: gap.recommendedAction,
      recommendedActionDetail: gap.recommendedActionDetail,
      status: prior?.status ?? "new",
      actionedAt: prior?.actionedAt,
      history,
      firstSeenAt: prior?.firstSeenAt ?? nowIso,
      lastComputedAt: nowIso,
    });
  }

  await tx.commit();
  return { upserted: gaps.length };
}

// ─── Read helpers ───────────────────────────────────────────────────────────

export interface StoredCompetitorGapTopic extends CompetitorGapTopic {
  status: "new" | "acknowledged" | "in_progress" | "done" | "dismissed";
  actionedAt?: string;
  history: { date: string; topicalRelevanceScore: number }[];
  firstSeenAt: string;
  lastComputedAt: string;
}

const GAP_PROJECTION = `{
  topicKey, topicLabel, competitorName, competitorUrl, sampleTitle, topicalRelevanceScore,
  recommendedAction, recommendedActionDetail, status, actionedAt, history, firstSeenAt, lastComputedAt
}`;

export async function getCompetitorGaps(): Promise<StoredCompetitorGapTopic[]> {
  return client.fetch<StoredCompetitorGapTopic[]>(
    `*[_type == "competitorGapTopic"] | order(topicalRelevanceScore desc) ${GAP_PROJECTION}`
  );
}

export async function getCompetitorGapByKey(topicKey: string): Promise<StoredCompetitorGapTopic | null> {
  return client.fetch<StoredCompetitorGapTopic | null>(
    `*[_type == "competitorGapTopic" && topicKey == $topicKey][0] ${GAP_PROJECTION}`,
    { topicKey }
  );
}
