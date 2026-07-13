import { client } from "@/sanity/client";
import { writeClient } from "@/sanity/write-client";
import { fetchAllTaxonomyNodes, type FetchClient } from "./content";
import { getTopicMap } from "./topic-map";
import { normalizeQuery, overlapScore, OVERLAP_THRESHOLDS } from "./keyword-utils";
import {
  candidate,
  mergeCandidates,
  dedupeEvidence,
  scoreBucket,
  type SuggestionEvidence,
  type CandidateBucket,
} from "./topic-clustering";
import {
  mineCompetitorGaps,
  mineSearchConsole,
  mineKeywordDiscovery,
  mineAutocomplete,
  mineRecurringEntities,
  flattenAllNodes,
  isAlreadyCovered,
  MERGE_OVERLAP,
} from "./topic-suggestions";

/**
 * Initial Topic Map Wizard — a one-shot, whole-tree version of
 * topic-suggestions.ts's ongoing mining, for bootstrapping an empty Topic
 * Map in a single reviewed pass instead of approving individual suggestions
 * one at a time. Reuses the exact same 5 source miners and merge/scoring
 * logic (topic-clustering.ts) — the only genuinely new piece is treating the
 * site's real taxonomy (Services, Makeup Styles, Occasions, Wedding Types)
 * as the natural top-level anchors everything else attaches under.
 *
 * Locations and Artists are deliberately excluded from becoming top-level
 * candidates — they're cross-cutting dimensions ("Ikeja", "Temilola"), not
 * content topics the way "Bridal Makeup" or "Soft Glam" are.
 */

const TAXONOMY_ANCHOR_TYPES = new Set(["service", "makeupStyle", "occasion", "weddingType"]);
const TAXONOMY_CANDIDATE_PRIORITY = 60; // flat baseline — real business taxonomy is inherently worth a branch regardless of external signal
const MAX_TOP_LEVEL = 12;
const MAX_CHILDREN_PER_TOP_LEVEL = 8;

// Same "best overlap in a list" shape used twice in this file (matching a
// candidate to a top-level anchor, and to a taxonomy node) — a single
// generic helper instead of two hand-rolled max-search loops that could
// silently disagree on tie-breaking if one drifted from the other.
function bestOverlapMatch<T>(tokens: string[], items: T[], getTokens: (item: T) => string[]): { item: T; overlap: number } | null {
  let best: T | null = null;
  let bestOverlap = 0;
  for (const item of items) {
    const overlap = overlapScore(tokens, getTokens(item));
    if (overlap > bestOverlap) {
      bestOverlap = overlap;
      best = item;
    }
  }
  return best ? { item: best, overlap: bestOverlap } : null;
}

export interface ProposedNode {
  tempId: string;
  label: string;
  parentTempId?: string;
  linkedTaxonomy?: { type: string; refId: string };
  evidence: SuggestionEvidence[];
  priorityScore: number;
  confidenceScore: number;
  confidenceLabel: string;
}

