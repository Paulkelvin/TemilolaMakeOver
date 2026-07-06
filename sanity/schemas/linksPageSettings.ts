import { defineField, defineType } from "sanity";

export const linksPageSettingsSchema = defineType({
  name: "linksPageSettings",
  title: "Links Page Settings",
  type: "document",
  fields: [
    defineField({
      name: "showCheckAvailability",
      title: "Show Check Availability",
      type: "boolean",
      description: "Show the inline Check Availability calendar dropdown on the /links page.",
      initialValue: true,
    }),
    defineField({
      name: "checkAvailabilityLabel",
      title: "Check Availability Label",
      type: "string",
      initialValue: "Check Availability",
      hidden: ({ parent }) => parent?.showCheckAvailability === false,
    }),
    defineField({
      name: "checkAvailabilityDescription",
      title: "Check Availability Description",
      type: "string",
      initialValue: "Pick a date & time to get started",
      hidden: ({ parent }) => parent?.showCheckAvailability === false,
    }),
  ],
  preview: {
    prepare() {
      return { title: "Links Page Settings" };
    },
  },
});
