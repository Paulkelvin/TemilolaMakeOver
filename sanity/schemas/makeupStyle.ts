import { defineField, defineType } from "sanity";

export const makeupStyleSchema = defineType({
  name: "makeupStyle",
  title: "Makeup Style",
  type: "document",
  description: "The aesthetic itself (Soft Glam, Bold Glam...) kept separate from bookable service packages, so a style can be discussed, tagged, and filtered on even when no single service sells it standalone.",
  fields: [
    defineField({ name: "name", title: "Name", type: "string" }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "name" } }),
    defineField({ name: "description", title: "Description", type: "text" }),
    defineField({ name: "bestFor", title: "Best For", type: "text", description: "When to choose this style" }),
    defineField({ name: "image", title: "Image", type: "image", options: { hotspot: true } }),
    defineField({ name: "order", title: "Display Order", type: "number" }),
  ],
  orderings: [{ title: "Display Order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
  preview: {
    select: { title: "name", subtitle: "bestFor" },
  },
});
