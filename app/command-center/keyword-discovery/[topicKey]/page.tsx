import Link from "next/link";
import { notFound } from "next/navigation";
import { getKeywordDiscoveryTopicByKey } from "@/lib/intelligence/keyword-discovery";
import { computeLifetime, applyLifetimeDecay, TREND_LABELS } from "@/lib/intelligence/opportunity-lifetime";
import { TREND_COLOR } from "@/components/command-center/shared-labels";
import { ScoreRow } from "@/components/command-center/ScoreRow";
import { TimeSeriesChart } from "@/components/command-center/TimeSeriesChart";
import { ScoreBreakdownRadar } from "@/components/command-center/ScoreBreakdownRadar";

const ACTION_LABELS: Record<string, string> = {
  create_new_pillar: "Create new pillar",
  create_cluster_article: "Create cluster article",
  improve_existing_page: "Improve existing page",
  add_faqs: "Add FAQs",
  add_portfolio: "Add portfolio",
  add_internal_links: "Add internal links",
};

const COVERAGE_LABELS: Record<string, string> = {
  none: "No existing content — genuine content gap",
  thin: "Thin/stale existing content",
  "existing-strong": "Strong existing content",
};

const SOURCE_LABELS: Record<string, string> = {
  "google-autocomplete": "Google Autocomplete",
  "youtube-autocomplete": "YouTube Autocomplete",
  "bing-autocomplete": "Bing Autocomplete",
  "duckduckgo-autocomplete": "DuckDuckGo Autocomplete",
  seed: "Seed (from taxonomy)",
};


