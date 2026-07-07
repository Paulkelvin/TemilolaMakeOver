import { client } from "@/sanity/client";
import { writeClient } from "@/sanity/write-client";
import { fetchAllTaxonomyNodes, computeCoverage, type FetchClient } from "./content";
import {
  TAXONOMY_TYPES,
  LEAF_TYPES,
  INTERNAL_LINKS_MINIMUM_FOR_HEALTHY,
  RELATED_TAXONOMY_MINIMUM_FOR_HEALTHY,
  CONTENT_DEPTH_TARGET_LENGTH,
} from "./registry";
import type { TaxonomyNode, CoverageCounts } from "./types";

/**
 * Topical Authority Engine — one deterministic dimension computation
 * (computeAuthorityDimensions) reused two ways: a "Coverage Score" (evidence
 * + structure only, replaces the old description-length proxy that
 * keyword-utils.ts used to gate content-gap detection) and an "Authority
 * Score" (adds content depth + freshness) shown per taxonomy node on its own
 * dashboard. Every dimension traces to a real Sanity count, a real
 * `_updatedAt` timestamp, or a real per-type template fact — nothing
 * fabricated, nothing AI-derived.
 */

// ─── Dimensions ─────────────────────────────────────────────────────────────

export type DimensionKey =
  | "portfolio"
  | "testimonials"
  | "transformations"
  | "faqs"
  | "articles"
  | "internalLinks"
  | "structuredData"
  | "images"
  | "relatedTaxonomy"
  | "contentDepth"
  | "freshness";

export interface AuthorityDimension {
  key: DimensionKey;
  label: string;
  /** false = not yet measurable for this node type (e.g. no public page yet) — excluded from scoring, not scored as 0. */
  applicable: boolean;
  earnedPct: number;
  raw: string;
}

const DIMENSION_LABELS: Record<DimensionKey, string> = {
  portfolio: "Portfolio",
  testimonials: "Testimonials",
  transformations: "Transformations",
  faqs: "FAQs",
  articles: "Articles",
  internalLinks: "Internal Links",
  structuredData: "Structured Data",
  images: "Images",
  relatedTaxonomy: "Related Taxonomy",
  contentDepth: "Content Depth",
  freshness: "Freshness",
};

function capPct(count: number, minimum: number): number {
  return minimum > 0 ? Math.min(count / minimum, 1) * 100 : 0;
}

function daysSince(iso: string): number {
  return (Date.now() - new Date(iso).getTime()) / 86_400_000;
}

function leafMinimum(leafType: string): number {
  return LEAF_TYPES.find((l) => l.type === leafType)?.minimumForHealthy ?? 1;
}

export function computeAuthorityDimensions(node: TaxonomyNode, coverage: CoverageCounts): AuthorityDimension[] {
  const cfg = TAXONOMY_TYPES.find((t) => t.type === node.type);
  const daysSinceEdit = daysSince(node.updatedAt);

  return [
    { key: "portfolio", label: DIMENSION_LABELS.portfolio, applicable: true, earnedPct: capPct(coverage.portfolioItem, leafMinimum("portfolioItem")), raw: String(coverage.portfolioItem) },
    { key: "testimonials", label: DIMENSION_LABELS.testimonials, applicable: true, earnedPct: capPct(coverage.testimonial, leafMinimum("testimonial")), raw: String(coverage.testimonial) },
    { key: "transformations", label: DIMENSION_LABELS.transformations, applicable: true, earnedPct: capPct(coverage.transformation, leafMinimum("transformation")), raw: String(coverage.transformation) },
    { key: "faqs", label: DIMENSION_LABELS.faqs, applicable: true, earnedPct: capPct(coverage.faq, leafMinimum("faq")), raw: String(coverage.faq) },
    { key: "articles", label: DIMENSION_LABELS.articles, applicable: true, earnedPct: capPct(coverage.blogPost, leafMinimum("blogPost")), raw: String(coverage.blogPost) },
    {
      key: "internalLinks",
      label: DIMENSION_LABELS.internalLinks,
      applicable: coverage.internalLinks !== null,
      earnedPct: coverage.internalLinks !== null ? capPct(coverage.internalLinks, INTERNAL_LINKS_MINIMUM_FOR_HEALTHY) : 0,
      raw: coverage.internalLinks !== null ? String(coverage.internalLinks) : "N/A — no public page yet",
    },
    {
      key: "structuredData",
      label: DIMENSION_LABELS.structuredData,
      applicable: Boolean(cfg?.structuredDataExpected),
      earnedPct: cfg?.structuredDataExpected ? 100 : 0,
      raw: cfg?.structuredDataExpected ? "Present (page template renders JSON-LD)" : "N/A — no page template yet",
    },
    {
      key: "images",
      label: DIMENSION_LABELS.images,
      applicable: node.hasImage !== null,
      earnedPct: node.hasImage ? 100 : 0,
      raw: node.hasImage === null ? "N/A — no image field for this type" : node.hasImage ? "Yes" : "No",
    },
    {
      key: "relatedTaxonomy",
      label: DIMENSION_LABELS.relatedTaxonomy,
      // computeCoverage() forces relatedServices to 0 for service nodes (a
      // service can't reference itself), so the dimension is meaningless —
      // not merely 0% — for that one type.
      applicable: node.type !== "service",
      earnedPct: node.type !== "service" ? capPct(coverage.relatedServices, RELATED_TAXONOMY_MINIMUM_FOR_HEALTHY) : 0,
      raw: node.type !== "service" ? String(coverage.relatedServices) : "N/A — services aren't cross-referenced by other services",
    },
    {
      key: "contentDepth",
      label: DIMENSION_LABELS.contentDepth,
      applicable: true,
      earnedPct: node.hasDescription ? Math.min(node.descriptionLength / CONTENT_DEPTH_TARGET_LENGTH, 1) * 100 : 0,
      raw: `${node.descriptionLength} chars`,
    },
    {
      key: "freshness",
      label: DIMENSION_LABELS.freshness,
      applicable: true,
      earnedPct: Math.max(0, 100 - (daysSinceEdit / (cfg?.staleAfterDays ?? 365)) * 100),
      raw: `${Math.round(daysSinceEdit)} days since last edit`,
    },
  ];
}

