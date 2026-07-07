import {
  LEAF_TYPES,
  TAXONOMY_TYPES,
  METADATA_WEIGHT,
  KNOWN_REFERENCE_FIELDS,
  PRIORITY_KEYWORDS,
  type TaxonomyTypeConfig,
} from "./registry";
import type {
  TaxonomyNode,
  CoverageCounts,
  CompletenessBreakdown,
  ContentGap,
  SeoReadiness,
  RoadmapRecommendation,
  PublishReadinessResult,
} from "./types";

// Minimal shape both the Studio's useClient() result and a plain
// @sanity/client instance satisfy — keeps this module usable from the
// Studio Tool and from a standalone verification script alike.
export interface FetchClient {
  fetch: <T = unknown>(query: string, params?: Record<string, unknown>) => Promise<T>;
}

// ─── Taxonomy nodes ──────────────────────────────────────────────────────────

export async function fetchAllTaxonomyNodes(client: FetchClient): Promise<TaxonomyNode[]> {
  const results = await Promise.all(
    TAXONOMY_TYPES.map(async (cfg) => {
      const raw = await client.fetch<
        { _id: string; name: string; slug?: string; description?: string; image?: unknown; seoTitle?: string; seoDescription?: string; _updatedAt: string }[]
      >(
        `*[_type == $type] { _id, "name": ${cfg.nameField}, "slug": slug.current, "description": ${cfg.descriptionField ?? "null"}, ${
          cfg.imageField ? `"image": ${cfg.imageField},` : ""
        } seoTitle, seoDescription, _updatedAt }`,
        { type: cfg.type }
      );
      return raw.map((r): TaxonomyNode => ({
        id: r._id,
        type: cfg.type,
        typeLabel: cfg.label,
        name: r.name ?? "(untitled)",
        slug: r.slug,
        hasDescription: Boolean(r.description && r.description.trim().length > 0),
        descriptionLength: r.description?.trim().length ?? 0,
        hasImage: cfg.imageField ? Boolean(r.image) : null,
        hasSeoFields: cfg.hasSeoFields ? Boolean(r.seoTitle && r.seoDescription) : null,
        updatedAt: r._updatedAt,
      }));
    })
  );
  return results.flat();
}

// ─── Coverage ────────────────────────────────────────────────────────────────

export async function computeCoverage(client: FetchClient, node: TaxonomyNode): Promise<CoverageCounts> {
  const leafCounts = await Promise.all(
    LEAF_TYPES.map((leaf) =>
      client.fetch<number>(`count(*[_type == $leafType && references($id)])`, { leafType: leaf.type, id: node.id })
    )
  );
  const relatedServices = await client.fetch<number>(
    `count(*[_type == "service" && references($id)])`,
    { id: node.id }
  );

  const cfg = TAXONOMY_TYPES.find((t) => t.type === node.type);
  const publicPath = cfg?.publicPath?.(node.slug ?? "") ?? null;
  const internalLinks = publicPath
    ? await client.fetch<number>(`count(*[_type == "blogPost" && $path in body[].markDefs[].href])`, { path: publicPath })
    : null;

  const counts: Record<string, number> = {};
  LEAF_TYPES.forEach((leaf, i) => {
    counts[leaf.type] = leafCounts[i];
  });

  return {
    portfolioItem: counts.portfolioItem ?? 0,
    testimonial: counts.testimonial ?? 0,
    faq: counts.faq ?? 0,
    blogPost: counts.blogPost ?? 0,
    transformation: counts.transformation ?? 0,
    relatedServices: node.type === "service" ? 0 : relatedServices,
    internalLinks,
  };
}

// ─── Completeness score ──────────────────────────────────────────────────────

