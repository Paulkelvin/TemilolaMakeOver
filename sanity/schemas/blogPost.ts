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
        defineArrayMember({
          type: "object",
          name: "experiencePlaceholder",
          title: "⚠️ Evidence Placeholder (editor-only)",
          description:
            "Flags a claim (pricing, a visual result, a client's reaction) that a real photo, price, or quote would substantiate. Never rendered on the live site — see the PortableText type override in blog/[slug]/page.tsx. Replace with real content, then check Resolved, or delete the block once real evidence is added directly.",
          fields: [
            defineField({
              name: "triggerType",
              title: "Trigger type",
              type: "string",
              options: {
                list: [
                  { title: "Pricing example needed", value: "pricing" },
                  { title: "Before/after or photo needed", value: "visual-result" },
                  { title: "Customer quote needed", value: "client-experience" },
                  { title: "Case study needed", value: "case-study" },
                ],
              },
            }),
            defineField({ name: "placeholderText", title: "Placeholder text", type: "string" }),
            defineField({ name: "matchedSentence", title: "Matched sentence (context)", type: "text", rows: 2, readOnly: true }),
            defineField({
              name: "resolved",
              title: "Resolved",
              type: "boolean",
              initialValue: false,
              description: "Check once real evidence has replaced this placeholder in the surrounding text.",
            }),
          ],
          preview: {
            select: { title: "placeholderText", subtitle: "matchedSentence", resolved: "resolved" },
            prepare({ title, subtitle, resolved }) {
              return {
                title: `${resolved ? "✅" : "⚠️"} ${title ?? "Evidence needed"}`,
                subtitle,
              };
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
    defineField({ name: "primaryService", title: "Primary Service", type: "reference", to: [{ type: "service" }] }),
    defineField({ name: "relatedStyle", title: "Related Style", type: "reference", to: [{ type: "makeupStyle" }] }),
    defineField({ name: "relatedOccasion", title: "Related Occasion", type: "reference", to: [{ type: "occasion" }] }),
    defineField({ name: "relatedWeddingType", title: "Related Wedding Type", type: "reference", to: [{ type: "weddingType" }] }),
    defineField({
      name: "relatedLocations",
      title: "Related Locations",
      type: "array",
      of: [{ type: "reference", to: [{ type: "location" }] }],
    }),
    defineField({
      name: "contentBrief",
      title: "Content Brief",
      type: "reference",
      to: [{ type: "contentBrief" }],
      description: "The brief this article was drafted from, if it went through the Editorial System.",
    }),
    defineField({
      name: "qualityScore",
      title: "Quality Score",
      type: "object",
      readOnly: true,
      description:
        "Written by the Verification Suite, never hand-edited. The 85-point minimum applies to new content going forward — it is not enforced retroactively against articles published before this system existed.",
      fields: [
        defineField({ name: "weightedTotal", title: "Weighted total", type: "number" }),
        defineField({ name: "publishable", title: "Publishable", type: "boolean" }),
        defineField({ name: "floorViolations", title: "Floor violations", type: "array", of: [{ type: "string" }] }),
        defineField({
          name: "categories",
          title: "Category scores",
          type: "array",
          of: [
            {
              type: "object",
              fields: [
                defineField({ name: "category", title: "Category", type: "string" }),
                defineField({ name: "score", title: "Score", type: "number" }),
                defineField({ name: "weight", title: "Weight", type: "number" }),
                defineField({ name: "floor", title: "Floor", type: "number" }),
                defineField({ name: "passesFloor", title: "Passes floor", type: "boolean" }),
              ],
            },
          ],
        }),
        defineField({ name: "computedAt", title: "Computed at", type: "datetime" }),
      ],
    }),
  ],
  orderings: [
    { title: "Published Date", name: "publishedAtDesc", by: [{ field: "publishedAt", direction: "desc" }] },
    { title: "Display Order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] },
  ],
  preview: {
    select: { title: "title", subtitle: "excerpt", score: "qualityScore.weightedTotal" },
    prepare({ title, subtitle, score }) {
      return {
        title: score !== undefined && score !== null ? `${title} (${score}/100)` : title,
        subtitle,
      };
    },
  },
});
