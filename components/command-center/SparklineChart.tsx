"use client";

import type { Trend } from "@/lib/intelligence/opportunity-lifetime";
import { TREND_COLOR } from "./shared-labels";

interface SparklineChartProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  /** When provided, colors the line by this classification (same one the
   * adjacent "Growing"/"Stable"/"Declining" text label uses) instead of a
   * raw last-vs-first comparison, so the two never visually disagree. */
  trend?: Trend;
}

export function SparklineChart({ data, width = 80, height = 24, color = "var(--cc-accent)", trend }: SparklineChartProps) {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = 2;
  const usableH = height - padding * 2;
  const step = (width - padding * 2) / (data.length - 1);

  const points = data
    .map((v, i) => `${padding + i * step},${padding + usableH - ((v - min) / range) * usableH}`)
    .join(" ");

  const rawDelta = data[data.length - 1] - data[0];
  const strokeColor = trend
    ? TREND_COLOR[trend]
    : rawDelta > 0 ? "var(--cc-good)" : rawDelta < 0 ? "var(--cc-critical)" : color;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: "block" }}>
      <polyline
        points={points}
        fill="none"
        stroke={strokeColor}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
