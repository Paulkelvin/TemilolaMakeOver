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
        { _id: string; name: string; slug?: string; description?: string; image?: unknown; seoTitle?: string; seoDescription?: string }[]
      >(
        `*[_type == $type] { _id, "name": ${cfg.nameField}, "slug": slug.current, "description": ${cfg.descriptionField ?? "null"}, ${
          cfg.imageField ? `"image": ${cfg.imageField},` : ""
        } seoTitle, seoDescription }`,
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
