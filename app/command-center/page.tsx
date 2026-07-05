import { computeBusinessHealthScore, CONFIDENCE_LABELS } from "@/lib/intelligence/health-score";
import { MetricBadge } from "@/components/command-center/MetricBadge";

export default async function CommandCenterOverviewPage() {
  const health = await computeBusinessHealthScore();

  return (
    <div>
      <h1 className="cc-page-title">Overview</h1>
      <p className="cc-page-dek">
        Business Health Score, phase 1 — Content, Booking, and Portfolio Health are live from Sanity today.
        SEO, Website, and Customer Health arrive as their data sources come online.
      </p>

      <div className="cc-card">
        <div className="cc-hero">
          <div
            className="cc-ring"
            style={{
              background:
                health.overall === null
                  ? "var(--cc-surface-2)"
                  : `conic-gradient(var(--cc-accent) 0deg ${(health.overall / 100) * 360}deg, var(--cc-surface-2) ${(health.overall / 100) * 360}deg 360deg)`,
            }}
            role="img"
            aria-label={health.overall === null ? "Business health score not yet measurable" : `Business health score, ${health.overall} out of 100`}
          >
            <span className="cc-ring__inner">{health.overall ?? "—"}</span>
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <strong>Business Health</strong>
              <span className="cc-tier" data-tier={health.overallConfidence}>
                {CONFIDENCE_LABELS[health.overallConfidence]}
              </span>
              <MetricBadge source="calculated" freshness="live" />
            </div>
            <p style={{ margin: 0, color: "var(--cc-text-muted)", fontSize: "0.875rem" }}>
              Weighted across the {health.subScores.length} sub-scores measurable today. Click a bar below for why.
            </p>
          </div>
        </div>
      </div>

      <div className="cc-card">
        <h2 style={{ margin: "0 0 14px", fontSize: "1.0625rem" }}>Sub-scores</h2>
        {health.subScores.map((sub) => (
          <div key={sub.key} className="cc-score-row" title={sub.reason}>
            <span className="cc-score-label">{sub.label}</span>
            <div className="cc-score-track">
              <div className="cc-score-fill" style={{ width: `${sub.score ?? 0}%` }} />
            </div>
            <span className="cc-score-val">{sub.score ?? "—"}</span>
            <span className="cc-tier" data-tier={sub.confidence}>
              {CONFIDENCE_LABELS[sub.confidence]}
            </span>
          </div>
        ))}
        {health.pending.map((p) => (
          <div key={p.key} className="cc-pending-row">
            <span>{p.label}</span>
            <span>{p.note}</span>
          </div>
        ))}
      </div>

      <div className="cc-card">
        <h2 style={{ margin: "0 0 6px", fontSize: "1.0625rem" }}>Why these numbers</h2>
        {health.subScores.map((sub) => (
          <p key={sub.key} style={{ fontSize: "0.875rem", color: "var(--cc-text-muted)", margin: "0 0 8px" }}>
            <strong style={{ color: "var(--cc-text)" }}>{sub.label}:</strong> {sub.reason}
          </p>
        ))}
      </div>

      <div className="cc-card">
        <h2 style={{ margin: "0 0 10px", fontSize: "1.0625rem" }}>Today&rsquo;s priorities</h2>
        <div className="cc-empty">
          The AI Business Advisor and Opportunity Engine generate this list from ranked recommendations —
          arriving in Phase 5. For now, use the sub-score reasons above and the Content section to find gaps.
        </div>
      </div>
    </div>
  );
}
