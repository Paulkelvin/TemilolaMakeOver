import Link from "next/link";
import { getCannibalizationIssues, type StoredCannibalizationIssue } from "@/lib/intelligence/cannibalization";
import { computeLifetime, applyLifetimeDecay, TREND_LABELS, type Trend } from "@/lib/intelligence/opportunity-lifetime";

const TREND_COLOR: Record<Trend, string> = {
  growing: "var(--cc-good)",
  declining: "var(--cc-critical)",
  stable: "var(--cc-text-muted)",
  new: "var(--cc-text-muted)",
};

const ACTION_LABELS: Record<string, string> = {
  consolidate_into_primary: "Consolidate into primary",
  differentiate_secondary: "Differentiate secondary",
  strengthen_primary_links: "Strengthen primary links",
};

function IssueRow({ issue }: { issue: StoredCannibalizationIssue }) {
  const lifetime = computeLifetime(
    issue.firstSeenAt,
    issue.history.map((h) => ({ date: h.date, score: h.severityScore })),
    issue.status
  );
  return (
    <tr style={{ borderBottom: "1px solid var(--cc-border)" }}>
      <td style={{ padding: "6px 8px" }}>
        <Link href={`/command-center/cannibalization/${issue.topicKey}`} style={{ color: "inherit" }}>
          {lifetime.isStale && "💤 "}
          {issue.primaryPage.path} <span style={{ color: "var(--cc-text-muted)" }}>vs.</span> {issue.secondaryPage.path}
        </Link>
      </td>
      <td style={{ padding: "6px 8px", textAlign: "right", fontFamily: "var(--cc-mono)" }}>
        {issue.scoreBreakdown.severityScore.toFixed(0)}
      </td>
      <td style={{ padding: "6px 8px", textAlign: "right", fontFamily: "var(--cc-mono)" }}>
        {applyLifetimeDecay(issue.priorityScore, lifetime).toFixed(1)}
      </td>
      <td style={{ padding: "6px 8px", textAlign: "right", fontFamily: "var(--cc-mono)" }}>
        {issue.secondaryShare.toFixed(0)}%
      </td>
      <td style={{ padding: "6px 8px" }}>{ACTION_LABELS[issue.recommendedAction] ?? issue.recommendedAction}</td>
      <td style={{ padding: "6px 8px", textTransform: "capitalize" }}>{issue.status.replace("_", " ")}</td>
      <td style={{ padding: "6px 8px", textAlign: "right", fontFamily: "var(--cc-mono)" }}>{lifetime.ageDays}d</td>
      <td style={{ padding: "6px 8px", color: TREND_COLOR[lifetime.trend] }}>{TREND_LABELS[lifetime.trend]}</td>
    </tr>
  );
}

export default async function CannibalizationPage() {
  const issuesRaw = await getCannibalizationIssues();
  const issues = [...issuesRaw].sort((a, b) => {
    const la = computeLifetime(a.firstSeenAt, a.history.map((h) => ({ date: h.date, score: h.severityScore })), a.status);
    const lb = computeLifetime(b.firstSeenAt, b.history.map((h) => ({ date: h.date, score: h.severityScore })), b.status);
    return applyLifetimeDecay(b.priorityScore, lb) - applyLifetimeDecay(a.priorityScore, la);
  });

  return (
    <div>
      <h1 className="cc-page-title">Cannibalization</h1>
      <p className="cc-page-dek">
        Real pairs of pages that Search Console itself served for the same real query in the last 90 days —
        evidence-only, no guessed content similarity. A pair only appears here once at least one query has real
        impressions split across both pages above the noise floor.
      </p>

      {issues.length === 0 ? (
        <div className="cc-card">
          <h2 style={{ margin: "0 0 12px", fontSize: "1.0625rem" }}>Cannibalization Detection Engine</h2>
          <div className="cc-empty">
            No cannibalization issues computed yet. This runs weekly from the daily snapshot cron (self-gated,
            requires Search Console) — trigger it manually via the &ldquo;Run now&rdquo; button on Settings, or{" "}
            <code>POST /api/command-center/snapshot</code>, to compute the first batch now.
          </div>
        </div>
      ) : (
        <div className="cc-card">
          <h2 style={{ margin: "0 0 4px", fontSize: "1.0625rem" }}>All issues</h2>
          <p style={{ margin: "0 0 12px", fontSize: "0.8125rem", color: "var(--cc-text-muted)" }}>
            {issues.length} page pair{issues.length === 1 ? "" : "s"} splitting real search impressions, sorted by
            priority (severity ÷ effort).
          </p>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", fontSize: "0.8125rem", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--cc-border)", color: "var(--cc-text-muted)" }}>
                  <th style={{ textAlign: "left", padding: "6px 8px", fontWeight: 500 }}>Pages</th>
                  <th style={{ textAlign: "right", padding: "6px 8px", fontWeight: 500 }}>Severity</th>
                  <th style={{ textAlign: "right", padding: "6px 8px", fontWeight: 500 }}>Priority</th>
                  <th style={{ textAlign: "right", padding: "6px 8px", fontWeight: 500 }}>Secondary share</th>
                  <th style={{ textAlign: "left", padding: "6px 8px", fontWeight: 500 }}>Recommended action</th>
                  <th style={{ textAlign: "left", padding: "6px 8px", fontWeight: 500 }}>Status</th>
                  <th style={{ textAlign: "right", padding: "6px 8px", fontWeight: 500 }}>Age</th>
                  <th style={{ textAlign: "left", padding: "6px 8px", fontWeight: 500 }}>Trend</th>
                </tr>
              </thead>
              <tbody>
                {issues.map((issue) => <IssueRow key={issue.topicKey} issue={issue} />)}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
