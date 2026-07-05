/**
 * Single source of truth for the Content Intelligence dashboard.
 *
 * To wire up a brand new content type (a future `product`, `event`,
 * `collaboration`, `campaign`...), add ONE entry to LEAF_TYPES (if it's
 * "proof" content that references taxonomies) and/or ONE entry to
 * TAXONOMY_TYPES (if it's itself something pages get built around).
 * Every report in the dashboard — coverage, completeness score, gap
 * detection, the relationship explorer, SEO readiness, the roadmap, and
 * publish readiness — reads from these two arrays. No other file needs to
 * change for a new type to show up everywhere.
 */

export interface LeafTypeConfig {
  /** Sanity `_type` name. */
  type: string;
  label: string;
  /** Points this type contributes to a taxonomy's 100-point completeness score. */
  weight: number;
  /** Count below which this is flagged as a content gap. */
  minimumForHealthy: number;
  /** Field used as the human-readable title when listing documents of this type. */
  titleField: string;
  /**
   * GROQ expression selecting this leaf's main body text, for thin-content
   * detection. Omit for image-only types (portfolioItem, transformation)
   * where a word-count floor wouldn't mean anything.
   */
  textFieldExpr?: string;
  minTextLength?: number;
  /**
   * Days after which this type is flagged stale. Only set for genuinely
   * time-sensitive content (a pricing guide going out of date) — most
   * taxonomy-adjacent content (a testimonial, a portfolio caption) has no
   * natural "expiry" and is deliberately left unset.
   */
  staleAfterDays?: number;
}

// Weights sum to 85 — the remaining 15 points come from the taxonomy's own
// metadata completeness (description + image), computed separately per type
// since not every taxonomy has an image field.
export const LEAF_TYPES: LeafTypeConfig[] = [
  { type: "portfolioItem", label: "Portfolio Items", weight: 25, minimumForHealthy: 3, titleField: "title" },
  { type: "testimonial", label: "Testimonials", weight: 20, minimumForHealthy: 2, titleField: "name", textFieldExpr: "text", minTextLength: 40 },
  { type: "faq", label: "FAQs", weight: 15, minimumForHealthy: 2, titleField: "question", textFieldExpr: "answer", minTextLength: 60 },
  { type: "blogPost", label: "Blog Posts", weight: 15, minimumForHealthy: 1, titleField: "title", textFieldExpr: "pt::text(body)", minTextLength: 300, staleAfterDays: 365 },
  { type: "transformation", label: "Transformations", weight: 10, minimumForHealthy: 1, titleField: "title" },
];

export const METADATA_WEIGHT = 15;

export interface TaxonomyTypeConfig {
  type: string;
  label: string;
  nameField: string;
  /** Field holding a description/bio-like text, used for the thin-content check. */
  descriptionField?: string;
  /** Does this schema have an image/photo field? */
  imageField?: string;
  /** Does this schema have explicit seoTitle/seoDescription fields (only `location` today)? */
  hasSeoFields?: boolean;
  /** Public route this type resolves to, for internal-link measurement and SEO checks. `null` = no public page yet. */
  publicPath: ((slug: string) => string) | null;
}

export const TAXONOMY_TYPES: TaxonomyTypeConfig[] = [
  { type: "service", label: "Services", nameField: "name", descriptionField: "description", imageField: "image", publicPath: (slug) => `/services/${slug}` },
  { type: "makeupStyle", label: "Makeup Styles", nameField: "name", descriptionField: "description", imageField: "image", publicPath: null },
  { type: "occasion", label: "Occasions", nameField: "name", descriptionField: "description", hasSeoFields: true, publicPath: null },
  { type: "weddingType", label: "Wedding Types", nameField: "name", descriptionField: "description", imageField: "image", publicPath: null },
  { type: "location", label: "Locations", nameField: "name", descriptionField: "subtitle", hasSeoFields: true, publicPath: (slug) => `/locations/${slug}` },
  { type: "artist", label: "Artists", nameField: "name", descriptionField: "bio", imageField: "photo", publicPath: null },
];

// Known reference field names, used only for the broken-relationship scan
// (references() alone can't tell us WHICH field is dangling). Add a field
// here if a new leaf/taxonomy type introduces a new reference field name.
export const KNOWN_REFERENCE_FIELDS = [
  "service",
  "style",
  "occasion",
  "weddingType",
  "location",
  "artist",
  "city",
  "travelZone",
];

// Slug/name fragments that bump a taxonomy item's priority in the content
// roadmap — reflects the bridal-first strategy established for this site.
export const PRIORITY_KEYWORDS = ["bridal", "wedding", "traditional"];