export function computeCompleteness(node: TaxonomyNode, coverage: CoverageCounts): CompletenessBreakdown {
  const leafScores = LEAF_TYPES.map((leaf) => {
    const count = (coverage as unknown as Record<string, number>)[leaf.type] ?? 0;
    const earned = Math.min(count / leaf.minimumForHealthy, 1) * leaf.weight;
    return { type: leaf.type, label: leaf.label, count, minimum: leaf.minimumForHealthy, weight: leaf.weight, earned };
  });

  const reasons: string[] = [];
  let metadataEarned = 0;
  const descriptionPoints = node.hasImage === null ? METADATA_WEIGHT : METADATA_WEIGHT * (2 / 3);
  const imagePoints = METADATA_WEIGHT - descriptionPoints;

  if (node.hasDescription && node.descriptionLength >= 60) {
    metadataEarned += descriptionPoints;
  } else {
    reasons.push(node.hasDescription ? "Description is too short (under 60 characters)" : "No description written");
  }
  if (node.hasImage !== null) {
    if (node.hasImage) metadataEarned += imagePoints;
    else reasons.push("No image set");
  }

  const leafTotal = leafScores.reduce((sum, s) => sum + s.earned, 0);
  const total = Math.round(leafTotal + metadataEarned);

  return {
    leafScores,
    metadataScore: { earned: Math.round(metadataEarned), max: METADATA_WEIGHT, reasons },
    total,
  };
}

// ─── Gap detection ───────────────────────────────────────────────────────────

export async function detectMissingContentGaps(node: TaxonomyNode, coverage: CoverageCounts): Promise<ContentGap[]> {
  const gaps: ContentGap[] = [];
  for (const leaf of LEAF_TYPES) {
    const count = (coverage as unknown as Record<string, number>)[leaf.type] ?? 0;
    if (count < leaf.minimumForHealthy) {
      gaps.push({
        taxonomyId: node.id,
        taxonomyType: node.type,
        taxonomyName: node.name,
        kind: "missing-content",
        leafType: leaf.type,
        message: `${node.typeLabel} "${node.name}" has ${count} ${leaf.label.toLowerCase()} (recommended: ${leaf.minimumForHealthy}+).`,
        severity: count === 0 ? "high" : "medium",
      });
    }
  }
  return gaps;
}

export async function detectOrphanedAndUntagged(client: FetchClient): Promise<ContentGap[]> {
  const gaps: ContentGap[] = [];
  const refFields = ["service", "style", "occasion", "weddingType", "location"];
  for (const leaf of LEAF_TYPES) {
    if (leaf.type === "faq" || leaf.type === "blogPost") continue; // these are legitimately often untagged (general content)
    const noTagsFilter = refFields.map((f) => `!defined(${f})`).join(" && ");
    const orphaned = await client.fetch<{ _id: string; title?: string }[]>(
      `*[_type == $type && ${noTagsFilter}]{ _id, "title": coalesce(title, name, question) }`,
      { type: leaf.type }
    );
    for (const doc of orphaned) {
      gaps.push({
        taxonomyId: doc._id,
        taxonomyType: leaf.type,
        taxonomyName: doc.title ?? doc._id,
        kind: "orphaned",
        leafType: leaf.type,
        message: `${leaf.label} item "${doc.title ?? doc._id}" isn't tagged to any service, style, occasion, wedding type, or location.`,
        severity: "low",
      });
    }
    const missingArtist = await client.fetch<{ _id: string; title?: string }[]>(
      `*[_type == $type && !defined(artist)]{ _id, "title": coalesce(title, name) }`,
      { type: leaf.type }
    );
    for (const doc of missingArtist) {
      gaps.push({
        taxonomyId: doc._id,
        taxonomyType: leaf.type,
        taxonomyName: doc.title ?? doc._id,
        kind: "untagged",
        leafType: leaf.type,
        message: `${leaf.label} item "${doc.title ?? doc._id}" has no artist attributed.`,
        severity: "low",
      });
    }
  }
  return gaps;
}

