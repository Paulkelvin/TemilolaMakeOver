import { defineField, defineType } from "sanity";

export const aboutValueSchema = defineType({
  name: "aboutValue",
  title: "About — Philosophy Cards",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string" }),
    defineField({ name: "text", title: "Body Text", type: "text", rows: 3 }),
    defineField({
      name: "icon",
      title: "Icon",
      type: "string",
      options: {
        list: [
          { title: "Heart", value: "heart" },
          { title: "Award", value: "award" },
          { title: "Sparkles", value: "sparkles" },
          { title: "Star", value: "star" },
          { title: "Shield", value: "shield" },
        ],
        layout: "radio",
      },
    }),
    defineField({ name: "order", title: "Order", type: "number" }),
  ],
  orderings: [
    { title: "Display order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] },
  ],
  preview: {
    select: { title: "title", subtitle: "text" },
  },
});
