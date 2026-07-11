import { defineField, defineType } from "sanity";

const gapRefFields = [
  defineField({ name: "label", title: "Label", type: "string" }),
  defineField({ name: "source", title: "Source", type: "string", description: "Which engine surfaced this — keyword-discovery, competitor-gap, or knowledge-graph." }),
  defineField({ name: "priorityScore", title: "Priority score", type: "number" }),
  defineField({ name: "detail", title: "Detail", type: "string" }),
];

export const clusterAuthoritySchema = defineType({
  name: "clusterAuthority",
  title: "Cluster Authority",
  type: "document",
  description:
    "System-generated. One row per Topic Map cluster (any topicNode with children) — rolls up the already-computed Topical Authority, Competitor Gap, Knowledge Graph, and Internal Link data for every page under that cluster, so authority is tracked at the cluster level, not just per article. Recomputed weekly by the snapshot cron; status/actionedAt are the only hand-edited fields.",
  fields: [
    defineField({ name: "clusterNodeId", title: "Topic Map node ID", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "clusterLabel", title: "Cluster label", type: "string", validation: (Rule) => Rule.required() }),

    defineField({ name: "descendantCount", title: "Descendant topics", type: "number" }),
    defineField({ name: "linkedDescendantCount", title: "Linked to a real page", type: "number" }),
    defineField({
      name: "linkedPaths",
      title: "Linked page paths",
      type: "array",
      of: [{ type: "string" }],
      description: "Real public paths of this cluster's linked pages, used by the Verification Suite's cannibalization check.",
    }),

    defineField({ name: "avgCoverageScore", title: "Average coverage score", type: "number" }),
    defineField({ name: "avgAuthorityScore", title: "Average authority score", type: "number" }),

    defineField({
      name: "internalLinkHealth",
      title: "Internal link health",
      type: "object",
      fields: [
        defineField({ name: "healthyCount", title: "Healthy", type: "number" }),
        defineField({ name: "underlinkedCount", title: "Under-linked", type: "number" }),
        defineField({ name: "orphanCount", title: "Orphaned", type: "number" }),
      ],
    }),

    defineField({
      name: "missingSubtopics",
      title: "Missing subtopics",
      type: "array",
      description: "Real Keyword Discovery topics that overlap this cluster and aren't covered yet.",
      of: [{ type: "object", fields: gapRefFields }],
    }),
    defineField({
      name: "competitorGaps",
      title: "Competitor gaps",
      type: "array",
      description: "Real competitor-covered topics that overlap this cluster.",
      of: [{ type: "object", fields: gapRefFields }],
    }),
    defineField({
      name: "knowledgeGraphGaps",
      title: "Knowledge graph gaps",
      type: "array",
      description: "Real Service × Occasion gaps that overlap this cluster.",
      of: [{ type: "object", fields: gapRefFields }],
    }),
    defineField({
      name: "recommendedNextContent",
      title: "Recommended next content",
      type: "array",
      description: "The top candidates across all three gap sources, ranked by priority — what to write next for this cluster.",
      of: [{ type: "object", fields: gapRefFields }],
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
    }),
    defineField({ name: "actionedAt", title: "Actioned at", type: "datetime" }),

    defineField({
      name: "history",
      title: "History",
      type: "array",
      description: "One entry appended per computation run — the cluster's progress-over-time record.",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "date", title: "Date", type: "date" }),
            defineField({ name: "avgAuthorityScore", title: "Average authority score", type: "number" }),
            defineField({ name: "avgCoverageScore", title: "Average coverage score", type: "number" }),
            defineField({ name: "openGapCount", title: "Open gap count", type: "number" }),
          ],
        },
      ],
    }),

    defineField({ name: "firstSeenAt", title: "First seen at", type: "datetime", readOnly: true }),
    defineField({ name: "lastComputedAt", title: "Last computed at", type: "datetime", readOnly: true }),
  ],
  orderings: [
    { title: "Authority, lowest first", name: "authorityAsc", by: [{ field: "avgAuthorityScore", direction: "asc" }] },
  ],
  preview: {
    select: { title: "clusterLabel", authority: "avgAuthorityScore", gaps: "recommendedNextContent" },
    prepare({ title, authority, gaps }) {
      const gapCount = Array.isArray(gaps) ? gaps.length : 0;
      return {
        title: title ?? "Untitled cluster",
        subtitle: `Authority ${authority ?? "?"}% · ${gapCount} open gap${gapCount === 1 ? "" : "s"}`,
      };
    },
  },
});