export async function detectBrokenRelationships(client: FetchClient): Promise<ContentGap[]> {
  const gaps: ContentGap[] = [];
  const allTypes = [...LEAF_TYPES.map((l) => l.type), ...TAXONOMY_TYPES.map((t) => t.type)];
  for (const type of allTypes) {
    for (const field of KNOWN_REFERENCE_FIELDS) {
      const broken = await client.fetch<{ _id: string; title?: string }[]>(
        `*[_type == $type && defined(${field}._ref) && !defined(${field}->_id)]{ _id, "title": coalesce(title, name, question) }`,
        { type }
      );
      for (const doc of broken) {
        gaps.push({
          taxonomyId: doc._id,
          taxonomyType: type,
          taxonomyName: doc.title ?? doc._id,
          kind: "broken-relationship",
          message: `"${doc.title ?? doc._id}" (${type}) has a "${field}" reference pointing to a deleted document.`,
          severity: "high",
        });
      }
    }
  }
  return gaps;
}

// ─── SEO readiness ───────────────────────────────────────────────────────────

export function computeSeoReadiness(node: TaxonomyNode, coverage: CoverageCounts): SeoReadiness {
  const cfg = TAXONOMY_TYPES.find((t) => t.type === node.type) as TaxonomyTypeConfig;
  const issues: string[] = [];

  if (cfg.hasSeoFields && !node.hasSeoFields) issues.push("Missing SEO title/description fields");
  if (!node.hasDescription || node.descriptionLength < 60) issues.push("Thin content: description is missing or under 60 characters");
  if (cfg.imageField && !node.hasImage) issues.push("Missing image (used as the Open Graph image source)");
  if (coverage.testimonial === 0) issues.push("No testimonials — AggregateRating/Review structured data would have nothing to show");
  if (cfg.publicPath && coverage.internalLinks === 0) issues.push("No internal links point to this page from blog content");
  if (coverage.portfolioItem === 0 && coverage.testimonial === 0 && coverage.blogPost === 0) {
    issues.push("Low supporting content overall — this page would likely read as thin to search engines");
  }

  return { taxonomyId: node.id, taxonomyType: node.type, taxonomyName: node.name, issues, ok: issues.length === 0 };
}

// ─── Content roadmap ─────────────────────────────────────────────────────────

export function buildRoadmap(
  nodes: TaxonomyNode[],
  coverageByNode: Map<string, CoverageCounts>
): RoadmapRecommendation[] {
  const recs: RoadmapRecommendation[] = [];

  for (const node of nodes) {
    const coverage = coverageByNode.get(node.id);
    if (!coverage) continue;
    const priorityBonus = PRIORITY_KEYWORDS.some((k) => node.name.toLowerCase().includes(k)) ? 1.4 : 1;

    for (const leaf of LEAF_TYPES) {
      const count = (coverage as unknown as Record<string, number>)[leaf.type] ?? 0;
      if (count >= leaf.minimumForHealthy) continue;
      const deficit = leaf.minimumForHealthy - count;
      const impact = leaf.weight * (deficit / leaf.minimumForHealthy) * priorityBonus;

      const strongAreas = LEAF_TYPES.filter((l) => l.type !== leaf.type && (coverage as unknown as Record<string, number>)[l.type] >= l.minimumForHealthy);
      const strongNote = strongAreas.length > 0 ? ` — it already has strong ${strongAreas[0].label.toLowerCase()}` : "";

      recs.push({
        taxonomyId: node.id,
        taxonomyType: node.type,
        taxonomyName: node.name,
        message: `${node.name} needs ${deficit} more ${leaf.label.toLowerCase()}${strongNote}.`,
        impact,
      });
    }
  }

  return recs.sort((a, b) => b.impact - a.impact);
}

// ─── Publish readiness (combination pages) ──────────────────────────────────

