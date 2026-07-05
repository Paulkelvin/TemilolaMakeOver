import { defineField, defineType } from "sanity";

export const citySchema = defineType({
  name: "city",
  title: "City",
  type: "document",
  description: "A city the business operates in. Lagos today — a foundation for expanding to other cities later without restructuring locations.",
  fields: [
    defineField({ name: "name", title: "Name", type: "string" }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "name" } }),
    defineField({ name: "state", title: "State / Region", type: "string" }),
    defineField({ name: "isActive", title: "Currently Serving This City", type: "boolean", initialValue: true }),
  ],
  preview: {
    select: { title: "name", subtitle: "state" },
  },
});
