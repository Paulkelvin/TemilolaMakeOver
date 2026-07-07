import { defineField, defineType } from "sanity";

export const keywordDiscoveryTopicSchema = defineType({
  name: "keywordDiscoveryTopic",
  title: "Keyword Discovery Topic",
  type: "document",
  description:
    "System-generated. One row per topic discovered from free external autocomplete sources (Google, YouTube) — independent of Search Console, so this works before the site has any real search traffic yet. Recomputed weekly by the snapshot cron; status/actionedAt are the only fields meant to be hand-edited, everything else is overwritten on each run (history is appended, not replaced).",
  fields: [
    defineField({
      name: "topicKey",
      title: "Topic key",
      type: "string",
      description:
        "Same key-generation scheme as SEO Opportunities, so a topic discovered here and later confirmed by real Search Console clicks converge on the same key.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "topicLabel", title: "Topic label", type: "string", validation: (Rule) => Rule.required() }),

    defineField({
      name: "sampleQueries",
      title: "Sample queries",
      type: "array",
      description: "The raw discovered query strings backing this topic — the explainability data.",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "query", title: "Query", type: "string" }),
            defineField({
              name: "source",
              title: "Source",
              type: "string",
              options: {
                list: [
                  { title: "Google Autocomplete", value: "google-autocomplete" },
                  { title: "YouTube Autocomplete", value: "youtube-autocomplete" },
                  { title: "Seed (generated from taxonomy)", value: "seed" },
                ],
              },
            }),
            defineField({ name: "depth", title: "Expansion depth", type: "number", description: "0 = seed query, 1 = one round of recursive expansion" }),
          ],
        },
      ],
    }),

    defineField({
      name: "queryBreadth",
      title: "Query breadth",
      type: "string",
      description: "Honest, observable stand-in for \"difficulty\" — head terms are broad/short, long-tail terms are specific/longer. No search volume or difficulty number is fabricated.",
      options: {
        list: [
          { title: "Head (broad)", value: "head" },
          { title: "Long-tail (specific)", value: "long-tail" },
        ],
      },
    }),

    defineField({
      name: "intent",
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
      name: "scoreBreakdown",
      title: "Score breakdown",
      type: "object",
      description: "Every subscore that fed the total, kept for explainability rather than showing just one number.",
      fields: [
        defineField({ name: "topicalRelevanceScore", title: "Topical relevance score", type: "number" }),
        defineField({ name: "commercialValueScore", title: "Commercial value score", type: "number" }),
        defineField({ name: "seasonalBoostScore", title: "Seasonal boost score", type: "number" }),
        defineField({ name: "contentCoverageScore", title: "Content coverage score", type: "number" }),
        defineField({ name: "confidenceScore", title: "Confidence score", type: "number" }),
        defineField({ name: "totalScore", title: "Total score", type: "number" }),
        defineField({
          name: "externalDifficultyNote",
          title: "External difficulty note",
          type: "text",
          rows: 2,
          description: "Intentionally left blank. Populate later via a paid SEO data provider (Ahrefs/Semrush/DataForSEO) if you want verified keyword-difficulty numbers — this engine never guesses at that figure.",
        }),
      ],
    }),

    defineField({
      name: "confidenceLevel",
      title: "Confidence level",
      type: "string",
      options: { list: [{ title: "High", value: "high" }, { title: "Medium", value: "medium" }, { title: "Low", value: "low" }] },
    }),
    defineField({
      name: "confidenceReasons",
      title: "Confidence reasons",
      type: "array",
      of: [{ type: "string" }],
      description: "Plain-language reasons, e.g. \"confirmed independently by both Google and YouTube autocomplete\".",
    }),

    defineField({ name: "isSeasonal", title: "Seasonal", type: "boolean", initialValue: false }),
    defineField({
      name: "seasonalPeriod",
      title: "Seasonal period",
      type: "string",
      hidden: ({ parent }) => !parent?.isSeasonal,
      description: "e.g. \"Wedding season (Nov–Jan)\", \"Detty December\", \"Graduation season\".",
    }),

    defineField({
      name: "contentCoverage",
      title: "Content coverage",
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
      description: "Public path of the existing page/post this topic matches, if any, e.g. \"/services/bridal-makeup\".",
    }),

    defineField({
      name: "recommendedAction",
      title: "Recommended action",
      type: "string",
      options: {
        list: [
          { title: "Create a new pillar", value: "create_new_pillar" },
          { title: "Create a cluster article", value: "create_cluster_article" },
          { title: "Improve existing page", value: "improve_existing_page" },
          { title: "Add FAQs", value: "add_faqs" },
          { title: "Add portfolio", value: "add_portfolio" },
          { title: "Add internal links", value: "add_internal_links" },
        ],
      },
    }),
    defineField({ name: "recommendedActionDetail", title: "Recommended action detail", type: "text", rows: 3 }),

    defineField({
      name: "linkedSeoOpportunityKey",
      title: "Linked SEO Opportunity key",
      type: "string",
      readOnly: true,
      description: "Set automatically once real Search Console data confirms this same topic — this record is enriched, never deleted or replaced, per the \"merge, don't replace\" design.",
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
            defineField({ name: "score", title: "Score", type: "number" }),
            defineField({ name: "confidenceLevel", title: "Confidence level", type: "string" }),
          ],
        },
      ],
    }),

    defineField({ name: "firstSeenAt", title: "First seen at", type: "datetime", readOnly: true }),
    defineField({ name: "lastComputedAt", title: "Last computed at", type: "datetime", readOnly: true }),
  ],
  orderings: [
    { title: "Score, highest first", name: "scoreDesc", by: [{ field: "scoreBreakdown.totalScore", direction: "desc" }] },
    { title: "Last computed", name: "lastComputedDesc", by: [{ field: "lastComputedAt", direction: "desc" }] },
  ],
  preview: {
    select: {
      title: "topicLabel",
      score: "scoreBreakdown.totalScore",
      action: "recommendedAction",
      linked: "linkedSeoOpportunityKey",
      status: "status",
    },
    prepare({ title, score, action, linked, status }) {
      return {
        title: `${linked ? "🔗 " : ""}${title ?? "Untitled topic"}`,
        subtitle: `score ${score ?? "?"} · ${action ?? "no action"} · ${status ?? "new"}`,
      };
    },
  },
});
