/**
 * Retry script for failed image uploads — replaces broken Unsplash IDs
 * with verified working ones.
 */

import { createClient } from "@sanity/client";
import * as dotenv from "dotenv";
import * as path from "path";

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

// Only the items that failed in the first run, with verified-working photo IDs
const failedPortfolio = [
  {
    docId: "portfolio-1",
    photoId: "photo-1498843053639-170ff2122f35",
    alt: "Soft glam bridal makeup — Temilola Makeup Lagos",
  },
  {
    docId: "portfolio-6",
    photoId: "photo-1560869713-7d0a29430803",
    alt: "Bridal soft glam — wedding makeup Lagos",
  },
  {
    docId: "portfolio-7",
    photoId: "photo-1571019613454-1cb2f99b2d8b",
    alt: "Soft glam party makeup — event makeup artist",
  },
  {
    docId: "portfolio-8",
    photoId: "photo-1614283233556-f35b0c801ef1",
    alt: "Bold glam birthday makeup — Lagos",
  },
  {
    docId: "portfolio-9",
    photoId: "photo-1616683693504-3ea7e9ad6fec",
    alt: "Before and after makeup transformation",
  },
  {
    docId: "portfolio-10",
    photoId: "photo-1604654894610-df63bc536371",
    alt: "Photoshoot glam makeup — professional artist",
  },
];

const failedServices = [
  {
    docId: "service-bridal",
    photoId: "photo-1598300042247-d088f8ab3a91",
    alt: "Bridal makeup by Temilola",
  },
  {
    docId: "service-birthday",
    photoId: "photo-1571945153237-4929e783af4a",
    alt: "Birthday glam makeup by Temilola",
  },
  {
    docId: "service-home",
    photoId: "photo-1522335789203-aabd1fc54bc9",
    alt: "Home service makeup by Temilola",
  },
];

const failedAboutImage = {
  docId: "pageCopy-about",
  photoId: "photo-1477959858617-67f85cf4f1df",
  alt: "Temilola — professional makeup artist in Lagos",
};

// Transformations that failed — with verified IDs
const failedTransformations = [
  {
    docId: "transformation-1",
    beforePhotoId: "photo-1506755855567-92ff770e8d00",
    afterPhotoId: "photo-1498843053639-170ff2122f35",
    title: "Bridal Transformation",
    beforeAlt: "Before bridal makeup",
    afterAlt: "After bridal makeup — Elegant Bridal Glow",
    order: 1,
  },
  {
    docId: "transformation-3",
    beforePhotoId: "photo-1604654894610-df63bc536371",
    afterPhotoId: "photo-1524504388940-b1c1722653e1",
    title: "Editorial Transformation",
    beforeAlt: "Before photoshoot makeup",
    afterAlt: "After photoshoot makeup",
    order: 3,
  },
  {
    docId: "transformation-4",
    beforePhotoId: "photo-1614283233556-f35b0c801ef1",
    afterPhotoId: "photo-1519741497674-611481863552",
    title: "Traditional Glam",
    beforeAlt: "Before traditional makeup",
    afterAlt: "After traditional bridal makeup",
    order: 4,
  },
  {
    docId: "transformation-5",
    beforePhotoId: "photo-1571019613454-1cb2f99b2d8b",
    afterPhotoId: "photo-1596462502278-27bfdc403348",
    title: "Event Glam Transformation",
    beforeAlt: "Before event glam makeup",
    afterAlt: "After event glam makeup",
    order: 5,
  },
  {
    docId: "transformation-6",
    beforePhotoId: "photo-1531746020798-e6953c6e8e04",
    afterPhotoId: "photo-1571945153237-4929e783af4a",
    title: "Cultural Elegance",
    beforeAlt: "Before traditional styling",
    afterAlt: "After traditional glam and gele",
    order: 6,
  },
];

async function fetchImageBuffer(photoId: string): Promise<Buffer> {
  const url = `https://images.unsplash.com/${photoId}?w=900&h=1125&fit=crop&auto=format&q=80`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function uploadImage(photoId: string, filename: string): Promise<string> {
  console.log(`  Downloading ${photoId}...`);
  const buffer = await fetchImageBuffer(photoId);
  const asset = await client.assets.upload("image", buffer, {
    filename: `${filename}.jpg`,
    contentType: "image/jpeg",
  });
  console.log(`  Uploaded → ${asset._id}`);
  return asset._id;
}

function imageRef(assetId: string) {
  return { _type: "image", asset: { _type: "reference", _ref: assetId } };
}

async function main() {
  console.log("Retrying failed image uploads...\n");

  console.log("── Portfolio Images ──────────────────────────");
  for (const item of failedPortfolio) {
    try {
      const assetId = await uploadImage(item.photoId, item.docId);
      await client.patch(item.docId).set({ image: imageRef(assetId), alt: item.alt }).commit();
      console.log(`  ✓ ${item.docId}`);
    } catch (err) {
      console.error(`  ✗ ${item.docId}:`, err);
    }
  }

  console.log("\n── Service Images ────────────────────────────");
  for (const item of failedServices) {
    try {
      const assetId = await uploadImage(item.photoId, item.docId);
      await client.patch(item.docId).set({ image: imageRef(assetId) }).commit();
      console.log(`  ✓ ${item.docId}`);
    } catch (err) {
      console.error(`  ✗ ${item.docId}:`, err);
    }
  }

  console.log("\n── About / Hero Image ────────────────────────");
  try {
    const assetId = await uploadImage(failedAboutImage.photoId, "about-hero");
    await client.patch(failedAboutImage.docId).set({ heroImage: imageRef(assetId) }).commit();
    console.log(`  ✓ About page hero image`);
  } catch (err) {
    console.error(`  ✗ About hero:`, err);
  }

  console.log("\n── Transformations ───────────────────────────");
  for (const pair of failedTransformations) {
    try {
      const beforeAssetId = await uploadImage(pair.beforePhotoId, `${pair.docId}-before`);
      const afterAssetId = await uploadImage(pair.afterPhotoId, `${pair.docId}-after`);
      await client.createOrReplace({
        _id: pair.docId,
        _type: "transformation",
        title: pair.title,
        beforeImage: imageRef(beforeAssetId),
        beforeAlt: pair.beforeAlt,
        afterImage: imageRef(afterAssetId),
        afterAlt: pair.afterAlt,
        order: pair.order,
      });
      console.log(`  ✓ ${pair.docId}: ${pair.title}`);
    } catch (err) {
      console.error(`  ✗ ${pair.docId}:`, err);
    }
  }

  console.log("\nDone!\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
