/**
 * Opportunity Lifetime — derived entirely from data every engine already
 * persists (firstSeenAt, the appended history[] array, status). No new
 * fields, no new cron work: age/trend/staleness are computed fresh on every
 * page load from what's already stored. Shared across all seven engines
 * so "don't keep recommending stale opportunities forever" behaves
 * identically everywhere instead of seven separate ad-hoc implementations.
 *
 * EMA (exponential moving average) smoothing replaces point-to-point
 * comparison to avoid single-run outliers flipping the trend.
 */

export type Trend = "growing" | "declining" | "stable" | "new";

export interface LifetimeInfo {
  ageDays: number;
  trend: Trend;
  /** Old, sitting unactioned, and not growing — a candidate to stop pushing to the top, not to delete. */
  isStale: boolean;
  /** EMA-smoothed score — less noisy than the raw latest value. */
  emaSmoothedScore: number;
  /** EMA-smoothed score change per 7-day interval (positive = growing). */
  velocityPerWeek: number;
}

export interface HistoryPoint {
  date: string;
  score: number;
}

const EMA_ALPHA = 0.3;
const TREND_WINDOW = 3;
const TREND_THRESHOLD_PCT = 8;
const STALE_AFTER_RUNS = 4;
const STALE_STATUSES = new Set(["new", "acknowledged"]);

function computeEMA(values: number[]): number[] {
  if (values.length === 0) return [];
  const ema = [values[0]];
  for (let i = 1; i < values.length; i++) {
    ema.push(EMA_ALPHA * values[i] + (1 - EMA_ALPHA) * ema[i - 1]);
  }
  return ema;
}

export function computeLifetime(firstSeenAt: string, history: HistoryPoint[], status: string): LifetimeInfo {
  const ageDays = Math.max(0, Math.floor((Date.now() - new Date(firstSeenAt).getTime()) / 86_400_000));

  const scores = history.map((h) => h.score);
  const ema = computeEMA(scores);

  let trend: Trend = "new";
  let emaSmoothedScore = scores.length > 0 ? scores[scores.length - 1] : 0;
  let velocityPerWeek = 0;

  if (ema.length >= 2) {
    emaSmoothedScore = ema[ema.length - 1];
    const compareIndex = Math.max(0, ema.length - 1 - TREND_WINDOW);
    const compareEma = ema[compareIndex];
    if (compareEma > 0) {
      const pctChange = ((emaSmoothedScore - compareEma) / compareEma) * 100;
      if (pctChange >= TREND_THRESHOLD_PCT) trend = "growing";
      else if (pctChange <= -TREND_THRESHOLD_PCT) trend = "declining";
      else trend = "stable";
    } else {
      trend = emaSmoothedScore > 0 ? "growing" : "stable";
    }

    const spanDays = history.length >= 2
      ? Math.max(1, (new Date(history[history.length - 1].date).getTime() - new Date(history[compareIndex].date).getTime()) / 86_400_000)
      : 7;
    velocityPerWeek = Math.round(((emaSmoothedScore - compareEma) / spanDays) * 7 * 100) / 100;
  } else if (ema.length === 1) {
    emaSmoothedScore = ema[0];
  }

  const isStale =
    history.length >= STALE_AFTER_RUNS && STALE_STATUSES.has(status) && (trend === "declining" || trend === "stable");

  return { ageDays, trend, isStale, emaSmoothedScore, velocityPerWeek };
}

const STALE_PENALTY = 0.5;

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
