import { defineField, defineType } from "sanity";

export const competitorGapTopicSchema = defineType({
  name: "competitorGapTopic",
  title: "Competitor Gap",
  type: "document",
  description:
    "System-generated. One row per real competitor page whose topic has no matching content on this site — a genuine content gap, never a suggestion to copy the competitor's actual wording. Recomputed weekly by the snapshot cron; status/actionedAt are the only fields meant to be hand-edited, everything else is overwritten on each run (history is appended, not replaced).",
  fields: [
    defineField({
      name: "topicKey",
      title: "Topic key",
      type: "string",
      description: "Same key-generation scheme as the other engines, so a competitor-covered topic converges with a matching SEO Opportunity or Keyword Discovery topic if one exists.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "topicLabel", title: "Topic label", type: "string", validation: (Rule) => Rule.required() }),

    defineField({ name: "competitorName", title: "Competitor", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "competitorUrl", title: "Competitor page", type: "url" }),
    defineField({ name: "sampleTitle", title: "Competitor page title", type: "string", description: "The competitor's own page title/heading — shown for context only, never copied into recommendations." }),

    defineField({
      name: "topicalRelevanceScore",
      title: "Topical relevance score",
      type: "number",
      description: "Overlap with this site's real services/locations/vocabulary — same scoring as the other engines.",
    }),
    defineField({
      name: "priorityScore",
      title: "Priority score (value ÷ effort)",
      type: "number",
      description: "Topical relevance divided by an ordinal effort weight for the recommended action — drives the list ordering, not raw relevance alone.",
    }),

    defineField({
      name: "recommendedAction",
      title: "Recommended action",
      type: "string",
      options: {
        list: [
          { title: "Create new pillar", value: "create_new_pillar" },
          { title: "Create cluster article", value: "create_cluster_article" },
          { title: "Add FAQs", value: "add_faqs" },
          { title: "Add portfolio", value: "add_portfolio" },
        ],
      },
    }),
    defineField({
      name: "recommendedActionDetail",
      title: "Recommended action detail",
      type: "text",
      rows: 3,
      description: "Names the topic to cover, in this site's own voice — never the competitor's actual wording.",
    }),
    defineField({
      name: "decisionTrace",
      title: "Decision trace",
      type: "array",
      of: [{ type: "string" }],
      description: "Every condition the recommendation decision tree checked, in order, and its result.",
    }),

    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "New", value: "new" },
          { title: "Acknowledged", value: "acknowledged" },
          { title: "In progress", value: "in_progress" },
          { title: "Done", value: "done" },
          { title: "Dismissed", value: "dismissed" },
        ],
      },
      initialValue: "new",
      description: "The only field on this document meant for hand-editing, along with Actioned at.",
    }),
    defineField({ name: "actionedAt", title: "Actioned at", type: "datetime" }),

    defineField({
      name: "history",
      title: "History",
      type: "array",
      description: "One entry appended per computation run — the progress-over-time record.",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "date", title: "Date", type: "date" }),
            defineField({ name: "topicalRelevanceScore", title: "Topical relevance score", type: "number" }),
          ],
        },
      ],
    }),

    defineField({ name: "firstSeenAt", title: "First seen at", type: "datetime", readOnly: true }),
    defineField({ name: "lastComputedAt", title: "Last computed at", type: "datetime", readOnly: true }),
  ],
  orderings: [
    { title: "Priority, highest first", name: "priorityDesc", by: [{ field: "priorityScore", direction: "desc" }] },
    { title: "Relevance, highest first", name: "relevanceDesc", by: [{ field: "topicalRelevanceScore", direction: "desc" }] },
    { title: "Last computed", name: "lastComputedDesc", by: [{ field: "lastComputedAt", direction: "desc" }] },
  ],
  preview: {
    select: { title: "topicLabel", competitor: "competitorName", priority: "priorityScore", action: "recommendedAction", status: "status" },
    prepare({ title, competitor, priority, action, status }) {
      return {
        title: title ?? "Untitled topic",
        subtitle: `vs. ${competitor ?? "?"} · priority ${priority ?? "?"} · ${action ?? "no action"} · ${status ?? "new"}`,
      };
    },
  },
});
