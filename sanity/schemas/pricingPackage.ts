import { defineField, defineType } from "sanity";

export const pricingPackageSchema = defineType({
  name: "pricingPackage",
  title: "Pricing Package",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Package Name", type: "string" }),
    defineField({ name: "bestFor", title: "Best For", type: "string" }),
    defineField({ name: "shortDescription", title: "Short Description", type: "text" }),
    defineField({ name: "priceFrom", title: "Starting Price (₦)", type: "number" }),
    defineField({ name: "duration", title: "Duration", type: "string" }),
    defineField({
      name: "features",
      title: "Features",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({ name: "highlighted", title: "Highlighted / Popular", type: "boolean" }),
    defineField({ name: "order", title: "Display Order", type: "number" }),
  ],
  orderings: [{ title: "Display Order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
  preview: {
    select: { title: "name", subtitle: "bestFor" },
  },
});
