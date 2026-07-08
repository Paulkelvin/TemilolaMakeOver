import type { ContentCoverage } from "./keyword-utils";

/**
 * Ranking Probability — a deterministic, rule-based likelihood band, not a
 * statistical or ML prediction. Every input is data the SEO Opportunity
 * Engine already computes and persists (real position history, real content
 * coverage, real topical relevance) — this just re-expresses it as an
 * explainable "how likely is this to reach page 1" verdict with a full
 * decision trace, live-computed at read time (no new schema fields).
 */

export type ProbabilityBand = "achieved" | "likely" | "possible" | "unlikely";

export interface RankingProbability {
  band: ProbabilityBand;
  label: string;
  trace: string[];
}

export interface PositionHistoryPoint {
  date: string;
  position: number;
}

type PositionTrend = "improving" | "declining" | "stable" | "new";

const TREND_WINDOW = 3; // compare against up to 3 runs back (~3 weekly cycles)
const TREND_THRESHOLD = 2; // positions of movement below this reads as "stable"

function computePositionTrend(history: PositionHistoryPoint[]): PositionTrend {
  if (history.length < 2) return "new";
  const latest = history[history.length - 1].position;
  const compareIndex = Math.max(0, history.length - 1 - TREND_WINDOW);
  const compare = history[compareIndex].position;
  const delta = compare - latest; // positive = improved (lower position number is better)
  if (delta >= TREND_THRESHOLD) return "improving";
  if (delta <= -TREND_THRESHOLD) return "declining";
  return "stable";
}

export function computeRankingProbability(input: {
  currentPosition: number;
  contentCoverage: ContentCoverage;
  topicalRelevanceScore: number;
  history: PositionHistoryPoint[];
}): RankingProbability {
  const trace: string[] = [];
  const trend = computePositionTrend(input.history);

  trace.push(`1. Current position <= 10 (already page 1)? ${input.currentPosition <= 10 ? "YES" : "no"} (position = ${input.currentPosition.toFixed(1)})`);
  if (input.currentPosition <= 10) {
    trace.push("-> achieved (already ranking on page 1 — the question now is holding the spot, not reaching it)");
    return { band: "achieved", label: "Already on page 1", trace };
  }

  trace.push(`2. Position trend from real history (last ${TREND_WINDOW} runs)? ${trend}`);
  trace.push(`3. Position within quick-win band (11-20)? ${input.currentPosition <= 20 ? "YES" : "no"}`);
  trace.push(`4. Real supporting content exists (coverage != "none")? ${input.contentCoverage !== "none" ? "YES" : "no"} (coverage = "${input.contentCoverage}")`);
  trace.push(`5. Topical relevance >= 60? ${input.topicalRelevanceScore >= 60 ? "YES" : "no"} (relevance = ${input.topicalRelevanceScore.toFixed(0)})`);

  const strongFoundation =
    input.currentPosition <= 20 && input.contentCoverage !== "none" && input.topicalRelevanceScore >= 60;

  if (strongFoundation) {
    if (trend === "declining") {
      trace.push("-> possible (strong foundation, but the real position history is trending worse — good signals, bad trajectory)");
      return { band: "possible", label: "Possible, but losing ground", trace };
    }
    trace.push("-> likely (close position + real supporting content + strong topical relevance)");
    return { band: "likely", label: "Likely with focused work", trace };
  }

  trace.push(`6. Position <= 30 and topical relevance >= 50? ${input.currentPosition <= 30 && input.topicalRelevanceScore >= 50 ? "YES" : "no"}`);
  if (input.currentPosition <= 30 && input.topicalRelevanceScore >= 50) {
    trace.push("-> possible (some real signal, but not yet a strong foundation)");
    return { band: "possible", label: "Possible with more work", trace };
  }

  trace.push("-> unlikely (position too far back and/or evidence too weak right now)");
  return { band: "unlikely", label: "Unlikely without significant work", trace };
}

export const BAND_COLOR: Record<ProbabilityBand, string> = {
  achieved: "var(--cc-good)",
  likely: "var(--cc-good)",
  possible: "var(--cc-warn)",
  unlikely: "var(--cc-critical)",
};
