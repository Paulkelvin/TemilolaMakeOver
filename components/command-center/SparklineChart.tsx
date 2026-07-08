"use client";

interface SparklineChartProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}

export function SparklineChart({ data, width = 80, height = 24, color = "var(--cc-accent)" }: SparklineChartProps) {
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

  const trend = data[data.length - 1] - data[0];
  const strokeColor = trend > 0 ? "var(--cc-good)" : trend < 0 ? "var(--cc-critical)" : color;

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
