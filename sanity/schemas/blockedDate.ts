import { defineType, defineField } from "sanity";
import { CalendarIcon } from "lucide-react";

export const blockedDateSchema = defineType({
  name: "blockedDate",
  title: "Blocked Date",
  type: "document",
  icon: CalendarIcon,
  description:
    "Add dates you are NOT available. These dates will appear as unavailable on the booking calendar so clients cannot select them.",
  fields: [
    defineField({
      name: "date",
      title: "Unavailable Date",
      type: "date",
      description: "Pick a date you are not available for bookings",
      validation: (r) => r.required(),
      options: {
        dateFormat: "DD MMM YYYY",
      },
    }),
    defineField({
      name: "reason",
      title: "Reason (optional, only you can see this)",
      type: "string",
      description: "e.g. 'Wedding booked', 'Personal day', 'Holiday'",
    }),
  ],
  orderings: [
    {
      title: "Date (newest first)",
      name: "dateDesc",
      by: [{ field: "date", direction: "desc" }],
    },
    {
      title: "Date (oldest first)",
      name: "dateAsc",
      by: [{ field: "date", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "date", subtitle: "reason" },
    prepare({ title, subtitle }) {
      const formatted = title
        ? new Date(title + "T00:00:00").toLocaleDateString("en-NG", {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : "No date set";
      return {
        title: formatted,
        subtitle: subtitle || "No reason given",
      };
    },
  },
});
