import Link from "next/link";
import { getInternalLinkGaps, type StoredInternalLinkGap } from "@/lib/intelligence/internal-links";
import { computeLifetime, applyLifetimeDecay, TREND_LABELS, type Trend } from "@/lib/intelligence/opportunity-lifetime";

const TREND_COLOR: Record<Trend, string> = {
  growing: "var(--cc-good)",
  declining: "var(--cc-critical)",
  stable: "var(--cc-text-muted)",
  new: "var(--cc-text-muted)",
};

const ACTION_LABELS: Record<string, string> = {
  add_internal_links: "Add internal links",
  create_new_blog_article: "Create new blog article",
};

function GapRow({ gap }: { gap: StoredInternalLinkGap }) {
  const lifetime = computeLifetime(
    gap.firstSeenAt,
    gap.history.map((h) => ({ date: h.date, score: h.severityScore })),
    gap.status
  );
  return (
    <tr style={{ borderBottom: "1px solid var(--cc-border)" }}>
      <td style={{ padding: "6px 8px" }}>
        <Link href={`/command-center/internal-links/${gap.topicKey}`} style={{ color: "inherit" }}>
          {gap.inboundLinkCount === 0 && "🚫 "}
          {lifetime.isStale && "💤 "}
          {gap.targetLabel}
        </Link>
      </td>
      <td style={{ padding: "6px 8px", textTransform: "capitalize" }}>{gap.targetType}</td>
      <td style={{ padding: "6px 8px", textAlign: "right", fontFamily: "var(--cc-mono)" }}>{gap.inboundLinkCount}</td>
      <td style={{ padding: "6px 8px", textAlign: "right", fontFamily: "var(--cc-mono)" }}>
        {gap.scoreBreakdown.severityScore.toFixed(0)}
      </td>
      <td style={{ padding: "6px 8px", textAlign: "right", fontFamily: "var(--cc-mono)" }}>
        {applyLifetimeDecay(gap.priorityScore, lifetime).toFixed(1)}
      </td>
      <td style={{ padding: "6px 8px" }}>{ACTION_LABELS[gap.recommendedAction] ?? gap.recommendedAction}</td>
      <td style={{ padding: "6px 8px", textTransform: "capitalize" }}>{gap.status.replace("_", " ")}</td>
      <td style={{ padding: "6px 8px", textAlign: "right", fontFamily: "var(--cc-mono)" }}>{lifetime.ageDays}d</td>
      <td style={{ padding: "6px 8px", color: TREND_COLOR[lifetime.trend] }}>{TREND_LABELS[lifetime.trend]}</td>
    </tr>
  );
}

export default async function InternalLinksPage() {
  const gapsRaw = await getInternalLinkGaps();
  const gaps = [...gapsRaw].sort((a, b) => {
    const la = computeLifetime(a.firstSeenAt, a.history.map((h) => ({ date: h.date, score: h.severityScore })), a.status);
    const lb = computeLifetime(b.firstSeenAt, b.history.map((h) => ({ date: h.date, score: h.severityScore })), b.status);
    return applyLifetimeDecay(b.priorityScore, lb) - applyLifetimeDecay(a.priorityScore, la);
  });
  const orphanCount = gaps.filter((g) => g.inboundLinkCount === 0).length;

  return (
    <div>
      <h1 className="cc-page-title">Internal Links</h1>
      <p className="cc-page-dek">
        Real service/location pages with too few genuine inbound links from blog content — found by scanning every
        blog post&rsquo;s actual link markup, not guessed. Suggestions always name specific real posts to link from,
        matched by real topical overlap; when no real candidate exists, the honest recommendation is to write new
        content instead of forcing an unrelated link.
      </p>

      {gaps.length === 0 ? (
        <div className="cc-card">
          <h2 style={{ margin: "0 0 12px", fontSize: "1.0625rem" }}>Internal Link Intelligence Engine</h2>
          <div className="cc-empty">
            No link gaps computed yet. This runs weekly from the daily snapshot cron (self-gated, Sanity-only, no
            external API needed) — trigger it manually via the &ldquo;Run now&rdquo; button on Settings, or{" "}
            <code>POST /api/command-center/snapshot</code>, to compute the first batch now.
          </div>
        </div>
      ) : (
        <div className="cc-card">
          <h2 style={{ margin: "0 0 4px", fontSize: "1.0625rem" }}>All gaps</h2>
          <p style={{ margin: "0 0 12px", fontSize: "0.8125rem", color: "var(--cc-text-muted)" }}>
            {gaps.length} page{gaps.length === 1 ? "" : "s"} under-linked ({orphanCount} completely orphaned — 🚫),
            sorted by priority (severity ÷ effort).
          </p>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", fontSize: "0.8125rem", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--cc-border)", color: "var(--cc-text-muted)" }}>
                  <th style={{ textAlign: "left", padding: "6px 8px", fontWeight: 500 }}>Page</th>
                  <th style={{ textAlign: "left", padding: "6px 8px", fontWeight: 500 }}>Type</th>
                  <th style={{ textAlign: "right", padding: "6px 8px", fontWeight: 500 }}>Inbound links</th>
                  <th style={{ textAlign: "right", padding: "6px 8px", fontWeight: 500 }}>Severity</th>
                  <th style={{ textAlign: "right", padding: "6px 8px", fontWeight: 500 }}>Priority</th>
                  <th style={{ textAlign: "left", padding: "6px 8px", fontWeight: 500 }}>Recommended action</th>
                  <th style={{ textAlign: "left", padding: "6px 8px", fontWeight: 500 }}>Status</th>
                  <th style={{ textAlign: "right", padding: "6px 8px", fontWeight: 500 }}>Age</th>
                  <th style={{ textAlign: "left", padding: "6px 8px", fontWeight: 500 }}>Trend</th>
                </tr>
              </thead>
              <tbody>
                {gaps.map((gap) => <GapRow key={gap.topicKey} gap={gap} />)}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
