import Link from "next/link";
import { notFound } from "next/navigation";
import { getTopicalAuthorityNode, type ScoredDimension } from "@/lib/intelligence/topical-authority";
import { getEntityCoverageForNode } from "@/lib/intelligence/entity-coverage";
import { computeLifetime, TREND_LABELS } from "@/lib/intelligence/opportunity-lifetime";
import { TREND_COLOR } from "@/components/command-center/shared-labels";
import { TimeSeriesChart } from "@/components/command-center/TimeSeriesChart";

function editUrl(type: string, id: string) {
  return `/studio/intent/edit/id=${id};type=${type}`;
}

function DimensionRow({
  coverageDim,
  authorityDim,
}: {
  coverageDim?: ScoredDimension;
  authorityDim?: ScoredDimension;
}) {
  const dim = authorityDim ?? coverageDim;
  if (!dim) return null;
  return (
    <div className="cc-score-row" title={dim.raw}>
      <span className="cc-score-label">{dim.label}</span>
      <div className="cc-score-track">
        <div className="cc-score-fill" style={{ width: `${Math.max(0, Math.min(100, dim.earnedPct))}%` }} />
      </div>
      <span className="cc-score-val">{dim.earnedPct.toFixed(0)}%</span>
      <span style={{ fontSize: "0.75rem", color: "var(--cc-text-muted)", fontFamily: "var(--cc-mono)", width: 180, textAlign: "right" }}>
        {coverageDim && coverageDim.weight > 0 ? `+${coverageDim.earnedPoints.toFixed(1)} coverage` : "n/a coverage"}
        {" · "}
        {authorityDim && authorityDim.weight > 0 ? `+${authorityDim.earnedPoints.toFixed(1)} authority` : "n/a authority"}
      </span>
    </div>
  );
}

