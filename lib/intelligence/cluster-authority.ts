import { client } from "@/sanity/client";
import { writeClient } from "@/sanity/write-client";
import { getTopicMap, type TopicMapNode } from "./topic-map";
import { getKeywordDiscoveryTopics } from "./keyword-discovery";
import { getCompetitorGaps } from "./competitor-gap";
import { getKnowledgeGraphGaps } from "./knowledge-graph";
import { getInternalLinkGaps } from "./internal-links";
import { normalizeQuery, overlapScore, OVERLAP_THRESHOLDS } from "./keyword-utils";

/**
 * Cluster Authority — the site's topical authority tracked at the level a
 * business actually plans content: the Topic Map cluster (any hand-edited
 * topicNode with children), not the individual article. Every number here
 * is a rollup of what other engines already computed — Topical Authority's
 * per-page scores, Keyword Discovery / Competitor Gap / Knowledge Graph's
 * open gaps, Internal Links' link-health data — filtered down to whichever
 * cluster each one topically belongs to. No new scoring model, just the
 * existing ones viewed one level up.
 */

const MAX_RECOMMENDATIONS = 5;

export type GapSource = "keyword-discovery" | "competitor-gap" | "knowledge-graph";

export interface ClusterGapRef {
  label: string;
  source: GapSource;
  priorityScore: number;
  detail: string;
}

export interface ClusterInternalLinkHealth {
  healthyCount: number;
  underlinkedCount: number;
  orphanCount: number;
}

export interface ClusterAuthority {
  clusterNodeId: string;
  clusterLabel: string;
  descendantCount: number;
  linkedDescendantCount: number;
  avgCoverageScore: number;
  avgAuthorityScore: number;
  internalLinkHealth: ClusterInternalLinkHealth;
  missingSubtopics: ClusterGapRef[];
  competitorGaps: ClusterGapRef[];
  knowledgeGraphGaps: ClusterGapRef[];
  recommendedNextContent: ClusterGapRef[];
  openGapCount: number; // full count behind the three gap lists, before capping each to MAX_RECOMMENDATIONS
  // Real public paths of this cluster's linked pages — lets the Verification
  // Suite check "would this draft duplicate an already-strong page in the
  // same cluster" without re-walking the whole Topic Map tree.
  linkedPaths: string[];
}

function flattenDescendants(node: TopicMapNode): TopicMapNode[] {
  return node.children.flatMap((c) => [c, ...flattenDescendants(c)]);
}

// A cluster's own label plus every descendant topic's label — the honest
// vocabulary of "what this cluster is about," used to decide which
// site-wide gaps genuinely belong to it.
function clusterTokens(clusterLabel: string, descendants: TopicMapNode[]): string[] {
  const tokens = new Set<string>();
  for (const label of [clusterLabel, ...descendants.map((d) => d.label)]) {
    for (const t of normalizeQuery(label).tokens) tokens.add(t);
  }
  return Array.from(tokens);
}

export interface ClusterMatch {
  clusterNodeId: string;
  clusterLabel: string;
  overlap: number;
}

// Shared with editorial-brief.ts — the same token-overlap test used to
// decide which site-wide gaps belong to a cluster also decides which
// cluster a newly compiled brief belongs to, so a brief and its cluster
// dashboard are always looking at the same definition of "in this cluster."
export async function matchTopicToCluster(topicTokens: string[]): Promise<ClusterMatch | null> {
  const tree = await getTopicMap();
  let best: ClusterMatch | null = null;

  function visit(node: TopicMapNode) {
    if (node.children.length > 0) {
      const descendants = flattenDescendants(node);
      const tokens = clusterTokens(node.label, descendants);
      const overlap = overlapScore(topicTokens, tokens);
      if (overlap >= OVERLAP_THRESHOLDS.clusterMembership && (!best || overlap > best.overlap)) {
        best = { clusterNodeId: node.id, clusterLabel: node.label, overlap };
      }
    }
    for (const child of node.children) visit(child);
  }
  for (const root of tree) visit(root);

  return best;
}

