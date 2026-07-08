import Link from "next/link";
import { notFound } from "next/navigation";
import { getCannibalizationIssueByKey } from "@/lib/intelligence/cannibalization";
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

function ScoreRow({ label, value, description }: { label: string; value: number; description?: string }) {
  return (
    <div className="cc-score-row" title={description}>
      <span className="cc-score-label">{label}</span>
      <div className="cc-score-track">
        <div className="cc-score-fill" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
      <span className="cc-score-val">{value.toFixed(0)}</span>
    </div>
  );
}

export default async function CannibalizationDetailPage({
  params,
}: {
  params: Promise<{ topicKey: string }>;
}) {
  const { topicKey } = await params;
  const issue = await getCannibalizationIssueByKey(topicKey);
  if (!issue) notFound();

  const sb = issue.scoreBreakdown;
  const lifetime = computeLifetime(
    issue.firstSeenAt,
    issue.history.map((h) => ({ date: h.date, score: h.severityScore })),
    issue.status
  );
  const decayedPriority = applyLifetimeDecay(issue.priorityScore, lifetime);

  return (
    <div>
      <p style={{ margin: "0 0 6px" }}>
        <Link href="/command-center/cannibalization" style={{ color: "var(--cc-text-muted)", fontSize: "0.8125rem" }}>
          &larr; Cannibalization
        </Link>
      </p>
      <h1 className="cc-page-title">
        {lifetime.isStale && "💤 "}
        {issue.primaryPage.path} <span style={{ color: "var(--cc-text-muted)" }}>vs.</span> {issue.secondaryPage.path}
      </h1>
      <p className="cc-page-dek">
        Both pages served real Search Console impressions for {issue.sharedQueries.length} shared quer
        {issue.sharedQueries.length === 1 ? "y" : "ies"} over the last 90 days.
      </p>

      <div className="cc-tiles">
        <div className="cc-tile">
          <div className="cc-tile__label">Severity</div>
          <div className="cc-tile__value">{sb.severityScore.toFixed(0)}</div>
        </div>
        <div className="cc-tile">
          <div className="cc-tile__label">Priority (severity ÷ effort)</div>
          <div className="cc-tile__value">
            {decayedPriority.toFixed(1)}
            {lifetime.isStale && (
              <span style={{ fontSize: "0.75rem", color: "var(--cc-text-muted)", fontWeight: 400 }}> (was {(issue.priorityScore ?? 0).toFixed(1)})</span>
            )}
          </div>
        </div>
        <div className="cc-tile">
          <div className="cc-tile__label">Secondary share</div>
          <div className="cc-tile__value">{issue.secondaryShare.toFixed(0)}%</div>
        </div>
        <div className="cc-tile">
          <div className="cc-tile__label">Status</div>
          <div className="cc-tile__value" style={{ textTransform: "capitalize", fontSize: "1.25rem" }}>{issue.status.replace("_", " ")}</div>
        </div>
        <div className="cc-tile">
          <div className="cc-tile__label">Age</div>
          <div className="cc-tile__value">{lifetime.ageDays}d</div>
        </div>
        <div className="cc-tile">
          <div className="cc-tile__label">Trend</div>
          <div className="cc-tile__value" style={{ color: TREND_COLOR[lifetime.trend], fontSize: "1.25rem" }}>
            {TREND_LABELS[lifetime.trend]}
          </div>
        </div>
      </div>

      {lifetime.isStale && (
        <div className="cc-card" style={{ borderColor: "var(--cc-text-muted)" }}>
          <h2 style={{ margin: "0 0 4px", fontSize: "1.0625rem" }}>💤 Lifetime — going stale</h2>
          <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--cc-text-muted)" }}>
            First seen {lifetime.ageDays} days ago, still <strong style={{ textTransform: "capitalize" }}>{issue.status.replace("_", " ")}</strong>, and
            severity has been {lifetime.trend} across the last several computation runs. Its priority is halved in the
            queue ordering above so it stops crowding out newer, growing issues — it isn&rsquo;t hidden or deleted,
            just deprioritized. Actioning it (or if severity starts growing again) will lift the penalty automatically.
          </p>
        </div>
      )}

      <div className="cc-card">
        <h2 style={{ margin: "0 0 4px", fontSize: "1.0625rem" }}>Recommended action</h2>
        <p style={{ margin: "0 0 4px", fontWeight: 600 }}>{ACTION_LABELS[issue.recommendedAction] ?? issue.recommendedAction}</p>
        <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--cc-text-muted)" }}>{issue.recommendedActionDetail}</p>
        <p style={{ margin: "12px 0 0", fontSize: "0.8125rem", color: "var(--cc-text-muted)" }}>
          Status: <strong style={{ textTransform: "capitalize" }}>{issue.status.replace("_", " ")}</strong>
          {issue.actionedAt && ` · actioned ${new Date(issue.actionedAt).toLocaleDateString()}`}
          {" · "}
          <span>edit status/actioned-at for this issue in Sanity Studio (Cannibalization Issues)</span>
        </p>
      </div>

      <div className="cc-card">
        <h2 style={{ margin: "0 0 12px", fontSize: "1.0625rem" }}>Severity breakdown</h2>
        <ScoreRow label="Impression volume" value={sb.impressionVolumeScore} description="Log-scaled combined impressions across shared queries" />
        <ScoreRow label="Share split" value={sb.shareSplitScore} description="How evenly the impressions are split between the two pages" />
        <ScoreRow label="Position proximity" value={sb.positionProximityScore} description="How close the two pages' average positions are — closer means a more direct fight" />
        <div style={{ borderTop: "1px solid var(--cc-border)", marginTop: 8, paddingTop: 8 }}>
          <ScoreRow label="Total severity" value={sb.severityScore} />
        </div>
      </div>

      <div className="cc-card">
        <h2 style={{ margin: "0 0 12px", fontSize: "1.0625rem" }}>Why this recommendation (decision trail)</h2>
        <ol style={{ margin: 0, paddingLeft: "1.2em", fontSize: "0.8125rem", color: "var(--cc-text-muted)", lineHeight: 1.8, fontFamily: "var(--cc-mono)" }}>
          {issue.decisionTrace?.length
            ? issue.decisionTrace.map((step, i) => <li key={i}>{step}</li>)
            : <li>Not yet computed for this issue — populates on the next weekly recompute.</li>}
        </ol>
      </div>

      <div className="cc-card">
        <h2 style={{ margin: "0 0 4px", fontSize: "1.0625rem" }}>Page comparison</h2>
        <p style={{ margin: "0 0 12px", fontSize: "0.8125rem", color: "var(--cc-text-muted)" }}>
          Aggregated across the {issue.sharedQueries.length} shared quer{issue.sharedQueries.length === 1 ? "y" : "ies"} only — not each page&rsquo;s total site-wide traffic.
        </p>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", fontSize: "0.8125rem", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--cc-border)", color: "var(--cc-text-muted)" }}>
                <th style={{ textAlign: "left", padding: "6px 8px", fontWeight: 500 }}>Page</th>
                <th style={{ textAlign: "right", padding: "6px 8px", fontWeight: 500 }}>Impressions</th>
                <th style={{ textAlign: "right", padding: "6px 8px", fontWeight: 500 }}>Clicks</th>
                <th style={{ textAlign: "right", padding: "6px 8px", fontWeight: 500 }}>Avg. position</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid var(--cc-border)" }}>
                <td style={{ padding: "6px 8px" }}>{issue.primaryPage.path} <span style={{ color: "var(--cc-text-muted)", fontSize: "0.75rem" }}>(primary)</span></td>
                <td style={{ padding: "6px 8px", textAlign: "right", fontFamily: "var(--cc-mono)" }}>{issue.primaryPage.impressions.toLocaleString()}</td>
                <td style={{ padding: "6px 8px", textAlign: "right", fontFamily: "var(--cc-mono)" }}>{issue.primaryPage.clicks}</td>
                <td style={{ padding: "6px 8px", textAlign: "right", fontFamily: "var(--cc-mono)" }}>{issue.primaryPage.position.toFixed(1)}</td>
              </tr>
              <tr>
                <td style={{ padding: "6px 8px" }}>{issue.secondaryPage.path} <span style={{ color: "var(--cc-text-muted)", fontSize: "0.75rem" }}>(secondary)</span></td>
                <td style={{ padding: "6px 8px", textAlign: "right", fontFamily: "var(--cc-mono)" }}>{issue.secondaryPage.impressions.toLocaleString()}</td>
                <td style={{ padding: "6px 8px", textAlign: "right", fontFamily: "var(--cc-mono)" }}>{issue.secondaryPage.clicks}</td>
                <td style={{ padding: "6px 8px", textAlign: "right", fontFamily: "var(--cc-mono)" }}>{issue.secondaryPage.position.toFixed(1)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="cc-card">
        <h2 style={{ margin: "0 0 12px", fontSize: "1.0625rem" }}>Shared queries ({issue.sharedQueries.length})</h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", fontSize: "0.8125rem", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--cc-border)", color: "var(--cc-text-muted)" }}>
                <th style={{ textAlign: "left", padding: "6px 8px", fontWeight: 500 }}>Query</th>
                <th style={{ textAlign: "right", padding: "6px 8px", fontWeight: 500 }}>Primary impr.</th>
                <th style={{ textAlign: "right", padding: "6px 8px", fontWeight: 500 }}>Primary pos.</th>
                <th style={{ textAlign: "right", padding: "6px 8px", fontWeight: 500 }}>Secondary impr.</th>
                <th style={{ textAlign: "right", padding: "6px 8px", fontWeight: 500 }}>Secondary pos.</th>
              </tr>
            </thead>
            <tbody>
              {issue.sharedQueries.map((q, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--cc-border)" }}>
                  <td style={{ padding: "6px 8px" }}>{q.query}</td>
                  <td style={{ padding: "6px 8px", textAlign: "right", fontFamily: "var(--cc-mono)" }}>{q.primaryImpressions.toLocaleString()}</td>
                  <td style={{ padding: "6px 8px", textAlign: "right", fontFamily: "var(--cc-mono)" }}>{q.primaryPosition.toFixed(1)}</td>
                  <td style={{ padding: "6px 8px", textAlign: "right", fontFamily: "var(--cc-mono)" }}>{q.secondaryImpressions.toLocaleString()}</td>
                  <td style={{ padding: "6px 8px", textAlign: "right", fontFamily: "var(--cc-mono)" }}>{q.secondaryPosition.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="cc-card">
        <h2 style={{ margin: "0 0 12px", fontSize: "1.0625rem" }}>Progress over time</h2>
        {issue.history.length <= 1 ? (
          <div className="cc-empty">
            Only one computation run so far — history builds up week over week as the engine recomputes.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", fontSize: "0.8125rem", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--cc-border)", color: "var(--cc-text-muted)" }}>
                  <th style={{ textAlign: "left", padding: "6px 8px", fontWeight: 500 }}>Date</th>
                  <th style={{ textAlign: "right", padding: "6px 8px", fontWeight: 500 }}>Severity</th>
                </tr>
              </thead>
              <tbody>
                {[...issue.history].reverse().map((h) => (
                  <tr key={h.date} style={{ borderBottom: "1px solid var(--cc-border)" }}>
                    <td style={{ padding: "6px 8px", fontFamily: "var(--cc-mono)" }}>{h.date}</td>
                    <td style={{ padding: "6px 8px", textAlign: "right", fontFamily: "var(--cc-mono)" }}>{h.severityScore.toFixed(0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p style={{ margin: "10px 0 0", fontSize: "0.75rem", color: "var(--cc-text-muted)" }}>
          First seen {new Date(issue.firstSeenAt).toLocaleDateString()} · last computed{" "}
          {new Date(issue.lastComputedAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
