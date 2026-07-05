import Link from "next/link";
import { client } from "@/sanity/client";
import {
  fetchAllTaxonomyNodes,
  computeCoverage,
  computeCompleteness,
  detectThinContent,
  detectStaleContent,
  computeGenerationEligibility,
} from "@/lib/intelligence/content";
import { MetricBadge } from "@/components/command-center/MetricBadge";

export default async function ContentPage() {
  const nodes = await fetchAllTaxonomyNodes(client);
  const [rows, thinContent, staleContent, eligibility] = await Promise.all([
    Promise.all(
      nodes.map(async (node) => {
        const coverage = await computeCoverage(client, node);
        const completeness = computeCompleteness(node, coverage);
        return { node, completeness };
      })
    ),
    detectThinContent(client),
    detectStaleContent(client),
    computeGenerationEligibility(client),
  ]);
  rows.sort((a, b) => a.completeness.total - b.completeness.total);

  const blocked = eligibility.filter((e) => e.state === "blocked");
  const readyToPublish = eligibility.filter((e) => e.state === "eligible");
  const published = eligibility.filter((e) => e.state === "published");

  return (
    <div>
      <h1 className="cc-page-title">Content</h1>
      <p className="cc-page-dek">
        Coverage and completeness across the taxonomy graph — services, styles, occasions, wedding types,
        locations, and artists. Portfolio and Training read the same underlying model, folded in here rather
        than split into separate dashboards. Click a row to open its Relationship Explorer.
      </p>

      <div style={{ marginBottom: 12 }}>
        <MetricBadge source="calculated" freshness="live" />
      </div>

      <div className="cc-card">
        {rows.length === 0 && <div className="cc-empty">No taxonomy documents found yet.</div>}
        {rows.map(({ node, completeness }) => (
          <Link
            key={node.id}
            href={`/command-center/content/${node.type}/${node.id}`}
            className="cc-score-row"
            style={{ textDecoration: "none", color: "inherit" }}
            title={completeness.metadataScore.reasons.join("; ") || "Metadata complete"}
          >
            <span className="cc-score-label">{node.name}</span>
            <div className="cc-score-track">
              <div className="cc-score-fill" style={{ width: `${completeness.total}%` }} />
            </div>
            <span className="cc-score-val">{completeness.total}</span>
            <span style={{ fontFamily: "var(--cc-mono)", fontSize: "0.75rem", color: "var(--cc-text-muted)", width: 90 }}>
              {node.typeLabel}
            </span>
          </Link>
        ))}
      </div>

      <div className="cc-card">
        <h2 style={{ margin: "0 0 12px", fontSize: "1.0625rem" }}>Locations — eligible vs. blocked</h2>
        <p style={{ fontSize: "0.8125rem", color: "var(--cc-text-muted)", margin: "0 0 12px" }}>
          A draft location needs 3+ tagged portfolio items and 1+ testimonial before it&rsquo;s worth publishing
          (the same minimum-proof gate from the content architecture rollout).
        </p>
        {eligibility.length === 0 && <div className="cc-empty">No locations found yet.</div>}
        {published.length > 0 && (
          <p style={{ fontSize: "0.8125rem", margin: "0 0 6px" }}>
            <span className="cc-tier" data-tier="established">Published</span>{" "}
            {published.map((e) => e.name).join(", ")}
          </p>
        )}
        {readyToPublish.map((e) => (
          <div key={e.id} className="cc-pending-row">
            <span style={{ color: "var(--cc-text)" }}>{e.name}</span>
            <span className="cc-tier" data-tier="established">Ready to publish</span>
          </div>
        ))}
        {blocked.map((e) => (
          <div key={e.id} className="cc-pending-row">
            <span style={{ color: "var(--cc-text)" }}>{e.name}</span>
            <span style={{ color: "var(--cc-text-muted)" }}>
              {e.proof.filter((p) => !p.met).map((p) => `${p.label}: ${p.count}/${p.minimum}`).join(" · ")}
            </span>
          </div>
        ))}
      </div>

      <div className="cc-card">
        <h2 style={{ margin: "0 0 12px", fontSize: "1.0625rem" }}>Thin content</h2>
        {thinContent.length === 0 && <div className="cc-empty">Nothing under the length floor right now.</div>}
        {thinContent.map((item) => (
          <div key={item.id} className="cc-pending-row">
            <span style={{ color: "var(--cc-text)" }}>{item.title}</span>
            <span style={{ color: "var(--cc-text-muted)" }}>
              {item.typeLabel} · {item.textLength}/{item.minimum} chars
            </span>
          </div>
        ))}
      </div>

      <div className="cc-card">
        <h2 style={{ margin: "0 0 12px", fontSize: "1.0625rem" }}>Stale content</h2>
        {staleContent.length === 0 && <div className="cc-empty">Nothing past its staleness threshold right now.</div>}
        {staleContent.map((item) => (
          <div key={item.id} className="cc-pending-row">
            <span style={{ color: "var(--cc-text)" }}>{item.title}</span>
            <span style={{ color: "var(--cc-text-muted)" }}>
              {item.typeLabel} · {item.daysSinceUpdate} days since last edit
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
