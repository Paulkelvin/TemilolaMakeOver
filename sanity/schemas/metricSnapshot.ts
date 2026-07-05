import { defineField, defineType } from "sanity";

export const metricSnapshotSchema = defineType({
  name: "metricSnapshot",
  title: "Metric Snapshot",
  type: "document",
  description:
    "System-generated. One row per (source, metric, date) — daily history for anything the Business Command Center pulls from an external API (Search Console, GA4, Vercel, Paystack). Never hand-authored; a scheduled job upserts these so every external number stays traceable to a source and a fetch time instead of being recomputed silently.",
  fields: [
    defineField({
      name: "source",
      title: "Source",
      type: "string",
      options: {
        list: [
          { title: "Sanity", value: "sanity" },
          { title: "Paystack", value: "paystack" },
          { title: "Search Console", value: "search-console" },
          { title: "GA4", value: "ga4" },
          { title: "Vercel", value: "vercel" },
          { title: "Calculated", value: "calculated" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "metric",
      title: "Metric key",
      type: "string",
      description: "Stable identifier, e.g. \"seo.impressions\" or \"revenue.total\".",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "date",
      title: "Date this snapshot covers",
      type: "date",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "value",
      title: "Value",
      type: "number",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "fetchedAt",
      title: "Fetched at",
      type: "datetime",
      description: "When this snapshot was actually pulled from its source — shown as the freshness timestamp on the metric's badge.",
      readOnly: true,
    }),
  ],
  orderings: [
    { title: "Newest first", name: "dateDesc", by: [{ field: "date", direction: "desc" }] },
  ],
  preview: {
    select: { source: "source", metric: "metric", date: "date", value: "value" },
    prepare({ source, metric, date, value }) {
      return {
        title: `${metric ?? "unknown metric"} — ${value ?? "?"}`,
        subtitle: `${source ?? "?"} · ${date ?? "?"}`,
      };
    },
  },
});
