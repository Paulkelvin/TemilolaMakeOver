import { defineField, defineType } from "sanity";

const dimensionFields = [
  defineField({ name: "key", title: "Key", type: "string" }),
  defineField({ name: "label", title: "Label", type: "string" }),
  defineField({ name: "applicable", title: "Applicable", type: "boolean" }),
  defineField({ name: "earnedPct", title: "Earned %", type: "number" }),
  defineField({ name: "raw", title: "Raw evidence", type: "string" }),
  defineField({ name: "weight", title: "Weight", type: "number" }),
  defineField({ name: "earnedPoints", title: "Earned points", type: "number" }),
];

const scoreObjectFields = [
  defineField({ name: "totalScore", title: "Total score", type: "number" }),
  defineField({
    name: "dimensions",
    title: "Dimensions",
    type: "array",
    description: "Every named dimension that fed the total, with its raw evidence, weight, and point contribution — the full \"Why?\" breakdown.",
    of: [{ type: "object", fields: dimensionFields }],
  }),
];

export const topicalAuthorityNodeSchema = defineType({
  name: "topicalAuthorityNode",
  title: "Topical Authority",
  type: "document",
  description:
    "System-generated. One row per taxonomy node (service, style, occasion, wedding type, location, artist) — real evidence counts (portfolio/testimonials/transformations/FAQs/blog posts/internal links/structured data/images/related taxonomy) and two derived scores: Coverage Score (replaces the old description-length proxy) and Authority Score (adds content depth + freshness). Recomputed weekly by the snapshot cron; status/actionedAt are the only fields meant to be hand-edited, everything else is overwritten on each run (history is appended, not replaced).",
  fields: [
    defineField({ name: "taxonomyId", title: "Taxonomy ID", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "taxonomyType", title: "Taxonomy type", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "taxonomyTypeLabel", title: "Taxonomy type label", type: "string" }),
    defineField({ name: "taxonomyName", title: "Taxonomy name", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "slug", title: "Slug", type: "string" }),
    defineField({ name: "publicPath", title: "Public path", type: "string", description: "Live page path, if this type has one, e.g. \"/services/bridal-makeup\"." }),

    defineField({
      name: "coverage",
      title: "Raw coverage counts",
      type: "object",
      description: "The real evidence counts, straight from Sanity — the literal numbers the dashboard shows.",
      fields: [
        defineField({ name: "portfolioItem", title: "Portfolio items", type: "number" }),
        defineField({ name: "testimonial", title: "Testimonials", type: "number" }),
        defineField({ name: "faq", title: "FAQs", type: "number" }),
        defineField({ name: "blogPost", title: "Blog posts", type: "number" }),
        defineField({ name: "transformation", title: "Transformations", type: "number" }),
        defineField({ name: "relatedServices", title: "Related services", type: "number" }),
        defineField({ name: "internalLinks", title: "Internal links", type: "number", description: "Null when this type has no public page to link to." }),
      ],
    }),

    defineField({
      name: "coverageScore",
      title: "Coverage score",
      type: "object",
      description: "Evidence + structure only (no content depth/freshness) — replaces the old description-length coverage proxy used by the SEO Opportunity and Keyword Discovery engines.",
      fields: scoreObjectFields,
    }),
    defineField({
      name: "authorityScore",
      title: "Authority score",
      type: "object",
      description: "Same evidence, plus content depth and freshness — the headline Topical Authority number for this node.",
      fields: scoreObjectFields,
    }),

    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "New", value: "new" },
          { title: "Acknowledged", value: "acknowledged" },
          { title: "In progress", value: "in_progress" },
          { title: "Done", value: "done" },
          { title: "Dismissed", value: "dismissed" },
        ],
      },
      initialValue: "new",
      description: "The only field on this document meant for hand-editing, along with Actioned at.",
    }),
    defineField({ name: "actionedAt", title: "Actioned at", type: "datetime" }),

    defineField({
      name: "history",
      title: "History",
      type: "array",
      description: "One entry appended per computation run — the progress-over-time record.",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "date", title: "Date", type: "date" }),
            defineField({ name: "coverageScore", title: "Coverage score", type: "number" }),
            defineField({ name: "authorityScore", title: "Authority score", type: "number" }),
          ],
        },
      ],
    }),

    defineField({ name: "firstSeenAt", title: "First seen at", type: "datetime", readOnly: true }),
    defineField({ name: "lastComputedAt", title: "Last computed at", type: "datetime", readOnly: true }),
  ],
  orderings: [
    { title: "Authority, highest first", name: "authorityDesc", by: [{ field: "authorityScore.totalScore", direction: "desc" }] },
    { title: "Authority, lowest first", name: "authorityAsc", by: [{ field: "authorityScore.totalScore", direction: "asc" }] },
    { title: "Coverage, highest first", name: "coverageDesc", by: [{ field: "coverageScore.totalScore", direction: "desc" }] },
  ],
  preview: {
    select: {
      title: "taxonomyName",
      type: "taxonomyTypeLabel",
      authority: "authorityScore.totalScore",
      coverage: "coverageScore.totalScore",
    },
    prepare({ title, type, authority, coverage }) {
      return {
        title: title ?? "Untitled node",
        subtitle: `${type ?? "?"} · Authority ${authority ?? "?"}% · Coverage ${coverage ?? "?"}%`,
      };
    },
  },
});