export async function computeClusterAuthority(): Promise<ClusterAuthority[]> {
  const tree = await getTopicMap();
  const [keywordTopics, competitorGapTopics, knowledgeGaps, internalLinkGaps] = await Promise.all([
    getKeywordDiscoveryTopics(),
    getCompetitorGaps(),
    getKnowledgeGraphGaps(),
    getInternalLinkGaps(),
  ]);

  const clusters: ClusterAuthority[] = [];

  function buildCluster(node: TopicMapNode): ClusterAuthority {
    const descendants = flattenDescendants(node);
    const linkedDescendants = descendants.filter((d) => d.linkedTaxonomy);
    // A cluster's own root is very often the one real, taxonomy-linked anchor
    // in the subtree (exactly how the Initial Topic Map Wizard builds every
    // cluster: a linked service/style/occasion at the root, with unlinked
    // keyword-discovery candidates as children) — flattenDescendants excludes
    // the node itself, so without a separate self-inclusive pool the root's
    // own authority/coverage and public path would never count toward its
    // own cluster's score, leaving avgAuthorityScore stuck at 0 forever no
    // matter how much real content gets published and tagged to it. Kept
    // distinct from linkedDescendants, which stays descendants-only for the
    // public "N of M topics linked" count.
    const scorableNodes = [node, ...descendants].filter((d) => d.linkedTaxonomy);
    const scoredDescendants = scorableNodes.filter((d) => d.authority);

    const avgCoverageScore =
      scoredDescendants.length > 0
        ? Math.round(scoredDescendants.reduce((sum, d) => sum + d.authority!.coverageScore, 0) / scoredDescendants.length)
        : 0;
    const avgAuthorityScore =
      scoredDescendants.length > 0
        ? Math.round(scoredDescendants.reduce((sum, d) => sum + d.authority!.authorityScore, 0) / scoredDescendants.length)
        : 0;

    const tokens = clusterTokens(node.label, descendants);
    const descendantPaths = new Set(
      scorableNodes.map((d) => d.authority?.publicPath).filter((p): p is string => Boolean(p))
    );

    const clusterLinkGaps = internalLinkGaps.filter((g) => descendantPaths.has(g.targetPath));
    const internalLinkHealth: ClusterInternalLinkHealth = {
      healthyCount: Math.max(0, descendantPaths.size - clusterLinkGaps.length),
      underlinkedCount: clusterLinkGaps.filter((g) => g.inboundLinkCount > 0).length,
      orphanCount: clusterLinkGaps.filter((g) => g.inboundLinkCount === 0).length,
    };

    const rankedKeywordGaps = keywordTopics
      .filter((t) => t.contentCoverage !== "existing-strong")
      .map((t) => ({ t, overlap: overlapScore(tokens, normalizeQuery(t.topicLabel).tokens) }))
      .filter((x) => x.overlap >= OVERLAP_THRESHOLDS.clusterMembership)
      .sort((a, b) => b.t.priorityScore - a.t.priorityScore);
    const missingSubtopics: ClusterGapRef[] = rankedKeywordGaps.slice(0, MAX_RECOMMENDATIONS).map((x) => ({
      label: x.t.topicLabel,
      source: "keyword-discovery",
      priorityScore: x.t.priorityScore,
      detail: `Real discovered query, ${x.t.contentCoverage} coverage today.`,
    }));

    const rankedCompetitorGaps = competitorGapTopics
      .map((g) => ({ g, overlap: overlapScore(tokens, normalizeQuery(g.topicLabel).tokens) }))
      .filter((x) => x.overlap >= OVERLAP_THRESHOLDS.clusterMembership)
      .sort((a, b) => b.g.priorityScore - a.g.priorityScore);
    const competitorGaps: ClusterGapRef[] = rankedCompetitorGaps.slice(0, MAX_RECOMMENDATIONS).map((x) => ({
      label: x.g.topicLabel,
      source: "competitor-gap",
      priorityScore: x.g.priorityScore,
      detail: x.g.recommendedActionDetail,
    }));

    const rankedKnowledgeGaps = knowledgeGaps
      .map((g) => ({ g, overlap: overlapScore(tokens, normalizeQuery(`${g.serviceName} ${g.occasionName}`).tokens) }))
      .filter((x) => x.overlap >= OVERLAP_THRESHOLDS.clusterMembership)
      .sort((a, b) => b.g.priorityScore - a.g.priorityScore);
    const knowledgeGraphGaps: ClusterGapRef[] = rankedKnowledgeGaps.slice(0, MAX_RECOMMENDATIONS).map((x) => ({
      label: `${x.g.serviceName} × ${x.g.occasionName}`,
      source: "knowledge-graph",
      priorityScore: x.g.priorityScore,
      detail: x.g.recommendedActionDetail,
    }));

    const recommendedNextContent = [...missingSubtopics, ...competitorGaps, ...knowledgeGraphGaps]
      .sort((a, b) => b.priorityScore - a.priorityScore)
      .slice(0, MAX_RECOMMENDATIONS);

    return {
      clusterNodeId: node.id,
      clusterLabel: node.label,
      descendantCount: descendants.length,
      linkedDescendantCount: linkedDescendants.length,
      avgCoverageScore,
      avgAuthorityScore,
      internalLinkHealth,
      missingSubtopics,
      competitorGaps,
      knowledgeGraphGaps,
      recommendedNextContent,
      openGapCount: rankedKeywordGaps.length + rankedCompetitorGaps.length + rankedKnowledgeGaps.length,
      linkedPaths: Array.from(descendantPaths),
    };
  }

  function visit(node: TopicMapNode) {
    if (node.children.length > 0) clusters.push(buildCluster(node));
    for (const child of node.children) visit(child);
  }
  for (const root of tree) visit(root);

  return clusters;
}

