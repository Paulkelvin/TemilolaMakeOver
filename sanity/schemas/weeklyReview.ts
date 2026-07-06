import { defineField, defineType } from "sanity";

export const weeklyReviewSchema = defineType({
  name: "weeklyReview",
  title: "Weekly Business Reviews",
  type: "document",
  description: "System-generated. One per week — an archived snapshot of business health, key metrics, and top opportunities.",
  fields: [
    defineField({
      name: "weekStart",
      title: "Week starting",
      type: "date",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "weekEnd",
      title: "Week ending",
      type: "date",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "healthScore",
      title: "Overall Health Score",
      type: "number",
    }),
    defineField({
      name: "sections",
      title: "Report sections",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "heading", title: "Heading", type: "string" }),
            defineField({ name: "body", title: "Body", type: "text" }),
          ],
        },
      ],
    }),
    defineField({
      name: "metrics",
      title: "Key metrics (JSON)",
      type: "text",
      description: "Stringified JSON of metric values at time of generation.",
    }),
    defineField({
      name: "generatedAt",
      title: "Generated at",
      type: "datetime",
      readOnly: true,
    }),
  ],
  orderings: [
    { title: "Most recent", name: "weekDesc", by: [{ field: "weekStart", direction: "desc" }] },
  ],
  preview: {
    select: { weekStart: "weekStart", weekEnd: "weekEnd", healthScore: "healthScore" },
    prepare({ weekStart, weekEnd, healthScore }) {
      return {
        title: `WBR: ${weekStart ?? "?"} → ${weekEnd ?? "?"}`,
        subtitle: healthScore !== undefined ? `Health: ${healthScore}/100` : "Generating…",
      };
    },
  },
});
