import { defineField, defineType } from "sanity";

export const knowledgeGraphGapSchema = defineType({
  name: "knowledgeGraphGap",
  title: "Knowledge Graph Gap",
  type: "document",
  description:
    "System-generated. One row per real Service × Occasion pair where both nodes are individually well-established (real content elsewhere) but the site's own reference graph has no real content connecting them yet. Pure reference counting, no guessed demand. Recomputed weekly by the snapshot cron; status/actionedAt are the only fields meant to be hand-edited, everything else is overwritten on each run (history is appended, not replaced).",
  fields: [
    defineField({ name: "topicKey", title: "Topic key", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "serviceName", title: "Service", type: "string" }),
    defineField({ name: "occasionName", title: "Occasion", type: "string" }),
    defineField({ name: "servicePath", title: "Service page path", type: "string" }),
    defineField({ name: "serviceContentCount", title: "Service's real content count (elsewhere)", type: "number" }),
    defineField({ name: "occasionContentCount", title: "Occasion's real content count (elsewhere)", type: "number" }),

    defineField({
      name: "scoreBreakdown",
      title: "Score breakdown",
      type: "object",
      fields: [
        defineField({ name: "serviceStrengthScore", title: "Service strength score", type: "number" }),
        defineField({ name: "occasionStrengthScore", title: "Occasion strength score", type: "number" }),
        defineField({ name: "importanceScore", title: "Importance score", type: "number" }),
      ],
    }),
    defineField({ name: "priorityScore", title: "Priority score (importance ÷ effort)", type: "number" }),

    defineField({
      name: "recommendedAction",
      title: "Recommended action",
      type: "string",
      options: {
        list: [
          { title: "Create new blog article", value: "create_new_blog_article" },
          { title: "Add portfolio examples", value: "add_portfolio_examples" },
        ],
      },
    }),
    defineField({ name: "recommendedActionDetail", title: "Recommended action detail", type: "text", rows: 3 }),
    defineField({ name: "decisionTrace", title: "Decision trace", type: "array", of: [{ type: "string" }] }),

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
            defineField({ name: "importanceScore", title: "Importance score", type: "number" }),
          ],
        },
      ],
    }),

    defineField({ name: "firstSeenAt", title: "First seen at", type: "datetime", readOnly: true }),
    defineField({ name: "lastComputedAt", title: "Last computed at", type: "datetime", readOnly: true }),
  ],
  orderings: [
    { title: "Priority, highest first", name: "priorityDesc", by: [{ field: "priorityScore", direction: "desc" }] },
    { title: "Last computed", name: "lastComputedDesc", by: [{ field: "lastComputedAt", direction: "desc" }] },
  ],
  preview: {
    select: { service: "serviceName", occasion: "occasionName", priority: "priorityScore", status: "status" },
    prepare({ service, occasion, priority, status }) {
      return {
        title: `${service ?? "?"} × ${occasion ?? "?"}`,
        subtitle: `priority ${priority ?? "?"} · ${status ?? "new"}`,
      };
    },
  },
});
