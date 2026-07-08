"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

interface TimeSeriesChartProps {
  data: { date: string; score: number }[];
  height?: number;
  lineColor?: string;
  label?: string;
}

export function TimeSeriesChart({ data, height = 260, lineColor = "var(--cc-accent)", label = "Score" }: TimeSeriesChartProps) {
  if (data.length === 0) return <p style={{ color: "var(--cc-text-muted)", fontSize: "0.8125rem" }}>No history yet.</p>;

  return (
    <div className="cc-chart-container">
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--cc-border)" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "var(--cc-text-muted)" }}
            tickLine={false}
            axisLine={{ stroke: "var(--cc-border)" }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "var(--cc-text-muted)" }}
            tickLine={false}
            axisLine={{ stroke: "var(--cc-border)" }}
            width={36}
          />
          <Tooltip
            contentStyle={{
              background: "var(--cc-surface)",
              border: "1px solid var(--cc-border)",
              borderRadius: 6,
              fontSize: "0.8125rem",
              color: "var(--cc-text)",
            }}
          />
          <Line
            type="monotone"
            dataKey="score"
            name={label}
            stroke={lineColor}
            strokeWidth={2}
            dot={{ r: 3, fill: lineColor }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
