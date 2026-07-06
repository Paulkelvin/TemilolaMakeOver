import { isSearchConsoleConfigured, getSummary, getTopPages, getTopQueries } from "@/lib/intelligence/sources/search-console";
import { getLatestSnapshot, getSnapshotSeries } from "@/lib/intelligence/sources/snapshots";
import { MetricBadge } from "@/components/command-center/MetricBadge";

function NotConnected() {
  return (
    <div>
      <h1 className="cc-page-title">SEO</h1>
      <p className="cc-page-dek">
        Connect Google Search Console to see indexing, impressions, clicks, CTR, and ranking data here.
      </p>
      <div className="cc-card">
        <h2 style={{ margin: "0 0 12px", fontSize: "1.0625rem" }}>How to connect</h2>
        <ol style={{ margin: 0, paddingLeft: "1.4em", fontSize: "0.875rem", color: "var(--cc-text-muted)", lineHeight: 1.7 }}>
          <li>Run <code>npm run google:auth</code> once (see <code>scripts/get-google-refresh-token.ts</code>) logged in as an account with <strong>Search Console API</strong> access to your property — this produces an OAuth refresh token rather than a service-account key.</li>
          <li>
            Set these environment variables:
            <ul style={{ margin: "4px 0 8px", paddingLeft: "1.2em" }}>
              <li><code>GOOGLE_OAUTH_CLIENT_ID</code></li>
              <li><code>GOOGLE_OAUTH_CLIENT_SECRET</code></li>
              <li><code>GOOGLE_OAUTH_REFRESH_TOKEN</code></li>
              <li><code>SEARCH_CONSOLE_SITE_URL</code> (e.g. <code>https://temilolomakeup.com</code>)</li>
            </ul>
          </li>
          <li>Redeploy. Data starts flowing on the next daily snapshot (or trigger manually via the snapshot API).</li>
        </ol>
      </div>
      <div className="cc-card">
        <h2 style={{ margin: "0 0 6px", fontSize: "1.0625rem" }}>What you&rsquo;ll see</h2>
        <ul style={{ margin: 0, paddingLeft: "1.2em", fontSize: "0.875rem", color: "var(--cc-text-muted)", lineHeight: 1.7 }}>
          <li>Total impressions, clicks, CTR, and average position (last 28 days)</li>
          <li>Top pages and queries by clicks</li>
          <li>Trend over time from daily snapshots</li>
          <li>SEO Health sub-score on the Overview</li>
        </ul>
      </div>
    </div>
  );
}

export default async function SeoPage() {
  if (!isSearchConsoleConfigured()) return <NotConnected />;

  let summary, topPages, topQueries;
  let fetchError = false;

  try {
    [summary, topPages, topQueries] = await Promise.all([
      getSummary(),
      getTopPages(),
      getTopQueries(),
    ]);
  } catch (err) {
    console.error("[Command Center] Search Console fetch failed:", err);
    fetchError = true;
  }

  const impressionsSeries = await getSnapshotSeries("search-console", "impressions", 30);
  const clicksSeries = await getSnapshotSeries("search-console", "clicks", 30);

  if (fetchError || !summary) {
    return (
      <div>
        <h1 className="cc-page-title">SEO</h1>
        <p className="cc-page-dek">Search Console is configured but the API returned an error. Check your credentials and try again.</p>
        <div className="cc-empty">
          Verify that the Google account used for <code>npm run google:auth</code> has read access to the
          Search Console property, that <code>GOOGLE_OAUTH_REFRESH_TOKEN</code> hasn&rsquo;t been revoked, and
          that <code>SEARCH_CONSOLE_SITE_URL</code> matches exactly (including protocol).
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="cc-page-title">SEO</h1>
      <p className="cc-page-dek">
        Search performance from Google Search Console — last 28 days. Data lags ~3 days from Google.
      </p>

      <div className="cc-tiles">
        <div className="cc-tile">
          <div className="cc-tile__label">Impressions</div>
          <div className="cc-tile__value">{summary.totalImpressions.toLocaleString()}</div>
          <MetricBadge source="search-console" freshness={summary.fetchedAt} />
        </div>
        <div className="cc-tile">
          <div className="cc-tile__label">Clicks</div>
          <div className="cc-tile__value">{summary.totalClicks.toLocaleString()}</div>
          <MetricBadge source="search-console" freshness={summary.fetchedAt} />
        </div>
        <div className="cc-tile">
          <div className="cc-tile__label">CTR</div>
          <div className="cc-tile__value">{(summary.averageCtr * 100).toFixed(1)}%</div>
          <MetricBadge source="search-console" freshness={summary.fetchedAt} />
        </div>
        <div className="cc-tile">
          <div className="cc-tile__label">Avg. position</div>
          <div className="cc-tile__value">{summary.averagePosition.toFixed(1)}</div>
          <MetricBadge source="search-console" freshness={summary.fetchedAt} />
        </div>
      </div>

      {(impressionsSeries.length > 0 || clicksSeries.length > 0) && (
        <div className="cc-card">
          <h2 style={{ margin: "0 0 12px", fontSize: "1.0625rem" }}>Snapshot trend (daily)</h2>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", fontSize: "0.8125rem", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--cc-border)", color: "var(--cc-text-muted)" }}>
                  <th style={{ textAlign: "left", padding: "6px 8px", fontWeight: 500 }}>Date</th>
                  <th style={{ textAlign: "right", padding: "6px 8px", fontWeight: 500 }}>Impressions</th>
                  <th style={{ textAlign: "right", padding: "6px 8px", fontWeight: 500 }}>Clicks</th>
                </tr>
              </thead>
              <tbody>
                {impressionsSeries.map((snap) => {
                  const clicksSnap = clicksSeries.find((c) => c.date === snap.date);
                  return (
                    <tr key={snap.date} style={{ borderBottom: "1px solid var(--cc-border)" }}>
                      <td style={{ padding: "6px 8px", fontFamily: "var(--cc-mono)" }}>{snap.date}</td>
                      <td style={{ padding: "6px 8px", textAlign: "right", fontFamily: "var(--cc-mono)" }}>{snap.value.toLocaleString()}</td>
                      <td style={{ padding: "6px 8px", textAlign: "right", fontFamily: "var(--cc-mono)" }}>{clicksSnap?.value.toLocaleString() ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {impressionsSeries.length === 0 && (
            <div className="cc-empty" style={{ marginTop: 8 }}>
              No daily snapshots yet. Snapshots are stored by the daily cron — trigger it manually via <code>POST /api/command-center/snapshot</code> or wait for the next scheduled run.
            </div>
          )}
        </div>
      )}

      <div className="cc-card">
        <h2 style={{ margin: "0 0 12px", fontSize: "1.0625rem" }}>Top pages by clicks</h2>
        {topPages!.length === 0 && <div className="cc-empty">No page data in this period.</div>}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", fontSize: "0.8125rem", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--cc-border)", color: "var(--cc-text-muted)" }}>
                <th style={{ textAlign: "left", padding: "6px 8px", fontWeight: 500 }}>Page</th>
                <th style={{ textAlign: "right", padding: "6px 8px", fontWeight: 500 }}>Clicks</th>
                <th style={{ textAlign: "right", padding: "6px 8px", fontWeight: 500 }}>Impressions</th>
                <th style={{ textAlign: "right", padding: "6px 8px", fontWeight: 500 }}>CTR</th>
                <th style={{ textAlign: "right", padding: "6px 8px", fontWeight: 500 }}>Position</th>
              </tr>
            </thead>
            <tbody>
              {topPages!.map((p) => (
                <tr key={p.page} style={{ borderBottom: "1px solid var(--cc-border)" }}>
                  <td style={{ padding: "6px 8px", maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {new URL(p.page).pathname}
                  </td>
                  <td style={{ padding: "6px 8px", textAlign: "right", fontFamily: "var(--cc-mono)" }}>{p.clicks}</td>
                  <td style={{ padding: "6px 8px", textAlign: "right", fontFamily: "var(--cc-mono)" }}>{p.impressions.toLocaleString()}</td>
                  <td style={{ padding: "6px 8px", textAlign: "right", fontFamily: "var(--cc-mono)" }}>{(p.ctr * 100).toFixed(1)}%</td>
                  <td style={{ padding: "6px 8px", textAlign: "right", fontFamily: "var(--cc-mono)" }}>{p.position.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="cc-card">
        <h2 style={{ margin: "0 0 12px", fontSize: "1.0625rem" }}>Top queries by clicks</h2>
        {topQueries!.length === 0 && <div className="cc-empty">No query data in this period.</div>}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", fontSize: "0.8125rem", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--cc-border)", color: "var(--cc-text-muted)" }}>
                <th style={{ textAlign: "left", padding: "6px 8px", fontWeight: 500 }}>Query</th>
                <th style={{ textAlign: "right", padding: "6px 8px", fontWeight: 500 }}>Clicks</th>
                <th style={{ textAlign: "right", padding: "6px 8px", fontWeight: 500 }}>Impressions</th>
                <th style={{ textAlign: "right", padding: "6px 8px", fontWeight: 500 }}>CTR</th>
                <th style={{ textAlign: "right", padding: "6px 8px", fontWeight: 500 }}>Position</th>
              </tr>
            </thead>
            <tbody>
              {topQueries!.map((q) => (
                <tr key={q.query} style={{ borderBottom: "1px solid var(--cc-border)" }}>
                  <td style={{ padding: "6px 8px" }}>{q.query}</td>
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
    </div>
  );
}
