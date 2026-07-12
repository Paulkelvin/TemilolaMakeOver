import { client } from "@/sanity/client";
import type { TopicMapNode } from "./topic-map";
import { getClusterAuthorityByNodeId, type StoredClusterAuthority } from "./cluster-authority";

/**
 * Topic Lifecycle — where a cluster currently sits in its own
 * content-development arc. Every stage below is derived live from data other
 * engines already compute (contentBrief.status/clusterId, ClusterAuthority's
 * internal-link health and authority score, the linked blog posts' own
 * _updatedAt) — mirroring the same "attach derived state at read time, don't
 * persist a new doc type" precedent topic-map.ts already set with its
 * tri-state `authority` field. The ONE genuinely human-intent signal this
 * can't derive — "we've decided to actively write for this next" — lives as
 * a hand-set `plannedNext` checkbox on topicNode itself.
 *
 * Deliberately NOT baked into getTopicMap() itself: that function is called
 * in a loop by matchTopicToCluster() (once per suggestion candidate), so
 * adding these extra queries there would silently tax every caller that
 * doesn't need lifecycle info. Callers that do (the Topic Map page, and
 * later the Roadmap/Editor-in-Chief) opt in via attachLifecycleStages().
 */

export type LifecycleStage =
  | "approved"
  | "planned"
  | "pillar_published"
  | "supporting_articles_published"
  | "internal_linking_complete"
  | "growing_authority"
  | "mature_authority"
  | "needs_refresh";

export const LIFECYCLE_STAGE_LABEL: Record<LifecycleStage, string> = {
  approved: "Approved",
  planned: "Planned",
  pillar_published: "Pillar Published",
  supporting_articles_published: "Supporting Articles Published",
  internal_linking_complete: "Internal Linking Complete",
  growing_authority: "Growing Authority",
  mature_authority: "Mature Authority",
  needs_refresh: "Needs Refresh",
};

const GROWING_AUTHORITY_THRESHOLD = 50;
const MATURE_AUTHORITY_THRESHOLD = 80;
const STALE_AFTER_DAYS = 365; // same threshold registry.ts already uses for blogPost staleness

export interface LifecycleResult {
  stage: LifecycleStage;
  decisionTrace: string[];
}

interface ClusterBriefRow {
  status: "new" | "drafting" | "verified" | "published";
  firstSeenAt: string;
  blogUpdatedAt: string | null;
}

async function fetchPublishedBriefs(clusterNodeId: string): Promise<ClusterBriefRow[]> {
  const rows = await client.fetch<ClusterBriefRow[]>(
    `*[_type == "contentBrief" && clusterId == $clusterNodeId && status == "published"] | order(firstSeenAt asc) {
      status, firstSeenAt, "blogUpdatedAt": linkedBlogPost->_updatedAt
    }`,
    { clusterNodeId }
  );
  return rows;
}

