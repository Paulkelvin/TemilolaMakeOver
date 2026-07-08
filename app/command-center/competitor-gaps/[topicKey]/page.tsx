import Link from "next/link";
import { notFound } from "next/navigation";
import { getCompetitorGapByKey } from "@/lib/intelligence/competitor-gap";
import { computeLifetime, applyLifetimeDecay, TREND_LABELS, type Trend } from "@/lib/intelligence/opportunity-lifetime";

const TREND_COLOR: Record<Trend, string> = {
  growing: "var(--cc-good)",
  declining: "var(--cc-critical)",
  stable: "var(--cc-text-muted)",
  new: "var(--cc-text-muted)",
};

const ACTION_LABELS: Record<string, string> = {
  create_new_pillar: "Create new pillar",
  create_cluster_article: "Create cluster article",
  add_faqs: "Add FAQs",
  add_portfolio: "Add portfolio",
};

export default async function CompetitorGapDetailPage({
  params,
}: {
  params: Promise<{ topicKey: string }>;
}) {
  const { topicKey } = await params;
  const gap = await getCompetitorGapByKey(topicKey);
  if (!gap) notFound();

  const lifetime = computeLifetime(
    gap.firstSeenAt,
    gap.history.map((h) => ({ date: h.date, score: h.topicalRelevanceScore })),
    gap.status
  );
  const decayedPriority = applyLifetimeDecay(gap.priorityScore, lifetime);

  return (
    <div>
      <p style={{ margin: "0 0 6px" }}>
        <Link href="/command-center/competitor-gaps" style={{ color: "var(--cc-text-muted)", fontSize: "0.8125rem" }}>
          &larr; Competitor Gaps
        </Link>
      </p>
      <h1 className="cc-page-title">
        {lifetime.isStale && "💤 "}
        {gap.topicLabel}
      </h1>
      <p className="cc-page-dek">
        Covered by <strong>{gap.competitorName}</strong>, no matching content on this site ·{" "}
        <a href={gap.competitorUrl} target="_blank" rel="noopener noreferrer">
          View competitor page
        </a>
      </p>

      <div className="cc-tiles">
        <div className="cc-tile">
          <div className="cc-tile__label">Topical relevance</div>
          <div className="cc-tile__value">{gap.topicalRelevanceScore}</div>
        </div>
        <div className="cc-tile">
          <div className="cc-tile__label">Priority (value ÷ effort)</div>
          <div className="cc-tile__value">
            {decayedPriority.toFixed(1)}
            {lifetime.isStale && (
              <span style={{ fontSize: "0.75rem", color: "var(--cc-text-muted)", fontWeight: 400 }}> (was {(gap.priorityScore ?? 0).toFixed(1)})</span>
            )}
          </div>
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
            relevance has been {lifetime.trend} across the last several computation runs. Its priority is halved in the
            queue ordering above so it stops crowding out newer, growing gaps — it isn&rsquo;t hidden or deleted, just
            deprioritized. Actioning it (or if it starts growing again) will lift the penalty automatically.
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
          <span>edit status/actioned-at for this topic in Sanity Studio (Competitor Gaps)</span>
        </p>
      </div>

      <div className="cc-card">
        <h2 style={{ margin: "0 0 12px", fontSize: "1.0625rem" }}>Why this is a gap</h2>
        <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--cc-text-muted)" }}>
          <strong>{gap.competitorName}</strong> has a real page titled &ldquo;{gap.sampleTitle}&rdquo; that scored{" "}
          {gap.topicalRelevanceScore}/100 for topical relevance to this business, and this site has no page or post
          that matches it (best content-overlap below the 30% threshold used across every engine). This is shown for
          context only — the recommendation is to cover the same real-world topic in this site&rsquo;s own words,
          never to copy the competitor&rsquo;s actual page.
        </p>
      </div>

      <div className="cc-card">
        <h2 style={{ margin: "0 0 12px", fontSize: "1.0625rem" }}>Why this recommendation (decision trail)</h2>
        <ol style={{ margin: 0, paddingLeft: "1.2em", fontSize: "0.8125rem", color: "var(--cc-text-muted)", lineHeight: 1.8, fontFamily: "var(--cc-mono)" }}>
          {gap.decisionTrace?.length
            ? gap.decisionTrace.map((step, i) => <li key={i}>{step}</li>)
            : <li>Not yet computed for this topic — populates on the next weekly recompute.</li>}
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
                  <th style={{ textAlign: "right", padding: "6px 8px", fontWeight: 500 }}>Relevance</th>
                </tr>
              </thead>
              <tbody>
                {[...gap.history].reverse().map((h) => (
                  <tr key={h.date} style={{ borderBottom: "1px solid var(--cc-border)" }}>
                    <td style={{ padding: "6px 8px", fontFamily: "var(--cc-mono)" }}>{h.date}</td>
                    <td style={{ padding: "6px 8px", textAlign: "right", fontFamily: "var(--cc-mono)" }}>{h.topicalRelevanceScore}</td>
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
