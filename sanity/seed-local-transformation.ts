/**
 * Upload local before/after transformation images to Sanity.
 *
 * Place your images in public/images/ as:
 *   before1.jpg  (or .png / .jpeg)
 *   after1.jpg
 *
 * Then run:
 *   npx tsx sanity/seed-local-transformation.ts
 */

import { createClient } from "@sanity/client";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const token = process.env.SANITY_API_TOKEN!;

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: "2024-01-01",
  useCdn: false,
});

const IMAGE_DIR = path.resolve(process.cwd(), "public/images");

const EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

function findLocalImage(base: string): string | null {
  for (const ext of EXTENSIONS) {
    const candidate = path.join(IMAGE_DIR, `${base}${ext}`);
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

async function uploadLocalFile(filePath: string, docId: string): Promise<string> {
  console.log(`  Uploading ${path.basename(filePath)}...`);
  const buffer = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase().replace(".", "");
  const contentType = ext === "png" ? "image/png" : "image/jpeg";
  const asset = await client.assets.upload("image", buffer, {
    filename: path.basename(filePath),
    contentType,
  });
  console.log(`  Uploaded → ${asset._id}`);
  return asset._id;
}

function imageRef(assetId: string) {
  return {
    _type: "image",
    asset: { _type: "reference", _ref: assetId },
  };
}

async function main() {
  const beforePath = findLocalImage("before1");
  const afterPath = findLocalImage("after1");

  if (!beforePath || !afterPath) {
    console.error(
      "Missing images. Place before1.jpg and after1.jpg in public/images/ and re-run."
    );
    console.error(`  before1: ${beforePath ?? "NOT FOUND"}`);
    console.error(`  after1:  ${afterPath ?? "NOT FOUND"}`);
    process.exit(1);
  }

  console.log("Uploading transformation-0 (real client before/after)...\n");

  const beforeAssetId = await uploadLocalFile(beforePath, "transformation-0-before");
  const afterAssetId = await uploadLocalFile(afterPath, "transformation-0-after");

  await client.createOrReplace({
    _id: "transformation-0",
    _type: "transformation",
    title: "Signature Glam Transformation",
    beforeImage: imageRef(beforeAssetId),
    beforeAlt: "Before makeup — natural skin",
    afterImage: imageRef(afterAssetId),
    afterAlt: "After makeup — full glam by Gleam by Temi",
    order: 0,
  });

  console.log("\n✓ transformation-0 seeded successfully.");
  console.log("It will appear first in the Transformations page (order: 0).");
}

main().catch((err) => {
  console.error("Upload failed:", err);
  process.exit(1);
});
