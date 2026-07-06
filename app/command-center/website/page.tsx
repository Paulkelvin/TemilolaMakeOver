import { isVercelConfigured, getDeploymentSummary, getWebVitals } from "@/lib/intelligence/sources/vercel-api";
import { isAnalyticsConfigured, getTrafficSummary, getTrafficByChannel, getTopPages as getTopTrafficPages } from "@/lib/intelligence/sources/analytics";
import { MetricBadge } from "@/components/command-center/MetricBadge";

function formatMs(ms: number): string {
  return ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${Math.round(ms)}ms`;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function vitalColor(rating: "good" | "needs-improvement" | "poor"): string {
  return rating === "good" ? "var(--cc-good)" : rating === "needs-improvement" ? "var(--cc-warn)" : "var(--cc-critical)";
}

function vitalBg(rating: "good" | "needs-improvement" | "poor"): string {
  return rating === "good" ? "var(--cc-good-soft)" : rating === "needs-improvement" ? "var(--cc-warn-soft)" : "var(--cc-critical-soft)";
}

function ConnectionGuide({ service, steps }: { service: string; steps: React.ReactNode }) {
  return (
    <div className="cc-card">
      <h2 style={{ margin: "0 0 12px", fontSize: "1.0625rem" }}>Connect {service}</h2>
      {steps}
    </div>
  );
}

export default async function WebsitePage() {
  const vercelOk = isVercelConfigured();
  const analyticsOk = isAnalyticsConfigured();

  if (!vercelOk && !analyticsOk) {
    return (
      <div>
        <h1 className="cc-page-title">Website</h1>
        <p className="cc-page-dek">
          Connect Vercel and Google Analytics to see deployments, Core Web Vitals, and traffic data here.
        </p>
        <ConnectionGuide
          service="Vercel"
          steps={
            <ol style={{ margin: 0, paddingLeft: "1.4em", fontSize: "0.875rem", color: "var(--cc-text-muted)", lineHeight: 1.7 }}>
              <li>Generate a <strong>Vercel API token</strong> at vercel.com/account/tokens.</li>
              <li>Find your <strong>Project ID</strong> in the project&rsquo;s Settings → General page.</li>
              <li>
                Set these environment variables:
                <ul style={{ margin: "4px 0 8px", paddingLeft: "1.2em" }}>
                  <li><code>VERCEL_API_TOKEN</code></li>
                  <li><code>VERCEL_PROJECT_ID</code></li>
                </ul>
              </li>
            </ol>
          }
        />
        <ConnectionGuide
          service="Google Analytics (GA4)"
          steps={
            <ol style={{ margin: 0, paddingLeft: "1.4em", fontSize: "0.875rem", color: "var(--cc-text-muted)", lineHeight: 1.7 }}>
              <li>Use the same Google Cloud service account as Search Console (or create a new one) with <strong>Analytics Data API</strong> access.</li>
              <li>Add the service account email as a <strong>Viewer</strong> on your GA4 property.</li>
              <li>
                Set this environment variable:
                <ul style={{ margin: "4px 0 8px", paddingLeft: "1.2em" }}>
                  <li><code>GA4_PROPERTY_ID</code> (the numeric property ID from GA4 Admin → Property Settings)</li>
                </ul>
              </li>
            </ol>
          }
        />
      </div>
    );
  }

  let deployments: Awaited<ReturnType<typeof getDeploymentSummary>> | null = null;
  let vitals: Awaited<ReturnType<typeof getWebVitals>> | null = null;
  let traffic: Awaited<ReturnType<typeof getTrafficSummary>> | null = null;
  let channels: Awaited<ReturnType<typeof getTrafficByChannel>> | null = null;
  let topPages: Awaited<ReturnType<typeof getTopTrafficPages>> | null = null;

  if (vercelOk) {
    try {
      [deployments, vitals] = await Promise.all([getDeploymentSummary(), getWebVitals()]);
    } catch (err) {
      console.error("[Command Center] Vercel API fetch failed:", err);
    }
  }

  if (analyticsOk) {
    try {
      [traffic, channels, topPages] = await Promise.all([getTrafficSummary(), getTrafficByChannel(), getTopTrafficPages()]);
    } catch (err) {
      console.error("[Command Center] GA4 fetch failed:", err);
    }
  }

  return (
    <div>
      <h1 className="cc-page-title">Website</h1>
      <p className="cc-page-dek">
        Deployment health, Core Web Vitals, and traffic — all in one place instead of split across Vercel and GA4.
      </p>

      {/* ─── Deployments ─────────────────────────────────────────── */}
      {vercelOk && deployments && (
        <>
          <div className="cc-tiles">
            <div className="cc-tile">
              <div className="cc-tile__label">Latest deploy</div>
              <div className="cc-tile__value" style={{ fontSize: "0.9375rem" }}>
                {deployments.latest ? deployments.latest.state : "—"}
              </div>
              {deployments.latest && (
                <span style={{ fontFamily: "var(--cc-mono)", fontSize: "0.6875rem", color: "var(--cc-text-muted)" }}>
                  {new Date(deployments.latest.created).toLocaleDateString()}
                </span>
              )}
              <MetricBadge source="vercel" freshness={deployments.fetchedAt} />
            </div>
            <div className="cc-tile">
              <div className="cc-tile__label">Deploy success rate</div>
              <div className="cc-tile__value">{Math.round(deployments.successRate * 100)}%</div>
              <span style={{ fontFamily: "var(--cc-mono)", fontSize: "0.6875rem", color: "var(--cc-text-muted)" }}>
                last {deployments.recentCount} deploys
              </span>
              <MetricBadge source="vercel" freshness={deployments.fetchedAt} />
            </div>
            <div className="cc-tile">
              <div className="cc-tile__label">Avg. build time</div>
              <div className="cc-tile__value">
                {deployments.avgBuildTimeMs !== null ? formatMs(deployments.avgBuildTimeMs) : "—"}
              </div>
              <MetricBadge source="vercel" freshness={deployments.fetchedAt} />
            </div>
          </div>
        </>
      )}
      {vercelOk && !deployments && (
        <div className="cc-empty" style={{ marginBottom: 16 }}>
          Vercel is configured but the API returned an error. Check that <code>VERCEL_API_TOKEN</code> is valid and <code>VERCEL_PROJECT_ID</code> matches your project.
        </div>
      )}

      {/* ─── Core Web Vitals ─────────────────────────────────────── */}
      {vitals && (vitals.lcp || vitals.cls || vitals.inp || vitals.fcp || vitals.ttfb) && (
        <div className="cc-card">
          <h2 style={{ margin: "0 0 14px", fontSize: "1.0625rem" }}>Core Web Vitals</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
            {(
              [
                { key: "lcp", label: "LCP", data: vitals.lcp, fmt: (v: number) => formatMs(v) },
                { key: "inp", label: "INP", data: vitals.inp, fmt: (v: number) => formatMs(v) },
                { key: "cls", label: "CLS", data: vitals.cls, fmt: (v: number) => v.toFixed(3) },
                { key: "fcp", label: "FCP", data: vitals.fcp, fmt: (v: number) => formatMs(v) },
                { key: "ttfb", label: "TTFB", data: vitals.ttfb, fmt: (v: number) => formatMs(v) },
              ] as const
            )
              .filter((m) => m.data)
              .map((m) => (
                <div
                  key={m.key}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 8,
                    background: vitalBg(m.data!.rating),
                    border: `1px solid ${vitalColor(m.data!.rating)}22`,
                  }}
                >
                  <div style={{ fontFamily: "var(--cc-mono)", fontSize: "0.6875rem", textTransform: "uppercase", color: "var(--cc-text-muted)", marginBottom: 2 }}>
                    {m.label}
                  </div>
                  <div style={{ fontFamily: "var(--cc-mono)", fontSize: "1.125rem", fontWeight: 600, color: vitalColor(m.data!.rating) }}>
                    {m.fmt(m.data!.value)}
                  </div>
                  <div
                    className="cc-tier"
                    style={{
                      marginTop: 4,
                      background: "transparent",
                      padding: 0,
                      color: vitalColor(m.data!.rating),
                    }}
                  >
                    {m.data!.rating.replace("-", " ")}
                  </div>
                </div>
              ))}
          </div>
          <MetricBadge source="vercel" freshness={vitals.fetchedAt} />
        </div>
      )}

      {/* ─── Traffic ─────────────────────────────────────────────── */}
      {analyticsOk && traffic && (
        <>
          <div className="cc-tiles">
            <div className="cc-tile">
              <div className="cc-tile__label">Sessions (28d)</div>
              <div className="cc-tile__value">{traffic.sessions.toLocaleString()}</div>
              <MetricBadge source="ga4" freshness={traffic.fetchedAt} />
            </div>
            <div className="cc-tile">
              <div className="cc-tile__label">Users</div>
              <div className="cc-tile__value">{traffic.users.toLocaleString()}</div>
              <MetricBadge source="ga4" freshness={traffic.fetchedAt} />
            </div>
            <div className="cc-tile">
              <div className="cc-tile__label">Pageviews</div>
              <div className="cc-tile__value">{traffic.pageviews.toLocaleString()}</div>
              <MetricBadge source="ga4" freshness={traffic.fetchedAt} />
            </div>
            <div className="cc-tile">
              <div className="cc-tile__label">Bounce rate</div>
              <div className="cc-tile__value">{(traffic.bounceRate * 100).toFixed(1)}%</div>
              <MetricBadge source="ga4" freshness={traffic.fetchedAt} />
            </div>
          </div>
          <div className="cc-tiles" style={{ marginTop: 0 }}>
            <div className="cc-tile">
              <div className="cc-tile__label">Avg. session</div>
              <div className="cc-tile__value">{formatDuration(traffic.avgSessionDuration)}</div>
              <MetricBadge source="ga4" freshness={traffic.fetchedAt} />
            </div>
          </div>
        </>
      )}
      {analyticsOk && !traffic && (
        <div className="cc-empty" style={{ marginBottom: 16 }}>
          GA4 is configured but the API returned an error. Check that the service account has Viewer access to GA4 property <code>{process.env.GA4_PROPERTY_ID}</code>.
        </div>
      )}

      {/* ─── Traffic by channel ──────────────────────────────────── */}
      {channels && channels.length > 0 && (
        <div className="cc-card">
          <h2 style={{ margin: "0 0 12px", fontSize: "1.0625rem" }}>Traffic by channel</h2>
          {channels.map((ch) => (
            <div key={ch.channel} className="cc-pending-row">
              <span style={{ color: "var(--cc-text)" }}>{ch.channel}</span>
              <span style={{ fontFamily: "var(--cc-mono)" }}>
                {ch.sessions.toLocaleString()} sessions · {ch.users.toLocaleString()} users
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ─── Top pages ───────────────────────────────────────────── */}
      {topPages && topPages.length > 0 && (
        <div className="cc-card">
          <h2 style={{ margin: "0 0 12px", fontSize: "1.0625rem" }}>Top pages by pageviews</h2>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", fontSize: "0.8125rem", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--cc-border)", color: "var(--cc-text-muted)" }}>
                  <th style={{ textAlign: "left", padding: "6px 8px", fontWeight: 500 }}>Path</th>
                  <th style={{ textAlign: "right", padding: "6px 8px", fontWeight: 500 }}>Pageviews</th>
                  <th style={{ textAlign: "right", padding: "6px 8px", fontWeight: 500 }}>Users</th>
                </tr>
              </thead>
              <tbody>
                {topPages.map((p) => (
                  <tr key={p.path} style={{ borderBottom: "1px solid var(--cc-border)" }}>
                    <td style={{ padding: "6px 8px" }}>{p.path}</td>
                    <td style={{ padding: "6px 8px", textAlign: "right", fontFamily: "var(--cc-mono)" }}>{p.pageviews.toLocaleString()}</td>
                    <td style={{ padding: "6px 8px", textAlign: "right", fontFamily: "var(--cc-mono)" }}>{p.users.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── Connection guides for missing integrations ──────────── */}
      {!vercelOk && (
        <ConnectionGuide
          service="Vercel"
          steps={
            <ol style={{ margin: 0, paddingLeft: "1.4em", fontSize: "0.875rem", color: "var(--cc-text-muted)", lineHeight: 1.7 }}>
              <li>Generate a <strong>Vercel API token</strong> at vercel.com/account/tokens.</li>
              <li>Set <code>VERCEL_API_TOKEN</code> and <code>VERCEL_PROJECT_ID</code>.</li>
            </ol>
          }
        />
      )}
      {!analyticsOk && (
        <ConnectionGuide
          service="Google Analytics (GA4)"
          steps={
            <ol style={{ margin: 0, paddingLeft: "1.4em", fontSize: "0.875rem", color: "var(--cc-text-muted)", lineHeight: 1.7 }}>
              <li>Add your service account as a Viewer on the GA4 property.</li>
              <li>Set <code>GA4_PROPERTY_ID</code> (numeric property ID).</li>
            </ol>
          }
        />
      )}
    </div>
  );
}
