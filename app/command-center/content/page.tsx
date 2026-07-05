import { client } from "@/sanity/client";
import { fetchAllTaxonomyNodes, computeCoverage, computeCompleteness } from "@/lib/intelligence/content";
import { MetricBadge } from "@/components/command-center/MetricBadge";

export default async function ContentPage() {
  const nodes = await fetchAllTaxonomyNodes(client);
  const rows = await Promise.all(
    nodes.map(async (node) => {
      const coverage = await computeCoverage(client, node);
      const completeness = computeCompleteness(node, coverage);
      return { node, completeness };
    })
  );
  rows.sort((a, b) => a.completeness.total - b.completeness.total);

  return (
    <div>
      <h1 className="cc-page-title">Content</h1>
      <p className="cc-page-dek">
        Coverage and completeness across the taxonomy graph — services, styles, occasions, wedding types,
        locations, and artists. Portfolio and Training read the same underlying model, folded in here rather
        than split into separate dashboards (see the locked architecture&rsquo;s navigation notes).
      </p>

      <div style={{ marginBottom: 12 }}>
        <MetricBadge source="calculated" freshness="live" />
      </div>

      <div className="cc-card">
        {rows.length === 0 && <div className="cc-empty">No taxonomy documents found yet.</div>}
        {rows.map(({ node, completeness }) => (
          <div key={node.id} className="cc-score-row" title={completeness.metadataScore.reasons.join("; ") || "Metadata complete"}>
            <span className="cc-score-label">{node.name}</span>
            <div className="cc-score-track">
              <div className="cc-score-fill" style={{ width: `${completeness.total}%` }} />
            </div>
            <span className="cc-score-val">{completeness.total}</span>
            <span style={{ fontFamily: "var(--cc-mono)", fontSize: "0.75rem", color: "var(--cc-text-muted)", width: 90 }}>
              {node.typeLabel}
            </span>
          </div>
        ))}
      </div>

      <div className="cc-empty">
        Thin-content and stale-content flags, the eligible-vs-blocked-for-generation view, and the
        Relationship Explorer land in Phase 2 &mdash; this page shows the coverage/completeness model that
        already exists in the Sanity Studio Content Intelligence tool, reused rather than rebuilt.
      </div>
    </div>
  );
}
