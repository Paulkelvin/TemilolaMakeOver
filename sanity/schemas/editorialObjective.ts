import { defineField, defineType } from "sanity";

export const editorialObjectiveSchema = defineType({
  name: "editorialObjective",
  title: "Editorial Objective",
  type: "document",
  description:
    "System-generated, one row per Topic Map cluster — the current highest-impact objective for that cluster and a concrete action checklist, all derived from what Cluster Authority, Topical Authority, and the Topic Lifecycle already computed. Recomputed weekly. Only status/actionedAt and each action's 'done' checkbox are hand-edited — mark the whole objective done once you've decided the cluster is in good shape (whether or not every action was ticked) and the next-highest-priority cluster becomes the new top objective automatically.",
  fields: [
    defineField({ name: "clusterNodeId", title: "Topic Map node ID", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "clusterLabel", title: "Cluster label", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "objectiveText", title: "Current goal", type: "string" }),
    defineField({
      name: "targetMetric",
      title: "Target metric",
      type: "object",
      fields: [
        defineField({ name: "label", title: "Label", type: "string" }),
        defineField({ name: "current", title: "Current value", type: "number" }),
        defineField({ name: "target", title: "Target value", type: "number" }),
      ],
    }),
    defineField({
      name: "actions",
      title: "Recommended actions",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "label", title: "Action", type: "string" }),
            defineField({ name: "done", title: "Done", type: "boolean", initialValue: false }),
          ],
        },
      ],
    }),
    defineField({ name: "priorityScore", title: "Priority score", type: "number" }),
    defineField({
      name: "decisionTrace",
      title: "Decision trace",
      type: "array",
      of: [{ type: "string" }],
      description: "Why this cluster ranks where it does — business priority, authority gap, lifecycle stage.",
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "New", value: "new" },
          { title: "In progress", value: "in_progress" },
          { title: "Done", value: "done" },
        ],
      },
      initialValue: "new",
    }),
    defineField({ name: "actionedAt", title: "Actioned at", type: "datetime" }),
    defineField({ name: "firstSeenAt", title: "First seen at", type: "datetime", readOnly: true }),
    defineField({ name: "lastComputedAt", title: "Last computed at", type: "datetime", readOnly: true }),
  ],
  orderings: [{ title: "Priority, highest first", name: "priorityDesc", by: [{ field: "priorityScore", direction: "desc" }] }],
  preview: {
    select: { title: "clusterLabel", objective: "objectiveText", status: "status", priority: "priorityScore" },
    prepare({ title, objective, status, priority }) {
      return {
        title: title ?? "Untitled cluster",
        subtitle: `${status ?? "new"} · priority ${priority ?? "?"} — ${objective ?? ""}`,
      };
    },
  },
});