export default async function TopicalAuthorityDetailPage({
  params,
}: {
  params: Promise<{ type: string; id: string }>;
}) {
  const { type, id } = await params;
  const node = await getTopicalAuthorityNode(type, id);
  if (!node) notFound();

  const coverageDims = new Map(node.coverageScore.dimensions.map((d) => [d.key, d]));
  const authorityDims = new Map(node.authorityScore.dimensions.map((d) => [d.key, d]));
  const allKeys = node.authorityScore.dimensions.map((d) => d.key);
  const entityCoverage = await getEntityCoverageForNode(node.taxonomyType, node.taxonomyId, node.taxonomyName);
  const lifetime = computeLifetime(
    node.firstSeenAt,
    node.history.map((h) => ({ date: h.date, score: h.authorityScore })),
    node.status
  );

  return (
    <div>
      <p style={{ margin: "0 0 6px" }}>
        <Link href="/command-center/topical-authority" style={{ color: "var(--cc-text-muted)", fontSize: "0.8125rem" }}>
          &larr; Topical Authority
        </Link>
      </p>
      <h1 className="cc-page-title">{node.taxonomyName}</h1>
      <p className="cc-page-dek">
        {node.taxonomyTypeLabel} · Authority {node.authorityScore.totalScore}% · Coverage {node.coverageScore.totalScore}%
        {node.publicPath && (
          <>
            {" · "}
            <a href={node.publicPath} target="_blank" rel="noopener noreferrer">
              View live page
            </a>
          </>
        )}
        {" · "}
        <a href={editUrl(node.taxonomyType, node.taxonomyId)}>Edit in Studio</a>
      </p>

      <div className="cc-tiles">
        <div className="cc-tile">
          <div className="cc-tile__label">Authority Score</div>
          <div className="cc-tile__value">{node.authorityScore.totalScore}%</div>
        </div>
        <div className="cc-tile">
          <div className="cc-tile__label">Coverage Score</div>
          <div className="cc-tile__value">{node.coverageScore.totalScore}%</div>
        </div>
        <div className="cc-tile">
          <div className="cc-tile__label">Status</div>
          <div className="cc-tile__value" style={{ textTransform: "capitalize", fontSize: "1.25rem" }}>{node.status.replace("_", " ")}</div>
        </div>
        <div className="cc-tile">
          <div className="cc-tile__label">Age</div>
          <div className="cc-tile__value">{lifetime.ageDays}d</div>
        </div>
        <div className="cc-tile">
          <div className="cc-tile__label">Authority trend</div>
          <div className="cc-tile__value" style={{ color: TREND_COLOR[lifetime.trend], fontSize: "1.25rem" }}>
            {TREND_LABELS[lifetime.trend]}
          </div>
        </div>
      </div>

      <div className="cc-card">
        <h2 style={{ margin: "0 0 4px", fontSize: "1.0625rem" }}>Why? Dimension breakdown</h2>
        <p style={{ margin: "0 0 12px", fontSize: "0.8125rem", color: "var(--cc-text-muted)" }}>
          Every dimension is a real Sanity count, a real last-edit timestamp, or a real per-type template fact — hover
          a row for the raw evidence. The right column shows exactly how many points each dimension contributed to
          Coverage and to Authority (dimensions marked n/a aren&rsquo;t buildable for this node type yet, and are
          excluded rather than scored as zero).
        </p>
        {allKeys.map((key) => (
          <DimensionRow key={key} coverageDim={coverageDims.get(key)} authorityDim={authorityDims.get(key)} />
        ))}
      </div>

      <div className="cc-card">
        <h2 style={{ margin: "0 0 4px", fontSize: "1.0625rem" }}>Entity coverage</h2>
        {entityCoverage ? (
          <>
            <p style={{ margin: "0 0 12px", fontSize: "0.8125rem", color: "var(--cc-text-muted)" }}>
              {entityCoverage.coveragePct}% of expected industry terms found in this topic&rsquo;s real text ({entityCoverage.wordCount.toLocaleString()} words scanned) — a curated checklist, not a guess.
            </p>
            {entityCoverage.missingEntities.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <p style={{ margin: "0 0 4px", fontSize: "0.8125rem", fontWeight: 600 }}>Missing entities — unused opportunities</p>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {entityCoverage.missingEntities.map((e) => (
                    <span key={e} className="cc-tier" data-tier="emerging">{e}</span>
                  ))}
                </div>
              </div>
            )}
            {entityCoverage.coveredEntities.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <p style={{ margin: "0 0 4px", fontSize: "0.8125rem", fontWeight: 600 }}>Covered entities</p>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {entityCoverage.coveredEntities.map((e) => (
                    <span key={e.entity} className="cc-tier" data-tier="established" title={`${e.occurrences} mention${e.occurrences === 1 ? "" : "s"}`}>
                      {e.entity} ({e.occurrences})
                    </span>
                  ))}
                </div>
              </div>
            )}
            {entityCoverage.overusedEntities.length > 0 && (
              <div>
                <p style={{ margin: "0 0 4px", fontSize: "0.8125rem", fontWeight: 600, color: "var(--cc-warn)" }}>Possibly overused</p>
                <p style={{ margin: 0, fontSize: "0.8125rem", color: "var(--cc-text-muted)" }}>
                  {entityCoverage.overusedEntities.map((e) => `${e.entity} (${e.occurrences}×)`).join(", ")} — more mentions than natural usage typically has, relative to the amount of real content. Worth checking for keyword stuffing.
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="cc-empty">
            No curated entity list for this topic yet — add one in <code>lib/intelligence/entity-registry.ts</code>.
          </div>
        )}
      </div>

      <div className="cc-card">
        <h2 style={{ margin: "0 0 12px", fontSize: "1.0625rem" }}>Progress over time</h2>
        {node.history.length <= 1 ? (
          <div className="cc-empty">
            Only one computation run so far — history builds up week over week as the engine recomputes.
          </div>
        ) : (
          <>
            <TimeSeriesChart data={node.history.map((h) => ({ date: h.date, score: h.authorityScore }))} />
            <details style={{ marginTop: 12 }}>
              <summary style={{ fontSize: "0.8125rem", color: "var(--cc-text-muted)", cursor: "pointer" }}>Raw data</summary>
              <div style={{ overflowX: "auto", marginTop: 8 }}>
                <table style={{ width: "100%", fontSize: "0.8125rem", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--cc-border)", color: "var(--cc-text-muted)" }}>
                      <th style={{ textAlign: "left", padding: "6px 8px", fontWeight: 500 }}>Date</th>
                      <th style={{ textAlign: "right", padding: "6px 8px", fontWeight: 500 }}>Coverage</th>
                      <th style={{ textAlign: "right", padding: "6px 8px", fontWeight: 500 }}>Authority</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...node.history].reverse().map((h) => (
                      <tr key={h.date} style={{ borderBottom: "1px solid var(--cc-border)" }}>
                        <td style={{ padding: "6px 8px", fontFamily: "var(--cc-mono)" }}>{h.date}</td>
                        <td style={{ padding: "6px 8px", textAlign: "right", fontFamily: "var(--cc-mono)" }}>{h.coverageScore}%</td>
                        <td style={{ padding: "6px 8px", textAlign: "right", fontFamily: "var(--cc-mono)" }}>{h.authorityScore}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          </>
        )}
        <p style={{ margin: "10px 0 0", fontSize: "0.75rem", color: "var(--cc-text-muted)" }}>
          First seen {new Date(node.firstSeenAt).toLocaleDateString()} · last computed{" "}
          {new Date(node.lastComputedAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
