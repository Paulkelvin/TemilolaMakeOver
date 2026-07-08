import { client } from "@/sanity/client";
import { writeClient } from "@/sanity/write-client";
import { isSearchConsoleConfigured, getQueryPageMatrix, type QueryPageRow } from "./sources/search-console";
import { createNotification } from "./notifications";
import { computePriorityScore } from "./keyword-utils";

/**
 * Cannibalization Detection — real evidence only: Search Console itself
 * telling us it served two different real pages of ours for the same real
 * query in the last 90 days. No guessed keyword-difficulty, no AI judgment
 * of "these pages are similar" — the query-page matrix from GSC is the
 * entire evidence base. Queries with only one served page never enter this
 * pipeline (there's nothing to cannibalize).
 */

export type CannibalizationAction = "consolidate_into_primary" | "differentiate_secondary" | "strengthen_primary_links";

export interface SharedQuery {
  query: string;
  primaryImpressions: number;
  primaryPosition: number;
  secondaryImpressions: number;
  secondaryPosition: number;
}

export interface PageStat {
  path: string;
  impressions: number;
  clicks: number;
  position: number; // impression-weighted, across the shared queries only
}

export interface ScoreBreakdown {
  impressionVolumeScore: number;
  shareSplitScore: number;
  positionProximityScore: number;
  severityScore: number;
}

export interface CannibalizationIssue {
  topicKey: string;
  primaryPage: PageStat;
  secondaryPage: PageStat;
  sharedQueries: SharedQuery[];
  scoreBreakdown: ScoreBreakdown;
  secondaryShare: number; // 0-50, % of combined impressions the secondary page is taking
  priorityScore: number;
  recommendedAction: CannibalizationAction;
  recommendedActionDetail: string;
  decisionTrace: string[];
}

const MIN_PAGE_IMPRESSIONS = 5; // below this, a page's presence for a query is noise, not real competition
const MIN_COMBINED_IMPRESSIONS = 15; // floor for a page-pair to be worth surfacing at all

function pathOf(url: string): string {
  try {
    const p = new URL(url).pathname;
    return p.length > 1 ? p.replace(/\/$/, "") : p;
  } catch {
    return url;
  }
}

function slug(path: string): string {
  return path.toLowerCase().replace(/^\/|\/$/g, "").replace(/[^a-z0-9]+/g, "-").slice(0, 40) || "root";
}

// ─── Group query-page rows by query, find queries with 2+ real pages ──────

interface ContestedQuery {
  query: string;
  pages: { path: string; impressions: number; clicks: number; position: number }[];
}

function findContestedQueries(rows: QueryPageRow[]): ContestedQuery[] {
  const byQuery = new Map<string, QueryPageRow[]>();
  for (const row of rows) {
    if (row.impressions < MIN_PAGE_IMPRESSIONS) continue;
    const list = byQuery.get(row.query) ?? [];
    list.push(row);
    byQuery.set(row.query, list);
  }

  const out: ContestedQuery[] = [];
  for (const [query, group] of byQuery) {
    // Collapse to distinct real pages (a query/page pair is already unique
    // per GSC's own dimensions, but paths can coincide after normalization).
    const byPage = new Map<string, { path: string; impressions: number; clicks: number; position: number }>();
    for (const row of group) {
      const path = pathOf(row.page);
      const existing = byPage.get(path);
      if (existing) {
        existing.impressions += row.impressions;
        existing.clicks += row.clicks;
      } else {
        byPage.set(path, { path, impressions: row.impressions, clicks: row.clicks, position: row.position });
      }
    }
    if (byPage.size < 2) continue;
    out.push({ query, pages: [...byPage.values()] });
  }
  return out;
}

// ─── Group contested queries by page-pair ──────────────────────────────────

interface PagePairAccumulator {
  pages: [string, string];
  queries: ContestedQuery[];
}

