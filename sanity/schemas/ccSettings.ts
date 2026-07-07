import { defineField, defineType } from "sanity";

export const ccSettingsSchema = defineType({
  name: "ccSettings",
  title: "Command Center Settings",
  type: "document",
  description: "Singleton — module toggles and notification preferences for the Business Command Center.",
  fields: [
    defineField({
      name: "disabledModules",
      title: "Disabled Modules",
      type: "array",
      of: [{ type: "string" }],
      description: "Module keys hidden from all users (e.g. 'seo', 'website').",
    }),
    defineField({
      name: "notificationPreferences",
      title: "Notification Preferences",
      type: "array",
      of: [
        {
          type: "object",
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
                ],
              },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "feedEnabled",
              title: "Show in feed",
              type: "boolean",
              initialValue: true,
            }),
            defineField({
              name: "emailEnabled",
              title: "Also send email",
              type: "boolean",
              initialValue: false,
            }),
          ],
          preview: {
            select: { kind: "kind", feed: "feedEnabled", email: "emailEnabled" },
            prepare({ kind, feed, email }) {
              return {
                title: kind,
                subtitle: `Feed: ${feed ? "on" : "off"} · Email: ${email ? "on" : "off"}`,
              };
            },
          },
        },
      ],
    }),
  ],
  preview: {
    prepare() {
      return { title: "Command Center Settings" };
    },
  },
});
