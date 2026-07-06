import { generateOpportunities, type Opportunity, type ImpactBand } from "@/lib/intelligence/opportunities";
import { getRecentReviews } from "@/lib/intelligence/weekly-review";
import { MetricBadge } from "@/components/command-center/MetricBadge";
import { AccessGuard } from "@/components/command-center/AccessGuard";

function impactColor(impact: ImpactBand): string {
  return impact === "high" ? "var(--cc-critical)" : impact === "medium" ? "var(--cc-warn)" : "var(--cc-text-muted)";
}

function impactBg(impact: ImpactBand): string {
  return impact === "high" ? "var(--cc-critical-soft)" : impact === "medium" ? "var(--cc-warn-soft)" : "var(--cc-surface-2)";
}

function categoryLabel(cat: string): string {
  const labels: Record<string, string> = {
    content: "Content",
    booking: "Bookings",
    portfolio: "Portfolio",
    customer: "Customers",
    seo: "SEO",
    website: "Website",
    infrastructure: "Infrastructure",
  };
  return labels[cat] ?? cat;
}

function OpportunityCard({ opp, featured }: { opp: Opportunity; featured?: boolean }) {
  return (
    <div
      className="cc-card"
      style={featured ? { borderLeft: `3px solid ${impactColor(opp.impact)}` } : undefined}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <span
          className="cc-tier"
          style={{ background: impactBg(opp.impact), color: impactColor(opp.impact) }}
        >
          {opp.impact}
        </span>
        <span className="cc-tier" data-tier="emerging" style={{ background: "var(--cc-accent-soft)", color: "var(--cc-accent-strong)" }}>
          {categoryLabel(opp.category)}
        </span>
      </div>
      <h3 style={{ margin: "0 0 4px", fontSize: "0.9375rem" }}>{opp.title}</h3>
      <p style={{ margin: "0 0 6px", fontSize: "0.8125rem", color: "var(--cc-text-muted)" }}>{opp.action}</p>
      <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--cc-text-muted)", fontStyle: "italic" }}>{opp.reason}</p>
    </div>
  );
}

export default async function AiInsightsPage() {
  const [opportunities, recentReviews] = await Promise.all([
    generateOpportunities(),
    getRecentReviews(6),
  ]);

  const topOpp = opportunities[0] ?? null;
  const remaining = opportunities.slice(1);

  return (
    <AccessGuard moduleKey="ai-insights">
    <div>
      <h1 className="cc-page-title">AI Insights</h1>
      <p className="cc-page-dek">
        Rule-based intelligence across every data source — no LLM, just pattern matching on real numbers.
        Every recommendation traces back to a specific metric.
      </p>

      {/* ─── AI Business Advisor ───────────────────────────── */}
      <div className="cc-card" style={{ borderLeft: "3px solid var(--cc-accent)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <strong style={{ fontSize: "1.0625rem" }}>Today&rsquo;s priority</strong>
          <MetricBadge source="calculated" freshness="live" />
        </div>
        {topOpp ? (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span className="cc-tier" style={{ background: impactBg(topOpp.impact), color: impactColor(topOpp.impact) }}>
                {topOpp.impact} impact
              </span>
              <span className="cc-tier" style={{ background: "var(--cc-accent-soft)", color: "var(--cc-accent-strong)" }}>
                {categoryLabel(topOpp.category)}
              </span>
            </div>
            <h2 style={{ margin: "0 0 4px", fontSize: "1.125rem" }}>{topOpp.title}</h2>
            <p style={{ margin: "0 0 6px", fontSize: "0.875rem", color: "var(--cc-text-muted)" }}>{topOpp.action}</p>
            <p style={{ margin: 0, fontSize: "0.8125rem", color: "var(--cc-text-muted)", fontStyle: "italic" }}>{topOpp.reason}</p>
          </>
        ) : (
          <p style={{ margin: 0, color: "var(--cc-text-muted)" }}>
            No actionable opportunities detected right now — all metrics look healthy.
          </p>
        )}
      </div>

      {/* ─── Opportunity Engine ─────────────────────────────── */}
      <div style={{ marginTop: 8 }}>
        <h2 style={{ fontSize: "1.0625rem", margin: "0 0 12px" }}>
          All opportunities ({opportunities.length})
        </h2>
        {remaining.length === 0 && opportunities.length <= 1 && (
          <div className="cc-empty">No additional opportunities beyond today&rsquo;s priority.</div>
        )}
        {remaining.map((opp) => (
          <OpportunityCard key={opp.id} opp={opp} />
        ))}
      </div>

      {/* ─── Weekly Business Reviews ───────────────────────── */}
      <div className="cc-card" style={{ marginTop: 24 }}>
        <h2 style={{ margin: "0 0 6px", fontSize: "1.0625rem" }}>Weekly Business Reviews</h2>
        <p style={{ margin: "0 0 12px", fontSize: "0.8125rem", color: "var(--cc-text-muted)" }}>
          Generated weekly via <code>POST /api/command-center/weekly-review</code>. Set up a cron to run every Monday morning.
        </p>
        {recentReviews.length === 0 ? (
          <div className="cc-empty">
            No reviews generated yet. Trigger the first one manually or wait for the weekly cron.
          </div>
        ) : (
          recentReviews.map((r) => (
            <div key={r._id} className="cc-pending-row">
              <span style={{ color: "var(--cc-text)" }}>
                {r.weekStart} → {r.weekEnd}
              </span>
              <span style={{ fontFamily: "var(--cc-mono)" }}>
                {r.healthScore !== null ? `Health: ${r.healthScore}/100` : "—"}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
    </AccessGuard>
  );
}
