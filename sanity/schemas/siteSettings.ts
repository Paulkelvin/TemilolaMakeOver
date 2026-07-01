import { defineField, defineType } from "sanity";

export const siteSettingsSchema = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  groups: [
    { name: "hero", title: "Hero Section" },
    { name: "about", title: "About Image" },
    { name: "media", title: "Media" },
    { name: "pricing", title: "Pricing" },
  ],
  fields: [
    defineField({
      name: "heroImageMain",
      title: "Hero — Main Image",
      type: "image",
      options: { hotspot: true },
      description: "The large hero image on the homepage (centre of the collage).",
      group: "hero",
    }),
    defineField({
      name: "heroImageSecondary",
      title: "Hero — Floating Image",
      type: "image",
      options: { hotspot: true },
      description: "Smaller floating image in the hero collage.",
      group: "hero",
    }),
    defineField({
      name: "heroImageDetail",
      title: "Hero — Detail Image",
      type: "image",
      options: { hotspot: true },
      description: "Third detail image in the hero collage.",
      group: "hero",
    }),
    defineField({
      name: "aboutImage",
      title: "About / Why Gleam Image",
      type: "image",
      options: { hotspot: true },
      description: "Image shown in the 'Why Gleam by Temi' section on the homepage.",
      group: "about",
    }),
    defineField({
      name: "youtubeReelUrl",
      title: "Homepage Video URL (YouTube)",
      type: "url",
      description:
        "Paste a YouTube link (e.g. https://www.youtube.com/watch?v=...). Leave empty to hide the video section.",
      group: "media",
    }),
    defineField({
      name: "extraFaceDiscountPercent",
      title: "Extra Face Discount (%)",
      type: "number",
      description:
        "Discount on each additional face beyond the first. E.g. 20 means each extra face is 20% off the service price.",
      group: "pricing",
      initialValue: 20,
      validation: (r) => r.min(0).max(100),
    }),
  ],
  preview: {
    prepare: () => ({ title: "Site Settings" }),
  },
});
