import { defineField, defineType } from "sanity";

export const pageCopySchema = defineType({
  name: "pageCopy",
  title: "Page Copy",
  type: "document",
  fields: [
    defineField({
      name: "page",
      title: "Page",
      type: "string",
      options: {
        list: [
          { title: "Homepage", value: "home" },
          { title: "About", value: "about" },
          { title: "Services", value: "services" },
          { title: "Portfolio", value: "portfolio" },
          { title: "Pricing", value: "pricing" },
          { title: "Book", value: "book" },
          { title: "Transformations", value: "transformations" },
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "seoTitle",
      title: "SEO Title",
      type: "string",
    }),
    defineField({
      name: "seoDescription",
      title: "SEO Description",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "heroLabel",
      title: "Hero — Label",
      type: "string",
    }),
    defineField({
      name: "heroTitle",
      title: "Hero — Title",
      type: "string",
    }),
    defineField({
      name: "heroSubtitle",
      title: "Hero — Subtitle",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "heroEyebrow",
      title: "Hero — Eyebrow",
      type: "string",
      description: "Small label above the headline (homepage only).",
    }),
    defineField({
      name: "heroTrustLine",
      title: "Hero — Trust Line",
      type: "string",
      description: "Small text below the hero buttons (homepage only).",
    }),
    defineField({
      name: "heroBadges",
      title: "Hero — Badges",
      type: "array",
      of: [{ type: "string" }],
      description: "Tags on the hero collage (homepage only).",
    }),
    defineField({
      name: "heroPrimaryCta",
      title: "Hero — Primary CTA",
      type: "string",
    }),
    defineField({
      name: "heroSecondaryCta",
      title: "Hero — Secondary CTA",
      type: "string",
    }),
    defineField({
      name: "heroImage",
      title: "Hero / Portrait Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "sections",
      title: "Sections",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "key", title: "Section Key", type: "string" }),
            defineField({ name: "label", title: "Label", type: "string" }),
            defineField({ name: "headline", title: "Headline", type: "string" }),
            defineField({ name: "paragraph", title: "Paragraph", type: "text", rows: 3 }),
            defineField({ name: "intro", title: "Intro", type: "text", rows: 2 }),
            defineField({ name: "subtitle", title: "Subtitle", type: "string" }),
            defineField({ name: "title", title: "Title", type: "string" }),
            defineField({ name: "body", title: "Body", type: "text", rows: 3 }),
            defineField({ name: "cta", title: "CTA Text", type: "string" }),
            defineField({ name: "footnote", title: "Footnote", type: "string" }),
            defineField({ name: "note", title: "Note", type: "string" }),
            defineField({
              name: "paragraphs",
              title: "Paragraphs",
              type: "array",
              of: [{ type: "text" }],
            }),
          ],
          preview: {
            select: { title: "label", subtitle: "key" },
          },
        },
      ],
    }),
  ],
  preview: {
    select: { title: "page" },
    prepare({ title }) {
      const labels: Record<string, string> = {
        home: "Homepage",
        about: "About",
        services: "Services",
        portfolio: "Portfolio",
        pricing: "Pricing",
        book: "Booking",
        transformations: "Transformations",
      };
      return { title: labels[title] ?? title ?? "Page Copy" };
    },
  },
});
