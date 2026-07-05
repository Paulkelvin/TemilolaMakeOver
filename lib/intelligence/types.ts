export interface TaxonomyNode {
  id: string;
  type: string;
  typeLabel: string;
  name: string;
  slug?: string;
  hasDescription: boolean;
  descriptionLength: number;
  hasImage: boolean | null; // null = this taxonomy type has no image field at all
  hasSeoFields: boolean | null;
}

export interface CoverageCounts {
  portfolioItem: number;
  testimonial: number;
  faq: number;
  blogPost: number;
  transformation: number;
  relatedServices: number;
  internalLinks: number | null; // null = not measurable for this type (no public page yet)
}

export interface CompletenessBreakdown {
  leafScores: { type: string; label: string; count: number; minimum: number; weight: number; earned: number }[];
  metadataScore: { earned: number; max: number; reasons: string[] };
  total: number; // 0-100
}

export interface ContentGap {
  taxonomyId: string;
  taxonomyType: string;
  taxonomyName: string;
  kind: "missing-content" | "orphaned" | "untagged" | "broken-relationship";
  leafType?: string;
  message: string;
  severity: "high" | "medium" | "low";
}

export interface SeoReadiness {
  taxonomyId: string;
  taxonomyType: string;
  taxonomyName: string;
  issues: string[];
  ok: boolean;
}

export interface RoadmapRecommendation {
  taxonomyId: string;
  taxonomyType: string;
  taxonomyName: string;
  message: string;
  impact: number;
}

export interface PublishReadinessResult {
  aName: string;
  bName: string;
  counts: { label: string; count: number; minimum: number; met: boolean }[];
  ready: boolean;
  reasons: string[];
}
