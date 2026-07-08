import type { Trend } from "@/lib/intelligence/opportunity-lifetime";

export const TREND_COLOR: Record<Trend, string> = {
  growing: "var(--cc-good)",
  declining: "var(--cc-critical)",
  stable: "var(--cc-text-muted)",
  new: "var(--cc-text-muted)",
};

export const CONFIDENCE_COLOR: Record<string, string> = {
  high: "var(--cc-good)",
  medium: "var(--cc-warn)",
  low: "var(--cc-text-muted)",
};