export async function computeInitialTopicMapProposal(fetchClient: FetchClient = client): Promise<ProposedNode[]> {
  const [tree, allTaxonomyNodes] = await Promise.all([getTopicMap(), fetchAllTaxonomyNodes(fetchClient)]);
  const existingNodes = flattenAllNodes(tree);
  const existingNodeTokenSets = existingNodes.map((n) => normalizeQuery(n.label).tokens);
  const anchorTaxonomyNodes = allTaxonomyNodes.filter((n) => TAXONOMY_ANCHOR_TYPES.has(n.type));

  const taxonomyCandidates = anchorTaxonomyNodes.map((n) =>
    candidate(n.name, "taxonomy", `Real, already-built ${n.typeLabel} on the site.`, TAXONOMY_CANDIDATE_PRIORITY)
  );

  const autocompleteSeeds = [...anchorTaxonomyNodes.map((n) => n.name), ...existingNodes.map((n) => n.label)];

  const [competitorCandidates, searchConsoleCandidates, keywordDiscoveryCandidates, autocompleteCandidates, entityCandidates] =
    await Promise.all([
      mineCompetitorGaps(),
      mineSearchConsole(),
      mineKeywordDiscovery(),
      mineAutocomplete(autocompleteSeeds),
      mineRecurringEntities(fetchClient),
    ]);

  const allCandidates = [
    ...taxonomyCandidates,
    ...competitorCandidates,
    ...searchConsoleCandidates,
    ...keywordDiscoveryCandidates,
    ...autocompleteCandidates,
    ...entityCandidates,
  ].filter((c) => c.tokens.length > 0 && !isAlreadyCovered(c.tokens, existingNodeTokenSets));

  const buckets = mergeCandidates(allCandidates, MERGE_OVERLAP);

  const isTaxonomyAnchored = (b: CandidateBucket) => b.sources.has("taxonomy");
  const topLevelBuckets = buckets.filter(isTaxonomyAnchored);
  const otherBuckets = buckets.filter((b) => !isTaxonomyAnchored(b));

  // Any candidate the real taxonomy doesn't already capture becomes its own
  // top-level branch too — an honest "the business has demand here but no
  // page for it yet" signal, not something to silently bury as a child.
  const looseTopLevelBuckets: CandidateBucket[] = [];
  const childBuckets: { bucket: CandidateBucket; parentBucket: CandidateBucket }[] = [];
  for (const bucket of otherBuckets) {
    const match = bestOverlapMatch(bucket.representative.tokens, topLevelBuckets, (b) => b.representative.tokens);
    if (match && match.overlap >= OVERLAP_THRESHOLDS.clusterMembership) {
      childBuckets.push({ bucket, parentBucket: match.item });
    } else {
      looseTopLevelBuckets.push(bucket);
    }
  }

  function toScoredNode(bucket: CandidateBucket): { evidence: SuggestionEvidence[]; priorityScore: number; confidenceLabel: string; confidenceScore: number } {
    const evidence = dedupeEvidence(bucket.evidence);
    const { priorityScore, confidenceLabel, confidenceScore } = scoreBucket(evidence, bucket.sources.size);
    return { evidence, priorityScore, confidenceLabel, confidenceScore };
  }

  function findLinkedTaxonomy(bucket: CandidateBucket): { type: string; refId: string } | undefined {
    const match = bestOverlapMatch(bucket.representative.tokens, anchorTaxonomyNodes, (n) => normalizeQuery(n.name).tokens);
    return match && match.overlap >= OVERLAP_THRESHOLDS.alreadyDuplicate ? { type: match.item.type, refId: match.item.id } : undefined;
  }

  // Ranked by the real, evidence-weighted scoreBucket() result — not by
  // bucket.representative.priorityScore, which is pinned at the flat
  // TAXONOMY_CANDIDATE_PRIORITY (60) for every taxonomy-anchored bucket
  // regardless of how much corroborating evidence it actually merged in.
  // Sorting by the raw representative score would make the MAX_TOP_LEVEL /
  // MAX_CHILDREN_PER_TOP_LEVEL caps keep whichever buckets happened to be
  // fetched first, not the ones the system itself scored highest.
  const scoredTopLevel = [...topLevelBuckets, ...looseTopLevelBuckets]
    .map((bucket) => ({ bucket, scored: toScoredNode(bucket) }))
    .sort((a, b) => b.scored.priorityScore - a.scored.priorityScore)
    .slice(0, MAX_TOP_LEVEL);

  const proposedNodes: ProposedNode[] = [];
  let counter = 0;
  for (const { bucket, scored } of scoredTopLevel) {
    const tempId = `node-${counter++}`;
    proposedNodes.push({
      tempId,
      label: bucket.representative.label,
      linkedTaxonomy: findLinkedTaxonomy(bucket),
      ...scored,
    });

    const children = childBuckets
      .filter((c) => c.parentBucket === bucket)
      .map((c) => ({ ...c, scored: toScoredNode(c.bucket) }))
      .sort((a, b) => b.scored.priorityScore - a.scored.priorityScore)
      .slice(0, MAX_CHILDREN_PER_TOP_LEVEL);
    for (const { bucket: childBucket, scored: childScored } of children) {
      proposedNodes.push({
        tempId: `node-${counter++}`,
        label: childBucket.representative.label,
        parentTempId: tempId,
        ...childScored,
      });
    }
  }

  return proposedNodes;
}