function groupByPagePair(contested: ContestedQuery[]): PagePairAccumulator[] {
  const byPair = new Map<string, PagePairAccumulator>();
  for (const cq of contested) {
    // Only the two highest-impression pages per query define "the" pair for
    // that query — a 3-way split is rare for a small business site and
    // would otherwise fragment one real conflict across multiple pair-keys.
    const sorted = [...cq.pages].sort((a, b) => b.impressions - a.impressions);
    const [p1, p2] = sorted;
    const sortedPaths = [p1.path, p2.path].sort();
    const key = sortedPaths.join(" ||| ");
    const existing = byPair.get(key) ?? { pages: sortedPaths as [string, string], queries: [] };
    existing.queries.push(cq);
    byPair.set(key, existing);
  }
  return [...byPair.values()];
}

// ─── Scoring ────────────────────────────────────────────────────────────────

function scoreImpressionVolume(combined: number): number {
  if (combined <= 0) return 0;
  return Math.min(100, Math.log10(combined + 1) * 32);
}

function scoreShareSplit(secondaryShare: number): number {
  // secondaryShare is 0-50 by construction (secondary <= primary impressions)
  return Math.min(100, (secondaryShare / 50) * 100);
}

function scorePositionProximity(gap: number): number {
  if (gap <= 3) return 100;
  if (gap <= 10) return 100 - ((gap - 3) / 7) * 40; // ramps down to 60
  if (gap <= 25) return 60 - ((gap - 10) / 15) * 40; // ramps down to 20
  return 10;
}

const SEVERITY_WEIGHTS = { impressionVolume: 0.4, shareSplit: 0.35, positionProximity: 0.25 };

// ─── Recommended action (deterministic decision tree, explainable) ────────

function recommendAction(
  secondaryShare: number,
  positionGap: number,
  primaryPosition: number,
  secondaryPosition: number
): { action: CannibalizationAction; detail: string; trace: string[] } {
  const trace: string[] = [];

  trace.push(`1. Secondary page's share of combined impressions >= 25%? ${secondaryShare >= 25 ? "YES" : "no"} (share = ${secondaryShare.toFixed(1)}%)`);
  if (secondaryShare < 25) {
    trace.push("-> strengthen_primary_links (primary already dominates — reinforce it, don't touch content)");
    return {
      action: "strengthen_primary_links",
      detail: "The stronger page already earns most of the shared impressions. Add internal links pointing to it from related content to reinforce it as the clear answer for this query.",
      trace,
    };
  }

  const closeFight = positionGap <= 10 && primaryPosition <= 30 && secondaryPosition <= 30;
  trace.push(
    `2. Both pages ranking within 10 positions of each other and both under position 30? gap=${positionGap.toFixed(1)}, primary=${primaryPosition.toFixed(1)}, secondary=${secondaryPosition.toFixed(1)} -> ${closeFight ? "YES, genuinely fighting for the same spot" : "no, one page isn't seriously in contention despite sharing impressions"}`
  );

  if (closeFight) {
    trace.push("-> consolidate_into_primary (real head-to-head competition, split authority is actively hurting both)");
    return {
      action: "consolidate_into_primary",
      detail: "Both pages are genuinely competing for this query at similar positions. Pick the stronger page as the canonical target, redirect or fold the weaker page's unique content into it, and update internal links to point at the survivor.",
      trace,
    };
  }

  trace.push("-> differentiate_secondary (meaningful share but not a direct fight — likely a different angle worth sharpening rather than merging)");
  return {
    action: "differentiate_secondary",
    detail: "The secondary page earns a real share of impressions but isn't directly contesting the primary page's position. Sharpen its title/content toward a distinct angle of this query instead of merging it, so it stops diluting the primary page without losing its own audience.",
    trace,
  };
}

// ─── Main computation ───────────────────────────────────────────────────────

