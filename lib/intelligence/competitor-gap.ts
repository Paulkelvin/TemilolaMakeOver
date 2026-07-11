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
  type PageSignal,
} from "./sources/competitor-sites";
import {
  normalizeQuery,
  buildContentIndex,
  matchContent,
  topicKeyFor,
  computePriorityScore,
  QUESTION_PATTERN,
  VISUAL_PATTERN,
  type ContentIndexEntry,
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

// ─── Content strength scoring (A2) ─────────────────────────────────────────

export interface ContentStrength {
  depthScore: number;
  structureScore: number;
  richMediaScore: number;
  linkAuthorityScore: number;
  totalScore: number;
  breakdownTrace: string[];
}

const CS_WEIGHTS = { depth: 0.35, structure: 0.25, richMedia: 0.20, linkAuthority: 0.20 };

function computeContentStrength(signal: PageSignal): ContentStrength {
  const trace: string[] = [];

  const wc = signal.approximateWordCount;
  const depthScore = wc < 300 ? 20 : wc < 800 ? 50 : wc < 1500 ? 75 : 100;
  trace.push(`Depth: ${wc} words → ${depthScore}/100`);

  const hc = signal.headings.length;
  const structureScore = hc === 0 ? 10 : hc <= 3 ? 50 : hc <= 7 ? 75 : 100;
  trace.push(`Structure: ${hc} headings → ${structureScore}/100`);

  const ic = signal.imageCount;
  const schemaBonus = signal.hasSchemaJsonLd ? 20 : 0;
  const richMediaScore = Math.min(100, (ic === 0 ? 10 : ic <= 3 ? 40 : ic <= 8 ? 65 : 85) + schemaBonus);
  trace.push(`Rich media: ${ic} images${signal.hasSchemaJsonLd ? " + JSON-LD" : ""} → ${richMediaScore}/100`);

  const lc = signal.internalLinkCount + signal.externalLinkCount;
  const linkAuthorityScore = lc === 0 ? 10 : lc <= 5 ? 40 : lc <= 15 ? 65 : lc <= 30 ? 80 : 100;
  trace.push(`Link authority: ${signal.internalLinkCount} internal + ${signal.externalLinkCount} external → ${linkAuthorityScore}/100`);

  const totalScore = Math.round(
    depthScore * CS_WEIGHTS.depth +
    structureScore * CS_WEIGHTS.structure +
    richMediaScore * CS_WEIGHTS.richMedia +
    linkAuthorityScore * CS_WEIGHTS.linkAuthority
  );
  trace.push(`Total: ${totalScore}/100`);

  return { depthScore, structureScore, richMediaScore, linkAuthorityScore, totalScore, breakdownTrace: trace };
}

// ─── Subtopic gap extraction (A4) ──────────────────────────────────────────

export interface SubtopicGap {
  heading: string;
  headingLevel: number;
  relevanceScore: number;
}

const MIN_SUBTOPIC_RELEVANCE = 30;

function extractSubtopicGaps(signal: PageSignal, contentIndex: ContentIndexEntry[]): SubtopicGap[] {
  const gaps: SubtopicGap[] = [];
  for (const h of signal.headings) {
    const { tokens } = normalizeQuery(h.text);
    if (tokens.length === 0) continue;
    const { coverage, topicalRelevanceScore } = matchContent([tokens], contentIndex);
    if (coverage === "none" && topicalRelevanceScore >= MIN_SUBTOPIC_RELEVANCE) {
      gaps.push({ heading: h.text, headingLevel: h.level, relevanceScore: topicalRelevanceScore });
    }
  }
  return gaps;
}

export type RecommendedAction = "create_new_pillar" | "create_cluster_article" | "add_faqs" | "add_portfolio";

export interface CompetitorGapTopic {
  topicKey: string;
  topicLabel: string;
  competitorName: string;
  competitorUrl: string;
  sampleTitle: string;
  topicalRelevanceScore: number;
  priorityScore: number;
  recommendedAction: RecommendedAction;
  recommendedActionDetail: string;
  decisionTrace: string[];
  contentStrength: ContentStrength;
  subtopicGaps: SubtopicGap[];
  competitorWordCount: number;
  competitorHeadingCount: number;
  depthDelta: number | null;
}

const MIN_TOPICAL_RELEVANCE = 30; // same noise floor as the other two engines

function recommendAction(title: string, h1: string, breadth: "head" | "long-tail"): { action: RecommendedAction; detail: string; trace: string[] } {
  const joined = `${title} ${h1}`;
  const label = title || h1;
  const trace: string[] = [];

  // Note: coverage === "none" is always true here (only genuine gaps ever
  // reach this function — see crawlCompetitor's `if (coverage !== "none" ...) continue`),
  // so unlike the other two engines' recommendAction, this one only chooses
  // among the content-creation actions, never "improve"/"add links".
  const isQuestion = QUESTION_PATTERN.test(joined);
  trace.push(`1. Question-form title? ${isQuestion ? "YES" : "no"}`);
  if (isQuestion) {
    trace.push("-> add_faqs");
    return { action: "add_faqs", detail: `A competitor answers this as a question that this site doesn't yet. Add an FAQ entry covering: ${label}.`, trace };
  }

  const wantsVisual = VISUAL_PATTERN.test(joined);
  trace.push(`2. Visual/proof language? ${wantsVisual ? "YES" : "no"}`);
  if (wantsVisual) {
    trace.push("-> add_portfolio");
    return { action: "add_portfolio", detail: `A competitor uses this as a visual/proof angle. Add tagged portfolio items covering: ${label}.`, trace };
  }

  trace.push(`3. Query breadth === "head"? ${breadth === "head" ? "YES" : "no"}`);
  if (breadth === "head") {
    trace.push("-> create_new_pillar (broad topic worth a dedicated page)");
    return { action: "create_new_pillar", detail: `A competitor has a dedicated page for this broad topic that this site doesn't have. Consider a pillar page covering: ${label}.`, trace };
  }
  trace.push("-> create_cluster_article (specific/long-tail topic)");
  return { action: "create_cluster_article", detail: `A competitor covers this specific topic that this site doesn't. Consider a cluster article covering: ${label}.`, trace };
}

async function crawlCompetitor(
  competitor: (typeof COMPETITOR_SITES)[number],
  ourContentIndex: Awaited<ReturnType<typeof buildContentIndex>>,
  // Shared across every competitor in the same run, not just this one — two
  // different competitor sites can easily cover the same generic topic (e.g.
  // both are Lagos bridal makeup businesses), and topicKeyFor() is a pure
  // function of the page's tokens with no competitor identity baked in. A
  // per-competitor set would let a second competitor's page silently
  // overwrite the first's document at persist time (same _id, no error).
  gapKeysSeen: Set<string>
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

    const { coverage, topicalRelevanceScore, matchedCoverageScore } = matchContent([tokens], ourContentIndex);
    if (coverage !== "none" || topicalRelevanceScore < MIN_TOPICAL_RELEVANCE) continue; // not a gap, or not genuinely on-topic

    const topicKey = topicKeyFor(tokens, label);
    if (gapKeysSeen.has(topicKey)) continue; // same topic already recorded from another competitor page
    gapKeysSeen.add(topicKey);

    const contentStrength = computeContentStrength(signal);
    const subtopicGaps = extractSubtopicGaps(signal, ourContentIndex);
    const depthDelta = matchedCoverageScore != null ? contentStrength.totalScore - matchedCoverageScore : null;

    const adjustedRelevance = topicalRelevanceScore * (0.6 + 0.4 * contentStrength.totalScore / 100);
    const breadth: "head" | "long-tail" = tokens.length <= 3 ? "head" : "long-tail";
    const { action, detail, trace } = recommendAction(signal.title, signal.h1, breadth);
    const priorityScore = computePriorityScore(adjustedRelevance, action);

    gaps.push({
      topicKey,
      topicLabel: label.replace(/\b\w/g, (c) => c.toUpperCase()),
      competitorName: competitor.name,
      competitorUrl: urls[i],
      sampleTitle: label,
      topicalRelevanceScore,
      priorityScore,
      recommendedAction: action,
      recommendedActionDetail: detail,
      decisionTrace: trace,
      contentStrength,
      subtopicGaps,
      competitorWordCount: signal.approximateWordCount,
      competitorHeadingCount: signal.headings.length,
      depthDelta,
    });
  }

  return gaps;
}

