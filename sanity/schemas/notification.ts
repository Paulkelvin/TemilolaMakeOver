import { defineField, defineType } from "sanity";

export const notificationSchema = defineType({
  name: "notification",
  title: "Notifications",
  type: "document",
  description: "Event-sourced alerts created by system triggers — bookings, payments, metric changes, content gaps.",
  fields: [
    defineField({
      name: "kind",
      title: "Kind",
      type: "string",
      options: {
        list: [
          { title: "Booking received", value: "booking_received" },
          { title: "Payment confirmed", value: "payment_confirmed" },
          { title: "Deploy failure", value: "deploy_failure" },
          { title: "Ranking drop", value: "ranking_drop" },
          { title: "Content gap", value: "content_gap" },
          { title: "New review", value: "new_review" },
          { title: "WBR ready", value: "wbr_ready" },
          { title: "Metric alert", value: "metric_alert" },
          { title: "SEO opportunity", value: "seo_opportunity" },
          { title: "Keyword cannibalization", value: "keyword_cannibalization" },
          { title: "Internal link gap", value: "internal_link_gap" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "severity",
      title: "Severity",
      type: "string",
      options: {
        list: [
          { title: "Info", value: "info" },
          { title: "Warning", value: "warning" },
          { title: "Critical", value: "critical" },
        ],
      },
      initialValue: "info",
    }),
    defineField({ name: "title", title: "Title", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "body", title: "Body", type: "text" }),
    defineField({ name: "read", title: "Read", type: "boolean", initialValue: false }),
    defineField({
      name: "metadata",
      title: "Metadata (JSON)",
      type: "text",
      description: "Type-specific structured data. Stringified JSON.",
    }),
  ],
  orderings: [
    { title: "Newest first", name: "createdDesc", by: [{ field: "_createdAt", direction: "desc" }] },
  ],
  preview: {
    select: { title: "title", kind: "kind", severity: "severity", read: "read", createdAt: "_createdAt" },
    prepare({ title, kind, severity, read }) {
      const icon = severity === "critical" ? "🔴" : severity === "warning" ? "🟡" : "🔵";
      return {
        title: `${icon} ${read ? "" : "● "}${title ?? kind ?? "Notification"}`,
        subtitle: kind,
      };
    },
  },
});