export async function computeCannibalization(): Promise<CannibalizationIssue[]> {
  if (!isSearchConsoleConfigured()) return [];

  const matrix = await getQueryPageMatrix(90);
  const contested = findContestedQueries(matrix.current);
  const pairs = groupByPagePair(contested);

  const issues: CannibalizationIssue[] = [];

  for (const pair of pairs) {
    const [pathA, pathB] = pair.pages;

    let aImpressions = 0, aClicks = 0, aPosWeighted = 0;
    let bImpressions = 0, bClicks = 0, bPosWeighted = 0;
    const sharedQueries: SharedQuery[] = [];

    for (const cq of pair.queries) {
      const a = cq.pages.find((p) => p.path === pathA);
      const b = cq.pages.find((p) => p.path === pathB);
      if (!a || !b) continue;
      aImpressions += a.impressions;
      aClicks += a.clicks;
      aPosWeighted += a.position * a.impressions;
      bImpressions += b.impressions;
      bClicks += b.clicks;
      bPosWeighted += b.position * b.impressions;
      sharedQueries.push({
        query: cq.query,
        primaryImpressions: a.impressions,
        primaryPosition: a.position,
        secondaryImpressions: b.impressions,
        secondaryPosition: b.position,
      });
    }

    const combined = aImpressions + bImpressions;
    if (combined < MIN_COMBINED_IMPRESSIONS) continue;

    const aIsPrimary = aImpressions >= bImpressions;
    const primary: PageStat = {
      path: aIsPrimary ? pathA : pathB,
      impressions: aIsPrimary ? aImpressions : bImpressions,
      clicks: aIsPrimary ? aClicks : bClicks,
      position: aIsPrimary
        ? (aImpressions > 0 ? aPosWeighted / aImpressions : 0)
        : (bImpressions > 0 ? bPosWeighted / bImpressions : 0),
    };
    const secondary: PageStat = {
      path: aIsPrimary ? pathB : pathA,
      impressions: aIsPrimary ? bImpressions : aImpressions,
      clicks: aIsPrimary ? bClicks : aClicks,
      position: aIsPrimary
        ? (bImpressions > 0 ? bPosWeighted / bImpressions : 0)
        : (aImpressions > 0 ? aPosWeighted / aImpressions : 0),
    };

    const secondaryShare = (secondary.impressions / combined) * 100;
    const positionGap = Math.abs(primary.position - secondary.position);

    const impressionVolumeScore = scoreImpressionVolume(combined);
    const shareSplitScore = scoreShareSplit(secondaryShare);
    const positionProximityScore = scorePositionProximity(positionGap);
    const severityScore =
      impressionVolumeScore * SEVERITY_WEIGHTS.impressionVolume +
      shareSplitScore * SEVERITY_WEIGHTS.shareSplit +
      positionProximityScore * SEVERITY_WEIGHTS.positionProximity;

    const { action, detail, trace } = recommendAction(secondaryShare, positionGap, primary.position, secondary.position);
    const priorityScore = computePriorityScore(severityScore, action);

    issues.push({
      // Stable regardless of which page is "primary" this run — grouping key
      // is the sorted page-pair, not the primary/secondary assignment, so a
      // traffic shift never orphans an existing document into a duplicate.
      topicKey: `cannib-${[slug(pathA), slug(pathB)].sort().join("-")}`,
      primaryPage: primary,
      secondaryPage: secondary,
      sharedQueries: sharedQueries.sort(
        (x, y) => y.primaryImpressions + y.secondaryImpressions - (x.primaryImpressions + x.secondaryImpressions)
      ),
      scoreBreakdown: { impressionVolumeScore, shareSplitScore, positionProximityScore, severityScore },
      secondaryShare,
      priorityScore,
      recommendedAction: action,
      recommendedActionDetail: detail,
      decisionTrace: trace,
    });
  }

  return issues.sort((a, b) => b.priorityScore - a.priorityScore);
}

// ─── Persistence ────────────────────────────────────────────────────────────

