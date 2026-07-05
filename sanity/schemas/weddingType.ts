import { defineField, defineType } from "sanity";

export const weddingTypeSchema = defineType({
  name: "weddingType",
  title: "Wedding Type",
  type: "document",
  description: "Sub-taxonomy under the Wedding occasion (White Wedding, Yoruba Traditional, Igbo Traditional...) — its own type because this is the deepest, most-researched content opportunity on the site.",
  fields: [
    defineField({ name: "name", title: "Name", type: "string" }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "name" } }),
    defineField({ name: "description", title: "Description", type: "text" }),
    defineField({
      name: "culturalNotes",
      title: "Cultural Notes",
      type: "text",
      description: "Only fill in real, business-verified detail (gele/aso-oke conventions, color meaning, etc.) — leave blank rather than invent something generic.",
    }),
    defineField({ name: "image", title: "Image", type: "image", options: { hotspot: true } }),
    defineField({ name: "order", title: "Display Order", type: "number" }),
  ],
  orderings: [{ title: "Display Order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
  preview: {
    select: { title: "name", subtitle: "description" },
  },
});