export function computeLifecycleStage(
  node: Pick<TopicMapNode, "id" | "label">,
  plannedNext: boolean,
  publishedBriefs: ClusterBriefRow[],
  clusterAuthority: StoredClusterAuthority | null
): LifecycleResult {
  const trace: string[] = [];
  const publishedCount = publishedBriefs.length;

  if (publishedCount === 0) {
    if (plannedNext) {
      trace.push("No published articles yet, but marked \"Planned next\" in the Topic Map.");
      return { stage: "planned", decisionTrace: trace };
    }
    trace.push("No published articles yet, and not marked as actively planned.");
    return { stage: "approved", decisionTrace: trace };
  }

  if (publishedCount === 1) {
    trace.push(`One published article (the pillar) — ${publishedBriefs[0].firstSeenAt.slice(0, 10)}.`);
    return { stage: "pillar_published", decisionTrace: trace };
  }

  trace.push(`${publishedCount} published articles — a pillar plus ${publishedCount - 1} supporting article${publishedCount === 2 ? "" : "s"}.`);

  const linkedDescendantCount = clusterAuthority?.linkedDescendantCount ?? 0;
  const internalLinkingComplete =
    clusterAuthority !== null &&
    linkedDescendantCount > 0 &&
    clusterAuthority.internalLinkHealth.underlinkedCount === 0 &&
    clusterAuthority.internalLinkHealth.orphanCount === 0;

  let stage: LifecycleStage;
  if (!internalLinkingComplete) {
    trace.push(
      clusterAuthority
        ? `Internal linking not complete yet — ${clusterAuthority.internalLinkHealth.underlinkedCount} under-linked, ${clusterAuthority.internalLinkHealth.orphanCount} orphaned.`
        : "Cluster Authority not yet computed — can't confirm internal linking health."
    );
    stage = "supporting_articles_published";
  } else if (clusterAuthority!.avgAuthorityScore >= MATURE_AUTHORITY_THRESHOLD) {
    trace.push(`Internal linking complete. Average authority ${clusterAuthority!.avgAuthorityScore}% — at or above the mature threshold (${MATURE_AUTHORITY_THRESHOLD}%).`);
    stage = "mature_authority";
  } else if (clusterAuthority!.avgAuthorityScore >= GROWING_AUTHORITY_THRESHOLD) {
    trace.push(`Internal linking complete. Average authority ${clusterAuthority!.avgAuthorityScore}% — growing toward maturity (${MATURE_AUTHORITY_THRESHOLD}%).`);
    stage = "growing_authority";
  } else {
    trace.push(`Internal linking complete, but average authority (${clusterAuthority!.avgAuthorityScore}%) hasn't reached the growing threshold (${GROWING_AUTHORITY_THRESHOLD}%) yet.`);
    stage = "internal_linking_complete";
  }

  const mostRecentUpdate = publishedBriefs
    .map((b) => b.blogUpdatedAt)
    .filter((d): d is string => Boolean(d))
    .sort()
    .at(-1);
  if (mostRecentUpdate) {
    const daysSinceUpdate = (Date.now() - new Date(mostRecentUpdate).getTime()) / 86_400_000;
    if (daysSinceUpdate > STALE_AFTER_DAYS) {
      trace.push(`Overridden: the most recently updated article in this cluster is ${Math.round(daysSinceUpdate)} days old — past the ${STALE_AFTER_DAYS}-day freshness threshold.`);
      return { stage: "needs_refresh", decisionTrace: trace };
    }
  }

  return { stage, decisionTrace: trace };
}

export interface ClusterLifecycle {
  clusterNodeId: string;
  clusterLabel: string;
  result: LifecycleResult;
}

// Computes lifecycle for every cluster (topicNode with children) in the
// given tree — callers pass in the SAME tree they already fetched from
// getTopicMap() rather than this function re-fetching it, so a page that
// needs both the raw tree and lifecycle info only pays for one fetch.
export async function computeLifecyclesForTree(tree: TopicMapNode[]): Promise<Map<string, ClusterLifecycle>> {
  const clusters: TopicMapNode[] = [];
  function collect(nodes: TopicMapNode[]) {
    for (const node of nodes) {
      if (node.children.length > 0) clusters.push(node);
      collect(node.children);
    }
  }
  collect(tree);

  const plannedNextRows = await client.fetch<{ _id: string; plannedNext?: boolean }[]>(
    `*[_type == "topicNode" && _id in $ids]{ _id, plannedNext }`,
    { ids: clusters.map((c) => c.id) }
  );
  const plannedNextByClusterId = new Map(plannedNextRows.map((r) => [r._id, Boolean(r.plannedNext)]));

  const results = await Promise.all(
    clusters.map(async (node): Promise<ClusterLifecycle> => {
      const [publishedBriefs, clusterAuthority] = await Promise.all([
        fetchPublishedBriefs(node.id),
        getClusterAuthorityByNodeId(node.id),
      ]);
      const result = computeLifecycleStage(node, plannedNextByClusterId.get(node.id) ?? false, publishedBriefs, clusterAuthority);
      return { clusterNodeId: node.id, clusterLabel: node.label, result };
    })
  );

  return new Map(results.map((r) => [r.clusterNodeId, r]));
}

// Single-cluster equivalent for pages that already have the cluster's id/label
// (e.g. the cluster detail page, via ClusterAuthority) and don't need the
// whole Topic Map tree just to compute one cluster's lifecycle.
export async function computeLifecycleForCluster(clusterNodeId: string, clusterLabel: string): Promise<ClusterLifecycle> {
  const [publishedBriefs, clusterAuthority, plannedNext] = await Promise.all([
    fetchPublishedBriefs(clusterNodeId),
    getClusterAuthorityByNodeId(clusterNodeId),
    client.fetch<boolean | null>(`*[_id == $id][0].plannedNext`, { id: clusterNodeId }),
  ]);
  const result = computeLifecycleStage({ id: clusterNodeId, label: clusterLabel }, Boolean(plannedNext), publishedBriefs, clusterAuthority);
  return { clusterNodeId, clusterLabel, result };
}
