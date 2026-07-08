/**
 * Opportunity Lifetime — derived entirely from data every engine already
 * persists (firstSeenAt, the appended history[] array, status). No new
 * fields, no new cron work: age/trend/staleness are computed fresh on every
 * page load from what's already stored. Shared across all four engines
 * (SEO Opportunity, Keyword Discovery, Competitor Gap, Topical Authority)
 * so "don't keep recommending stale opportunities forever" behaves
 * identically everywhere instead of four separate ad-hoc implementations.
 */

export type Trend = "growing" | "declining" | "stable" | "new";

export interface LifetimeInfo {
  ageDays: number;
  trend: Trend;
  /** Old, sitting unactioned, and not growing — a candidate to stop pushing to the top, not to delete. */
  isStale: boolean;
}

export interface HistoryPoint {
  date: string;
  score: number;
}

const TREND_WINDOW = 3; // compare the latest run against up to 3 runs back (~3 weekly cycles)
const TREND_THRESHOLD_PCT = 8; // below this % change, call it "stable" rather than growing/declining
const STALE_AFTER_RUNS = 4; // ~a month of weekly recomputation
const STALE_STATUSES = new Set(["new", "acknowledged"]); // status values where "nothing has been done about this yet"

export function computeLifetime(firstSeenAt: string, history: HistoryPoint[], status: string): LifetimeInfo {
  const ageDays = Math.max(0, Math.floor((Date.now() - new Date(firstSeenAt).getTime()) / 86_400_000));

  let trend: Trend = "new";
  if (history.length >= 2) {
    const latest = history[history.length - 1].score;
    const compareIndex = Math.max(0, history.length - 1 - TREND_WINDOW);
    const compare = history[compareIndex].score;
    if (compare > 0) {
      const pctChange = ((latest - compare) / compare) * 100;
      if (pctChange >= TREND_THRESHOLD_PCT) trend = "growing";
      else if (pctChange <= -TREND_THRESHOLD_PCT) trend = "declining";
      else trend = "stable";
    } else {
      trend = latest > 0 ? "growing" : "stable";
    }
  }

  const isStale =
    history.length >= STALE_AFTER_RUNS && STALE_STATUSES.has(status) && (trend === "declining" || trend === "stable");

  return { ageDays, trend, isStale };
}

const STALE_PENALTY = 0.5; // halve priority for stale, ignored, non-growing topics — deprioritize, don't hide

// Accepts null/undefined so documents computed before priorityScore existed
// (pending their next weekly recompute) render as 0 instead of crashing the page.
export function applyLifetimeDecay(priorityScore: number | null | undefined, lifetime: LifetimeInfo): number {
  const score = priorityScore ?? 0;
  return lifetime.isStale ? Math.round(score * STALE_PENALTY * 10) / 10 : score;
}

export const TREND_LABELS: Record<Trend, string> = {
  growing: "Growing",
  declining: "Declining",
  stable: "Stable",
  new: "Too new to tell",
};