// ─── Weighting (two named tables, same 11 dimensions, both sum to 100) ─────

// Point 1's "Coverage Score" — evidence + structure only, no depth/freshness.
export const COVERAGE_WEIGHTS: Record<DimensionKey, number> = {
  portfolio: 20,
  testimonials: 15,
  transformations: 10,
  faqs: 12,
  articles: 13,
  internalLinks: 10,
  structuredData: 8,
  images: 7,
  relatedTaxonomy: 5,
  contentDepth: 0,
  freshness: 0,
};

// Point 2's "Authority Score" — same rank order, evidence weights shaved
// down to make room for contentDepth + freshness.
export const AUTHORITY_WEIGHTS: Record<DimensionKey, number> = {
  portfolio: 18,
  testimonials: 13,
  transformations: 9,
  faqs: 11,
  articles: 12,
  internalLinks: 9,
  structuredData: 7,
  images: 6,
  relatedTaxonomy: 5,
  contentDepth: 6,
  freshness: 4,
};

export interface ScoredDimension extends AuthorityDimension {
  weight: number;
  earnedPoints: number;
}

export interface ScoreBreakdown {
  dimensions: ScoredDimension[];
  totalScore: number;
}

// N/A-aware: inapplicable dimensions (e.g. Structured Data for a makeupStyle
// node with no public page) are excluded and the remaining weights
// proportionally rescaled so the total still maxes at 100 — generalizes
// computeCompleteness()'s existing hasImage===null redistribution.
function applyWeights(dims: AuthorityDimension[], weightTable: Record<DimensionKey, number>): ScoreBreakdown {
  const applicable = dims.filter((d) => d.applicable && weightTable[d.key] > 0);
  const rawWeightSum = applicable.reduce((sum, d) => sum + weightTable[d.key], 0);
  const scale = rawWeightSum > 0 ? 100 / rawWeightSum : 0;

  const dimensions: ScoredDimension[] = dims.map((d) => {
    const applies = d.applicable && weightTable[d.key] > 0;
    const weight = applies ? weightTable[d.key] * scale : 0;
    const earnedPoints = applies ? (d.earnedPct / 100) * weight : 0;
    return { ...d, weight, earnedPoints };
  });

  const totalScore = Math.round(dimensions.reduce((sum, d) => sum + d.earnedPoints, 0));
  return { dimensions, totalScore };
}

export function computeCoverageScore(node: TaxonomyNode, coverage: CoverageCounts): ScoreBreakdown {
  return applyWeights(computeAuthorityDimensions(node, coverage), COVERAGE_WEIGHTS);
}

export function computeAuthorityScore(node: TaxonomyNode, coverage: CoverageCounts): ScoreBreakdown {
  return applyWeights(computeAuthorityDimensions(node, coverage), AUTHORITY_WEIGHTS);
}

// ─── Orchestration ──────────────────────────────────────────────────────────

export interface TopicalAuthorityNode {
  taxonomyId: string;
  taxonomyType: string;
  taxonomyTypeLabel: string;
  taxonomyName: string;
  slug?: string;
  publicPath?: string;
  coverage: CoverageCounts;
  coverageScore: ScoreBreakdown;
  authorityScore: ScoreBreakdown;
}

