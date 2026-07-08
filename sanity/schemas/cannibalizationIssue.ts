import { defineField, defineType } from "sanity";

const pageStatFields = [
  defineField({ name: "path", title: "Path", type: "string" }),
  defineField({ name: "impressions", title: "Impressions", type: "number" }),
  defineField({ name: "clicks", title: "Clicks", type: "number" }),
  defineField({ name: "position", title: "Position", type: "number" }),
];

export const cannibalizationIssueSchema = defineType({
  name: "cannibalizationIssue",
  title: "Cannibalization Issue",
  type: "document",
  description:
    "System-generated. One row per real pair of pages that Search Console served for the same real query in the last 90 days — evidence-only, no guessed content similarity. Recomputed weekly by the snapshot cron; status/actionedAt are the only fields meant to be hand-edited, everything else is overwritten on each run (history is appended, not replaced).",
  fields: [
    defineField({
      name: "topicKey",
      title: "Topic key",
      type: "string",
      description: "Derived from the sorted page-pair, so it stays stable even if the primary/secondary roles swap between runs.",
      validation: (Rule) => Rule.required(),
    }),

    defineField({ name: "primaryPage", title: "Primary page (higher combined impressions)", type: "object", fields: pageStatFields }),
    defineField({ name: "secondaryPage", title: "Secondary page (lower combined impressions)", type: "object", fields: pageStatFields }),
    defineField({
      name: "sharedQueries",
      title: "Shared queries",
      type: "array",
      description: "Every real query where Search Console served both pages, sorted by combined impressions.",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "query", title: "Query", type: "string" }),
            defineField({ name: "primaryImpressions", title: "Primary impressions", type: "number" }),
            defineField({ name: "primaryPosition", title: "Primary position", type: "number" }),
            defineField({ name: "secondaryImpressions", title: "Secondary impressions", type: "number" }),
            defineField({ name: "secondaryPosition", title: "Secondary position", type: "number" }),
          ],
        },
      ],
    }),

    defineField({
      name: "scoreBreakdown",
      title: "Score breakdown",
      type: "object",
      fields: [
        defineField({ name: "impressionVolumeScore", title: "Impression volume score", type: "number" }),
        defineField({ name: "shareSplitScore", title: "Share split score", type: "number" }),
        defineField({ name: "positionProximityScore", title: "Position proximity score", type: "number" }),
        defineField({ name: "severityScore", title: "Severity score", type: "number" }),
      ],
    }),
    defineField({
      name: "secondaryShare",
      title: "Secondary share (%)",
      type: "number",
      description: "The secondary page's percentage of combined impressions across shared queries (0-50 by construction).",
    }),
    defineField({
      name: "priorityScore",
      title: "Priority score (severity ÷ effort)",
      type: "number",
      description: "Severity divided by an ordinal effort weight for the recommended action — drives the list ordering, not raw severity alone.",
    }),

    defineField({
      name: "recommendedAction",
      title: "Recommended action",
      type: "string",
      options: {
        list: [
          { title: "Consolidate into primary", value: "consolidate_into_primary" },
          { title: "Differentiate secondary", value: "differentiate_secondary" },
          { title: "Strengthen primary links", value: "strengthen_primary_links" },
        ],
      },
    }),
    defineField({
      name: "recommendedActionDetail",
      title: "Recommended action detail",
      type: "text",
      rows: 3,
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
            defineField({ name: "severityScore", title: "Severity score", type: "number" }),
          ],
        },
      ],
    }),

    defineField({ name: "firstSeenAt", title: "First seen at", type: "datetime", readOnly: true }),
    defineField({ name: "lastComputedAt", title: "Last computed at", type: "datetime", readOnly: true }),
  ],
  orderings: [
    { title: "Priority, highest first", name: "priorityDesc", by: [{ field: "priorityScore", direction: "desc" }] },
    { title: "Severity, highest first", name: "severityDesc", by: [{ field: "scoreBreakdown.severityScore", direction: "desc" }] },
    { title: "Last computed", name: "lastComputedDesc", by: [{ field: "lastComputedAt", direction: "desc" }] },
  ],
  preview: {
    select: { primary: "primaryPage.path", secondary: "secondaryPage.path", priority: "priorityScore", action: "recommendedAction", status: "status" },
    prepare({ primary, secondary, priority, action, status }) {
      return {
        title: `${primary ?? "?"} vs. ${secondary ?? "?"}`,
        subtitle: `priority ${priority ?? "?"} · ${action ?? "no action"} · ${status ?? "new"}`,
      };
    },
  },
});
