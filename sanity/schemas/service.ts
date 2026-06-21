import { defineField, defineType } from "sanity";

export const serviceSchema = defineType({
  name: "service",
  title: "Service",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string" }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name" },
    }),
    defineField({ name: "shortDescription", title: "Short Description", type: "text" }),
    defineField({ name: "description", title: "Full Description", type: "text" }),
    defineField({ name: "whoFor", title: "Who It's For", type: "text" }),
    defineField({ name: "bestFor", title: "Best For", type: "string" }),
    defineField({
      name: "included",
      title: "What's Included",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({ name: "duration", title: "Duration", type: "string" }),
    defineField({ name: "homeService", title: "Home Service Available", type: "boolean" }),
    defineField({ name: "priceFrom", title: "Starting Price (₦)", type: "number" }),
    defineField({
      name: "icon",
      title: "Icon Name",
      type: "string",
      description: "Lucide icon name: crown, sparkles, palette, party-popper, camera, home, users",
    }),
    defineField({ name: "highlighted", title: "Most Popular", type: "boolean", description: "Show 'Most Popular' badge on this service card" }),
    defineField({ name: "image", title: "Service Image", type: "image", options: { hotspot: true } }),
    defineField({ name: "order", title: "Display Order", type: "number" }),
  ],
  orderings: [{ title: "Display Order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
  preview: {
    select: { title: "name", subtitle: "shortDescription" },
  },
});
