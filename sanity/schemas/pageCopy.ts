import { defineField, defineType } from "sanity";

const textBlock = (name: string, title: string) =>
  defineField({ name, title, type: "text" });

const stringBlock = (name: string, title: string) =>
  defineField({ name, title, type: "string" });

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
          { title: "Home", value: "home" },
          { title: "Services", value: "services" },
          { title: "Portfolio", value: "portfolio" },
          { title: "Pricing", value: "pricing" },
          { title: "About", value: "about" },
          { title: "Book", value: "book" },
          { title: "Transformations", value: "transformations" },
        ],
      },
      validation: (rule) => rule.required(),
    }),

    // SEO
    stringBlock("seoTitle", "SEO Title"),
    textBlock("seoDescription", "SEO Description"),

    // Hero
    stringBlock("heroLabel", "Hero Label"),
    stringBlock("heroTitle", "Hero Title"),
    textBlock("heroSubtitle", "Hero Subtitle"),
    stringBlock("heroEyebrow", "Hero Eyebrow"),
    textBlock("heroTrustLine", "Hero Trust Line"),
    defineField({
      name: "heroBadges",
      title: "Hero Badges",
      type: "array",
      of: [{ type: "string" }],
    }),
    stringBlock("heroPrimaryCta", "Hero Primary CTA"),
    stringBlock("heroSecondaryCta", "Hero Secondary CTA"),

    // Hero Image
    defineField({
      name: "heroImage",
      title: "Hero Image",
      type: "image",
      options: { hotspot: true },
    }),

    // Section copies — flexible key-value style
    defineField({
      name: "sections",
      title: "Section Content Blocks",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "key", title: "Section Key", type: "string" }),
            defineField({ name: "label", title: "Label", type: "string" }),
            defineField({ name: "headline", title: "Headline", type: "string" }),
            defineField({ name: "paragraph", title: "Paragraph", type: "text" }),
            defineField({ name: "cta", title: "CTA Text", type: "string" }),
            defineField({ name: "intro", title: "Intro Text", type: "text" }),
            defineField({ name: "subtitle", title: "Subtitle", type: "text" }),
            defineField({ name: "footnote", title: "Footnote", type: "string" }),
            defineField({ name: "note", title: "Note", type: "text" }),
            defineField({ name: "body", title: "Body", type: "text" }),
            defineField({ name: "title", title: "Title", type: "string" }),
            defineField({
              name: "paragraphs",
              title: "Paragraphs",
              type: "array",
              of: [{ type: "text" }],
            }),
            defineField({
              name: "steps",
              title: "Steps",
              type: "array",
              of: [{ type: "string" }],
            }),
            defineField({
              name: "image",
              title: "Section Image",
              type: "image",
              options: { hotspot: true },
            }),
          ],
          preview: {
            select: { title: "key", subtitle: "headline" },
          },
        },
      ],
    }),
  ],
  preview: {
    select: { title: "page", subtitle: "heroTitle" },
    prepare({ title, subtitle }) {
      return { title: `${title?.charAt(0).toUpperCase()}${title?.slice(1)} Page`, subtitle };
    },
  },
});
