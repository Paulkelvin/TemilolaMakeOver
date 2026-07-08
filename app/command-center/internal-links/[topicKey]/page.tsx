import Link from "next/link";
import { notFound } from "next/navigation";
import { getInternalLinkGapByKey } from "@/lib/intelligence/internal-links";
import { computeLifetime, applyLifetimeDecay, TREND_LABELS } from "@/lib/intelligence/opportunity-lifetime";
import { TREND_COLOR } from "@/components/command-center/shared-labels";
import { ScoreRow } from "@/components/command-center/ScoreRow";
import { TimeSeriesChart } from "@/components/command-center/TimeSeriesChart";
import { ScoreBreakdownRadar } from "@/components/command-center/ScoreBreakdownRadar";

const ACTION_LABELS: Record<string, string> = {
  add_internal_links: "Add internal links",
  create_new_blog_article: "Create new blog article",
};

export default async function InternalLinkGapDetailPage({
  params,
}: {
  params: Promise<{ topicKey: string }>;
}) {
  const { topicKey } = await params;
  const gap = await getInternalLinkGapByKey(topicKey);
  if (!gap) notFound();

  const sb = gap.scoreBreakdown;
  const lifetime = computeLifetime(
    gap.firstSeenAt,
    gap.history.map((h) => ({ date: h.date, score: h.severityScore })),
    gap.status
  );
  const decayedPriority = applyLifetimeDecay(gap.priorityScore, lifetime);

  return (
    <div>
      <p style={{ margin: "0 0 6px" }}>
        <Link href="/command-center/internal-links" style={{ color: "var(--cc-text-muted)", fontSize: "0.8125rem" }}>
          &larr; Internal Links
        </Link>
      </p>
      <h1 className="cc-page-title">
        {gap.inboundLinkCount === 0 && "🚫 "}
        {lifetime.isStale && "💤 "}
        {gap.targetLabel}
      </h1>
      <p className="cc-page-dek">
        <span style={{ textTransform: "capitalize" }}>{gap.targetType}</span> page ·{" "}
        <a href={gap.targetPath} target="_blank" rel="noopener noreferrer">{gap.targetPath}</a> ·{" "}
        {gap.inboundLinkCount} real inbound link{gap.inboundLinkCount === 1 ? "" : "s"} from blog content
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
              <span style={{ fontSize: "0.75rem", color: "var(--cc-text-muted)", fontWeight: 400 }}> (was {(gap.priorityScore ?? 0).toFixed(1)})</span>
            )}
          </div>
        </div>
        <div className="cc-tile">
          <div className="cc-tile__label">Inbound links</div>
          <div className="cc-tile__value">{gap.inboundLinkCount}</div>
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
            severity hasn&rsquo;t improved across the last several computation runs. Its priority is halved in the
            queue ordering above so it stops crowding out newer, growing gaps — it isn&rsquo;t hidden or deleted,
            just deprioritized. Actioning it will lift the penalty automatically.
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
          <span>edit status/actioned-at for this gap in Sanity Studio (Internal Link Gaps)</span>
        </p>
      </div>

      <div className="cc-card">
        <h2 style={{ margin: "0 0 12px", fontSize: "1.0625rem" }}>Severity breakdown</h2>
        <ScoreRow label="Page importance" value={sb.importanceScore} description="Service pages are the direct conversion surface, weighted higher than other taxonomy types" />
        <ScoreRow label="Link deficit" value={sb.linkDeficitScore} description="0 real inbound links scores higher than 1" />
        <div style={{ borderTop: "1px solid var(--cc-border)", marginTop: 8, paddingTop: 8 }}>
          <ScoreRow label="Total severity" value={sb.severityScore} />
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

      {gap.suggestedSources.length > 0 && (
        <div className="cc-card">
          <h2 style={{ margin: "0 0 4px", fontSize: "1.0625rem" }}>Suggested source posts</h2>
          <p style={{ margin: "0 0 12px", fontSize: "0.8125rem", color: "var(--cc-text-muted)" }}>
            Real blog posts that don&rsquo;t yet link here, ranked by topical overlap with &ldquo;{gap.targetLabel}&rdquo;.
          </p>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", fontSize: "0.8125rem", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--cc-border)", color: "var(--cc-text-muted)" }}>
                  <th style={{ textAlign: "left", padding: "6px 8px", fontWeight: 500 }}>Post</th>
                  <th style={{ textAlign: "right", padding: "6px 8px", fontWeight: 500 }}>Overlap</th>
                </tr>
              </thead>
              <tbody>
                {gap.suggestedSources.map((s) => (
                  <tr key={s.path} style={{ borderBottom: "1px solid var(--cc-border)" }}>
                    <td style={{ padding: "6px 8px" }}>
                      <a href={s.path} target="_blank" rel="noopener noreferrer">{s.title}</a>
                    </td>
                    <td style={{ padding: "6px 8px", textAlign: "right", fontFamily: "var(--cc-mono)" }}>{(s.overlapScore * 100).toFixed(0)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {gap.linkingPosts.length > 0 && (
        <div className="cc-card">
          <h2 style={{ margin: "0 0 12px", fontSize: "1.0625rem" }}>Already linking here ({gap.linkingPosts.length})</h2>
          <ul style={{ margin: 0, paddingLeft: "1.2em", fontSize: "0.875rem", lineHeight: 1.8 }}>
            {gap.linkingPosts.map((p) => (
              <li key={p.path}><a href={p.path} target="_blank" rel="noopener noreferrer">{p.title}</a></li>
            ))}
          </ul>
        </div>
      )}

      <div className="cc-card">
        <h2 style={{ margin: "0 0 12px", fontSize: "1.0625rem" }}>Score shape</h2>
        <ScoreBreakdownRadar dimensions={[
          { label: "Page importance", value: sb.importanceScore },
          { label: "Link deficit", value: sb.linkDeficitScore },
        ]} />
      </div>

      <div className="cc-card">
        <h2 style={{ margin: "0 0 12px", fontSize: "1.0625rem" }}>Progress over time</h2>
        {gap.history.length <= 1 ? (
          <div className="cc-empty">
            Only one computation run so far — history builds up week over week as the engine recomputes.
          </div>
        ) : (
          <>
            <TimeSeriesChart data={gap.history.map((h) => ({ date: h.date, score: h.severityScore }))} />
            <details style={{ marginTop: 12 }}>
              <summary style={{ fontSize: "0.8125rem", color: "var(--cc-text-muted)", cursor: "pointer" }}>Raw data</summary>
              <div style={{ overflowX: "auto", marginTop: 8 }}>
                <table style={{ width: "100%", fontSize: "0.8125rem", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--cc-border)", color: "var(--cc-text-muted)" }}>
                      <th style={{ textAlign: "left", padding: "6px 8px", fontWeight: 500 }}>Date</th>
                      <th style={{ textAlign: "right", padding: "6px 8px", fontWeight: 500 }}>Severity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...gap.history].reverse().map((h) => (
                      <tr key={h.date} style={{ borderBottom: "1px solid var(--cc-border)" }}>
                        <td style={{ padding: "6px 8px", fontFamily: "var(--cc-mono)" }}>{h.date}</td>
                        <td style={{ padding: "6px 8px", textAlign: "right", fontFamily: "var(--cc-mono)" }}>{h.severityScore.toFixed(0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          </>
        )}
        <p style={{ margin: "10px 0 0", fontSize: "0.75rem", color: "var(--cc-text-muted)" }}>
          First seen {new Date(gap.firstSeenAt).toLocaleDateString()} · last computed{" "}
          {new Date(gap.lastComputedAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
