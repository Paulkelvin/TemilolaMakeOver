/**
 * Sets mediaType: "icon" + a sensible default icon on the 6 bio-link
 * documents created by 2026-07-06-add-bio-links-for-links-page.ts, so the
 * /links page shows an icon immediately instead of an empty placeholder box
 * — no photo assets are needed. Studio still lets you switch mediaType to
 * Image/Video and pick a different icon per link afterward.
 *
 * Additive/idempotent: only sets these two fields via patch().set(), does
 * not touch anything else on these documents. Safe to re-run.
 *
 * Usage:
 *   npx tsx sanity/migrations/2026-07-06-set-icons-on-existing-bio-links.ts --dry-run
 *   npx tsx sanity/migrations/2026-07-06-set-icons-on-existing-bio-links.ts
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

const iconAssignments = [
  { _id: "bio-link-book", icon: "calendar-days" },
  { _id: "bio-link-portfolio", icon: "images" },
  { _id: "bio-link-services", icon: "tag" },
  { _id: "bio-link-whatsapp", icon: "message-circle" },
  { _id: "bio-link-instagram", icon: "camera" },
  { _id: "bio-link-website", icon: "globe" },
];

async function main() {
  console.log(dryRun ? "DRY RUN — no writes will be made\n" : "LIVE RUN — writing to Sanity\n");

  for (const { _id, icon } of iconAssignments) {
    console.log(`${_id}: mediaType -> "icon", icon -> "${icon}"`);
    if (!dryRun) {
      await client.patch(_id).set({ mediaType: "icon", icon }).commit({ autoGenerateArrayKeys: true });
      console.log(`  -> patched`);
    }
  }

  console.log(`\n${dryRun ? "Would patch" : "Done —"} ${iconAssignments.length} bio links.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
