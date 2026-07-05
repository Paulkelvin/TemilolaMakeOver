import { defineField, defineType } from "sanity";

export const transformationSchema = defineType({
  name: "transformation",
  title: "Before & After Transformation",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string" }),
    defineField({
      name: "beforeImage",
      title: "Before Image",
      type: "image",
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "beforeAlt", title: "Before Alt Text", type: "string" }),
    defineField({
      name: "afterImage",
      title: "After Image",
      type: "image",
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "afterAlt", title: "After Alt Text", type: "string" }),
    defineField({ name: "order", title: "Display Order", type: "number" }),
    defineField({ name: "service", title: "Service", type: "reference", to: [{ type: "service" }] }),
    defineField({ name: "style", title: "Makeup Style", type: "reference", to: [{ type: "makeupStyle" }] }),
    defineField({ name: "occasion", title: "Occasion", type: "reference", to: [{ type: "occasion" }] }),
    defineField({ name: "weddingType", title: "Wedding Type", type: "reference", to: [{ type: "weddingType" }] }),
    defineField({ name: "location", title: "Location", type: "reference", to: [{ type: "location" }] }),
    defineField({ name: "artist", title: "Artist", type: "reference", to: [{ type: "artist" }] }),
  ],
  orderings: [{ title: "Display Order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
  preview: {
    select: { title: "title", media: "afterImage" },
  },
});
