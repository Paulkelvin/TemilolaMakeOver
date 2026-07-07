import { defineField, defineType } from "sanity";

const queryRowFields = [
  defineField({ name: "query", title: "Query", type: "string" }),
  defineField({ name: "page", title: "Page", type: "string" }),
  defineField({ name: "clicks", title: "Clicks", type: "number" }),
  defineField({ name: "impressions", title: "Impressions", type: "number" }),
  defineField({ name: "ctr", title: "CTR", type: "number" }),
  defineField({ name: "position", title: "Position", type: "number" }),
];

export const seoOpportunitySchema = defineType({
  name: "seoOpportunity",
  title: "SEO Opportunity",
  type: "document",
  description:
    "System-generated. One row per query-cluster ('topic') discovered from Search Console — the SEO Opportunity Engine's living roadmap. Recomputed weekly by the snapshot cron; status/actionedAt are the only fields meant to be hand-edited, everything else is overwritten on each run (history is appended, not replaced).",
  fields: [
    defineField({
      name: "topicKey",
      title: "Topic key",
      type: "string",
      description: "Stable identifier derived from the cluster's core tokens, e.g. \"bridal-makeup-lagos\".",
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "topicLabel", title: "Topic label", type: "string", validation: (Rule) => Rule.required() }),

    defineField({
      name: "queries",
      title: "Backing queries",
      type: "array",
      description: "The raw Search Console (query, page) rows that make up this cluster — the explainability data.",
      of: [{ type: "object", fields: queryRowFields }],
    }),

    defineField({
      name: "currentMetrics",
      title: "Current metrics",
      type: "object",
      fields: [
        defineField({ name: "position", title: "Position", type: "number" }),
        defineField({ name: "impressions", title: "Impressions", type: "number" }),
        defineField({ name: "clicks", title: "Clicks", type: "number" }),
        defineField({ name: "ctr", title: "CTR", type: "number" }),
      ],
    }),

    defineField({
      name: "scoreBreakdown",
      title: "Score breakdown",
      type: "object",
      description: "Every subscore that fed the total, kept for explainability rather than showing just one number.",
      fields: [
        defineField({ name: "positionScore", title: "Position score", type: "number" }),
        defineField({ name: "impressionsScore", title: "Impressions score", type: "number" }),
        defineField({ name: "ctrGapScore", title: "CTR-gap score", type: "number" }),
        defineField({ name: "intentScore", title: "Intent score", type: "number" }),
        defineField({ name: "commercialValueScore", title: "Commercial value score", type: "number" }),
        defineField({ name: "topicalRelevanceScore", title: "Topical relevance score", type: "number" }),
        defineField({
          name: "competitionProxyScore",
          title: "Competition proxy score",
          type: "number",
          description: "A proxy, not verified keyword-difficulty data (no paid tool source) — see confidenceReasons.",
        }),
        defineField({ name: "contentCoverageScore", title: "Content coverage score", type: "number" }),
        defineField({ name: "totalScore", title: "Total score", type: "number" }),
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
      description: "Plain-language reasons behind the confidence level, e.g. \"competition score is a proxy, not verified difficulty\".",
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
      name: "intentClassification",
      title: "Intent classification detail",
      type: "object",
      description: "Exactly which words triggered the intent detection and how confident the (deterministic, regex-based) rule is.",
      fields: [
        defineField({ name: "confidencePct", title: "Confidence %", type: "number" }),
        defineField({ name: "matchedWords", title: "Matched words", type: "array", of: [{ type: "string" }] }),
        defineField({ name: "ruleTriggered", title: "Rule triggered", type: "string" }),
      ],
    }),
    defineField({
      name: "priorityScore",
      title: "Priority score (value ÷ effort)",
      type: "number",
      description: "Total score divided by an ordinal effort weight for the recommended action — a quick FAQ addition can outrank a bigger-value pillar page that takes much longer to build.",
    }),

    defineField({ name: "isQuickWin", title: "Quick win (position 8–20)", type: "boolean", initialValue: false }),
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
      description: "Public path of the existing page/post this cluster matches, if any, e.g. \"/services/bridal-makeup\".",
    }),

    defineField({
      name: "recommendedAction",
      title: "Recommended action",
      type: "string",
      options: {
        list: [
          { title: "Improve existing page", value: "improve_existing_page" },
          { title: "Create new blog article", value: "create_new_blog_article" },
          { title: "Add FAQs", value: "add_faqs" },
          { title: "Add portfolio examples", value: "add_portfolio_examples" },
          { title: "Strengthen internal links", value: "strengthen_internal_links" },
          { title: "Expand pillar page", value: "expand_pillar_page" },
        ],
      },
    }),
    defineField({ name: "recommendedActionDetail", title: "Recommended action detail", type: "text", rows: 3 }),
    defineField({
      name: "decisionTrace",
      title: "Decision trace",
      type: "array",
      of: [{ type: "string" }],
      description: "Every condition the recommendation decision tree checked, in order, and its result — the full \"why did it recommend THIS\" trail, not just the outcome.",
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
            defineField({ name: "position", title: "Position", type: "number" }),
            defineField({ name: "impressions", title: "Impressions", type: "number" }),
            defineField({ name: "clicks", title: "Clicks", type: "number" }),
            defineField({ name: "ctr", title: "CTR", type: "number" }),
            defineField({ name: "score", title: "Score", type: "number" }),
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
      quickWin: "isQuickWin",
      status: "status",
    },
    prepare({ title, score, action, quickWin, status }) {
      return {
        title: `${quickWin ? "⚡ " : ""}${title ?? "Untitled topic"}`,
        subtitle: `score ${score ?? "?"} · ${action ?? "no action"} · ${status ?? "new"}`,
      };
    },
  },
});
