import { client } from "@/sanity/client";
import { writeClient } from "@/sanity/write-client";
import { getTopicMap, type TopicMapNode } from "./topic-map";
import { getClusterAuthorities, type StoredClusterAuthority } from "./cluster-authority";
import { getTopicalAuthorityNode, type DimensionKey } from "./topical-authority";
import { computeLifecyclesForTree, LIFECYCLE_STAGE_LABEL, type LifecycleStage } from "./topic-lifecycle";
import { flattenAllNodes } from "./topic-suggestions";

/**
 * Editorial Roadmap — turns the site's already-computed cluster data into
 * ONE current objective per cluster, ranked so the highest-impact cluster
 * surfaces first. No new scoring model: priority is a narration layer over
 * ClusterAuthority (authority/coverage/gaps), the hand-set businessPriority
 * on topicNode, and the Topic Lifecycle stage. Marking an objective's
 * status "done" — whether or not every action was ticked — lets the next
 * highest-priority cluster become the new top objective automatically.
 */

const TARGET_AUTHORITY = 85; // same ceiling quality-score.ts's MIN_PUBLISHABLE_SCORE uses — one consistent "good enough" bar across the platform
const BUSINESS_PRIORITY_MULTIPLIER: Record<string, number> = { low: 0.7, medium: 1.0, high: 1.4 };
const NEEDS_REFRESH_URGENCY_BONUS = 30;
const MAX_ACTIONS = 6;
const LOW_COVERAGE_THRESHOLD = 50;

// Only genuinely human-actionable content dimensions — skips structuredData/
// relatedTaxonomy/contentDepth (technical/structural, not a checklist item a
// business owner ticks off) and articles (already covered by
// ClusterAuthority's recommendedNextContent "publish" actions below).
const ACTIONABLE_DIMENSIONS: Partial<Record<DimensionKey, string>> = {
  portfolio: "Add a portfolio gallery",
  testimonials: "Add a client testimonial or case study",
  transformations: "Add a before/after transformation",
  faqs: "Add FAQs",
  images: "Add more photos",
};

export interface RoadmapAction {
  label: string;
  done: boolean;
}

export interface EditorialObjective {
  clusterNodeId: string;
  clusterLabel: string;
  objectiveText: string;
  targetMetric: { label: string; current: number; target: number };
  actions: RoadmapAction[];
  priorityScore: number;
  decisionTrace: string[];
}

async function collectDimensionGapActions(node: TopicMapNode): Promise<string[]> {
  // Includes the cluster root itself, not just its descendants — the root is
  // very often the one real, taxonomy-linked anchor page in the subtree (the
  // Wizard's standard shape: a linked service/style/occasion at the root,
  // unlinked keyword-discovery candidates as children), so excluding it here
  // meant this function returned [] for exactly the clusters most likely to
  // have a real coverage gap on their own anchor page — the same root-
  // exclusion bug cluster-authority.ts's scorableNodes fix already addressed
  // for authority/coverage scoring, just not mirrored here.
  const descendants = node.children.flatMap((c) => [c, ...flattenAllNodes(c.children)]);
  const linked = [node, ...descendants].filter((d) => d.linkedTaxonomy);
  const nodes = await Promise.all(
    linked.map((d) => getTopicalAuthorityNode(d.linkedTaxonomy!.type, d.linkedTaxonomy!.refId))
  );

  const sums = new Map<DimensionKey, { total: number; count: number }>();
  for (const n of nodes) {
    if (!n) continue;
    for (const dim of n.coverageScore.dimensions) {
      if (!dim.applicable || !ACTIONABLE_DIMENSIONS[dim.key]) continue;
      const agg = sums.get(dim.key) ?? { total: 0, count: 0 };
      agg.total += dim.earnedPct;
      agg.count += 1;
      sums.set(dim.key, agg);
    }
  }

  const actions: string[] = [];
  for (const [key, agg] of sums) {
    const avgPct = agg.total / agg.count;
    if (avgPct < LOW_COVERAGE_THRESHOLD) actions.push(ACTIONABLE_DIMENSIONS[key]!);
  }
  return actions;
}