export async function computeCompetitorGaps(fetchClient: FetchClient = client): Promise<CompetitorGapTopic[]> {
  const ourContentIndex = await buildContentIndex(fetchClient);
  // One shared set across every competitor — see crawlCompetitor's
  // gapKeysSeen parameter comment for why a per-competitor set isn't enough.
  const gapKeysSeen = new Set<string>();
  const results = await Promise.all(
    COMPETITOR_SITES.map((c) => crawlCompetitor(c, ourContentIndex, gapKeysSeen))
  );
  return results.flat().sort((a, b) => b.priorityScore - a.priorityScore);
}

// ─── Persistence ────────────────────────────────────────────────────────────

interface StoredGapDoc {
  _id: string;
  topicKey: string;
  status?: string;
  actionedAt?: string;
  history?: { date: string; topicalRelevanceScore: number; contentStrengthScore?: number }[];
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
      history.push({ date: today, topicalRelevanceScore: gap.topicalRelevanceScore, contentStrengthScore: gap.contentStrength.totalScore });
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
      priorityScore: gap.priorityScore,
      recommendedAction: gap.recommendedAction,
      recommendedActionDetail: gap.recommendedActionDetail,
      decisionTrace: gap.decisionTrace,
      contentStrength: gap.contentStrength,
      subtopicGaps: gap.subtopicGaps,
      competitorWordCount: gap.competitorWordCount,
      competitorHeadingCount: gap.competitorHeadingCount,
      depthDelta: gap.depthDelta,
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
  history: { date: string; topicalRelevanceScore: number; contentStrengthScore?: number }[];
  firstSeenAt: string;
  lastComputedAt: string;
}

const GAP_PROJECTION = `{
  topicKey, topicLabel, competitorName, competitorUrl, sampleTitle, topicalRelevanceScore,
  priorityScore, recommendedAction, recommendedActionDetail, decisionTrace,
  contentStrength, subtopicGaps, competitorWordCount, competitorHeadingCount, depthDelta,
  status, actionedAt, history, firstSeenAt, lastComputedAt
}`;

export async function getCompetitorGaps(): Promise<StoredCompetitorGapTopic[]> {
  return client.fetch<StoredCompetitorGapTopic[]>(
    `*[_type == "competitorGapTopic"] | order(priorityScore desc) ${GAP_PROJECTION}`
  );
}

export async function getCompetitorGapByKey(topicKey: string): Promise<StoredCompetitorGapTopic | null> {
  return client.fetch<StoredCompetitorGapTopic | null>(
    `*[_type == "competitorGapTopic" && topicKey == $topicKey][0] ${GAP_PROJECTION}`,
    { topicKey }
  );
}
