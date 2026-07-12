import { defineField, defineType } from "sanity";

export const topicNodeSchema = defineType({
  name: "topicNode",
  title: "Topic Map",
  type: "document",
  description:
    "Hand-edited content-planning hierarchy — parent/child topics for building topical authority over time. Mixes real, already-built taxonomy documents (linked via 'Linked page') with purely conceptual sub-topics that don't have their own page yet (e.g. \"Gele Styling\" as a planning idea under \"Traditional Wedding Makeup\"). Nothing here is system-generated — edit freely.",
  fields: [
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      description: "e.g. \"Traditional Wedding Makeup\", \"Gele Styling\".",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "parent",
      title: "Parent topic",
      type: "reference",
      to: [{ type: "topicNode" }],
      description: "Leave empty for a top-level topic.",
    }),
    defineField({
      name: "linkedTaxonomy",
      title: "Linked page",
      type: "object",
      description: "Only set this when the topic maps to a real, already-built page — leave both fields empty for a conceptual/planning-only topic.",
      fields: [
        defineField({
          name: "type",
          title: "Type",
          type: "string",
          options: {
            list: [
              { title: "Service", value: "service" },
              { title: "Makeup Style", value: "makeupStyle" },
              { title: "Occasion", value: "occasion" },
              { title: "Wedding Type", value: "weddingType" },
              { title: "Location", value: "location" },
            ],
          },
        }),
        defineField({
          name: "ref",
          title: "Document",
          type: "reference",
          to: [
            { type: "service" },
            { type: "makeupStyle" },
            { type: "occasion" },
            { type: "weddingType" },
            { type: "location" },
          ],
        }),
      ],
    }),
    defineField({ name: "notes", title: "Notes", type: "text", rows: 3, description: "Your own planning notes for this topic." }),
    defineField({ name: "order", title: "Display Order", type: "number" }),
    defineField({
      name: "businessPriority",
      title: "Business priority",
      type: "string",
      description: "How much this topic matters to the business, independent of its current authority — feeds the Editorial Roadmap and Editor-in-Chief recommendation.",
      options: { list: [{ title: "Low", value: "low" }, { title: "Medium", value: "medium" }, { title: "High", value: "high" }] },
      initialValue: "medium",
    }),
    defineField({
      name: "plannedNext",
      title: "Planned next",
      type: "boolean",
      description: "Check this once you've decided to actively write for this topic soon — the one lifecycle signal the system can't derive on its own.",
      initialValue: false,
    }),
  ],
  orderings: [{ title: "Display Order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
  preview: {
    select: { title: "label", parentLabel: "parent.label", linked: "linkedTaxonomy.type" },
    prepare({ title, parentLabel, linked }) {
      return {
        title: title ?? "Untitled topic",
        subtitle: `${parentLabel ? `under ${parentLabel}` : "top-level"}${linked ? ` · linked (${linked})` : " · conceptual"}`,
      };
    },
  },
});
