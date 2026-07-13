import Link from "next/link";
import { getTopicMap, type TopicMapNode } from "@/lib/intelligence/topic-map";
import { getClusterAuthorities, type StoredClusterAuthority } from "@/lib/intelligence/cluster-authority";
import { getPendingTopicSuggestionCount } from "@/lib/intelligence/topic-suggestions";
import { computeLifecyclesForTree, LIFECYCLE_STAGE_LABEL, type ClusterLifecycle } from "@/lib/intelligence/topic-lifecycle";

const STAGE_COLOR: Record<string, string> = {
  needs_refresh: "var(--cc-critical)",
  mature_authority: "var(--cc-good)",
  growing_authority: "var(--cc-accent)",
};

function TopicRow({
  node,
  depth,
  clustersById,
  lifecyclesById,
}: {
  node: TopicMapNode;
  depth: number;
  clustersById: Map<string, StoredClusterAuthority>;
  lifecyclesById: Map<string, ClusterLifecycle>;
}) {
  const isCluster = node.children.length > 0;
  const cluster = clustersById.get(node.id);
  const lifecycle = lifecyclesById.get(node.id);

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
          {isCluster && lifecycle && (
            <span
              style={{
                marginLeft: 8,
                fontSize: "0.6875rem",
                fontWeight: 600,
                padding: "1px 8px",
                borderRadius: 999,
                border: "1px solid var(--cc-border)",
                color: STAGE_COLOR[lifecycle.result.stage] ?? "var(--cc-text-muted)",
              }}
            >
              {LIFECYCLE_STAGE_LABEL[lifecycle.result.stage]}
            </span>
          )}
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
        <TopicRow key={child.id} node={child} depth={depth + 1} clustersById={clustersById} lifecyclesById={lifecyclesById} />
      ))}
    </div>
  );
}

export default async function TopicMapPage() {
  const tree = await getTopicMap();
  const [clusters, pendingSuggestionCount] = await Promise.all([
    getClusterAuthorities(),
    getPendingTopicSuggestionCount(),
  ]);
  const clustersById = new Map(clusters.map((c) => [c.clusterNodeId, c]));
  // Reuses the same clusterAuthority list just fetched above, instead of
  // computeLifecyclesForTree independently point-fetching each cluster's doc
  // a second time.
  const lifecyclesById = await computeLifecyclesForTree(tree, clustersById);

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

      {tree.length === 0 && (
        <Link href="/command-center/topic-map/wizard" className="cc-card" style={{ display: "block", marginBottom: 16 }}>
          <strong style={{ color: "var(--cc-accent)" }}>Topic Map is empty — generate an initial structure →</strong>
          <p style={{ margin: "4px 0 0", fontSize: "0.8125rem", color: "var(--cc-text-muted)" }}>
            The Initial Topic Map Wizard proposes a whole starting hierarchy from Competitor Gaps, Search Console,
            Keyword Discovery, Google Autocomplete, verified articles, and the site&rsquo;s real taxonomy — review and
            approve the whole structure in one pass instead of building it node by node.
          </p>
        </Link>
      )}

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
          tree.map((node) => <TopicRow key={node.id} node={node} depth={0} clustersById={clustersById} lifecyclesById={lifecyclesById} />)
        )}
      </div>
    </div>
  );
}
