import { defineField, defineType } from "sanity";

export const locationSchema = defineType({
  name: "location",
  title: "Location",
  type: "document",
  description: "A service area page (e.g. Lekki, Ikeja). Promoted from a hardcoded file so it can be tagged with real proof content and gated by status before going live.",
  fields: [
    defineField({ name: "name", title: "Name", type: "string" }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "name" } }),
    defineField({ name: "city", title: "City", type: "reference", to: [{ type: "city" }] }),
    defineField({ name: "areas", title: "Areas Covered", type: "array", of: [{ type: "string" }] }),
    defineField({ name: "travelZone", title: "Travel Zone", type: "reference", to: [{ type: "travelZone" }] }),
    defineField({ name: "headline", title: "Headline", type: "string" }),
    defineField({ name: "subtitle", title: "Subtitle", type: "text" }),
    defineField({ name: "seoTitle", title: "SEO Title", type: "string" }),
    defineField({ name: "seoDescription", title: "SEO Description", type: "text" }),
    defineField({ name: "intro", title: "Intro Paragraphs", type: "array", of: [{ type: "text" }] }),
    defineField({ name: "keywords", title: "Keywords", type: "array", of: [{ type: "string" }] }),
    defineField({
      name: "localNotes",
      title: "Local Notes (optional)",
      type: "text",
      description: "Only fill in if there's something real and specific to say about this area — leave blank otherwise.",
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: { list: [{ title: "Draft", value: "draft" }, { title: "Published", value: "published" }], layout: "radio" },
      initialValue: "draft",
      description: "Only published locations appear on the site, in the sitemap, and in generated pages.",
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "status" },
  },
});
