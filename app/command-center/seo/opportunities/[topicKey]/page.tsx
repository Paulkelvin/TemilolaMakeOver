import Link from "next/link";
import { notFound } from "next/navigation";
import { getSeoOpportunityByKey } from "@/lib/intelligence/seo-opportunities";
import { computeLifetime, applyLifetimeDecay, TREND_LABELS, type Trend } from "@/lib/intelligence/opportunity-lifetime";

const TREND_COLOR: Record<Trend, string> = {
  growing: "var(--cc-good)",
  declining: "var(--cc-critical)",
  stable: "var(--cc-text-muted)",
  new: "var(--cc-text-muted)",
};

const ACTION_LABELS: Record<string, string> = {
  improve_existing_page: "Improve existing page",
  create_new_blog_article: "Create new blog article",
  add_faqs: "Add FAQs",
  add_portfolio_examples: "Add portfolio examples",
  strengthen_internal_links: "Strengthen internal links",
  expand_pillar_page: "Expand pillar page",
};

const COVERAGE_LABELS: Record<string, string> = {
  none: "No existing content — genuine content gap",
  thin: "Thin/stale existing content",
  "existing-strong": "Strong existing content",
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

export default async function SeoOpportunityDetailPage({
  params,
}: {
  params: Promise<{ topicKey: string }>;
}) {
  const { topicKey } = await params;
  const opp = await getSeoOpportunityByKey(topicKey);
  if (!opp) notFound();

  const sb = opp.scoreBreakdown;
  const lifetime = computeLifetime(opp.firstSeenAt, opp.history.map((h) => ({ date: h.date, score: h.score })), opp.status);
  const decayedPriority = applyLifetimeDecay(opp.priorityScore, lifetime);

  return (
    <div>
      <p style={{ margin: "0 0 6px" }}>
        <Link href="/command-center/seo" style={{ color: "var(--cc-text-muted)", fontSize: "0.8125rem" }}>
          &larr; SEO
        </Link>
      </p>
      <h1 className="cc-page-title">
        {opp.isQuickWin && "⚡ "}
        {opp.isSeasonal && "🗓 "}
        {lifetime.isStale && "💤 "}
        {opp.topicLabel}
      </h1>
      <p className="cc-page-dek">
        {opp.intent} intent · {COVERAGE_LABELS[opp.contentCoverage]} · confidence: {opp.confidenceLevel}
        {opp.matchedContentPath && (
          <>
            {" · "}
            <a href={opp.matchedContentPath} target="_blank" rel="noopener noreferrer">
              View matched page
            </a>
          </>
        )}
      </p>

      <div className="cc-tiles">
        <div className="cc-tile">
          <div className="cc-tile__label">Score</div>
          <div className="cc-tile__value">{sb.totalScore.toFixed(0)}</div>
        </div>
        <div className="cc-tile">
          <div className="cc-tile__label">Priority (value ÷ effort)</div>
          <div className="cc-tile__value">
            {decayedPriority.toFixed(1)}
            {lifetime.isStale && (
              <span style={{ fontSize: "0.75rem", color: "var(--cc-text-muted)", fontWeight: 400 }}> (was {(opp.priorityScore ?? 0).toFixed(1)})</span>
            )}
          </div>
        </div>
        <div className="cc-tile">
          <div className="cc-tile__label">Position</div>
          <div className="cc-tile__value">{opp.currentMetrics.position.toFixed(1)}</div>
        </div>
        <div className="cc-tile">
          <div className="cc-tile__label">Impressions</div>
          <div className="cc-tile__value">{opp.currentMetrics.impressions.toLocaleString()}</div>
        </div>
        <div className="cc-tile">
          <div className="cc-tile__label">CTR</div>
          <div className="cc-tile__value">{(opp.currentMetrics.ctr * 100).toFixed(1)}%</div>
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
            First seen {lifetime.ageDays} days ago, still <strong style={{ textTransform: "capitalize" }}>{opp.status.replace("_", " ")}</strong>, and
            the score has been {lifetime.trend} across the last several computation runs. Its priority is halved in the queue
            ordering above so it stops crowding out newer, growing opportunities — it isn&rsquo;t hidden or deleted, just
            deprioritized. Actioning it (or if it starts growing again) will lift the penalty automatically.
          </p>
        </div>
      )}

      <div className="cc-card">
        <h2 style={{ margin: "0 0 4px", fontSize: "1.0625rem" }}>Recommended action</h2>
        <p style={{ margin: "0 0 4px", fontWeight: 600 }}>{ACTION_LABELS[opp.recommendedAction] ?? opp.recommendedAction}</p>
        <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--cc-text-muted)" }}>{opp.recommendedActionDetail}</p>
        <p style={{ margin: "12px 0 0", fontSize: "0.8125rem", color: "var(--cc-text-muted)" }}>
          Status: <strong style={{ textTransform: "capitalize" }}>{opp.status.replace("_", " ")}</strong>
          {opp.actionedAt && ` · actioned ${new Date(opp.actionedAt).toLocaleDateString()}`}
          {" · "}
          <span>edit status/actioned-at for this topic in Sanity Studio (SEO Opportunities)</span>
        </p>
      </div>

      <div className="cc-card">
        <h2 style={{ margin: "0 0 12px", fontSize: "1.0625rem" }}>Score breakdown</h2>
        <ScoreRow label="Position" value={sb.positionScore} description="Peaks in the 8–20 quick-win band" />
        <ScoreRow label="Impressions" value={sb.impressionsScore} description="Log-scaled search volume signal" />
        <ScoreRow label="CTR gap" value={sb.ctrGapScore} description="Actual CTR vs. expected CTR for this position" />
        <ScoreRow label="Commercial value" value={sb.commercialValueScore} description={`Intent classified as: ${opp.intent}`} />
        <ScoreRow label="Topical relevance" value={sb.topicalRelevanceScore} description="Overlap with the site's real services/locations/vocabulary" />
        <ScoreRow label="Competition (proxy)" value={sb.competitionProxyScore} description="Not verified keyword-difficulty data — see confidence reasons" />
        <ScoreRow label="Content coverage" value={sb.contentCoverageScore} description={COVERAGE_LABELS[opp.contentCoverage]} />
        <div style={{ borderTop: "1px solid var(--cc-border)", marginTop: 8, paddingTop: 8 }}>
          <ScoreRow label="Total" value={sb.totalScore} />
        </div>
      </div>

      <div className="cc-card">
        <h2 style={{ margin: "0 0 12px", fontSize: "1.0625rem" }}>Why this confidence level</h2>
        <ul style={{ margin: 0, paddingLeft: "1.2em", fontSize: "0.875rem", color: "var(--cc-text-muted)", lineHeight: 1.7 }}>
          {opp.confidenceReasons.map((r, i) => <li key={i}>{r}</li>)}
        </ul>
      </div>

      <div className="cc-card">
        <h2 style={{ margin: "0 0 4px", fontSize: "1.0625rem" }}>Search intent detection</h2>
        {opp.intentClassification ? (
          <>
            <p style={{ margin: "0 0 4px", fontWeight: 600, textTransform: "capitalize" }}>
              {opp.intentClassification.intent} — {opp.intentClassification.confidencePct}% confidence
            </p>
            <p style={{ margin: "0 0 4px", fontSize: "0.875rem", color: "var(--cc-text-muted)" }}>{opp.intentClassification.ruleTriggered}</p>
            {opp.intentClassification.matchedWords.length > 0 && (
              <p style={{ margin: 0, fontSize: "0.8125rem", color: "var(--cc-text-muted)" }}>
                Matched words: {opp.intentClassification.matchedWords.map((w) => <code key={w} style={{ marginRight: 6 }}>{w}</code>)}
              </p>
            )}
          </>
        ) : (
          <div className="cc-empty">Not yet computed for this topic — populates on the next weekly recompute.</div>
        )}
      </div>

      <div className="cc-card">
        <h2 style={{ margin: "0 0 12px", fontSize: "1.0625rem" }}>Why this recommendation (decision trail)</h2>
        <ol style={{ margin: 0, paddingLeft: "1.2em", fontSize: "0.8125rem", color: "var(--cc-text-muted)", lineHeight: 1.8, fontFamily: "var(--cc-mono)" }}>
          {opp.decisionTrace?.length
            ? opp.decisionTrace.map((step, i) => <li key={i}>{step}</li>)
            : <li>Not yet computed for this topic — populates on the next weekly recompute.</li>}
        </ol>
      </div>

      <div className="cc-card">
        <h2 style={{ margin: "0 0 12px", fontSize: "1.0625rem" }}>Backing queries ({opp.queries.length})</h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", fontSize: "0.8125rem", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--cc-border)", color: "var(--cc-text-muted)" }}>
                <th style={{ textAlign: "left", padding: "6px 8px", fontWeight: 500 }}>Query</th>
                <th style={{ textAlign: "left", padding: "6px 8px", fontWeight: 500 }}>Page</th>
                <th style={{ textAlign: "right", padding: "6px 8px", fontWeight: 500 }}>Clicks</th>
                <th style={{ textAlign: "right", padding: "6px 8px", fontWeight: 500 }}>Impressions</th>
                <th style={{ textAlign: "right", padding: "6px 8px", fontWeight: 500 }}>CTR</th>
                <th style={{ textAlign: "right", padding: "6px 8px", fontWeight: 500 }}>Position</th>
              </tr>
            </thead>
            <tbody>
              {opp.queries.map((q, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--cc-border)" }}>
                  <td style={{ padding: "6px 8px" }}>{q.query}</td>
                  <td style={{ padding: "6px 8px", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {(() => {
                      try {
                        return new URL(q.page).pathname;
                      } catch {
                        return q.page;
                      }
                    })()}
                  </td>
                  <td style={{ padding: "6px 8px", textAlign: "right", fontFamily: "var(--cc-mono)" }}>{q.clicks}</td>
                  <td style={{ padding: "6px 8px", textAlign: "right", fontFamily: "var(--cc-mono)" }}>{q.impressions.toLocaleString()}</td>
                  <td style={{ padding: "6px 8px", textAlign: "right", fontFamily: "var(--cc-mono)" }}>{(q.ctr * 100).toFixed(1)}%</td>
                  <td style={{ padding: "6px 8px", textAlign: "right", fontFamily: "var(--cc-mono)" }}>{q.position.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="cc-card">
        <h2 style={{ margin: "0 0 12px", fontSize: "1.0625rem" }}>Progress over time</h2>
        {opp.history.length <= 1 ? (
          <div className="cc-empty">
            Only one computation run so far — history builds up week over week as the engine recomputes.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", fontSize: "0.8125rem", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--cc-border)", color: "var(--cc-text-muted)" }}>
                  <th style={{ textAlign: "left", padding: "6px 8px", fontWeight: 500 }}>Date</th>
                  <th style={{ textAlign: "right", padding: "6px 8px", fontWeight: 500 }}>Position</th>
                  <th style={{ textAlign: "right", padding: "6px 8px", fontWeight: 500 }}>Impressions</th>
                  <th style={{ textAlign: "right", padding: "6px 8px", fontWeight: 500 }}>Clicks</th>
                  <th style={{ textAlign: "right", padding: "6px 8px", fontWeight: 500 }}>CTR</th>
                  <th style={{ textAlign: "right", padding: "6px 8px", fontWeight: 500 }}>Score</th>
                </tr>
              </thead>
              <tbody>
                {[...opp.history].reverse().map((h) => (
                  <tr key={h.date} style={{ borderBottom: "1px solid var(--cc-border)" }}>
                    <td style={{ padding: "6px 8px", fontFamily: "var(--cc-mono)" }}>{h.date}</td>
                    <td style={{ padding: "6px 8px", textAlign: "right", fontFamily: "var(--cc-mono)" }}>{h.position.toFixed(1)}</td>
                    <td style={{ padding: "6px 8px", textAlign: "right", fontFamily: "var(--cc-mono)" }}>{h.impressions.toLocaleString()}</td>
                    <td style={{ padding: "6px 8px", textAlign: "right", fontFamily: "var(--cc-mono)" }}>{h.clicks}</td>
                    <td style={{ padding: "6px 8px", textAlign: "right", fontFamily: "var(--cc-mono)" }}>{(h.ctr * 100).toFixed(1)}%</td>
                    <td style={{ padding: "6px 8px", textAlign: "right", fontFamily: "var(--cc-mono)" }}>{h.score.toFixed(0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p style={{ margin: "10px 0 0", fontSize: "0.75rem", color: "var(--cc-text-muted)" }}>
          First seen {new Date(opp.firstSeenAt).toLocaleDateString()} · last computed {new Date(opp.lastComputedAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
