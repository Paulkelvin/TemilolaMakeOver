import { defineField, defineType } from "sanity";

export const faqSchema = defineType({
  name: "faq",
  title: "FAQ",
  type: "document",
  fields: [
    defineField({ name: "question", title: "Question", type: "string" }),
    defineField({ name: "answer", title: "Answer", type: "text" }),
    defineField({
      name: "category",
      title: "Category",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "General", value: "general" },
          { title: "Pricing", value: "pricing" },
        ],
      },
      description: "Where this question shows up. A question can belong to more than one category.",
      initialValue: ["general"],
    }),
    defineField({ name: "order", title: "Display Order", type: "number" }),
    defineField({ name: "service", title: "Service", type: "reference", to: [{ type: "service" }] }),
    defineField({ name: "occasion", title: "Occasion", type: "reference", to: [{ type: "occasion" }] }),
    defineField({ name: "location", title: "Location", type: "reference", to: [{ type: "location" }] }),
  ],
  orderings: [{ title: "Display Order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
  preview: {
    select: { title: "question", category: "category" },
    prepare({ title, category }) {
      return {
        title,
        subtitle: Array.isArray(category) ? category.join(", ") : undefined,
      };
    },
  },
});
