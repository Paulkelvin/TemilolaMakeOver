/**
 * Publishes all draft documents in Sanity by copying them to their
 * published ID and deleting the draft.
 *
 * Usage: npx tsx sanity/publish-all.ts
 */

import { createClient } from "@sanity/client";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_TOKEN;

if (!projectId || !token) {
  console.error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_API_TOKEN");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: "2024-01-01",
  useCdn: false,
});

async function publishAll() {
  console.log("Fetching all draft documents...\n");

  const drafts = await client.fetch<Array<{ _id: string; _type: string }>>(
    `*[_id in path("drafts.**")]{ _id, _type }`
  );

  if (drafts.length === 0) {
    console.log("No draft documents found — everything is already published.");
    return;
  }

  console.log(`Found ${drafts.length} draft(s). Publishing...\n`);

  let published = 0;
  let failed = 0;

  for (const draft of drafts) {
    const publishedId = draft._id.replace(/^drafts\./, "");
    try {
      // Fetch the full draft document
      const doc = await client.getDocument(draft._id);
      if (!doc) continue;

      // Write it to the published ID
      const { _id: _draftId, ...rest } = doc;
      await client.createOrReplace({ ...rest, _id: publishedId });

      // Delete the draft
      await client.delete(draft._id);

      console.log(`  Published: [${draft._type}] ${publishedId}`);
      published++;
    } catch (err) {
      console.error(`  Failed: ${draft._id} — ${err}`);
      failed++;
    }
  }

  console.log(`\nDone! Published: ${published}, Failed: ${failed}`);
}

publishAll().catch((err) => {
  console.error("Publish failed:", err);
  process.exit(1);
});
