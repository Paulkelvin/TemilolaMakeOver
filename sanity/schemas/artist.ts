import { defineField, defineType } from "sanity";

export const artistSchema = defineType({
  name: "artist",
  title: "Artist",
  type: "document",
  description: "A makeup artist working under this business. One document exists today (the founder) — this is what lets a second artist join later without restructuring bookings, availability, or content tagging.",
  fields: [
    defineField({ name: "name", title: "Name", type: "string" }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "name" } }),
    defineField({ name: "role", title: "Role", type: "string", description: "e.g. 'Founder & Lead Artist', 'Associate Artist'" }),
    defineField({ name: "bio", title: "Bio", type: "text" }),
    defineField({ name: "photo", title: "Photo", type: "image", options: { hotspot: true } }),
    defineField({
      name: "specialties",
      title: "Specialty Styles",
      type: "array",
      of: [{ type: "reference", to: [{ type: "makeupStyle" }] }],
    }),
    defineField({ name: "isPrimary", title: "Primary/Founding Artist", type: "boolean", initialValue: false }),
    defineField({
      name: "socialLinks",
      title: "Social Links",
      type: "object",
      fields: [defineField({ name: "instagram", title: "Instagram URL", type: "url" })],
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "role", media: "photo" },
  },
});
