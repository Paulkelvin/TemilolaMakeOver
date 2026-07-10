import Link from "next/link";
import { getCompetitorGaps, type StoredCompetitorGapTopic } from "@/lib/intelligence/competitor-gap";
import { COMPETITOR_SITES } from "@/lib/intelligence/competitor-registry";
import { computeLifetime, applyLifetimeDecay, TREND_LABELS } from "@/lib/intelligence/opportunity-lifetime";
import { TREND_COLOR } from "@/components/command-center/shared-labels";
import { SparklineChart } from "@/components/command-center/SparklineChart";

const ACTION_LABELS: Record<string, string> = {
  create_new_pillar: "Create new pillar",
  create_cluster_article: "Create cluster article",
  add_faqs: "Add FAQs",
  add_portfolio: "Add portfolio",
};

function GapRow({ gap }: { gap: StoredCompetitorGapTopic }) {
  const lifetime = computeLifetime(
    gap.firstSeenAt,
    gap.history.map((h) => ({ date: h.date, score: h.topicalRelevanceScore })),
    gap.status
  );
  return (
    <tr style={{ borderBottom: "1px solid var(--cc-border)" }}>
      <td style={{ padding: "6px 8px" }}>
        <Link href={`/command-center/competitor-gaps/${gap.topicKey}`} style={{ color: "inherit" }}>
          {lifetime.isStale && "💤 "}
          {gap.topicLabel}
        </Link>
      </td>
      <td style={{ padding: "6px 8px", textAlign: "right", fontFamily: "var(--cc-mono)" }}>
        {gap.topicalRelevanceScore}
      </td>
      <td style={{ padding: "6px 8px", textAlign: "right", fontFamily: "var(--cc-mono)" }}>
        {applyLifetimeDecay(gap.priorityScore, lifetime).toFixed(1)}
      </td>
      <td style={{ padding: "6px 8px" }}>{gap.competitorName}</td>
      <td style={{ padding: "6px 8px" }}>{ACTION_LABELS[gap.recommendedAction] ?? gap.recommendedAction}</td>
      <td style={{ padding: "6px 8px", textTransform: "capitalize" }}>{gap.status.replace("_", " ")}</td>
      <td style={{ padding: "6px 8px", textAlign: "right", fontFamily: "var(--cc-mono)" }}>{lifetime.ageDays}d</td>
      <td style={{ padding: "6px 8px", textAlign: "right", fontFamily: "var(--cc-mono)" }}>
        {gap.contentStrength?.totalScore ?? "—"}
      </td>
      <td style={{ padding: "6px 8px" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <SparklineChart data={gap.history.map((h) => h.topicalRelevanceScore)} trend={lifetime.trend} />
          <span style={{ color: TREND_COLOR[lifetime.trend], fontSize: "0.75rem" }}>{TREND_LABELS[lifetime.trend]}</span>
        </span>
      </td>
    </tr>
  );
}

export default async function CompetitorGapsPage() {
  const gapsRaw = await getCompetitorGaps();
  const gaps = [...gapsRaw].sort((a, b) => {
    const la = computeLifetime(a.firstSeenAt, a.history.map((h) => ({ date: h.date, score: h.topicalRelevanceScore })), a.status);
    const lb = computeLifetime(b.firstSeenAt, b.history.map((h) => ({ date: h.date, score: h.topicalRelevanceScore })), b.status);
    return applyLifetimeDecay(b.priorityScore, lb) - applyLifetimeDecay(a.priorityScore, la);
  });

  return (
    <div>
      <h1 className="cc-page-title">Competitor Gaps</h1>
      <p className="cc-page-dek">
        Real topics that a real, live-verified competitor covers on their own site that this one doesn&rsquo;t —
        crawled respecting each site&rsquo;s robots.txt (crawl-delay honored, disallowed paths skipped). Never a
        suggestion to copy their wording — only to cover the same genuine topic in this site&rsquo;s own voice.
        Currently tracking: {COMPETITOR_SITES.map((c) => `${c.name} (${c.market})`).join(", ")}.
      </p>

      {gaps.length > 0 && (() => {
        const byCompetitor = new Map<string, number>();
        for (const g of gaps) byCompetitor.set(g.competitorName, (byCompetitor.get(g.competitorName) ?? 0) + 1);
        const growingCount = gaps.filter((g) => {
          const lt = computeLifetime(g.firstSeenAt, g.history.map((h) => ({ date: h.date, score: h.topicalRelevanceScore })), g.status);
          return lt.trend === "growing";
        }).length;
        const avgStrength = gaps.filter((g) => g.contentStrength).length > 0
          ? Math.round(gaps.reduce((s, g) => s + (g.contentStrength?.totalScore ?? 0), 0) / gaps.filter((g) => g.contentStrength).length)
          : 0;
        return (
          <div className="cc-stat-strip">
            <div className="cc-stat-tile"><div className="cc-stat-value">{gaps.length}</div><div className="cc-stat-label">Total gaps</div></div>
            {[...byCompetitor.entries()].map(([name, count]) => (
              <div key={name} className="cc-stat-tile"><div className="cc-stat-value">{count}</div><div className="cc-stat-label">{name}</div></div>
            ))}
            <div className="cc-stat-tile"><div className="cc-stat-value" style={{ color: "var(--cc-good)" }}>{growingCount}</div><div className="cc-stat-label">Growing</div></div>
            <div className="cc-stat-tile"><div className="cc-stat-value">{avgStrength}</div><div className="cc-stat-label">Avg strength</div></div>
          </div>
        );
      })()}

      {gaps.length === 0 ? (
        <div className="cc-card">
          <h2 style={{ margin: "0 0 12px", fontSize: "1.0625rem" }}>Competitor Content Gap Engine</h2>
          <div className="cc-empty">
            No gaps computed yet. This runs weekly from the daily snapshot cron (self-gated) — trigger it manually
            via the &ldquo;Run now&rdquo; button on Settings, or <code>POST /api/command-center/snapshot</code>, to
            compute the first batch now.
          </div>
        </div>
      ) : (
        <div className="cc-card">
          <h2 style={{ margin: "0 0 4px", fontSize: "1.0625rem" }}>All gaps</h2>
          <p style={{ margin: "0 0 12px", fontSize: "0.8125rem", color: "var(--cc-text-muted)" }}>
            {gaps.length} topic{gaps.length === 1 ? "" : "s"} found on competitor sites with no matching content
            here, sorted by priority (relevance ÷ effort).
          </p>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", fontSize: "0.8125rem", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--cc-border)", color: "var(--cc-text-muted)" }}>
                  <th style={{ textAlign: "left", padding: "6px 8px", fontWeight: 500 }}>Topic</th>
                  <th style={{ textAlign: "right", padding: "6px 8px", fontWeight: 500 }}>Relevance</th>
                  <th style={{ textAlign: "right", padding: "6px 8px", fontWeight: 500 }}>Priority</th>
                  <th style={{ textAlign: "left", padding: "6px 8px", fontWeight: 500 }}>Competitor</th>
                  <th style={{ textAlign: "left", padding: "6px 8px", fontWeight: 500 }}>Recommended action</th>
                  <th style={{ textAlign: "left", padding: "6px 8px", fontWeight: 500 }}>Status</th>
                  <th style={{ textAlign: "right", padding: "6px 8px", fontWeight: 500 }}>Age</th>
                  <th style={{ textAlign: "right", padding: "6px 8px", fontWeight: 500 }}>Strength</th>
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
