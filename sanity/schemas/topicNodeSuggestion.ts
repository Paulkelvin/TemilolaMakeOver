import { defineField, defineType } from "sanity";

export const topicNodeSuggestionSchema = defineType({
  name: "topicNodeSuggestion",
  title: "Topic Suggestion",
  type: "document",
  description:
    "System-generated candidate for the Topic Map — mined from Competitor Gaps, Search Console, Keyword Discovery, Google Autocomplete, and recurring entities in verified articles, never written straight into the Topic Map. A human reviews the evidence and explicitly approves (creates a real topicNode) or rejects each one — this keeps the knowledge graph data-driven without ever auto-editing it. status/actionedAt/createdTopicNodeId are the only hand-edited fields.",
  fields: [
    defineField({ name: "suggestionKey", title: "Suggestion key", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "suggestedLabel", title: "Suggested label", type: "string", validation: (Rule) => Rule.required() }),

    defineField({
      name: "suggestedParentId",
      title: "Suggested parent node ID",
      type: "string",
      description: "The existing Topic Map cluster this would attach under, if one matched closely enough. Empty means it doesn't fit any existing cluster — a candidate for a brand new one.",
    }),
    defineField({ name: "suggestedParentLabel", title: "Suggested parent label", type: "string" }),

    defineField({
      name: "evidence",
      title: "Evidence",
      type: "array",
      description: "Every source that surfaced this candidate — the reviewer's basis for approving or rejecting it.",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "source", title: "Source", type: "string", description: "competitor-gap, search-console, keyword-discovery, autocomplete, or recurring-entity." }),
            defineField({ name: "detail", title: "Detail", type: "string" }),
            defineField({ name: "priorityScore", title: "Priority score", type: "number" }),
          ],
        },
      ],
    }),
    defineField({ name: "sourceCount", title: "Distinct sources", type: "number" }),
    defineField({ name: "priorityScore", title: "Combined priority score", type: "number" }),
    defineField({
      name: "confidenceLabel",
      title: "Confidence",
      type: "string",
      description: "How many independent evidence sources support this — high/medium/low, distinct from priority (how impactful it would be).",
      options: { list: [{ title: "High", value: "high" }, { title: "Medium", value: "medium" }, { title: "Low", value: "low" }] },
    }),
    defineField({ name: "confidenceScore", title: "Confidence score", type: "number" }),
    defineField({
      name: "decisionTrace",
      title: "Decision trace",
      type: "array",
      of: [{ type: "string" }],
      description: "Plain-language why: which sources agreed, why it isn't already covered, why this parent (or none).",
    }),

    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Pending review", value: "pending" },
          { title: "Approved", value: "approved" },
          { title: "Rejected", value: "rejected" },
        ],
      },
      initialValue: "pending",
    }),
    defineField({ name: "actionedAt", title: "Actioned at", type: "datetime" }),
    defineField({
      name: "createdTopicNodeId",
      title: "Created Topic Map node ID",
      type: "string",
      readOnly: true,
      description: "Set automatically once approved — the real topicNode this suggestion became.",
    }),

    defineField({ name: "firstSeenAt", title: "First seen at", type: "datetime", readOnly: true }),
    defineField({ name: "lastComputedAt", title: "Last computed at", type: "datetime", readOnly: true }),
  ],
  orderings: [
    { title: "Priority, highest first", name: "priorityDesc", by: [{ field: "priorityScore", direction: "desc" }] },
  ],
  preview: {
    select: { title: "suggestedLabel", status: "status", priority: "priorityScore", sources: "sourceCount" },
    prepare({ title, status, priority, sources }) {
      return {
        title: title ?? "Untitled suggestion",
        subtitle: `${status ?? "pending"} · priority ${priority ?? "?"} · ${sources ?? 0} source${sources === 1 ? "" : "s"}`,
      };
    },
  },
});
