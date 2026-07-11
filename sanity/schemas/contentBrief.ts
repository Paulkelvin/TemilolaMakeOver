import { defineField, defineType } from "sanity";

export const contentBriefSchema = defineType({
  name: "contentBrief",
  title: "Content Brief",
  type: "document",
  description:
    "Compiled once per candidate article, from data the site already computes (Keyword Discovery, Competitor Gaps, Knowledge Graph, Internal Links, Search Console) — never guessed. Hands a human writer everything needed to draft without re-researching: what to cover, what a competitor already covers that this doesn't, and which existing pages the new article must link to. The Verification Suite (run after drafting) diffs the finished article against requiredSubtopics/requiredInternalLinks to compute the real coverage score — this document is the checklist, not the grade.",
  fields: [
    defineField({
      name: "topicKey",
      title: "Topic key",
      type: "string",
      description: "Matches the source keywordDiscoveryTopic's topicKey this brief was compiled from.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "topicLabel", title: "Topic label", type: "string", validation: (Rule) => Rule.required() }),

    defineField({
      name: "targetQueries",
      title: "Target queries",
      type: "array",
      of: [{ type: "string" }],
      description: "Real discovered query strings this article should satisfy — pulled from the source Keyword Discovery topic, not invented.",
    }),
    defineField({
      name: "searchIntent",
      title: "Search intent",
      type: "string",
      options: {
        list: [
          { title: "Informational", value: "informational" },
          { title: "Commercial", value: "commercial" },
          { title: "Transactional", value: "transactional" },
          { title: "Navigational", value: "navigational" },
        ],
      },
    }),
    defineField({
      name: "audienceLevel",
      title: "Audience level",
      type: "string",
      description: "Heuristic read from the query language itself (\"beginner\", \"advanced\", \"professional\") — a signal, not a certainty.",
      options: {
        list: [
          { title: "Beginner", value: "beginner" },
          { title: "Intermediate", value: "intermediate" },
          { title: "Advanced", value: "advanced" },
          { title: "General / mixed", value: "general" },
        ],
      },
    }),

    defineField({
      name: "existingCoverage",
      title: "Existing coverage",
      type: "string",
      options: {
        list: [
          { title: "None — genuine content gap", value: "none" },
          { title: "Thin/stale existing content", value: "thin" },
          { title: "Strong existing content", value: "existing-strong" },
        ],
      },
    }),
    defineField({
      name: "matchedContentPath",
      title: "Matched content path",
      type: "string",
      description: "If existing coverage isn't \"none\", the real page this topic already matches.",
    }),

    defineField({
      name: "requiredSubtopics",
      title: "Required subtopics",
      type: "array",
      description: "The checklist a drafted article is later diffed against to compute its real coverage score. Each entry names where the requirement came from, so it's traceable back to real evidence.",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "label", title: "Label", type: "string" }),
            defineField({
              name: "source",
              title: "Source",
              type: "string",
              options: {
                list: [
                  { title: "Competitor covers this", value: "competitor" },
                  { title: "Knowledge Graph connection gap", value: "knowledge-graph" },
                  { title: "Real discovered query", value: "sample-query" },
                ],
              },
            }),
            defineField({ name: "detail", title: "Detail", type: "text", rows: 2 }),
          ],
        },
      ],
    }),

    defineField({
      name: "competitorGaps",
      title: "Competitor gaps",
      type: "array",
      description: "Real topics a real, crawled competitor covers that this site doesn't — from the Competitor Gap engine, not guessed.",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "competitorTopicLabel", title: "Competitor topic label", type: "string" }),
            defineField({ name: "priorityScore", title: "Priority score", type: "number" }),
          ],
        },
      ],
    }),

    defineField({
      name: "knowledgeGraphConnections",
      title: "Knowledge Graph connections",
      type: "array",
      description: "Service × Occasion pairs the Knowledge Graph engine flagged as independently established but never connected by real content.",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "serviceName", title: "Service", type: "string" }),
            defineField({ name: "occasionName", title: "Occasion", type: "string" }),
            defineField({ name: "priorityScore", title: "Priority score", type: "number" }),
          ],
        },
      ],
    }),

    defineField({
      name: "requiredInternalLinks",
      title: "Required internal links",
      type: "array",
      description: "Real existing pages this article must link to, matched by the same topical-overlap scoring internal-links.ts already uses — never a vague \"add more links\".",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "targetPath", title: "Target path", type: "string" }),
            defineField({ name: "targetLabel", title: "Target label", type: "string" }),
            defineField({
              name: "targetType",
              title: "Target type",
              type: "string",
              options: {
                list: [
                  { title: "Service", value: "service" },
                  { title: "Location", value: "location" },
                  { title: "Pillar post", value: "pillar-post" },
                  { title: "Supporting post", value: "supporting-post" },
                ],
              },
            }),
            defineField({ name: "overlapScore", title: "Overlap score", type: "number" }),
          ],
        },
      ],
    }),

    defineField({
      name: "searchConsoleSnapshot",
      title: "Search Console snapshot",
      type: "object",
      description: "Real clicks/impressions/position if this topic already has a ranking page — null if Search Console isn't configured or nothing matched yet.",
      fields: [
        defineField({ name: "clicks", title: "Clicks", type: "number" }),
        defineField({ name: "impressions", title: "Impressions", type: "number" }),
        defineField({ name: "position", title: "Average position", type: "number" }),
        defineField({ name: "fetchedAt", title: "Fetched at", type: "datetime" }),
      ],
    }),

    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "New", value: "new" },
          { title: "Drafting", value: "drafting" },
          { title: "Verified", value: "verified" },
          { title: "Published", value: "published" },
        ],
      },
      initialValue: "new",
    }),
    defineField({
      name: "linkedBlogPost",
      title: "Linked blog post",
      type: "reference",
      to: [{ type: "blogPost" }],
      description: "Set once the article this brief describes is actually published.",
    }),

    defineField({ name: "firstSeenAt", title: "First seen at", type: "datetime", readOnly: true }),
    defineField({ name: "lastComputedAt", title: "Last computed at", type: "datetime", readOnly: true }),
  ],
  orderings: [
    { title: "Last computed", name: "lastComputedDesc", by: [{ field: "lastComputedAt", direction: "desc" }] },
  ],
  preview: {
    select: { title: "topicLabel", status: "status", intent: "searchIntent" },
    prepare({ title, status, intent }) {
      return {
        title: title ?? "Untitled brief",
        subtitle: `${intent ?? "unknown intent"} · ${status ?? "new"}`,
      };
    },
  },
});
