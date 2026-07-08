import Link from "next/link";
import { notFound } from "next/navigation";
import { getKnowledgeGraphGapByKey } from "@/lib/intelligence/knowledge-graph";
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

export default async function KnowledgeGraphDetailPage({
  params,
}: {
  params: Promise<{ topicKey: string }>;
}) {
  const { topicKey } = await params;
  const gap = await getKnowledgeGraphGapByKey(topicKey);
  if (!gap) notFound();

  const sb = gap.scoreBreakdown;
  const lifetime = computeLifetime(
    gap.firstSeenAt,
    gap.history.map((h) => ({ date: h.date, score: h.importanceScore })),
    gap.status
  );
  const decayedPriority = applyLifetimeDecay(gap.priorityScore, lifetime);

  return (
    <div>
      <p style={{ margin: "0 0 6px" }}>
        <Link href="/command-center/knowledge-graph" style={{ color: "var(--cc-text-muted)", fontSize: "0.8125rem" }}>
          &larr; Knowledge Graph
        </Link>
      </p>
      <h1 className="cc-page-title">
        {lifetime.isStale && "💤 "}
        {gap.serviceName} <span style={{ color: "var(--cc-text-muted)" }}>×</span> {gap.occasionName}
      </h1>
      <p className="cc-page-dek">
        {gap.servicePath && <a href={gap.servicePath} target="_blank" rel="noopener noreferrer">{gap.serviceName}</a>}
        {" · "}
        {gap.occasionName} (no dedicated page yet) · no real content connects them yet
      </p>

      <div className="cc-tiles">
        <div className="cc-tile">
          <div className="cc-tile__label">Importance</div>
          <div className="cc-tile__value">{sb.importanceScore.toFixed(0)}</div>
        </div>
        <div className="cc-tile">
          <div className="cc-tile__label">Priority (importance ÷ effort)</div>
          <div className="cc-tile__value">
            {decayedPriority.toFixed(1)}
            {lifetime.isStale && (
              <span style={{ fontSize: "0.75rem", color: "var(--cc-text-muted)", fontWeight: 400 }}> (was {(gap.priorityScore ?? 0).toFixed(1)})</span>
            )}
          </div>
        </div>
        <div className="cc-tile">
          <div className="cc-tile__label">{gap.serviceName} content elsewhere</div>
          <div className="cc-tile__value">{gap.serviceContentCount}</div>
        </div>
        <div className="cc-tile">
          <div className="cc-tile__label">{gap.occasionName} content elsewhere</div>
          <div className="cc-tile__value">{gap.occasionContentCount}</div>
        </div>
        <div className="cc-tile">
          <div className="cc-tile__label">Status</div>
          <div className="cc-tile__value" style={{ textTransform: "capitalize", fontSize: "1.25rem" }}>{gap.status.replace("_", " ")}</div>
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
            First seen {lifetime.ageDays} days ago, still <strong style={{ textTransform: "capitalize" }}>{gap.status.replace("_", " ")}</strong>, and
            importance hasn&rsquo;t grown across the last several computation runs. Its priority is halved in the
            queue ordering above so it stops crowding out newer gaps — it isn&rsquo;t hidden or deleted, just
            deprioritized. Actioning it will lift the penalty automatically.
          </p>
        </div>
      )}

      <div className="cc-card">
        <h2 style={{ margin: "0 0 4px", fontSize: "1.0625rem" }}>Recommended action</h2>
        <p style={{ margin: "0 0 4px", fontWeight: 600 }}>{ACTION_LABELS[gap.recommendedAction] ?? gap.recommendedAction}</p>
        <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--cc-text-muted)" }}>{gap.recommendedActionDetail}</p>
        <p style={{ margin: "12px 0 0", fontSize: "0.8125rem", color: "var(--cc-text-muted)" }}>
          Status: <strong style={{ textTransform: "capitalize" }}>{gap.status.replace("_", " ")}</strong>
          {gap.actionedAt && ` · actioned ${new Date(gap.actionedAt).toLocaleDateString()}`}
          {" · "}
          <span>edit status/actioned-at for this gap in Sanity Studio (Knowledge Graph Gaps)</span>
        </p>
      </div>

      <div className="cc-card">
        <h2 style={{ margin: "0 0 12px", fontSize: "1.0625rem" }}>Importance breakdown</h2>
        <ScoreRow label={`${gap.serviceName} strength`} value={sb.serviceStrengthScore} description="How established this service is elsewhere on the site" />
        <ScoreRow label={`${gap.occasionName} strength`} value={sb.occasionStrengthScore} description="How established this occasion is elsewhere on the site" />
        <div style={{ borderTop: "1px solid var(--cc-border)", marginTop: 8, paddingTop: 8 }}>
          <ScoreRow label="Total importance" value={sb.importanceScore} description="The weaker of the two sides — a gap is only as important as its least-established node" />
        </div>
      </div>

      <div className="cc-card">
        <h2 style={{ margin: "0 0 12px", fontSize: "1.0625rem" }}>Why this recommendation (decision trail)</h2>
        <ol style={{ margin: 0, paddingLeft: "1.2em", fontSize: "0.8125rem", color: "var(--cc-text-muted)", lineHeight: 1.8, fontFamily: "var(--cc-mono)" }}>
          {gap.decisionTrace?.length
            ? gap.decisionTrace.map((step, i) => <li key={i}>{step}</li>)
            : <li>Not yet computed for this gap — populates on the next weekly recompute.</li>}
        </ol>
      </div>

      <div className="cc-card">
        <h2 style={{ margin: "0 0 12px", fontSize: "1.0625rem" }}>Progress over time</h2>
        {gap.history.length <= 1 ? (
          <div className="cc-empty">
            Only one computation run so far — history builds up week over week as the engine recomputes.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", fontSize: "0.8125rem", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--cc-border)", color: "var(--cc-text-muted)" }}>
                  <th style={{ textAlign: "left", padding: "6px 8px", fontWeight: 500 }}>Date</th>
                  <th style={{ textAlign: "right", padding: "6px 8px", fontWeight: 500 }}>Importance</th>
                </tr>
              </thead>
              <tbody>
                {[...gap.history].reverse().map((h) => (
                  <tr key={h.date} style={{ borderBottom: "1px solid var(--cc-border)" }}>
                    <td style={{ padding: "6px 8px", fontFamily: "var(--cc-mono)" }}>{h.date}</td>
                    <td style={{ padding: "6px 8px", textAlign: "right", fontFamily: "var(--cc-mono)" }}>{h.importanceScore.toFixed(0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p style={{ margin: "10px 0 0", fontSize: "0.75rem", color: "var(--cc-text-muted)" }}>
          First seen {new Date(gap.firstSeenAt).toLocaleDateString()} · last computed{" "}
          {new Date(gap.lastComputedAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
