import { defineField, defineType } from "sanity";

export const siteConfigSchema = defineType({
  name: "siteConfig",
  title: "Site Configuration",
  type: "document",
  fields: [
    defineField({ name: "brand", title: "Brand Name", type: "string" }),
    defineField({ name: "artistName", title: "Artist Name", type: "string" }),
    defineField({ name: "tagline", title: "Tagline", type: "string" }),
    defineField({ name: "description", title: "Site Description", type: "text" }),
    defineField({
      name: "usp",
      title: "Unique Selling Points",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({ name: "url", title: "Site URL", type: "url" }),
    defineField({ name: "location", title: "Location", type: "string" }),
    defineField({ name: "serviceArea", title: "Service Area", type: "string" }),
    defineField({ name: "phone", title: "Phone", type: "string" }),
    defineField({ name: "phoneRaw", title: "Phone (raw)", type: "string" }),
    defineField({ name: "whatsapp", title: "WhatsApp Number", type: "string" }),
    defineField({ name: "email", title: "Email", type: "string" }),
    defineField({ name: "instagram", title: "Instagram URL", type: "url" }),
    defineField({ name: "instagramHandle", title: "Instagram Handle", type: "string" }),
    defineField({ name: "tiktok", title: "TikTok URL", type: "url" }),
    defineField({ name: "tiktokHandle", title: "TikTok Handle", type: "string" }),
    defineField({ name: "hours", title: "Business Hours", type: "string" }),
    defineField({ name: "currency", title: "Currency", type: "string" }),
    defineField({ name: "depositNote", title: "Deposit Note", type: "string" }),
    defineField({ name: "pricingDisclaimer", title: "Pricing Disclaimer", type: "text" }),
  ],
  preview: {
    select: { title: "brand" },
  },
});
