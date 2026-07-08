import Link from "next/link";
import { computeBusinessHealthScore, CONFIDENCE_LABELS } from "@/lib/intelligence/health-score";
import { getBookingFunnel, getRevenueSummary } from "@/lib/intelligence/sources/sanity";
import { getLatestSnapshot } from "@/lib/intelligence/sources/snapshots";
import { generateOpportunities } from "@/lib/intelligence/opportunities";
import { getUnreadCount } from "@/lib/intelligence/notifications";
import { computeConvergence } from "@/lib/intelligence/keyword-utils";
import { MetricBadge } from "@/components/command-center/MetricBadge";
import { SparklineChart } from "@/components/command-center/SparklineChart";
import { client } from "@/sanity/client";
import { formatPrice } from "@/lib/utils";

interface EngineCount {
  label: string;
  href: string;
  total: number;
  growing: number;
  history: number[];
}

const ENGINE_LABEL_MAP: Record<string, string> = {
  "seo-opportunities": "SEO Opportunities",
  "keyword-discovery": "Keyword Discovery",
  "competitor-gaps": "Competitor Gaps",
  "cannibalization": "Cannibalization",
  "internal-links": "Internal Links",
  "knowledge-graph": "Knowledge Graph",
};

export default async function CommandCenterOverviewPage() {
  const [health, funnel, revenue, sessionsSnap, opportunities, unreadNotifs, convergence, engineRows] = await Promise.all([
    computeBusinessHealthScore(),
    getBookingFunnel(client),
    getRevenueSummary(client),
    getLatestSnapshot("ga4", "sessions"),
    generateOpportunities(),
    getUnreadCount(),
    computeConvergence(client),
    client.fetch<{ _type: string; history?: { date: string }[] }[]>(
      `*[_type in ["seoOpportunity","keywordDiscoveryTopic","competitorGapTopic","cannibalizationIssue","internalLinkGap","knowledgeGraphGap"]]{ _type, "history": history[]{date} }`
    ),
  ]);

  const engineCounts: EngineCount[] = [
    { label: "SEO Opportunities", href: "/command-center/seo", total: 0, growing: 0, history: [] },
    { label: "Keyword Discovery", href: "/command-center/keyword-discovery", total: 0, growing: 0, history: [] },
    { label: "Competitor Gaps", href: "/command-center/competitor-gaps", total: 0, growing: 0, history: [] },
    { label: "Cannibalization", href: "/command-center/cannibalization", total: 0, growing: 0, history: [] },
    { label: "Internal Links", href: "/command-center/internal-links", total: 0, growing: 0, history: [] },
    { label: "Knowledge Graph", href: "/command-center/knowledge-graph", total: 0, growing: 0, history: [] },
  ];
  const typeToIndex: Record<string, number> = {
    seoOpportunity: 0, keywordDiscoveryTopic: 1, competitorGapTopic: 2,
    cannibalizationIssue: 3, internalLinkGap: 4, knowledgeGraphGap: 5,
  };
  for (const row of engineRows) {
    const idx = typeToIndex[row._type];
    if (idx !== undefined) {
      engineCounts[idx].total++;
      if (row.history && row.history.length >= 2) engineCounts[idx].growing++;
    }
  }

  return (
    <div>
      <h1 className="cc-page-title">Overview</h1>
      <p className="cc-page-dek">
        Six health sub-scores across content, bookings, portfolio, customers, SEO, and website performance.
        {unreadNotifs > 0 && <> — <strong style={{ color: "var(--cc-accent)" }}>{unreadNotifs} unread notification{unreadNotifs > 1 ? "s" : ""}</strong>.</>}
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
        {opportunities.length === 0 ? (
          <div className="cc-empty">No actionable opportunities detected — all metrics look healthy.</div>
        ) : (
          opportunities.slice(0, 3).map((opp) => (
            <div key={opp.id} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                <span
                  className="cc-tier"
                  style={{
                    background: opp.impact === "high" ? "var(--cc-critical-soft)" : opp.impact === "medium" ? "var(--cc-warn-soft)" : "var(--cc-surface-2)",
                    color: opp.impact === "high" ? "var(--cc-critical)" : opp.impact === "medium" ? "var(--cc-warn)" : "var(--cc-text-muted)",
                  }}
                >
                  {opp.impact}
                </span>
                <strong style={{ fontSize: "0.875rem" }}>{opp.title}</strong>
              </div>
              <p style={{ margin: 0, fontSize: "0.8125rem", color: "var(--cc-text-muted)" }}>{opp.action}</p>
            </div>
          ))
        )}
      </div>

      <div className="cc-card">
        <h2 style={{ margin: "0 0 12px", fontSize: "1.0625rem" }}>Intelligence engines</h2>
        <div className="cc-stat-strip">
          {engineCounts.map((ec) => (
            <Link key={ec.label} href={ec.href} style={{ textDecoration: "none", color: "inherit", flex: "1 1 140px", minWidth: 120 }}>
              <div className="cc-stat-tile" style={{ cursor: "pointer" }}>
                <div className="cc-stat-value">{ec.total}</div>
                <div className="cc-stat-label">{ec.label}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {convergence.length > 0 && (
        <div className="cc-card">
          <h2 style={{ margin: "0 0 4px", fontSize: "1.0625rem" }}>Cross-engine convergence</h2>
          <p style={{ margin: "0 0 12px", fontSize: "0.8125rem", color: "var(--cc-text-muted)" }}>
            Topics independently found by multiple engines — the strongest evidence of real opportunity.
          </p>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", fontSize: "0.8125rem", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--cc-border)", color: "var(--cc-text-muted)" }}>
                  <th style={{ textAlign: "left", padding: "6px 8px", fontWeight: 500 }}>Topic</th>
                  <th style={{ textAlign: "left", padding: "6px 8px", fontWeight: 500 }}>Found by</th>
                  <th style={{ textAlign: "right", padding: "6px 8px", fontWeight: 500 }}>Multiplier</th>
                </tr>
              </thead>
              <tbody>
                {convergence.slice(0, 15).map((c) => (
                  <tr key={c.topicKey} style={{ borderBottom: "1px solid var(--cc-border)" }}>
                    <td style={{ padding: "6px 8px" }}>{c.topicKey}</td>
                    <td style={{ padding: "6px 8px" }}>
                      {c.engines.map((e) => ENGINE_LABEL_MAP[e] ?? e).join(", ")}
                    </td>
                    <td style={{ padding: "6px 8px", textAlign: "right", fontFamily: "var(--cc-mono)", color: "var(--cc-good)" }}>
                      {c.convergenceMultiplier}x
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