export async function computePublishReadiness(
  client: FetchClient,
  a: { id: string; name: string },
  b: { id: string; name: string }
): Promise<PublishReadinessResult> {
  const thresholds = [
    { type: "portfolioItem", label: "Portfolio", minimum: 3 },
    { type: "testimonial", label: "Testimonials", minimum: 2 },
    { type: "faq", label: "FAQs", minimum: 1 },
    { type: "blogPost", label: "Blog", minimum: 1 },
  ];

  const counts = await Promise.all(
    thresholds.map((t) =>
      client.fetch<number>(`count(*[_type == $type && references($a) && references($b)])`, { type: t.type, a: a.id, b: b.id })
    )
  );

  const results = thresholds.map((t, i) => ({ label: t.label, count: counts[i], minimum: t.minimum, met: counts[i] >= t.minimum }));
  const metCount = results.filter((r) => r.met).length;
  const ready = metCount >= 3; // at least 3 of 4 proof types must clear their bar

  const reasons = ready
    ? [`Meets the bar on ${metCount} of ${results.length} proof types.`]
    : results.filter((r) => !r.met).map((r) => `${r.label}: ${r.count} (needs ${r.minimum}+)`);

  return { aName: a.name, bName: b.name, counts: results, ready, reasons };
}

// ─── Relationship explorer ───────────────────────────────────────────────────

export interface RelatedDocument {
  id: string;
  type: string;
  typeLabel: string;
  title: string;
}

export async function getRelatedDocuments(client: FetchClient, node: TaxonomyNode): Promise<RelatedDocument[]> {
  const results = await Promise.all(
    LEAF_TYPES.map(async (leaf) => {
      const docs = await client.fetch<{ _id: string; title: string }[]>(
        `*[_type == $type && references($id)]{ _id, "title": ${leaf.titleField} }`,
        { type: leaf.type, id: node.id }
      );
      return docs.map((d): RelatedDocument => ({ id: d._id, type: leaf.type, typeLabel: leaf.label, title: d.title ?? d._id }));
    })
  );
  const services = await client.fetch<{ _id: string; name: string }[]>(
    `*[_type == "service" && references($id)]{ _id, name }`,
    { id: node.id }
  );
  results.push(services.map((s): RelatedDocument => ({ id: s._id, type: "service", typeLabel: "Services", title: s.name })));
  return results.flat();
}

// One hop further: for each document related to `node`, which OTHER
// taxonomy nodes does that document itself point to? Lets the explorer go
// location -> portfolio item -> the style/occasion that same item is
// tagged with, without hand-building a graph engine.
const SECOND_HOP_FIELDS: { field: string; type: string }[] = [
  { field: "service", type: "service" },
  { field: "style", type: "makeupStyle" },
  { field: "occasion", type: "occasion" },
  { field: "weddingType", type: "weddingType" },
  { field: "location", type: "location" },
  { field: "artist", type: "artist" },
];

export interface RelatedDocumentWithTags extends RelatedDocument {
  tags: { type: string; id: string; name: string }[];
}

export async function getRelatedDocumentsWithTags(
  client: FetchClient,
  node: TaxonomyNode
): Promise<RelatedDocumentWithTags[]> {
  const base = await getRelatedDocuments(client, node);
  return Promise.all(
    base.map(async (doc): Promise<RelatedDocumentWithTags> => {
      const raw = await client.fetch<Record<string, { _id: string; name: string } | null>>(
        `*[_id == $id][0]{ ${SECOND_HOP_FIELDS.map((r) => `"${r.field}": ${r.field}->{_id, name}`).join(", ")} }`,
        { id: doc.id }
      );
      const tags = SECOND_HOP_FIELDS.map((r) => {
        const val = raw?.[r.field];
        return val ? { type: r.type, id: val._id, name: val.name } : null;
      }).filter((t): t is { type: string; id: string; name: string } => t !== null && t.id !== node.id);
      return { ...doc, tags };
    })
  );
}

// ─── Thin content ────────────────────────────────────────────────────────────

export interface ThinContentItem {
  id: string;
  type: string;
  typeLabel: string;
  title: string;
  textLength: number;
  minimum: number;
}

