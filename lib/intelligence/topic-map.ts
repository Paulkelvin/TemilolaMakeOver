import { client } from "@/sanity/client";
import { getTopicalAuthorityNode } from "./topical-authority";

/**
 * Reads the hand-edited topicNode hierarchy from Sanity and, for any node
 * linked to a real taxonomy document, looks up its already-computed
 * Coverage/Authority scores (lib/intelligence/topical-authority.ts) — no new
 * scoring logic here, just a tree assembled from two existing data sources.
 * Purely conceptual nodes (no linked page yet) surface as an honest
 * "not yet a real page" placeholder rather than a fabricated score.
 */

interface RawTopicNode {
  _id: string;
  label: string;
  parentId?: string;
  linkedType?: string;
  linkedRefId?: string;
  notes?: string;
  order?: number;
}

export interface TopicMapNode {
  id: string;
  label: string;
  notes?: string;
  order: number;
  linkedTaxonomy?: { type: string; refId: string };
  /** undefined = conceptual (no linked page); null = linked but not yet computed by the weekly cron; object = real scores. */
  authority?: { coverageScore: number; authorityScore: number; publicPath?: string } | null;
  children: TopicMapNode[];
}

export async function getTopicMap(): Promise<TopicMapNode[]> {
  const raw = await client.fetch<RawTopicNode[]>(
    `*[_type == "topicNode"]{ _id, label, "parentId": parent._ref, "linkedType": linkedTaxonomy.type, "linkedRefId": linkedTaxonomy.ref._ref, notes, order }`
  );

  const linkedNodes = raw.filter((r) => r.linkedType && r.linkedRefId);
  const authorityLookups = await Promise.all(
    linkedNodes.map((r) => getTopicalAuthorityNode(r.linkedType!, r.linkedRefId!))
  );
  const authorityByNodeId = new Map(linkedNodes.map((r, i) => [r._id, authorityLookups[i]]));

  const nodesById = new Map<string, TopicMapNode>();
  for (const r of raw) {
    const isLinked = Boolean(r.linkedType && r.linkedRefId);
    const stored = isLinked ? authorityByNodeId.get(r._id) : undefined;
    nodesById.set(r._id, {
      id: r._id,
      label: r.label,
      notes: r.notes,
      order: r.order ?? 0,
      linkedTaxonomy: isLinked ? { type: r.linkedType!, refId: r.linkedRefId! } : undefined,
      authority: isLinked
        ? stored
          ? { coverageScore: stored.coverageScore.totalScore, authorityScore: stored.authorityScore.totalScore, publicPath: stored.publicPath }
          : null
        : undefined,
      children: [],
    });
  }

  const roots: TopicMapNode[] = [];
  for (const r of raw) {
    const node = nodesById.get(r._id)!;
    const parent = r.parentId ? nodesById.get(r.parentId) : undefined;
    if (parent) parent.children.push(node);
    else roots.push(node);
  }

  function sortTree(nodes: TopicMapNode[]): void {
    nodes.sort((a, b) => a.order - b.order);
    for (const n of nodes) sortTree(n.children);
  }
  sortTree(roots);

  return roots;
}
