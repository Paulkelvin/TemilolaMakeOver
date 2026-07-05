export type MetricSource = "sanity" | "paystack" | "search-console" | "ga4" | "vercel" | "calculated";

const SOURCE_LABEL: Record<MetricSource, string> = {
  sanity: "Sanity",
  paystack: "Paystack",
  "search-console": "Search Console",
  ga4: "GA4",
  vercel: "Vercel",
  calculated: "Calculated",
};

// Sanity gets its own visual lane; every external API reads the same lane
// (they carry the same "can go stale" risk); calculated values get a third,
// since they're neither a live query nor a fetched snapshot.
const SOURCE_VARIANT: Record<MetricSource, "sanity" | "external" | "calculated"> = {
  sanity: "sanity",
  paystack: "external",
  "search-console": "external",
  ga4: "external",
  vercel: "external",
  calculated: "calculated",
};

interface MetricBadgeProps {
  source: MetricSource;
  /**
   * Pass "live" for a value read straight from a query at render time.
   * Pass a Date or ISO string for anything backed by a metricSnapshot's
   * `fetchedAt` — a stale or failed external fetch then shows up as an old
   * timestamp instead of silently passing off yesterday's number as current.
   */
  freshness: "live" | Date | string;
}

function formatFreshness(freshness: MetricBadgeProps["freshness"]): string {
  if (freshness === "live") return "live";

  const date = typeof freshness === "string" ? new Date(freshness) : freshness;
  if (Number.isNaN(date.getTime())) return "unknown";

  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  const time = date.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" });
  return sameDay
    ? `as of ${time} today`
    : `as of ${date.toLocaleDateString("en-NG", { month: "short", day: "numeric" })}`;
}

export function MetricBadge({ source, freshness }: MetricBadgeProps) {
  return (
    <span className="cc-badge" data-variant={SOURCE_VARIANT[source]}>
      <span className="cc-badge__source">{SOURCE_LABEL[source]}</span>
      <span className="cc-badge__dot" aria-hidden="true" />
      <span className="cc-badge__freshness">{formatFreshness(freshness)}</span>
    </span>
  );
}