function buildObjective(
  node: TopicMapNode,
  clusterAuthority: StoredClusterAuthority | null,
  lifecycleStage: LifecycleStage,
  businessPriority: string,
  dimensionActions: string[]
): EditorialObjective {
  const trace: string[] = [];
  const multiplier = BUSINESS_PRIORITY_MULTIPLIER[businessPriority] ?? 1.0;
  trace.push(`Business priority: ${businessPriority} (×${multiplier}).`);
  trace.push(`Lifecycle stage: ${LIFECYCLE_STAGE_LABEL[lifecycleStage]}.`);

  const avgAuthorityScore = clusterAuthority?.avgAuthorityScore ?? 0;
  const hasPublishedContent = !["approved", "planned"].includes(lifecycleStage);

  let objectiveText: string;
  let actions: string[];
  let baseOpportunity: number;

  if (!hasPublishedContent) {
    objectiveText = `Publish the first article for ${node.label}.`;
    actions = clusterAuthority?.recommendedNextContent.length
      ? clusterAuthority.recommendedNextContent.map((g) => `Publish: ${g.label}`)
      : [`Compile a Content Brief for ${node.label} to find the first topic to write.`];
    baseOpportunity = 60; // launching a new cluster is inherently a solid opportunity even before any data exists
    trace.push("No published articles yet — objective is launching the pillar, not growing an authority score that doesn't exist.");
  } else if (lifecycleStage === "mature_authority") {
    objectiveText = `Maintain ${node.label}'s authority (${avgAuthorityScore}%) — monitor for new gaps.`;
    actions = clusterAuthority?.recommendedNextContent.slice(0, 2).map((g) => `Publish: ${g.label}`) ?? [];
    baseOpportunity = Math.max(0, TARGET_AUTHORITY - avgAuthorityScore) + (clusterAuthority?.openGapCount ?? 0);
    trace.push(`Already at or above the ${TARGET_AUTHORITY}% target — low remaining opportunity here relative to other clusters.`);
  } else {
    objectiveText = `Increase ${node.label} authority from ${avgAuthorityScore}% to ${TARGET_AUTHORITY}%.`;
    const contentActions = clusterAuthority?.recommendedNextContent.map((g) => `Publish: ${g.label}`) ?? [];
    const linkGapCount = clusterAuthority
      ? clusterAuthority.internalLinkHealth.underlinkedCount + clusterAuthority.internalLinkHealth.orphanCount
      : 0;
    const linkAction = linkGapCount > 0 ? [`Add ${linkGapCount} internal link${linkGapCount === 1 ? "" : "s"} to under-linked pages in this cluster`] : [];
    actions = [...contentActions, ...linkAction];
    const authorityGap = Math.max(0, TARGET_AUTHORITY - avgAuthorityScore);
    baseOpportunity = authorityGap + Math.min(20, (clusterAuthority?.openGapCount ?? 0) * 2);
    trace.push(`Authority gap to target: ${authorityGap} point${authorityGap === 1 ? "" : "s"}. Open gaps: ${clusterAuthority?.openGapCount ?? "not yet computed"}.`);
  }

  actions = [...actions, ...dimensionActions].slice(0, MAX_ACTIONS);
  if (dimensionActions.length > 0) trace.push(`Coverage gaps below ${LOW_COVERAGE_THRESHOLD}%: ${dimensionActions.join(", ")}.`);

  const urgencyBonus = lifecycleStage === "needs_refresh" ? NEEDS_REFRESH_URGENCY_BONUS : 0;
  if (urgencyBonus > 0) {
    trace.push(`+${urgencyBonus} urgency bonus — this cluster's content has gone stale despite its authority.`);
    actions = ["Refresh outdated content in this cluster", ...actions].slice(0, MAX_ACTIONS);
  }

  const priorityScore = Math.round(Math.max(0, Math.min(100, (baseOpportunity + urgencyBonus) * multiplier)));
  trace.push(`Priority score: (${baseOpportunity} opportunity + ${urgencyBonus} urgency) × ${multiplier} business priority = ${priorityScore}.`);

  return {
    clusterNodeId: node.id,
    clusterLabel: node.label,
    objectiveText,
    targetMetric: { label: "Average Authority", current: avgAuthorityScore, target: TARGET_AUTHORITY },
    actions: actions.map((label) => ({ label, done: false })),
    priorityScore,
    decisionTrace: trace,
  };
}

