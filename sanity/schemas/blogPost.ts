import { defineField, defineType, defineArrayMember } from "sanity";

export const blogPostSchema = defineType({
  name: "blogPost",
  title: "Blog Post",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string" }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title" },
    }),
    defineField({ name: "excerpt", title: "Excerpt", type: "text" }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      of: [
        defineArrayMember({
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "H2", value: "h2" },
            { title: "H3", value: "h3" },
            { title: "H4", value: "h4" },
            { title: "Quote", value: "blockquote" },
          ],
        }),
        defineArrayMember({
          type: "object",
          name: "videoEmbed",
          title: "YouTube Video",
          fields: [
            defineField({ name: "url", title: "YouTube URL", type: "url", validation: (r) => r.required() }),
            defineField({ name: "caption", title: "Caption (optional)", type: "string" }),
          ],
          preview: {
            select: { title: "url", subtitle: "caption" },
            prepare({ title, subtitle }) {
              return { title: subtitle || "YouTube Video", subtitle: title };
            },
          },
        }),
      ],
    }),
    defineField({ name: "category", title: "Category", type: "string" }),
    defineField({
      name: "coverImage",
      title: "Cover Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "string",
      initialValue: "Temilola",
    }),
    defineField({ name: "publishedAt", title: "Published At", type: "datetime" }),
    defineField({ name: "order", title: "Display Order", type: "number" }),
  ],
  orderings: [
    { title: "Published Date", name: "publishedAtDesc", by: [{ field: "publishedAt", direction: "desc" }] },
    { title: "Display Order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] },
  ],
  preview: {
    select: { title: "title", subtitle: "excerpt" },
  },
});