// ─── Persistence ────────────────────────────────────────────────────────────

export async function persistWizardProposal(nodes: ProposedNode[]): Promise<{ id: string }> {
  const created = await writeClient.create({
    _type: "topicMapWizardProposal",
    generatedAt: new Date().toISOString(),
    status: "draft",
    proposedNodes: nodes,
  });
  return { id: created._id };
}

export interface StoredWizardProposal {
  _id: string;
  generatedAt: string;
  status: "draft" | "approved" | "discarded";
  actionedAt?: string;
  createdNodeCount?: number;
  proposedNodes: ProposedNode[];
}

export async function getWizardProposals(): Promise<StoredWizardProposal[]> {
  return client.fetch<StoredWizardProposal[]>(`*[_type == "topicMapWizardProposal"] | order(generatedAt desc)`);
}

export async function getWizardProposalById(id: string): Promise<StoredWizardProposal | null> {
  return client.fetch<StoredWizardProposal | null>(`*[_id == $id][0]`, { id });
}

export async function getTopicNodeCount(): Promise<number> {
  return client.fetch<number>(`count(*[_type == "topicNode"])`);
}

// ─── Approval workflow — the one place this ever writes topicNode docs ────

function buildTopicNodeDoc(realId: string, node: ProposedNode, order: number, extra: Record<string, unknown>) {
  return { _id: realId, _type: "topicNode", label: node.label, order, ...extra };
}

export async function approveWizardProposal(proposalId: string): Promise<{ createdNodeCount: number }> {
  const proposal = await getWizardProposalById(proposalId);
  if (!proposal) throw new Error(`Proposal ${proposalId} not found.`);
  if (proposal.status !== "draft") throw new Error(`Proposal is already ${proposal.status}.`);

  const topLevel = proposal.proposedNodes.filter((n) => !n.parentTempId);
  const children = proposal.proposedNodes.filter((n) => n.parentTempId);

  let tx = writeClient.transaction();
  const realIdByTempId = new Map<string, string>();

  topLevel.forEach((node, index) => {
    const realId = `topicNode-wizard-${proposalId}-${node.tempId}`;
    realIdByTempId.set(node.tempId, realId);
    const extra = node.linkedTaxonomy
      ? { linkedTaxonomy: { type: node.linkedTaxonomy.type, ref: { _type: "reference", _ref: node.linkedTaxonomy.refId } } }
      : {};
    tx = tx.createIfNotExists(buildTopicNodeDoc(realId, node, index, extra));
  });

  const childrenByParent = new Map<string, ProposedNode[]>();
  for (const node of children) {
    const list = childrenByParent.get(node.parentTempId!) ?? [];
    list.push(node);
    childrenByParent.set(node.parentTempId!, list);
  }
  for (const [parentTempId, siblings] of childrenByParent) {
    const parentRealId = realIdByTempId.get(parentTempId);
    if (!parentRealId) continue;
    siblings.forEach((node, index) => {
      const realId = `topicNode-wizard-${proposalId}-${node.tempId}`;
      tx = tx.createIfNotExists(buildTopicNodeDoc(realId, node, index, { parent: { _type: "reference", _ref: parentRealId } }));
    });
  }

  await tx.commit();

  const createdNodeCount = proposal.proposedNodes.length;
  await writeClient
    .patch(proposalId)
    .set({ status: "approved", actionedAt: new Date().toISOString(), createdNodeCount })
    .commit();

  return { createdNodeCount };
}

export async function discardWizardProposal(proposalId: string): Promise<void> {
  const proposal = await getWizardProposalById(proposalId);
  if (!proposal) throw new Error(`Proposal ${proposalId} not found.`);
  if (proposal.status !== "draft") throw new Error(`Proposal is already ${proposal.status}.`);
  await writeClient.patch(proposalId).set({ status: "discarded", actionedAt: new Date().toISOString() }).commit();
}