export async function detectThinContent(client: FetchClient): Promise<ThinContentItem[]> {
  const items: ThinContentItem[] = [];
  for (const leaf of LEAF_TYPES) {
    if (!leaf.textFieldExpr || !leaf.minTextLength) continue;
    const docs = await client.fetch<{ _id: string; title?: string; text?: string }[]>(
      `*[_type == $type]{ _id, "title": coalesce(title, name, question), "text": ${leaf.textFieldExpr} }`,
      { type: leaf.type }
    );
    for (const doc of docs) {
      const length = (doc.text ?? "").trim().length;
      if (length < leaf.minTextLength) {
        items.push({
          id: doc._id,
          type: leaf.type,
          typeLabel: leaf.label,
          title: doc.title ?? doc._id,
          textLength: length,
          minimum: leaf.minTextLength,
        });
      }
    }
  }
  return items;
}

// ─── Stale content ───────────────────────────────────────────────────────────

export interface StaleContentItem {
  id: string;
  type: string;
  typeLabel: string;
  title: string;
  updatedAt: string;
  daysSinceUpdate: number;
}

export async function detectStaleContent(client: FetchClient): Promise<StaleContentItem[]> {
  const items: StaleContentItem[] = [];
  const now = Date.now();
  for (const leaf of LEAF_TYPES) {
    if (!leaf.staleAfterDays) continue;
    const docs = await client.fetch<{ _id: string; title?: string; _updatedAt: string }[]>(
      `*[_type == $type]{ _id, "title": coalesce(title, name, question), _updatedAt }`,
      { type: leaf.type }
    );
    for (const doc of docs) {
      const daysSinceUpdate = Math.floor((now - new Date(doc._updatedAt).getTime()) / 86_400_000);
      if (daysSinceUpdate >= leaf.staleAfterDays) {
        items.push({
          id: doc._id,
          type: leaf.type,
          typeLabel: leaf.label,
          title: doc.title ?? doc._id,
          updatedAt: doc._updatedAt,
          daysSinceUpdate,
        });
      }
    }
  }
  return items.sort((a, b) => b.daysSinceUpdate - a.daysSinceUpdate);
}

// ─── Generation eligibility (locations gated on real proof) ─────────────────

const GENERATION_PROOF_THRESHOLDS = [
  { type: "portfolioItem", label: "Portfolio", minimum: 3 },
  { type: "testimonial", label: "Testimonials", minimum: 1 },
];

export interface GenerationEligibility {
  id: string;
  name: string;
  currentStatus: "draft" | "published";
  proof: { label: string; count: number; minimum: number; met: boolean }[];
  proofMet: boolean;
  /** "published" = already live. "eligible" = draft but proof bar cleared, ready to flip live. "blocked" = draft, still short on proof. */
  state: "published" | "eligible" | "blocked";
}

export async function computeGenerationEligibility(client: FetchClient): Promise<GenerationEligibility[]> {
  const locations = await client.fetch<{ _id: string; name: string; status?: string }[]>(
    `*[_type == "location"]{ _id, name, status }`
  );

  return Promise.all(
    locations.map(async (loc): Promise<GenerationEligibility> => {
      const proof = await Promise.all(
        GENERATION_PROOF_THRESHOLDS.map(async (t) => {
          const count = await client.fetch<number>(
            `count(*[_type == $type && location._ref == $id])`,
            { type: t.type, id: loc._id }
          );
          return { label: t.label, count, minimum: t.minimum, met: count >= t.minimum };
        })
      );
      const proofMet = proof.every((p) => p.met);
      const currentStatus: "draft" | "published" = loc.status === "published" ? "published" : "draft";
      const state: GenerationEligibility["state"] =
        currentStatus === "published" ? "published" : proofMet ? "eligible" : "blocked";

      return { id: loc._id, name: loc.name, currentStatus, proof, proofMet, state };
    })
  );
}
