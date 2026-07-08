import Link from "next/link";
import { getKnowledgeGraphGaps, type StoredKnowledgeGraphGap } from "@/lib/intelligence/knowledge-graph";
import { computeLifetime, applyLifetimeDecay, TREND_LABELS, type Trend } from "@/lib/intelligence/opportunity-lifetime";

const TREND_COLOR: Record<Trend, string> = {
  growing: "var(--cc-good)",
  declining: "var(--cc-critical)",
  stable: "var(--cc-text-muted)",
  new: "var(--cc-text-muted)",
};

const ACTION_LABELS: Record<string, string> = {
  create_new_blog_article: "Create new blog article",
  add_portfolio_examples: "Add portfolio examples",
};

function GapRow({ gap }: { gap: StoredKnowledgeGraphGap }) {
  const lifetime = computeLifetime(
    gap.firstSeenAt,
    gap.history.map((h) => ({ date: h.date, score: h.importanceScore })),
    gap.status
  );
  return (
    <tr style={{ borderBottom: "1px solid var(--cc-border)" }}>
      <td style={{ padding: "6px 8px" }}>
        <Link href={`/command-center/knowledge-graph/${gap.topicKey}`} style={{ color: "inherit" }}>
          {lifetime.isStale && "💤 "}
          {gap.serviceName} <span style={{ color: "var(--cc-text-muted)" }}>×</span> {gap.occasionName}
        </Link>
      </td>
      <td style={{ padding: "6px 8px", textAlign: "right", fontFamily: "var(--cc-mono)" }}>{gap.serviceContentCount}</td>
      <td style={{ padding: "6px 8px", textAlign: "right", fontFamily: "var(--cc-mono)" }}>{gap.occasionContentCount}</td>
      <td style={{ padding: "6px 8px", textAlign: "right", fontFamily: "var(--cc-mono)" }}>
        {gap.scoreBreakdown.importanceScore.toFixed(0)}
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

export default async function KnowledgeGraphPage() {
  const gapsRaw = await getKnowledgeGraphGaps();
  const gaps = [...gapsRaw].sort((a, b) => {
    const la = computeLifetime(a.firstSeenAt, a.history.map((h) => ({ date: h.date, score: h.importanceScore })), a.status);
    const lb = computeLifetime(b.firstSeenAt, b.history.map((h) => ({ date: h.date, score: h.importanceScore })), b.status);
    return applyLifetimeDecay(b.priorityScore, lb) - applyLifetimeDecay(a.priorityScore, la);
  });

  return (
    <div>
      <h1 className="cc-page-title">Knowledge Graph</h1>
      <p className="cc-page-dek">
        Real Service × Occasion pairs where both sides are individually well-established (real portfolio/testimonial/
        FAQ/blog content elsewhere) but the site&rsquo;s own reference graph has no real content connecting them yet
        — pure reference counting over data already in Sanity, no guessed demand.
      </p>

      {gaps.length === 0 ? (
        <div className="cc-card">
          <h2 style={{ margin: "0 0 12px", fontSize: "1.0625rem" }}>Knowledge Graph Utilization Engine</h2>
          <div className="cc-empty">
            No graph gaps computed yet. This runs weekly from the daily snapshot cron (self-gated, Sanity-only) —
            trigger it manually via the &ldquo;Run now&rdquo; button on Settings, or{" "}
            <code>POST /api/command-center/snapshot</code>, to compute the first batch now.
          </div>
        </div>
      ) : (
        <div className="cc-card">
          <h2 style={{ margin: "0 0 4px", fontSize: "1.0625rem" }}>All gaps</h2>
          <p style={{ margin: "0 0 12px", fontSize: "0.8125rem", color: "var(--cc-text-muted)" }}>
            {gaps.length} pair{gaps.length === 1 ? "" : "s"} with no real content connecting two otherwise-established nodes, sorted by priority.
          </p>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", fontSize: "0.8125rem", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--cc-border)", color: "var(--cc-text-muted)" }}>
                  <th style={{ textAlign: "left", padding: "6px 8px", fontWeight: 500 }}>Pair</th>
                  <th style={{ textAlign: "right", padding: "6px 8px", fontWeight: 500 }}>Service content</th>
                  <th style={{ textAlign: "right", padding: "6px 8px", fontWeight: 500 }}>Occasion content</th>
                  <th style={{ textAlign: "right", padding: "6px 8px", fontWeight: 500 }}>Importance</th>
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
