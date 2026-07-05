import { defineField, defineType } from "sanity";

export const occasionSchema = defineType({
  name: "occasion",
  title: "Occasion",
  type: "document",
  description: "The event type (Wedding, Owambe/Party, Birthday...) — replaces free-text event labels with a real, referenceable entity so proof content (portfolio, testimonials) can be filtered by it.",
  fields: [
    defineField({ name: "name", title: "Name", type: "string" }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "name" } }),
    defineField({ name: "description", title: "Description", type: "text" }),
    defineField({ name: "seoTitle", title: "SEO Title", type: "string" }),
    defineField({ name: "seoDescription", title: "SEO Description", type: "text" }),
    defineField({ name: "order", title: "Display Order", type: "number" }),
  ],
  orderings: [{ title: "Display Order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
  preview: {
    select: { title: "name", subtitle: "description" },
  },
});
