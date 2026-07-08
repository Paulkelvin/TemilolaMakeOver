/**
 * Curated, hand-maintained expected-entity lists for the site's major real
 * topics — same convention as PRIORITY_KEYWORDS/COMPETITOR_SITES in
 * registry.ts/competitor-registry.ts. No AI, nothing inferred: every entity
 * here is a real, standard term from the Nigerian bridal/makeup industry
 * (gele, aso-oke, aso-ebi, etc.), curated for a handful of the site's
 * highest-priority topics to start — Temilola should refine/expand these
 * lists over time as she has the real domain expertise this session doesn't.
 *
 * Keyed by taxonomy type + exact node name (not slug — slugs on this site
 * aren't uniformly lowercase, e.g. "Soft-glam", so matching on the
 * already-fetched real name is more robust than guessing a slug format).
 */

export interface EntityTopicConfig {
  taxonomyType: string;
  taxonomyName: string;
  expectedEntities: string[];
}

export const ENTITY_COVERAGE_TOPICS: EntityTopicConfig[] = [
  {
    taxonomyType: "service",
    taxonomyName: "Bridal Makeup",
    expectedEntities: [
      "gele", "aso oke", "aso ebi", "bridal trial", "skin preparation", "primer",
      "setting spray", "waterproof", "touch-up kit", "photography", "flashback",
      "humidity", "reception", "ceremony", "bridal timeline", "veil",
    ],
  },
  {
    taxonomyType: "weddingType",
    taxonomyName: "Traditional Wedding",
    expectedEntities: [
      "gele", "aso oke", "aso ebi", "coral beads", "traditional attire",
      "cultural rites", "yoruba", "igbo", "engagement", "dowry", "family blessing",
    ],
  },
  {
    taxonomyType: "occasion",
    taxonomyName: "Owambe / Party",
    expectedEntities: [
      "aso ebi", "gele", "party makeup", "long-lasting", "photo-ready",
      "touch-up", "group booking", "asoebi ladies", "celebrant",
    ],
  },
  {
    taxonomyType: "makeupStyle",
    taxonomyName: "Soft Glam",
    expectedEntities: [
      "natural finish", "dewy", "everyday makeup", "light coverage",
      "no-makeup look", "office appropriate", "understated",
    ],
  },
];

export function getEntityConfig(taxonomyType: string, taxonomyName: string): EntityTopicConfig | undefined {
  return ENTITY_COVERAGE_TOPICS.find(
    (c) => c.taxonomyType === taxonomyType && c.taxonomyName.toLowerCase() === taxonomyName.toLowerCase()
  );
}
