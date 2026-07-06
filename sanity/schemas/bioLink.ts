import { defineField, defineType } from "sanity";

export const bioLinkSchema = defineType({
  name: "bioLink",
  title: "Bio Link (/links page)",
  type: "document",
  description: "Items on the /links bio-link page — navigation to your own site sections, WhatsApp, socials, etc.",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "url",
      title: "Link URL",
      type: "string",
      description: "An internal path (e.g. /book) or a full external URL (e.g. https://wa.me/...)",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "mediaType",
      title: "Media Type",
      type: "string",
      options: {
        list: [
          { title: "Image", value: "image" },
          { title: "Video", value: "video" },
        ],
        layout: "radio",
      },
      initialValue: "image",
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
      hidden: ({ parent }) => parent?.mediaType === "video",
    }),
    defineField({
      name: "video",
      title: "Video",
      type: "file",
      options: { accept: "video/mp4,video/webm" },
      hidden: ({ parent }) => parent?.mediaType !== "video",
    }),
    defineField({
      name: "thumbnail",
      title: "Video Thumbnail",
      type: "image",
      options: { hotspot: true },
      description: "Thumbnail image for video items (used in compact layout)",
      hidden: ({ parent }) => parent?.mediaType !== "video",
    }),
    defineField({
      name: "alt",
      title: "Alt Text",
      type: "string",
    }),
    defineField({
      name: "layout",
      title: "Card Layout",
      type: "string",
      options: {
        list: [
          { title: "Compact — small thumbnail + title", value: "compact" },
          { title: "Featured — large media, title below", value: "featured" },
          { title: "Wide — image left, text right", value: "wide" },
        ],
        layout: "radio",
      },
      initialValue: "wide",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 2,
      description: "Shown on featured and wide layouts",
    }),
    defineField({
      name: "order",
      title: "Order",
      type: "number",
      initialValue: 0,
    }),
  ],
  orderings: [
    { title: "Order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] },
  ],
  preview: {
    select: { title: "title", subtitle: "url", media: "image", layout: "layout" },
    prepare({ title, subtitle, media, layout }) {
      return {
        title: title ?? "Untitled",
        subtitle: `${subtitle ?? ""} · ${layout ?? "wide"}`,
        media,
      };
    },
  },
});
