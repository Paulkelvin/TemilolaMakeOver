/**
 * Migrates the previously hardcoded /links page entries into real, editable
 * bioLink documents in Sanity — same layout-choice system already used for
 * /TemilolaShyllon's shop links (compact / featured / wide). All seeded
 * with layout: "wide" (image left, text right) to match the page's current
 * look. Additive only (createIfNotExists), safe to re-run.
 *
 * None of these documents have an image attached yet — the old page used
 * lucide icons, not real photos. The wide/featured card layouts need a
 * real image per link to look complete; add one to each in Sanity Studio
 * (Shop & Links → Bio Links) after running this.
 *
 * Usage:
 *   npx tsx sanity/migrations/2026-07-06-add-bio-links-for-links-page.ts --dry-run
 *   npx tsx sanity/migrations/2026-07-06-add-bio-links-for-links-page.ts
 *
 * Requires NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET,
 * and SANITY_API_WRITE_TOKEN in .env.local
 */

import { createClient } from "@sanity/client";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_WRITE_TOKEN;
const dryRun = process.argv.includes("--dry-run");

if (!projectId || (!token && !dryRun)) {
  console.error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_API_WRITE_TOKEN in .env.local");
  process.exit(1);
}

const client = createClient({
  projectId: projectId!,
  dataset,
  apiVersion: "2024-01-01",
  token,
  useCdn: false,
});

// Mirrors lib/whatsapp.ts's "availability" intent template exactly, without
// importing the app's "@/..." path alias into this standalone script.
const whatsappMessage = `Hello Gleam, I'd like to check availability for a makeup session.

Name:
Service:
Event Date:
Location:
Number of Faces:
Preferred Look:`;
const whatsappUrl = `https://wa.me/2347058596531?text=${encodeURIComponent(whatsappMessage)}`;

const bioLinks = [
  {
    _id: "bio-link-book",
    _type: "bioLink",
    title: "Book Your Date",
    url: "/book#booking-form",
    description: "Check availability & reserve",
    mediaType: "image",
    layout: "wide",
    order: 0,
  },
  {
    _id: "bio-link-portfolio",
    _type: "bioLink",
    title: "View Portfolio",
    url: "/portfolio#gallery",
    description: "Real client looks & transformations",
    mediaType: "image",
    layout: "wide",
    order: 1,
  },
  {
    _id: "bio-link-services",
    _type: "bioLink",
    title: "Services & Pricing",
    url: "/services",
    description: "Bridal, glam, editorial & more",
    mediaType: "image",
    layout: "wide",
    order: 2,
  },
  {
    _id: "bio-link-whatsapp",
    _type: "bioLink",
    title: "Chat on WhatsApp",
    url: whatsappUrl,
    description: "Quick questions & quotes",
    mediaType: "image",
    layout: "wide",
    order: 3,
  },
  {
    _id: "bio-link-instagram",
    _type: "bioLink",
    title: "Follow on Instagram",
    url: "https://www.instagram.com/gleambytemi/",
    description: "@gleambytemi",
    mediaType: "image",
    layout: "wide",
    order: 4,
  },
  {
    _id: "bio-link-website",
    _type: "bioLink",
    title: "Visit Full Website",
    url: "/",
    description: "Everything about Gleam by Temi",
    mediaType: "image",
    layout: "wide",
    order: 5,
  },
];

async function main() {
  console.log(dryRun ? "DRY RUN — no writes will be made\n" : "LIVE RUN — writing to Sanity\n");

  for (const link of bioLinks) {
    console.log(`${link._id}: "${link.title}" -> ${link.url}`);
    if (!dryRun) {
      await client.createIfNotExists(link);
      console.log(`  -> created (or already existed)`);
    }
  }

  console.log(`\n${dryRun ? "Would create" : "Done —"} ${bioLinks.length} bio links.`);
  console.log("\nRemember: add an image to each in Studio (Shop & Links -> Bio Links) for the wide-card layout to look complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