interface StoredIssueLite {
  _id: string;
  topicKey: string;
  status?: string;
  actionedAt?: string;
  history?: { date: string; severityScore: number }[];
  firstSeenAt?: string;
}

function docIdForTopic(topicKey: string): string {
  return `cannibalization-${topicKey}`;
}

export async function persistCannibalization(
  issues: CannibalizationIssue[]
): Promise<{ upserted: number; notifications: number }> {
  const today = new Date().toISOString().slice(0, 10);
  const nowIso = new Date().toISOString();

  const existing = await client.fetch<StoredIssueLite[]>(
    `*[_type == "cannibalizationIssue"]{ _id, topicKey, status, actionedAt, history, firstSeenAt }`
  );
  const existingByKey = new Map(existing.map((e) => [e.topicKey, e]));

  let notifications = 0;
  let tx = writeClient.transaction();

  for (const issue of issues) {
    const prior = existingByKey.get(issue.topicKey);
    const history = [...(prior?.history ?? [])];
    if (history[history.length - 1]?.date !== today) {
      history.push({ date: today, severityScore: issue.scoreBreakdown.severityScore });
    }

    tx = tx.createOrReplace({
      _id: docIdForTopic(issue.topicKey),
      _type: "cannibalizationIssue",
      topicKey: issue.topicKey,
      primaryPage: issue.primaryPage,
      secondaryPage: issue.secondaryPage,
      sharedQueries: issue.sharedQueries,
      scoreBreakdown: issue.scoreBreakdown,
      secondaryShare: issue.secondaryShare,
      priorityScore: issue.priorityScore,
      recommendedAction: issue.recommendedAction,
      recommendedActionDetail: issue.recommendedActionDetail,
      decisionTrace: issue.decisionTrace,
      status: prior?.status ?? "new",
      actionedAt: prior?.actionedAt,
      history,
      firstSeenAt: prior?.firstSeenAt ?? nowIso,
      lastComputedAt: nowIso,
    });

    if (!prior && issue.scoreBreakdown.severityScore >= 60) {
      await createNotification({
        kind: "keyword_cannibalization",
        severity: issue.scoreBreakdown.severityScore >= 80 ? "warning" : "info",
        title: `Keyword cannibalization: ${issue.primaryPage.path} vs. ${issue.secondaryPage.path}`,
        body: issue.recommendedActionDetail,
        metadata: { topicKey: issue.topicKey, severityScore: issue.scoreBreakdown.severityScore },
      });
      notifications++;
    }
  }

  await tx.commit();
  return { upserted: issues.length, notifications };
}

// ─── Read helpers (for the UI — no recomputation, just what's stored) ──────

export interface StoredCannibalizationIssue extends CannibalizationIssue {
  status: "new" | "acknowledged" | "in_progress" | "done" | "dismissed";
  actionedAt?: string;
  history: { date: string; severityScore: number }[];
  firstSeenAt: string;
  lastComputedAt: string;
}

const ISSUE_PROJECTION = `{
  topicKey, primaryPage, secondaryPage, sharedQueries, scoreBreakdown, secondaryShare,
  priorityScore, recommendedAction, recommendedActionDetail, decisionTrace,
  status, actionedAt, history, firstSeenAt, lastComputedAt
}`;

export async function getCannibalizationIssues(): Promise<StoredCannibalizationIssue[]> {
  return client.fetch<StoredCannibalizationIssue[]>(
    `*[_type == "cannibalizationIssue"] | order(priorityScore desc) ${ISSUE_PROJECTION}`
  );
}

export async function getCannibalizationIssueByKey(topicKey: string): Promise<StoredCannibalizationIssue | null> {
  return client.fetch<StoredCannibalizationIssue | null>(
    `*[_type == "cannibalizationIssue" && topicKey == $topicKey][0] ${ISSUE_PROJECTION}`,
    { topicKey }
  );
}
