import Link from "next/link";
import { getTopicMap, type TopicMapNode } from "@/lib/intelligence/topic-map";

function TopicRow({ node, depth }: { node: TopicMapNode; depth: number }) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 0",
          paddingLeft: depth * 24,
          borderBottom: "1px solid var(--cc-border)",
        }}
      >
        <div>
          <span style={{ color: "var(--cc-text)" }}>{node.label}</span>
          {node.notes && (
            <span style={{ marginLeft: 8, fontSize: "0.75rem", color: "var(--cc-text-muted)" }}>{node.notes}</span>
          )}
        </div>
        <div style={{ fontSize: "0.8125rem", textAlign: "right", whiteSpace: "nowrap" }}>
          {node.linkedTaxonomy ? (
            node.authority ? (
              <Link
                href={`/command-center/topical-authority/${node.linkedTaxonomy.type}/${node.linkedTaxonomy.refId}`}
                style={{ color: "inherit" }}
              >
                Authority {node.authority.authorityScore}% · Coverage {node.authority.coverageScore}%
              </Link>
            ) : (
              <span style={{ color: "var(--cc-text-muted)" }}>Linked — not yet computed (run the weekly cron)</span>
            )
          ) : (
            <span style={{ color: "var(--cc-text-muted)" }}>Not yet a real page — planning placeholder</span>
          )}
        </div>
      </div>
      {node.children.map((child) => (
        <TopicRow key={child.id} node={child} depth={depth + 1} />
      ))}
    </div>
  );
}

export default async function TopicMapPage() {
  const tree = await getTopicMap();

  return (
    <div>
      <h1 className="cc-page-title">Topic Map</h1>
      <p className="cc-page-dek">
        Hand-edited content-planning hierarchy — parent/child topics for building topical authority over time. Mixes
        real, already-built pages (linked to their live Authority/Coverage scores) with purely conceptual sub-topics
        that don&rsquo;t have a page yet. Edit the hierarchy in Sanity Studio (Taxonomy → Topic Map).
      </p>

      <div className="cc-card">
        {tree.length === 0 ? (
          <div className="cc-empty">
            No topics mapped yet. Add topicNode documents in Sanity Studio (Taxonomy → Topic Map) to start building
            the hierarchy — each topic can either link to a real page or stand alone as a planning idea.
          </div>
        ) : (
          tree.map((node) => <TopicRow key={node.id} node={node} depth={0} />)
        )}
      </div>
    </div>
  );
}
