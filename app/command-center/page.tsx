import { computeBusinessHealthScore, CONFIDENCE_LABELS } from "@/lib/intelligence/health-score";
import { getBookingFunnel, getRevenueSummary } from "@/lib/intelligence/sources/sanity";
import { getLatestSnapshot } from "@/lib/intelligence/sources/snapshots";
import { MetricBadge } from "@/components/command-center/MetricBadge";
import { client } from "@/sanity/client";
import { formatPrice } from "@/lib/utils";

export default async function CommandCenterOverviewPage() {
  const [health, funnel, revenue, sessionsSnap] = await Promise.all([
    computeBusinessHealthScore(),
    getBookingFunnel(client),
    getRevenueSummary(client),
    getLatestSnapshot("ga4", "sessions"),
  ]);

  return (
    <div>
      <h1 className="cc-page-title">Overview</h1>
      <p className="cc-page-dek">
        Content, Booking, Portfolio, and Customer Health are live from Sanity today. SEO and Website Health
        arrive once Search Console and Vercel are connected in Phase 4.
      </p>

      <div className="cc-tiles">
        <div className="cc-tile">
          <div className="cc-tile__label">Revenue</div>
          <div className="cc-tile__value">{formatPrice(revenue.totalRevenue)}</div>
          <MetricBadge source="paystack" freshness="live" />
        </div>
        <div className="cc-tile">
          <div className="cc-tile__label">Bookings</div>
          <div className="cc-tile__value">{funnel.total}</div>
          <MetricBadge source="sanity" freshness="live" />
        </div>
        <div className="cc-tile">
          <div className="cc-tile__label">Conversion rate</div>
          <div className="cc-tile__value">{Math.round(funnel.conversionRate * 100)}%</div>
          <MetricBadge source="sanity" freshness="live" />
        </div>
        <div className="cc-tile">
          <div className="cc-tile__label">Sessions (28d)</div>
          <div className="cc-tile__value">{sessionsSnap ? sessionsSnap.value.toLocaleString() : "—"}</div>
          {sessionsSnap ? (
            <MetricBadge source="ga4" freshness={sessionsSnap.fetchedAt} />
          ) : (
            <span style={{ fontFamily: "var(--cc-mono)", fontSize: "0.6875rem", color: "var(--cc-text-muted)" }}>
              GA4 not connected — see Settings
            </span>
          )}
        </div>
      </div>

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
