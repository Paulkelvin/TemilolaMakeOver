import { defineField, defineType } from "sanity";

const POST_URL = /^https:\/\/(www\.)?(tiktok\.com\/@[\w.-]+\/video\/\d+|instagram\.com\/(p|reel)\/[\w-]+)/;

export const socialPostSchema = defineType({
  name: "socialPost",
  title: "Social Post",
  type: "document",
  fields: [
    defineField({
      name: "url",
      title: "Post link",
      type: "url",
      description:
        "Paste the TikTok video or Instagram post/reel link, e.g. https://www.tiktok.com/@gleambytemi/video/123… or https://www.instagram.com/reel/AbC…",
      validation: (rule) =>
        rule.required().custom((value) =>
          !value || POST_URL.test(value)
            ? true
            : "Use a single TikTok video link or an Instagram post/reel link"
        ),
    }),
    defineField({
      name: "cover",
      title: "Cover image",
      type: "image",
      options: { hotspot: true },
      description: "The thumbnail shown on the website. Use a portrait (9:16) image of the finished look.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "caption",
      title: "Short description",
      type: "string",
      description: "Describes the look for screen readers and Google, e.g. 'Soft glam for a birthday shoot'.",
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: "order",
      title: "Order",
      type: "number",
      initialValue: 0,
    }),
  ],
  orderings: [{ title: "Order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
  preview: {
    select: { title: "caption", url: "url", media: "cover" },
    prepare({ title, url, media }) {
      const platform = url?.includes("tiktok.com") ? "TikTok" : url?.includes("instagram.com") ? "Instagram" : "";
      return { title: title ?? "Untitled", subtitle: platform, media };
    },
  },
});
