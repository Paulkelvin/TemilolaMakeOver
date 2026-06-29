import { defineField, defineType } from "sanity";

export const bookingSchema = defineType({
  name: "booking",
  title: "Bookings",
  type: "document",
  fields: [
    defineField({ name: "clientName", title: "Client Name", type: "string" }),
    defineField({ name: "phone", title: "Phone", type: "string" }),
    defineField({ name: "email", title: "Email", type: "string" }),
    defineField({ name: "service", title: "Service", type: "string" }),
    defineField({ name: "eventType", title: "Event Type", type: "string" }),
    defineField({ name: "eventDate", title: "Event Date", type: "string" }),
    defineField({ name: "eventTime", title: "Preferred Time", type: "string" }),
    defineField({ name: "eventLocation", title: "Location", type: "string" }),
    defineField({ name: "numberOfFaces", title: "Number of Faces", type: "number" }),
    defineField({ name: "message", title: "Message / Inspiration", type: "text" }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Pending", value: "pending" },
          { title: "Confirmed", value: "confirmed" },
          { title: "Paid", value: "paid" },
          { title: "Cancelled", value: "cancelled" },
        ],
        layout: "radio",
      },
      initialValue: "pending",
    }),
    defineField({
      name: "submittedAt",
      title: "Submitted At",
      type: "datetime",
      readOnly: true,
    }),
    defineField({
      name: "paidAt",
      title: "Paid At",
      type: "datetime",
      readOnly: true,
    }),
  ],
  orderings: [
    { title: "Newest first", name: "submittedDesc", by: [{ field: "submittedAt", direction: "desc" }] },
    { title: "Event date", name: "eventDateAsc", by: [{ field: "eventDate", direction: "asc" }] },
  ],
  preview: {
    select: { title: "clientName", subtitle: "eventDate", status: "status" },
    prepare({ title, subtitle, status }) {
      const statusEmoji: Record<string, string> = {
        pending: "🕐",
        confirmed: "✅",
        paid: "💳",
        cancelled: "❌",
      };
      return {
        title: `${statusEmoji[status] ?? "📋"} ${title ?? "Unknown client"}`,
        subtitle: subtitle ? `${subtitle} · ${status}` : status,
      };
    },
  },
});
