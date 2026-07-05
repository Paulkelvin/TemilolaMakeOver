import { defineField, defineType } from "sanity";

export const branchSchema = defineType({
  name: "branch",
  title: "Studio Branch",
  type: "document",
  description: "A physical studio location where in-studio appointments happen. Leave empty if the business is home-service/mobile only.",
  fields: [
    defineField({ name: "name", title: "Name", type: "string" }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "name" } }),
    defineField({ name: "city", title: "City", type: "reference", to: [{ type: "city" }] }),
    defineField({ name: "address", title: "Address", type: "text" }),
    defineField({ name: "geo", title: "Map Location", type: "geopoint" }),
    defineField({ name: "hours", title: "Opening Hours", type: "text" }),
    defineField({ name: "photos", title: "Photos", type: "array", of: [{ type: "image", options: { hotspot: true } }] }),
    defineField({ name: "isActive", title: "Currently Open", type: "boolean", initialValue: true }),
  ],
  preview: {
    select: { title: "name", subtitle: "address" },
  },
});
