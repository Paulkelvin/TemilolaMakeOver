import { defineField, defineType } from "sanity";

export const siteSettingsSchema = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    defineField({
      name: "youtubeReelUrl",
      title: "Homepage Video URL (YouTube)",
      type: "url",
      description:
        "Paste a YouTube link (e.g. https://www.youtube.com/watch?v=...). Leave empty to hide the video section.",
    }),
  ],
  preview: {
    prepare: () => ({ title: "Site Settings" }),
  },
});
