import { client } from "@/sanity/client";
import { type FetchClient } from "./content";
import { LEAF_TYPES, TAXONOMY_TYPES } from "./registry";
import { getEntityConfig } from "./entity-registry";

/**
 * Entity Coverage — for a handful of curated major topics (entity-registry.ts),
 * scans the site's real text (the taxonomy node's own description plus every
 * related blog post/FAQ/testimonial's real text, via the same reference scan
 * computeCoverage() already uses) for expected industry-standard entities.
 * Purely deterministic word-boundary counting — no AI, nothing inferred.
 * Live-computed on page load, not persisted/cron-gated, since it's a plain
 * text scan over already-small documents, not an external fetch.
 */

export interface EntityStatus {
  entity: string;
  covered: boolean;
  occurrences: number;
}

export interface EntityCoverageResult {
  taxonomyType: string;
  taxonomyName: string;
  coveredEntities: EntityStatus[];
  missingEntities: string[];
  overusedEntities: EntityStatus[];
  coveragePct: number;
  wordCount: number;
}

// More than this many mentions per 1,000 words of real content reads as
// keyword stuffing rather than organic, natural usage.
const OVERUSE_PER_1000_WORDS = 8;

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function countOccurrences(text: string, phrase: string): number {
  const re = new RegExp(`\\b${escapeRegExp(phrase)}\\b`, "gi");
  return (text.match(re) ?? []).length;
}

async function fetchNodeText(
  fetchClient: FetchClient,
  node: { type: string; id: string }
): Promise<string> {
  const cfg = TAXONOMY_TYPES.find((t) => t.type === node.type);
  const parts: string[] = [];

  if (cfg?.descriptionField) {
    const row = await fetchClient.fetch<{ text: string | null } | null>(
      `*[_type == $type && _id == $id][0]{ "text": ${cfg.descriptionField} }`,
      { type: node.type, id: node.id }
    );
    if (row?.text) parts.push(row.text);
  }

  const leafResults = await Promise.all(
    LEAF_TYPES.filter((l) => l.textFieldExpr).map((leaf) =>
      fetchClient.fetch<{ text: string | null }[]>(
        `*[_type == $leafType && references($id)]{ "text": ${leaf.textFieldExpr} }`,
        { leafType: leaf.type, id: node.id }
      )
    )
  );
  for (const rows of leafResults) {
    for (const row of rows) if (row.text) parts.push(row.text);
  }

  return parts.join(" \n ");
}

export async function computeEntityCoverage(
  fetchClient: FetchClient,
  node: { type: string; id: string; name: string }
): Promise<EntityCoverageResult | null> {
  const config = getEntityConfig(node.type, node.name);
  if (!config || config.expectedEntities.length === 0) return null;

  const text = await fetchNodeText(fetchClient, node);
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  const statuses: EntityStatus[] = config.expectedEntities.map((entity) => {
    const occurrences = countOccurrences(text, entity);
    return { entity, covered: occurrences > 0, occurrences };
  });

  const coveredEntities = statuses.filter((s) => s.covered);
  const missingEntities = statuses.filter((s) => !s.covered).map((s) => s.entity);
  const overusedEntities = statuses.filter(
    (s) => s.covered && wordCount > 0 && (s.occurrences / wordCount) * 1000 > OVERUSE_PER_1000_WORDS
  );

  return {
    taxonomyType: node.type,
    taxonomyName: node.name,
    coveredEntities,
    missingEntities,
    overusedEntities,
    coveragePct: Math.round((coveredEntities.length / config.expectedEntities.length) * 100),
    wordCount,
  };
}

export async function getEntityCoverageForNode(
  type: string,
  id: string,
  name: string
): Promise<EntityCoverageResult | null> {
  return computeEntityCoverage(client, { type, id, name });
}
