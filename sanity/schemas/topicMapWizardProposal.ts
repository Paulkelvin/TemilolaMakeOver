import { defineField, defineType } from "sanity";

export const topicMapWizardProposalSchema = defineType({
  name: "topicMapWizardProposal",
  title: "Topic Map Wizard Proposal",
  type: "document",
  description:
    "System-generated, one row per 'Generate Proposal' run — a full candidate Topic Map hierarchy mined from Competitor Gaps, Search Console, Keyword Discovery, Google Autocomplete, verified articles, and the site's real taxonomy, meant to bootstrap an empty Topic Map in one reviewed pass instead of approving suggestions one at a time. Nothing here is written into the real Topic Map until a human approves the whole proposal — status/actionedAt are the only hand-edited fields.",
  fields: [
    defineField({ name: "generatedAt", title: "Generated at", type: "datetime", readOnly: true }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: { list: [{ title: "Draft — awaiting review", value: "draft" }, { title: "Approved", value: "approved" }, { title: "Discarded", value: "discarded" }] },
      initialValue: "draft",
    }),
    defineField({ name: "actionedAt", title: "Actioned at", type: "datetime" }),
    defineField({ name: "createdNodeCount", title: "Nodes created", type: "number", readOnly: true }),
    defineField({
      name: "proposedNodes",
      title: "Proposed nodes",
      type: "array",
      description: "The full candidate tree, flattened — each node references its parent by tempId until approval creates the real topicNode documents.",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "tempId", title: "Temp ID", type: "string", description: "Stable within this proposal only — used to link parent/child before real document IDs exist." }),
            defineField({ name: "label", title: "Label", type: "string" }),
            defineField({ name: "parentTempId", title: "Parent temp ID", type: "string", description: "Empty means top-level." }),
            defineField({
              name: "linkedTaxonomy",
              title: "Linked page",
              type: "object",
              description: "Set when this node maps to a real, already-built taxonomy document (e.g. an existing Service).",
              fields: [
                defineField({
                  name: "type",
                  title: "Type",
                  type: "string",
                  options: { list: [{ title: "Service", value: "service" }, { title: "Makeup Style", value: "makeupStyle" }, { title: "Occasion", value: "occasion" }, { title: "Wedding Type", value: "weddingType" }, { title: "Location", value: "location" }] },
                }),
                defineField({
                  name: "ref",
                  title: "Document",
                  type: "reference",
                  to: [{ type: "service" }, { type: "makeupStyle" }, { type: "occasion" }, { type: "weddingType" }, { type: "location" }],
                }),
              ],
            }),
            defineField({
              name: "evidence",
              title: "Evidence",
              type: "array",
              of: [
                {
                  type: "object",
                  fields: [
                    defineField({ name: "source", title: "Source", type: "string" }),
                    defineField({ name: "detail", title: "Detail", type: "string" }),
                    defineField({ name: "priorityScore", title: "Priority score", type: "number" }),
                  ],
                },
              ],
            }),
            defineField({ name: "priorityScore", title: "Priority score", type: "number" }),
            defineField({ name: "confidenceScore", title: "Confidence score", type: "number" }),
            defineField({ name: "confidenceLabel", title: "Confidence", type: "string" }),
          ],
        },
      ],
    }),
  ],
  orderings: [{ title: "Generated, newest first", name: "generatedDesc", by: [{ field: "generatedAt", direction: "desc" }] }],
  preview: {
    select: { status: "status", nodeCount: "proposedNodes", generatedAt: "generatedAt" },
    prepare({ status, nodeCount, generatedAt }) {
      const count = Array.isArray(nodeCount) ? nodeCount.length : 0;
      return {
        title: `Wizard proposal — ${count} node${count === 1 ? "" : "s"}`,
        subtitle: `${status ?? "draft"} · generated ${generatedAt ? new Date(generatedAt).toLocaleDateString() : "?"}`,
      };
    },
  },
});
