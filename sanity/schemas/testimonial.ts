import { defineField, defineType } from "sanity";

export const testimonialSchema = defineType({
  name: "testimonial",
  title: "Testimonial",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Client Name", type: "string" }),
    defineField({ name: "event", title: "Event Type", type: "string" }),
    defineField({ name: "text", title: "Testimonial Text", type: "text" }),
    defineField({ name: "rating", title: "Rating (1-5)", type: "number", validation: (rule) => rule.min(1).max(5) }),
    defineField({ name: "initials", title: "Initials", type: "string" }),
    defineField({ name: "avatar", title: "Avatar Photo", type: "image", options: { hotspot: true } }),
    defineField({ name: "order", title: "Display Order", type: "number" }),
  ],
  orderings: [{ title: "Display Order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
  preview: {
    select: { title: "name", subtitle: "event" },
  },
});
