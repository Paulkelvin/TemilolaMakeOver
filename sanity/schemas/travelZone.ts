import { defineField, defineType } from "sanity";

export const travelZoneSchema = defineType({
  name: "travelZone",
  title: "Travel Zones",
  type: "document",
  fields: [
    defineField({
      name: "label",
      title: "Zone Name",
      type: "string",
      description: "Pick the zone this covers.",
      options: {
        list: [
          "Lekki / VI / Ikoyi",
          "Ajah / Sangotedo / Chevron",
          "Ikeja / GRA / Magodo",
          "Yaba / Surulere / Gbagada",
          "Festac / Amuwo / Oshodi",
          "Ikorodu / Epe / Badagry",
          "Outside Lagos (Ibadan, Abeokuta, etc.)",
        ],
        layout: "dropdown",
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "areas",
      title: "Areas Covered",
      type: "array",
      of: [{ type: "string" }],
      description: "Add or remove specific areas covered by this zone.",
      options: { layout: "tags" },
      validation: (r) => r.required().min(1),
    }),
    defineField({
      name: "fee",
      title: "Travel Fee (₦)",
      type: "number",
      description: "Set to 0 for 'included'. Set to -1 for 'quote on request' (e.g. outside Lagos).",
      validation: (r) => r.required().min(-1),
      initialValue: 0,
    }),
    defineField({
      name: "note",
      title: "Note (optional)",
      type: "string",
      description: "Shown to the customer when this zone is selected, e.g. 'Travel fee quoted separately'",
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
      initialValue: 0,
    }),
  ],
  orderings: [
    {
      title: "Display Order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "label", fee: "fee" },
    prepare({ title, fee }) {
      const feeText =
        fee === -1
          ? "Quote on request"
          : fee === 0
            ? "Travel included"
            : `+₦${Number(fee).toLocaleString()}`;
      return {
        title: title ?? "Untitled zone",
        subtitle: feeText,
      };
    },
  },
});
