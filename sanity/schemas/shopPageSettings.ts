import { defineField, defineType } from "sanity";

export const shopPageSettingsSchema = defineType({
  name: "shopPageSettings",
  title: "Shop Page Settings",
  type: "document",
  fields: [
    defineField({
      name: "pageTitle",
      title: "Page Title",
      type: "string",
      initialValue: "Shop & Recommendations",
    }),
    defineField({
      name: "pageSubtitle",
      title: "Page Subtitle",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "showSectionHeaders",
      title: "Show Section Headers",
      type: "boolean",
      initialValue: true,
    }),
  ],
  preview: {
    prepare() {
      return { title: "Shop Page Settings" };
    },
  },
});
