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
  const tree = await getTopicMap();
  const existingNodes = flattenAllNodes(tree);
  const existingNodeTokenSets = existingNodes.map((n) => normalizeQuery(n.label).tokens);

  const allTaxonomyNodes = await fetchAllTaxonomyNodes(fetchClient);
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

  const buckets = mergeCandidates(allCandidates, 0.5);

  const isTaxonomyAnchored = (b: CandidateBucket) => b.sources.has("taxonomy");
  const topLevelBuckets = buckets.filter(isTaxonomyAnchored);
  const otherBuckets = buckets.filter((b) => !isTaxonomyAnchored(b));

  // Any candidate the real taxonomy doesn't already capture becomes its own
  // top-level branch too — an honest "the business has demand here but no
  // page for it yet" signal, not something to silently bury as a child.
  const looseTopLevelBuckets: CandidateBucket[] = [];
  const childBuckets: { bucket: CandidateBucket; parentBucket: CandidateBucket }[] = [];
  for (const bucket of otherBuckets) {
    let best: CandidateBucket | null = null;
    let bestOverlap = 0;
    for (const anchor of topLevelBuckets) {
      const overlap = overlapScore(bucket.representative.tokens, anchor.representative.tokens);
      if (overlap > bestOverlap) {
        bestOverlap = overlap;
        best = anchor;
      }
    }
    if (best && bestOverlap >= OVERLAP_THRESHOLDS.clusterMembership) {
      childBuckets.push({ bucket, parentBucket: best });
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
    let best: (typeof anchorTaxonomyNodes)[number] | null = null;
    let bestOverlap = 0;
    for (const node of anchorTaxonomyNodes) {
      const overlap = overlapScore(bucket.representative.tokens, normalizeQuery(node.name).tokens);
      if (overlap > bestOverlap) {
        bestOverlap = overlap;
        best = node;
      }
    }
    return best && bestOverlap >= OVERLAP_THRESHOLDS.alreadyDuplicate ? { type: best.type, refId: best.id } : undefined;
  }

  const allTopLevel = [...topLevelBuckets, ...looseTopLevelBuckets]
    .sort((a, b) => b.representative.priorityScore - a.representative.priorityScore)
    .slice(0, MAX_TOP_LEVEL);

  const proposedNodes: ProposedNode[] = [];
  let counter = 0;
  for (const bucket of allTopLevel) {
    const tempId = `node-${counter++}`;
    const scored = toScoredNode(bucket);
    proposedNodes.push({
      tempId,
      label: bucket.representative.label,
      linkedTaxonomy: findLinkedTaxonomy(bucket),
      ...scored,
    });

    const children = childBuckets
      .filter((c) => c.parentBucket === bucket)
      .sort((a, b) => b.bucket.representative.priorityScore - a.bucket.representative.priorityScore)
      .slice(0, MAX_CHILDREN_PER_TOP_LEVEL);
    for (const { bucket: childBucket } of children) {
      const childScored = toScoredNode(childBucket);
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
    tx = tx.createIfNotExists({
      _id: realId,
      _type: "topicNode",
      label: node.label,
      order: index,
      ...(node.linkedTaxonomy
        ? { linkedTaxonomy: { type: node.linkedTaxonomy.type, ref: { _type: "reference", _ref: node.linkedTaxonomy.refId } } }
        : {}),
    });
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
      tx = tx.createIfNotExists({
        _id: realId,
        _type: "topicNode",
        label: node.label,
        order: index,
        parent: { _type: "reference", _ref: parentRealId },
      });
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
