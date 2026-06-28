import { defineType, defineField } from "sanity";

export const blockedDateSchema = defineType({
  name: "blockedDate",
  title: "Blocked Date",
  type: "document",
  fields: [
    defineField({
      name: "date",
      title: "Date",
      type: "date",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "reason",
      title: "Reason (admin note)",
      type: "string",
    }),
  ],
  preview: {
    select: { title: "date", subtitle: "reason" },
  },
});
