import { defineField, defineType } from "sanity";

export const bookingStepSchema = defineType({
  name: "bookingStep",
  title: "Booking Step",
  type: "document",
  fields: [
    defineField({ name: "step", title: "Step Number", type: "number" }),
    defineField({ name: "title", title: "Title", type: "string" }),
    defineField({ name: "description", title: "Description", type: "text" }),
  ],
  orderings: [{ title: "Step Number", name: "stepAsc", by: [{ field: "step", direction: "asc" }] }],
  preview: {
    select: { title: "title", subtitle: "step" },
    prepare({ title, subtitle }) {
      return { title: `Step ${subtitle}: ${title}` };
    },
  },
});
