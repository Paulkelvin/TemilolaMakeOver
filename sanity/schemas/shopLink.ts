import { defineField, defineType } from "sanity";

export const shopLinkSchema = defineType({
  name: "shopLink",
  title: "Shop Link",
  type: "document",
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
      type: "url",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "section",
      title: "Section",
      type: "string",
      description: "Group name (e.g. 'Top Beauty Picks', 'Hair Products')",
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
      initialValue: "compact",
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
      title: "Order (within section)",
      type: "number",
      initialValue: 0,
    }),
    defineField({
      name: "sectionOrder",
      title: "Section Order",
      type: "number",
      description: "Controls the order of this section group (all items in the same section should share the same value)",
      initialValue: 0,
    }),
  ],
  orderings: [
    {
      title: "Section → Order",
      name: "sectionThenOrder",
      by: [
        { field: "sectionOrder", direction: "asc" },
        { field: "order", direction: "asc" },
      ],
    },
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "section",
      media: "image",
      layout: "layout",
    },
    prepare({ title, subtitle, media, layout }) {
      return {
        title: title ?? "Untitled",
        subtitle: `${subtitle ?? "No section"} · ${layout ?? "compact"}`,
        media,
      };
    },
  },
});
