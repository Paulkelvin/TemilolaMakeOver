import Link from "next/link";
import { getTopicMap, type TopicMapNode } from "@/lib/intelligence/topic-map";
import { getClusterAuthorities, type StoredClusterAuthority } from "@/lib/intelligence/cluster-authority";
import { getPendingTopicSuggestionCount } from "@/lib/intelligence/topic-suggestions";

function TopicRow({
  node,
  depth,
  clustersById,
}: {
  node: TopicMapNode;
  depth: number;
  clustersById: Map<string, StoredClusterAuthority>;
}) {
  const isCluster = node.children.length > 0;
  const cluster = clustersById.get(node.id);

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
          <span style={{ color: "var(--cc-text)", fontWeight: isCluster ? 600 : 400 }}>{node.label}</span>
          {node.notes && (
            <span style={{ marginLeft: 8, fontSize: "0.75rem", color: "var(--cc-text-muted)" }}>{node.notes}</span>
          )}
        </div>
        <div style={{ fontSize: "0.8125rem", textAlign: "right", whiteSpace: "nowrap" }}>
          {isCluster ? (
            cluster ? (
              <Link href={`/command-center/topic-map/${node.id}`} style={{ color: "var(--cc-accent)", fontWeight: 600 }}>
                Cluster authority {cluster.avgAuthorityScore}% · {cluster.openGapCount} open gap
                {cluster.openGapCount === 1 ? "" : "s"} →
              </Link>
            ) : (
              <span style={{ color: "var(--cc-text-muted)" }}>Cluster — not yet computed (run the weekly cron)</span>
            )
          ) : node.linkedTaxonomy ? (
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
        <TopicRow key={child.id} node={child} depth={depth + 1} clustersById={clustersById} />
      ))}
    </div>
  );
}

export default async function TopicMapPage() {
  const [tree, clusters, pendingSuggestionCount] = await Promise.all([
    getTopicMap(),
    getClusterAuthorities(),
    getPendingTopicSuggestionCount(),
  ]);
  const clustersById = new Map(clusters.map((c) => [c.clusterNodeId, c]));

  return (
    <div>
      <h1 className="cc-page-title">Topic Map</h1>
      <p className="cc-page-dek">
        Hand-edited content-planning hierarchy — parent/child topics for building topical authority over time. Any
        topic with children is a <strong>cluster</strong>: click through for its rolled-up coverage, missing
        subtopics, internal linking, competitor gaps, and recommended next content. Real, already-built pages link to
        their live Authority/Coverage scores; purely conceptual sub-topics don&rsquo;t have a page yet. Edit the
        hierarchy in Sanity Studio (Taxonomy → Topic Map).
      </p>

      {pendingSuggestionCount > 0 && (
        <Link href="/command-center/topic-map/suggestions" className="cc-card" style={{ display: "block", marginBottom: 16 }}>
          <strong style={{ color: "var(--cc-accent)" }}>
            {pendingSuggestionCount} pending topic suggestion{pendingSuggestionCount === 1 ? "" : "s"} to review →
          </strong>
          <p style={{ margin: "4px 0 0", fontSize: "0.8125rem", color: "var(--cc-text-muted)" }}>
            Mined from Competitor Gaps, Search Console, Keyword Discovery, Google Autocomplete, and recurring entities
            in verified articles — each needs your approval before it becomes a real Topic Map node.
          </p>
        </Link>
      )}

      <div className="cc-card">
        {tree.length === 0 ? (
          <div className="cc-empty">
            No topics mapped yet. Add topicNode documents in Sanity Studio (Taxonomy → Topic Map) to start building
            the hierarchy — each topic can either link to a real page or stand alone as a planning idea.
          </div>
        ) : (
          tree.map((node) => <TopicRow key={node.id} node={node} depth={0} clustersById={clustersById} />)
        )}
      </div>
    </div>
  );
}
