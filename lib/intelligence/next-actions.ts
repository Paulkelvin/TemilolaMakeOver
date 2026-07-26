import { getKeywordDiscoveryTopics } from "./keyword-discovery";
import { getCompetitorGaps } from "./competitor-gap";
import { getSeoOpportunities } from "./seo-opportunities";

/**
 * One ranked answer to "what should I write next".
 *
 * Three engines each had their own Command Center page, each sorted by its own
 * priorityScore, each answering that same question — so the queue you were
 * meant to work from was actually three queues with no shared order, and
 * nothing told you which of the three to open first. They all already score on
 * the same value-over-effort scale (computePriorityScore in keyword-utils.ts),
 * which is exactly what makes merging them legitimate rather than cosmetic:
 * the numbers are directly comparable.
 *
 * The per-engine detail pages still exist and are linked from each row — this
 * replaces the three *list* pages, not the reasoning behind any of them.
 */

export type ActionSource = "keyword-discovery" | "competitor-gap" | "search-console";

export const SOURCE_LABEL: Record<ActionSource, string> = {
  "keyword-discovery": "Discovered",
  "competitor-gap": "Competitor",
  "search-console": "Search Console",
};

/** Why a row is worth trusting, shortest honest version, shown as a tooltip. */
export const SOURCE_BASIS: Record<ActionSource, string> = {
  "keyword-discovery": "Suggested by public autocomplete — real phrasing, no volume data.",
  "competitor-gap": "A competitor covers this and this site does not.",
  "search-console": "Real impressions and clicks from Google Search Console.",
};

export interface NextAction {
  key: string;
  label: string;
  source: ActionSource;
  priorityScore: number;
  action: string;
  detail: string;
  href: string;
  /** Only present for Search Console rows, which are the only ones with real traffic behind them. */
  impressions?: number;
  status: string;
}

const DISMISSED = new Set(["done", "dismissed"]);

export async function getNextActions(limit = 25): Promise<NextAction[]> {
  const [keywords, competitors, seo] = await Promise.all([
    getKeywordDiscoveryTopics(),
    getCompetitorGaps(),
    getSeoOpportunities(),
  ]);

  const rows: NextAction[] = [
    ...keywords.map((t) => ({
      key: t.topicKey,
      label: t.topicLabel,
      source: "keyword-discovery" as const,
      priorityScore: t.priorityScore,
      action: t.recommendedAction,
      detail: t.recommendedActionDetail,
      href: `/command-center/keyword-discovery/${encodeURIComponent(t.topicKey)}`,
      status: t.status,
    })),
    ...competitors.map((g) => ({
      key: g.topicKey,
      label: g.topicLabel,
      source: "competitor-gap" as const,
      priorityScore: g.priorityScore,
      action: g.recommendedAction,
      detail: g.recommendedActionDetail,
      href: `/command-center/competitor-gaps/${encodeURIComponent(g.topicKey)}`,
      status: g.status,
    })),
    ...seo.map((o) => ({
      key: o.topicKey,
      label: o.topicLabel,
      source: "search-console" as const,
      priorityScore: o.priorityScore,
      action: o.recommendedAction,
      detail: o.recommendedActionDetail,
      href: `/command-center/seo/opportunities/${encodeURIComponent(o.topicKey)}`,
      impressions: o.currentMetrics?.impressions,
      status: o.status,
    })),
  ];

  // Search Console rows win ties: an equal score backed by real impressions is
  // strictly better evidence than one inferred from autocomplete.
  const sourceRank: Record<ActionSource, number> = {
    "search-console": 2,
    "competitor-gap": 1,
    "keyword-discovery": 0,
  };

  return rows
    .filter((r) => !DISMISSED.has(r.status))
    .sort((a, b) => b.priorityScore - a.priorityScore || sourceRank[b.source] - sourceRank[a.source])
    .slice(0, limit);
}
