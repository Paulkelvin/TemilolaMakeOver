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
      description:
        "Pick a date you are not available for bookings. Make sure the year is correct!",
      validation: (r) =>
        r.required().custom((date) => {
          if (!date) return true;
          const d = new Date(date + "T00:00:00");
          const now = new Date();
          const oneYearOut = new Date();
          oneYearOut.setFullYear(now.getFullYear() + 1);
          if (d < new Date(now.toISOString().slice(0, 10) + "T00:00:00")) {
            return "This date is in the past";
          }
          if (d > oneYearOut) {
            return "Date cannot be more than 1 year from now";
          }
          return true;
        }),
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
    defineField({
      name: "artist",
      title: "Artist",
      type: "reference",
      to: [{ type: "artist" }],
      description: "Leave empty if this date is blocked for the whole business. Set an artist once there is more than one artist to scope this to their calendar specifically.",
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
