import Link from "next/link";
import { notFound } from "next/navigation";
import { client } from "@/sanity/client";
import { TAXONOMY_TYPES } from "@/lib/intelligence/registry";
import { fetchAllTaxonomyNodes, computeCoverage, computeCompleteness, getRelatedDocumentsWithTags } from "@/lib/intelligence/content";
import { MetricBadge } from "@/components/command-center/MetricBadge";

function editUrl(type: string, id: string) {
  return `/studio/intent/edit/id=${id};type=${type}`;
}

export default async function TaxonomyNodeExplorerPage({
  params,
}: {
  params: Promise<{ type: string; id: string }>;
}) {
  const { type, id } = await params;
  const cfg = TAXONOMY_TYPES.find((t) => t.type === type);
  if (!cfg) notFound();

  const nodes = await fetchAllTaxonomyNodes(client);
  const node = nodes.find((n) => n.id === id && n.type === type);
  if (!node) notFound();

  const [coverage, related] = await Promise.all([
    computeCoverage(client, node),
    getRelatedDocumentsWithTags(client, node),
  ]);
  const completeness = computeCompleteness(node, coverage);
  const publicPath = cfg.publicPath?.(node.slug ?? "");

  return (
    <div>
      <p style={{ margin: "0 0 6px" }}>
        <Link href="/command-center/content" style={{ color: "var(--cc-text-muted)", fontSize: "0.8125rem" }}>
          &larr; Content
        </Link>
      </p>
      <h1 className="cc-page-title">{node.name}</h1>
      <p className="cc-page-dek">
        {node.typeLabel} · Completeness {completeness.total}/100
        {publicPath && (
          <>
            {" · "}
            <a href={publicPath} target="_blank" rel="noopener noreferrer">
              View live page
            </a>
          </>
        )}
        {" · "}
        <a href={editUrl(node.type, node.id)}>Edit in Studio</a>
      </p>

      <div style={{ marginBottom: 12 }}>
        <MetricBadge source="calculated" freshness="live" />
      </div>

      <div className="cc-card">
        <h2 style={{ margin: "0 0 12px", fontSize: "1.0625rem" }}>
          Connected documents ({related.length})
        </h2>
        {related.length === 0 && (
          <div className="cc-empty">Nothing references {node.name} yet.</div>
        )}
        {related.map((doc) => (
          <div key={`${doc.type}-${doc.id}`} className="cc-pending-row" style={{ flexDirection: "column", alignItems: "flex-start", gap: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
              <a href={editUrl(doc.type, doc.id)} style={{ color: "var(--cc-text)" }}>
                {doc.title}
              </a>
              <span style={{ fontFamily: "var(--cc-mono)", fontSize: "0.75rem", color: "var(--cc-text-muted)" }}>
                {doc.typeLabel}
              </span>
            </div>
            {doc.tags.length > 0 && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {doc.tags.map((tag) => (
                  <Link
                    key={`${tag.type}-${tag.id}`}
                    href={`/command-center/content/${tag.type}/${tag.id}`}
                    className="cc-tier"
                    data-tier="emerging"
                    style={{ textDecoration: "none" }}
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