// ─── Persistence ────────────────────────────────────────────────────────────

interface StoredClusterLite {
  _id: string;
  status?: string;
  actionedAt?: string;
  history?: { date: string; avgAuthorityScore: number; avgCoverageScore: number; openGapCount: number }[];
  firstSeenAt?: string;
}

function docIdForCluster(clusterNodeId: string): string {
  return `cluster-authority-${clusterNodeId}`;
}

export async function persistClusterAuthority(clusters: ClusterAuthority[]): Promise<{ upserted: number }> {
  const today = new Date().toISOString().slice(0, 10);
  const nowIso = new Date().toISOString();

  const existing = await client.fetch<StoredClusterLite[]>(
    `*[_type == "clusterAuthority"]{ _id, status, actionedAt, history, firstSeenAt }`
  );
  const existingById = new Map(existing.map((e) => [e._id, e]));

  let tx = writeClient.transaction();
  for (const cluster of clusters) {
    const id = docIdForCluster(cluster.clusterNodeId);
    const prior = existingById.get(id);
    const history = [...(prior?.history ?? [])];
    if (history[history.length - 1]?.date !== today) {
      history.push({
        date: today,
        avgAuthorityScore: cluster.avgAuthorityScore,
        avgCoverageScore: cluster.avgCoverageScore,
        openGapCount: cluster.openGapCount,
      });
    }

    tx = tx.createOrReplace({
      _id: id,
      _type: "clusterAuthority",
      ...cluster,
      status: prior?.status ?? "new",
      actionedAt: prior?.actionedAt,
      history,
      firstSeenAt: prior?.firstSeenAt ?? nowIso,
      lastComputedAt: nowIso,
    });
  }
  await tx.commit();

  return { upserted: clusters.length };
}

export interface StoredClusterAuthority extends ClusterAuthority {
  _id: string;
  status: "new" | "acknowledged" | "in_progress" | "done" | "dismissed";
  actionedAt?: string;
  history: { date: string; avgAuthorityScore: number; avgCoverageScore: number; openGapCount: number }[];
  firstSeenAt: string;
  lastComputedAt: string;
}

export async function getClusterAuthorities(): Promise<StoredClusterAuthority[]> {
  return client.fetch<StoredClusterAuthority[]>(
    `*[_type == "clusterAuthority"] | order(avgAuthorityScore asc)`
  );
}

export async function getClusterAuthorityByNodeId(clusterNodeId: string): Promise<StoredClusterAuthority | null> {
  return client.fetch<StoredClusterAuthority | null>(
    `*[_id == $id][0]`,
    { id: docIdForCluster(clusterNodeId) }
  );
}