export default async function KeywordDiscoveryDetailPage({
  params,
}: {
  params: Promise<{ topicKey: string }>;
}) {
  const { topicKey } = await params;
  const topic = await getKeywordDiscoveryTopicByKey(topicKey);
  if (!topic) notFound();

  const sb = topic.scoreBreakdown;
  const lifetime = computeLifetime(topic.firstSeenAt, topic.history.map((h) => ({ date: h.date, score: h.score })), topic.status);
  const decayedPriority = applyLifetimeDecay(topic.priorityScore, lifetime);

  return (
    <div>
      <p style={{ margin: "0 0 6px" }}>
        <Link href="/command-center/keyword-discovery" style={{ color: "var(--cc-text-muted)", fontSize: "0.8125rem" }}>
          &larr; Keyword Discovery
        </Link>
      </p>
      <h1 className="cc-page-title">
        {topic.linkedSeoOpportunityKey && "🔗 "}
        {topic.isSeasonal && "🗓 "}
        {lifetime.isStale && "💤 "}
        {topic.topicLabel}
      </h1>
      <p className="cc-page-dek">
        {topic.intent} intent · {topic.queryBreadth} · {COVERAGE_LABELS[topic.contentCoverage]} · confidence:{" "}
        {topic.confidenceLevel}
        {topic.matchedContentPath && (
          <>
            {" · "}
            <a href={topic.matchedContentPath} target="_blank" rel="noopener noreferrer">
              View matched page
            </a>
          </>
        )}
        {topic.linkedSeoOpportunityKey && (
          <>
            {" · "}
            <Link href={`/command-center/seo/opportunities/${topic.linkedSeoOpportunityKey}`}>
              View live SEO performance
            </Link>
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
              <span style={{ fontSize: "0.75rem", color: "var(--cc-text-muted)", fontWeight: 400 }}> (was {(topic.priorityScore ?? 0).toFixed(1)})</span>
            )}
          </div>
        </div>
        <div className="cc-tile">
          <div className="cc-tile__label">Breadth</div>
          <div className="cc-tile__value" style={{ textTransform: "capitalize" }}>{topic.queryBreadth}</div>
        </div>
        <div className="cc-tile">
          <div className="cc-tile__label">Confidence</div>
          <div className="cc-tile__value" style={{ textTransform: "capitalize" }}>{topic.confidenceLevel}</div>
        </div>
        <div className="cc-tile">
          <div className="cc-tile__label">Sample queries</div>
          <div className="cc-tile__value">{topic.sampleQueries.length}</div>
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
            First seen {lifetime.ageDays} days ago, still <strong style={{ textTransform: "capitalize" }}>{topic.status.replace("_", " ")}</strong>, and
            the score has been {lifetime.trend} across the last several computation runs. Its priority is halved in the queue
            ordering above so it stops crowding out newer, growing topics — it isn&rsquo;t hidden or deleted, just
            deprioritized. Actioning it (or if it starts growing again) will lift the penalty automatically.
          </p>
        </div>
      )}

      <div className="cc-card">
        <h2 style={{ margin: "0 0 4px", fontSize: "1.0625rem" }}>Recommended action</h2>
        <p style={{ margin: "0 0 4px", fontWeight: 600 }}>{ACTION_LABELS[topic.recommendedAction] ?? topic.recommendedAction}</p>
        <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--cc-text-muted)" }}>{topic.recommendedActionDetail}</p>
        <p style={{ margin: "12px 0 0", fontSize: "0.8125rem", color: "var(--cc-text-muted)" }}>
          Status: <strong style={{ textTransform: "capitalize" }}>{topic.status.replace("_", " ")}</strong>
          {topic.actionedAt && ` · actioned ${new Date(topic.actionedAt).toLocaleDateString()}`}
          {" · "}
          <span>edit status/actioned-at for this topic in Sanity Studio (Keyword Discovery)</span>
        </p>
      </div>

      <div className="cc-card">
        <h2 style={{ margin: "0 0 12px", fontSize: "1.0625rem" }}>Score breakdown</h2>
        <ScoreRow label="Topical relevance" value={sb.topicalRelevanceScore} description="Overlap with the site's real services/locations/vocabulary" />
        <ScoreRow label="Commercial value" value={sb.commercialValueScore} description={`Intent classified as: ${topic.intent}`} />
        <ScoreRow label="Seasonal boost" value={sb.seasonalBoostScore} description={topic.isSeasonal ? topic.seasonalPeriod : "Not tied to a specific season"} />
        <ScoreRow label="Content coverage" value={sb.contentCoverageScore} description={COVERAGE_LABELS[topic.contentCoverage]} />
        <ScoreRow label="Confidence" value={sb.confidenceScore} description="Based on real cross-source corroboration, not a guessed score" />
        <div style={{ borderTop: "1px solid var(--cc-border)", marginTop: 8, paddingTop: 8 }}>
          <ScoreRow label="Total" value={sb.totalScore} />
        </div>
        <p style={{ margin: "12px 0 0", fontSize: "0.75rem", color: "var(--cc-text-muted)" }}>
          No search volume or keyword-difficulty number is fabricated anywhere in this breakdown. Populate a verified
          difficulty figure later via a paid SEO data provider (Ahrefs/Semrush/DataForSEO) if desired.
        </p>
      </div>

      <div className="cc-card">
        <h2 style={{ margin: "0 0 12px", fontSize: "1.0625rem" }}>Why this confidence level</h2>
        <ul style={{ margin: 0, paddingLeft: "1.2em", fontSize: "0.875rem", color: "var(--cc-text-muted)", lineHeight: 1.7 }}>
          {topic.confidenceReasons.map((r, i) => <li key={i}>{r}</li>)}
        </ul>
      </div>

      <div className="cc-card">
        <h2 style={{ margin: "0 0 4px", fontSize: "1.0625rem" }}>Search intent detection</h2>
        {topic.intentClassification ? (
          <>
            <p style={{ margin: "0 0 4px", fontWeight: 600, textTransform: "capitalize" }}>
              {topic.intentClassification.intent} — {topic.intentClassification.confidencePct}% confidence
            </p>
            <p style={{ margin: "0 0 4px", fontSize: "0.875rem", color: "var(--cc-text-muted)" }}>{topic.intentClassification.ruleTriggered}</p>
            {topic.intentClassification.matchedWords.length > 0 && (
              <p style={{ margin: 0, fontSize: "0.8125rem", color: "var(--cc-text-muted)" }}>
                Matched words: {topic.intentClassification.matchedWords.map((w) => <code key={w} style={{ marginRight: 6 }}>{w}</code>)}
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
          {topic.decisionTrace?.length
            ? topic.decisionTrace.map((step, i) => <li key={i}>{step}</li>)
            : <li>Not yet computed for this topic — populates on the next weekly recompute.</li>}
        </ol>
      </div>

      <div className="cc-card">
        <h2 style={{ margin: "0 0 12px", fontSize: "1.0625rem" }}>Sample queries ({topic.sampleQueries.length})</h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", fontSize: "0.8125rem", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--cc-border)", color: "var(--cc-text-muted)" }}>
                <th style={{ textAlign: "left", padding: "6px 8px", fontWeight: 500 }}>Query</th>
                <th style={{ textAlign: "left", padding: "6px 8px", fontWeight: 500 }}>Source</th>
                <th style={{ textAlign: "right", padding: "6px 8px", fontWeight: 500 }}>Depth</th>
              </tr>
            </thead>
            <tbody>
              {topic.sampleQueries.map((q, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--cc-border)" }}>
                  <td style={{ padding: "6px 8px" }}>{q.query}</td>
                  <td style={{ padding: "6px 8px" }}>{SOURCE_LABELS[q.source] ?? q.source}</td>
                  <td style={{ padding: "6px 8px", textAlign: "right", fontFamily: "var(--cc-mono)" }}>{q.depth}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="cc-card">
        <h2 style={{ margin: "0 0 12px", fontSize: "1.0625rem" }}>Score shape</h2>
        <ScoreBreakdownRadar dimensions={[
          { label: "Topical relevance", value: sb.topicalRelevanceScore },
          { label: "Commercial value", value: sb.commercialValueScore },
          { label: "Seasonal boost", value: sb.seasonalBoostScore },
          { label: "Content coverage", value: sb.contentCoverageScore },
          { label: "Confidence", value: sb.confidenceScore },
        ]} />
      </div>

      <div className="cc-card">
        <h2 style={{ margin: "0 0 12px", fontSize: "1.0625rem" }}>Progress over time</h2>
        {topic.history.length <= 1 ? (
          <div className="cc-empty">
            Only one computation run so far — history builds up week over week as the engine recomputes.
          </div>
        ) : (
          <>
            <TimeSeriesChart data={topic.history.map((h) => ({ date: h.date, score: h.score }))} />
            <details style={{ marginTop: 12 }}>
              <summary style={{ fontSize: "0.8125rem", color: "var(--cc-text-muted)", cursor: "pointer" }}>Raw data</summary>
              <div style={{ overflowX: "auto", marginTop: 8 }}>
                <table style={{ width: "100%", fontSize: "0.8125rem", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--cc-border)", color: "var(--cc-text-muted)" }}>
                      <th style={{ textAlign: "left", padding: "6px 8px", fontWeight: 500 }}>Date</th>
                      <th style={{ textAlign: "right", padding: "6px 8px", fontWeight: 500 }}>Score</th>
                      <th style={{ textAlign: "left", padding: "6px 8px", fontWeight: 500 }}>Confidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...topic.history].reverse().map((h) => (
                      <tr key={h.date} style={{ borderBottom: "1px solid var(--cc-border)" }}>
                        <td style={{ padding: "6px 8px", fontFamily: "var(--cc-mono)" }}>{h.date}</td>
                        <td style={{ padding: "6px 8px", textAlign: "right", fontFamily: "var(--cc-mono)" }}>{h.score.toFixed(0)}</td>
                        <td style={{ padding: "6px 8px", textTransform: "capitalize" }}>{h.confidenceLevel}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          </>
        )}
        <p style={{ margin: "10px 0 0", fontSize: "0.75rem", color: "var(--cc-text-muted)" }}>
          First seen {new Date(topic.firstSeenAt).toLocaleDateString()} · last computed{" "}
          {new Date(topic.lastComputedAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