export async function computeEditorialRoadmap(): Promise<EditorialObjective[]> {
  const tree = await getTopicMap();
  const clusters = flattenAllNodes(tree).filter((n) => n.children.length > 0);

  const [businessPriorityRows, clusterAuthorities] = await Promise.all([
    client.fetch<{ _id: string; businessPriority?: string }[]>(
      `*[_type == "topicNode" && _id in $ids]{ _id, businessPriority }`,
      { ids: clusters.map((c) => c.id) }
    ),
    getClusterAuthorities(),
  ]);
  const businessPriorityById = new Map(businessPriorityRows.map((r) => [r._id, r.businessPriority ?? "medium"]));
  // Fetched once here and reused below — computeLifecyclesForTree used to
  // independently point-fetch the same clusterAuthority doc per cluster a
  // second time.
  const clusterAuthorityById = new Map(clusterAuthorities.map((c) => [c.clusterNodeId, c]));

  const lifecyclesById = await computeLifecyclesForTree(tree, clusterAuthorityById);

  const objectives = await Promise.all(
    clusters.map(async (node) => {
      const clusterAuthority = clusterAuthorityById.get(node.id) ?? null;
      const dimensionActions = await collectDimensionGapActions(node);
      const lifecycleStage = lifecyclesById.get(node.id)?.result.stage ?? "approved";
      const businessPriority = businessPriorityById.get(node.id) ?? "medium";
      return buildObjective(node, clusterAuthority, lifecycleStage, businessPriority, dimensionActions);
    })
  );

  return objectives.sort((a, b) => b.priorityScore - a.priorityScore);
}

// ─── Persistence ────────────────────────────────────────────────────────────

interface StoredObjectiveLite {
  _id: string;
  status?: string;
  actionedAt?: string;
  firstSeenAt?: string;
  actions?: RoadmapAction[];
}

function docIdForObjective(clusterNodeId: string): string {
  return `editorial-objective-${clusterNodeId}`;
}

export async function persistEditorialRoadmap(objectives: EditorialObjective[]): Promise<{ upserted: number }> {
  const nowIso = new Date().toISOString();

  const existing = await client.fetch<StoredObjectiveLite[]>(
    `*[_type == "editorialObjective"]{ _id, status, actionedAt, firstSeenAt, actions }`
  );
  const existingById = new Map(existing.map((e) => [e._id, e]));

  let tx = writeClient.transaction();
  for (const objective of objectives) {
    const id = docIdForObjective(objective.clusterNodeId);
    const prior = existingById.get(id);
    const priorDoneByLabel = new Map((prior?.actions ?? []).map((a) => [a.label, a.done]));
    const actions = objective.actions.map((a) => ({ label: a.label, done: priorDoneByLabel.get(a.label) ?? false }));

    tx = tx.createOrReplace({
      _id: id,
      _type: "editorialObjective",
      ...objective,
      actions,
      status: prior?.status ?? "new",
      actionedAt: prior?.actionedAt,
      firstSeenAt: prior?.firstSeenAt ?? nowIso,
      lastComputedAt: nowIso,
    });
  }
  await tx.commit();

  return { upserted: objectives.length };
}

export interface StoredEditorialObjective extends EditorialObjective {
  _id: string;
  status: "new" | "in_progress" | "done";
  actionedAt?: string;
  firstSeenAt: string;
  lastComputedAt: string;
}

export async function getEditorialRoadmap(): Promise<StoredEditorialObjective[]> {
  return client.fetch<StoredEditorialObjective[]>(`*[_type == "editorialObjective"] | order(priorityScore desc)`);
}

export async function getCurrentTopPriorityObjective(): Promise<StoredEditorialObjective | null> {
  return client.fetch<StoredEditorialObjective | null>(
    `*[_type == "editorialObjective" && status != "done"] | order(priorityScore desc)[0]`
  );
}

// Matched by array index, not label text — recommendedNextContent merges
// gaps from three independent engines (keyword-discovery, competitor-gap,
// knowledge-graph), so two actions can legitimately share the exact same
// "Publish: ${label}" text. Matching by label would toggle every action
// with that text at once instead of just the one checkbox the user clicked.
export async function toggleRoadmapAction(objectiveId: string, actionIndex: number): Promise<void> {
  const objective = await client.fetch<StoredEditorialObjective | null>(`*[_id == $id][0]`, { id: objectiveId });
  if (!objective) throw new Error(`Objective ${objectiveId} not found.`);
  if (actionIndex < 0 || actionIndex >= objective.actions.length) {
    throw new Error(`Action index ${actionIndex} out of range for objective ${objectiveId}.`);
  }
  const actions = objective.actions.map((a, i) => (i === actionIndex ? { ...a, done: !a.done } : a));
  await writeClient.patch(objectiveId).set({ actions }).commit();
}

export async function setRoadmapObjectiveStatus(objectiveId: string, status: "new" | "in_progress" | "done"): Promise<void> {
  await writeClient.patch(objectiveId).set({ status, actionedAt: new Date().toISOString() }).commit();
}
