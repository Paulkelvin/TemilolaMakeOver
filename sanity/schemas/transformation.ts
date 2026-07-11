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
      name: "beforeFocusY",
      title: "Before — vertical focus (%)",
      type: "number",
      validation: (rule) => rule.min(0).max(100),
      description:
        "0 = top of image, 100 = bottom. Adjust so the head lines up with the After image when the slider is dragged across — compare the two on the /transformations page and nudge until eyes/hairline match. Defaults to 50 (centered) if left blank.",
    }),
    defineField({
      name: "afterImage",
      title: "After Image",
      type: "image",
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "afterAlt", title: "After Alt Text", type: "string" }),
    defineField({
      name: "afterFocusY",
      title: "After — vertical focus (%)",
      type: "number",
      validation: (rule) => rule.min(0).max(100),
      description: "Same as Before's vertical focus, for the After image. Defaults to 50 (centered) if left blank.",
    }),
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
