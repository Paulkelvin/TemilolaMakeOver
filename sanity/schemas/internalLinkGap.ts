import { defineField, defineType } from "sanity";

export const internalLinkGapSchema = defineType({
  name: "internalLinkGap",
  title: "Internal Link Gap",
  type: "document",
  description:
    "System-generated. One row per real service/location page with too few real inbound links from blog post content — evidence is a literal scan of every blog post's markDefs hrefs, no guessed relevance. Recomputed weekly by the snapshot cron; status/actionedAt are the only fields meant to be hand-edited, everything else is overwritten on each run (history is appended, not replaced).",
  fields: [
    defineField({
      name: "topicKey",
      title: "Topic key",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "targetPath", title: "Target page path", type: "string" }),
    defineField({ name: "targetLabel", title: "Target page label", type: "string" }),
    defineField({ name: "targetType", title: "Target page type", type: "string" }),
    defineField({ name: "inboundLinkCount", title: "Real inbound links found", type: "number" }),
    defineField({
      name: "linkingPosts",
      title: "Blog posts already linking here",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "path", title: "Path", type: "string" }),
            defineField({ name: "title", title: "Title", type: "string" }),
          ],
        },
      ],
    }),
    defineField({
      name: "suggestedSources",
      title: "Suggested source posts",
      type: "array",
      description: "Real blog posts that don't yet link here, ranked by topical overlap with the target page.",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "path", title: "Path", type: "string" }),
            defineField({ name: "title", title: "Title", type: "string" }),
            defineField({ name: "overlapScore", title: "Overlap score (0-1)", type: "number" }),
          ],
        },
      ],
    }),

    defineField({
      name: "scoreBreakdown",
      title: "Score breakdown",
      type: "object",
      fields: [
        defineField({ name: "importanceScore", title: "Importance score", type: "number" }),
        defineField({ name: "linkDeficitScore", title: "Link deficit score", type: "number" }),
        defineField({ name: "severityScore", title: "Severity score", type: "number" }),
      ],
    }),
    defineField({
      name: "priorityScore",
      title: "Priority score (severity ÷ effort)",
      type: "number",
    }),

    defineField({
      name: "recommendedAction",
      title: "Recommended action",
      type: "string",
      options: {
        list: [
          { title: "Add internal links", value: "add_internal_links" },
          { title: "Create new blog article", value: "create_new_blog_article" },
        ],
      },
    }),
    defineField({ name: "recommendedActionDetail", title: "Recommended action detail", type: "text", rows: 3 }),
    defineField({
      name: "decisionTrace",
      title: "Decision trace",
      type: "array",
      of: [{ type: "string" }],
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
    { title: "Last computed", name: "lastComputedDesc", by: [{ field: "lastComputedAt", direction: "desc" }] },
  ],
  preview: {
    select: { title: "targetLabel", path: "targetPath", inbound: "inboundLinkCount", priority: "priorityScore", status: "status" },
    prepare({ title, path, inbound, priority, status }) {
      return {
        title: title ?? "Untitled page",
        subtitle: `${path ?? "?"} · ${inbound ?? 0} inbound link${inbound === 1 ? "" : "s"} · priority ${priority ?? "?"} · ${status ?? "new"}`,
      };
    },
  },
});
