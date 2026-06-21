import { defineField, defineType } from "sanity";

export const portfolioItemSchema = defineType({
  name: "portfolioItem",
  title: "Portfolio Item",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string" }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "alt", title: "Alt Text", type: "string" }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Bridal", value: "Bridal" },
          { title: "Soft Glam", value: "Soft Glam" },
          { title: "Event Glam", value: "Event Glam" },
          { title: "Traditional", value: "Traditional" },
          { title: "Photoshoot", value: "Photoshoot" },
          { title: "Before & After", value: "Before & After" },
        ],
      },
    }),
    defineField({
      name: "aspect",
      title: "Aspect Ratio",
      type: "string",
      options: {
        list: [
          { title: "Portrait", value: "portrait" },
          { title: "Square", value: "square" },
          { title: "Tall", value: "tall" },
        ],
      },
    }),
    defineField({ name: "order", title: "Display Order", type: "number" }),
  ],
  orderings: [{ title: "Display Order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
  preview: {
    select: { title: "title", subtitle: "category", media: "image" },
  },
});