export async function computeTopicalAuthority(fetchClient: FetchClient = client): Promise<TopicalAuthorityNode[]> {
  const nodes = await fetchAllTaxonomyNodes(fetchClient);

  const results = await Promise.all(
    nodes.map(async (node): Promise<TopicalAuthorityNode> => {
      const coverage = await computeCoverage(fetchClient, node);
      const cfg = TAXONOMY_TYPES.find((t) => t.type === node.type);
      return {
        taxonomyId: node.id,
        taxonomyType: node.type,
        taxonomyTypeLabel: node.typeLabel,
        taxonomyName: node.name,
        slug: node.slug,
        publicPath: cfg?.publicPath && node.slug ? cfg.publicPath(node.slug) : undefined,
        coverage,
        coverageScore: computeCoverageScore(node, coverage),
        authorityScore: computeAuthorityScore(node, coverage),
      };
    })
  );

  // Weakest first — matches the Content Intelligence page's convention,
  // since the weakest topics are the actionable ones.
  return results.sort((a, b) => a.authorityScore.totalScore - b.authorityScore.totalScore);
}

// ─── Persistence ────────────────────────────────────────────────────────────

interface StoredAuthorityDoc {
  _id: string;
  taxonomyId: string;
  status?: string;
  actionedAt?: string;
  history?: { date: string; coverageScore: number; authorityScore: number }[];
  firstSeenAt?: string;
}

function docIdForNode(type: string, id: string): string {
  return `topical-authority-${type}-${id}`;
}

export async function persistTopicalAuthority(nodes: TopicalAuthorityNode[]): Promise<{ upserted: number }> {
  const today = new Date().toISOString().slice(0, 10);
  const nowIso = new Date().toISOString();

  const existing = await client.fetch<StoredAuthorityDoc[]>(
    `*[_type == "topicalAuthorityNode"]{ _id, taxonomyId, status, actionedAt, history, firstSeenAt }`
  );
  const existingById = new Map(existing.map((e) => [e.taxonomyId, e]));

  let tx = writeClient.transaction();

  for (const node of nodes) {
    const prior = existingById.get(node.taxonomyId);
    const history = [...(prior?.history ?? [])];
    if (history[history.length - 1]?.date !== today) {
      history.push({
        date: today,
        coverageScore: node.coverageScore.totalScore,
        authorityScore: node.authorityScore.totalScore,
      });
    }

    tx = tx.createOrReplace({
      _id: docIdForNode(node.taxonomyType, node.taxonomyId),
      _type: "topicalAuthorityNode",
      taxonomyId: node.taxonomyId,
      taxonomyType: node.taxonomyType,
      taxonomyTypeLabel: node.taxonomyTypeLabel,
      taxonomyName: node.taxonomyName,
      slug: node.slug,
      publicPath: node.publicPath,
      coverage: node.coverage,
      coverageScore: node.coverageScore,
      authorityScore: node.authorityScore,
      status: prior?.status ?? "new",
      actionedAt: prior?.actionedAt,
      history,
      firstSeenAt: prior?.firstSeenAt ?? nowIso,
      lastComputedAt: nowIso,
    });
  }

  await tx.commit();
  return { upserted: nodes.length };
}

// ─── Read helpers (for the UI — no recomputation, just what's stored) ──────

export interface StoredTopicalAuthorityNode extends TopicalAuthorityNode {
  status: "new" | "acknowledged" | "in_progress" | "done" | "dismissed";
  actionedAt?: string;
  history: { date: string; coverageScore: number; authorityScore: number }[];
  firstSeenAt: string;
  lastComputedAt: string;
}

const AUTHORITY_PROJECTION = `{
  taxonomyId, taxonomyType, taxonomyTypeLabel, taxonomyName, slug, publicPath,
  coverage, coverageScore, authorityScore, status, actionedAt, history, firstSeenAt, lastComputedAt
}`;

export async function getTopicalAuthorityNodes(): Promise<StoredTopicalAuthorityNode[]> {
  return client.fetch<StoredTopicalAuthorityNode[]>(
    `*[_type == "topicalAuthorityNode"] | order(authorityScore.totalScore asc) ${AUTHORITY_PROJECTION}`
  );
}

export async function getTopicalAuthorityNode(type: string, id: string): Promise<StoredTopicalAuthorityNode | null> {
  return client.fetch<StoredTopicalAuthorityNode | null>(
    `*[_type == "topicalAuthorityNode" && taxonomyType == $type && taxonomyId == $id][0] ${AUTHORITY_PROJECTION}`,
    { type, id }
  );
}
