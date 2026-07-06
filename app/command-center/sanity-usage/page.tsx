import { client } from "@/sanity/client";
import { MetricBadge } from "@/components/command-center/MetricBadge";
import {
  getSanityUsageSnapshot,
  getDocumentLimit,
  isDocumentLimitConfigured,
  getAssetLimitBytes,
  isAssetLimitConfigured,
  getPlanName,
  isPlanNameConfigured,
  usageWarningTier,
  computeGrowthProjection,
  type UsageWarningTier,
} from "@/lib/intelligence/sources/sanity-usage";
import { getSnapshotSeries, getLatestSnapshot } from "@/lib/intelligence/sources/snapshots";

function formatBytes(bytes: number): string {
  if (bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 2)} ${units[i]}`;
}

function tierColor(tier: UsageWarningTier): string {
  if (tier === "severe" || tier === "critical") return "var(--cc-critical)";
  if (tier === "warning") return "var(--cc-warn)";
  return "var(--cc-good)";
}

function tierBg(tier: UsageWarningTier): string {
  if (tier === "severe" || tier === "critical") return "var(--cc-critical-soft)";
  if (tier === "warning") return "var(--cc-warn-soft)";
  return "var(--cc-good-soft)";
}

function tierLabel(tier: UsageWarningTier): string {
  if (tier === "severe") return "Severe — 95%+ used";
  if (tier === "critical") return "Critical — 90%+ used";
  if (tier === "warning") return "Warning — 75%+ used";
  return "Healthy";
}

export default async function SanityUsagePage() {
  const [usage, docSeries, assetSeries, latestDocSnap] = await Promise.all([
    getSanityUsageSnapshot(client),
    getSnapshotSeries("sanity-usage", "documents", 30),
    getSnapshotSeries("sanity-usage", "asset-bytes", 30),
    getLatestSnapshot("sanity-usage", "documents"),
  ]);

  const docLimit = getDocumentLimit();
  const assetLimitBytes = getAssetLimitBytes();
  const docPct = docLimit > 0 ? (usage.totalDocuments / docLimit) * 100 : 0;
  const assetPct = assetLimitBytes > 0 ? (usage.assetBytes / assetLimitBytes) * 100 : 0;
  const docTier = usageWarningTier(docPct);
  const assetTier = usageWarningTier(assetPct);

  const docProjection = computeGrowthProjection(
    docSeries.map((s) => ({ date: s.date, value: s.value })),
    docLimit
  );

  const planName = getPlanName();
  const planConfigured = isPlanNameConfigured();
  const docLimitConfigured = isDocumentLimitConfigured();
  const assetLimitConfigured = isAssetLimitConfigured();

  return (
    <div>
      <h1 className="cc-page-title">Sanity Usage</h1>
      <p className="cc-page-dek">
        Sanity has no Management API for usage or plan limits — every number below is either a live
        count computed straight from your dataset, or an admin-entered assumption used only to turn
        that count into a percentage. Each metric&rsquo;s badge says which.
      </p>

      <div className="cc-card">
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <strong>Plan</strong>
          <MetricBadge source="calculated" freshness="live" />
        </div>
        <p style={{ margin: 0, fontSize: "0.9375rem" }}>
          {planName}
          {!planConfigured && (
            <span style={{ marginLeft: 8, fontSize: "0.75rem", color: "var(--cc-text-muted)" }}>
              — Sanity doesn&rsquo;t expose plan tier via any API. Set <code>SANITY_PLAN_NAME</code> to display it here.
            </span>
          )}
        </p>
      </div>

      <div className="cc-tiles">
        <div className="cc-tile">
          <div className="cc-tile__label">Total documents</div>
          <div className="cc-tile__value">{usage.totalDocuments.toLocaleString()}</div>
          <MetricBadge source="calculated" freshness="live" />
        </div>
        <div className="cc-tile">
          <div className="cc-tile__label">Document limit used</div>
          <div className="cc-tile__value" style={{ color: tierColor(docTier) }}>{docPct.toFixed(1)}%</div>
          <span className="cc-tier" style={{ background: tierBg(docTier), color: tierColor(docTier) }}>
            {tierLabel(docTier)}
          </span>
        </div>
        <div className="cc-tile">
          <div className="cc-tile__label">Asset storage used</div>
          <div className="cc-tile__value">{formatBytes(usage.assetBytes)}</div>
          <MetricBadge source="calculated" freshness="live" />
        </div>
        <div className="cc-tile">
          <div className="cc-tile__label">Asset count</div>
          <div className="cc-tile__value">{usage.assetCount.toLocaleString()}</div>
          <MetricBadge source="calculated" freshness="live" />
        </div>
      </div>

      {docTier !== "ok" && (
        <div className="cc-card" style={{ borderLeft: `3px solid ${tierColor(docTier)}` }}>
          <strong style={{ color: tierColor(docTier) }}>{tierLabel(docTier)} — document limit</strong>
          <p style={{ margin: "6px 0 0", fontSize: "0.875rem", color: "var(--cc-text-muted)" }}>
            Using {usage.totalDocuments.toLocaleString()} of an assumed {docLimit.toLocaleString()}-document limit
            {!docLimitConfigured && " (Sanity's published Free-tier default — set SANITY_DOCUMENT_LIMIT if your real plan differs)"}.
            {docProjection.daysUntilLimit !== null && (
              <>
                {" "}At the current growth rate (~{docProjection.dailyGrowthRate!.toFixed(1)} docs/day), you&rsquo;ll reach this
                limit in about <strong>{docProjection.daysUntilLimit} day{docProjection.daysUntilLimit === 1 ? "" : "s"}</strong>
                {docProjection.projectedLimitDate && ` (around ${docProjection.projectedLimitDate})`}.
              </>
            )}
          </p>
        </div>
      )}

      {assetTier !== "ok" && (
        <div className="cc-card" style={{ borderLeft: `3px solid ${tierColor(assetTier)}` }}>
          <strong style={{ color: tierColor(assetTier) }}>{tierLabel(assetTier)} — asset storage</strong>
          <p style={{ margin: "6px 0 0", fontSize: "0.875rem", color: "var(--cc-text-muted)" }}>
            Using {formatBytes(usage.assetBytes)} of an assumed {formatBytes(assetLimitBytes)} asset allotment
            {!assetLimitConfigured && " (Sanity's published Free/Growth default — set SANITY_ASSET_LIMIT_GB if your real plan differs)"}.
          </p>
        </div>
      )}

      <div className="cc-card">
        <h2 style={{ margin: "0 0 14px", fontSize: "1.0625rem" }}>Documents by type</h2>
        {usage.byType.map((t) => (
          <div key={t.type} className="cc-score-row">
            <span className="cc-score-label">{t.label}</span>
            <div className="cc-score-track">
              <div
                className="cc-score-fill"
                style={{ width: `${usage.contentDocuments > 0 ? (t.count / usage.contentDocuments) * 100 : 0}%` }}
              />
            </div>
            <span className="cc-score-val">{t.count}</span>
          </div>
        ))}
        {usage.byType.length === 0 && <div className="cc-empty">No content documents found yet.</div>}
        <div style={{ marginTop: 10 }}>
          <MetricBadge source="calculated" freshness="live" />
        </div>
      </div>

      <div className="cc-card">
        <h2 style={{ margin: "0 0 12px", fontSize: "1.0625rem" }}>Document growth (last 30 days)</h2>
        {docSeries.length === 0 ? (
          <div className="cc-empty">
            No snapshots yet. Snapshots are stored by the daily cron — trigger it manually via{" "}
            <code>POST /api/command-center/snapshot</code> or wait for the next scheduled run.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", fontSize: "0.8125rem", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--cc-border)", color: "var(--cc-text-muted)" }}>
                  <th style={{ textAlign: "left", padding: "6px 8px", fontWeight: 500 }}>Date</th>
                  <th style={{ textAlign: "right", padding: "6px 8px", fontWeight: 500 }}>Documents</th>
                  <th style={{ textAlign: "right", padding: "6px 8px", fontWeight: 500 }}>Asset storage</th>
                </tr>
              </thead>
              <tbody>
                {docSeries.map((snap) => {
                  const assetSnap = assetSeries.find((a) => a.date === snap.date);
                  return (
                    <tr key={snap.date} style={{ borderBottom: "1px solid var(--cc-border)" }}>
                      <td style={{ padding: "6px 8px", fontFamily: "var(--cc-mono)" }}>{snap.date}</td>
                      <td style={{ padding: "6px 8px", textAlign: "right", fontFamily: "var(--cc-mono)" }}>
                        {snap.value.toLocaleString()}
                      </td>
                      <td style={{ padding: "6px 8px", textAlign: "right", fontFamily: "var(--cc-mono)" }}>
                        {assetSnap ? formatBytes(assetSnap.value) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div style={{ marginTop: 10 }}>
          <MetricBadge source="calculated" freshness={latestDocSnap?.fetchedAt ?? "live"} />
        </div>
      </div>

      <div className="cc-card">
        <h2 style={{ margin: "0 0 6px", fontSize: "1.0625rem" }}>What Sanity doesn&rsquo;t expose</h2>
        <p style={{ margin: "0 0 10px", fontSize: "0.875rem", color: "var(--cc-text-muted)" }}>
          Sanity&rsquo;s Management API has no usage-telemetry endpoint — only project structure (members, datasets).
          These two figures genuinely can&rsquo;t be computed from the dataset or any API:
        </p>
        <div className="cc-pending-row" style={{ borderTop: "none" }}>
          <span>Dataset (Content Lake) storage — byte size isn&rsquo;t exposed via GROQ, distinct from asset storage above</span>
          <span>Not available</span>
        </div>
        <div className="cc-pending-row">
          <span>API request usage — Sanity doesn&rsquo;t expose request telemetry via any public API</span>
          <span>Not available</span>
        </div>
        <p style={{ margin: "10px 0 0", fontSize: "0.8125rem", color: "var(--cc-text-muted)" }}>
          Check <strong>manage.sanity.io → your project → Usage</strong> for the official numbers on these two.
        </p>
      </div>
    </div>
  );
}
