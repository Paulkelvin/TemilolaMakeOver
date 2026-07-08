"use client";

import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";

interface Dimension {
  label: string;
  value: number;
  fullMark?: number;
}

interface ScoreBreakdownRadarProps {
  dimensions: Dimension[];
  height?: number;
  color?: string;
}

export function ScoreBreakdownRadar({ dimensions, height = 280, color = "var(--cc-accent)" }: ScoreBreakdownRadarProps) {
  if (dimensions.length < 3) return null;

  const data = dimensions.map((d) => ({
    subject: d.label,
    value: d.value,
    fullMark: d.fullMark ?? 100,
  }));

  return (
    <div className="cc-chart-container">
      <ResponsiveContainer width="100%" height={height}>
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke="var(--cc-border)" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fontSize: 11, fill: "var(--cc-text-muted)" }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: "var(--cc-text-muted)" }}
            tickCount={5}
          />
          <Radar
            name="Score"
            dataKey="value"
            stroke={color}
            fill={color}
            fillOpacity={0.2}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
