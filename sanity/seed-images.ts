/**
 * Downloads portfolio images from Unsplash and uploads them to Sanity.
 * Run after seed.ts: npx tsx sanity/seed-images.ts
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

// Map portfolio document IDs to Unsplash photo IDs + metadata
const portfolioImages: {
  docId: string;
  photoId: string;
  title: string;
  alt: string;
}[] = [
  {
    docId: "portfolio-1",
    photoId: "photo-1457972729786-0411a3b2b626",
    title: "Elegant Bridal Glow",
    alt: "Soft glam bridal makeup — Temilola Makeup Lagos",
  },
  {
    docId: "portfolio-2",
    photoId: "photo-1487412947147-5cebf100ffc2",
    title: "Romantic Soft Glam",
    alt: "Event glam makeup look — Lagos makeup artist",
  },
  {
    docId: "portfolio-3",
    photoId: "photo-1596462502278-27bfdc403348",
    title: "Evening Event Glam",
    alt: "Bold glam evening makeup — Temilola Makeup",
  },
  {
    docId: "portfolio-4",
    photoId: "photo-1519741497674-611481863552",
    title: "Traditional Bridal",
    alt: "Traditional bridal makeup — Lagos wedding",
  },
  {
    docId: "portfolio-5",
    photoId: "photo-1524504388940-b1c1722653e1",
    title: "Editorial Photoshoot",
    alt: "Photoshoot makeup — camera-ready glam",
  },
  {
    docId: "portfolio-6",
    photoId: "photo-1516975080664-ed2fc6a32937",
    title: "Classic Bridal Beauty",
    alt: "Bridal soft glam — wedding makeup Lagos",
  },
  {
    docId: "portfolio-7",
    photoId: "photo-1503236823255-94609f598e71",
    title: "Party Soft Glam",
    alt: "Soft glam party makeup — event makeup artist",
  },
  {
    docId: "portfolio-8",
    photoId: "photo-1560869713-7d0a29430803",
    title: "Birthday Statement",
    alt: "Bold glam birthday makeup — Lagos",
  },
  {
    docId: "portfolio-9",
    photoId: "photo-1512496015851-a90fb38ba796",
    title: "Bridal Transformation",
    alt: "Before and after makeup transformation",
  },
  {
    docId: "portfolio-10",
    photoId: "photo-1526045478516-99145907023c",
    title: "Fashion Forward",
    alt: "Photoshoot glam makeup — professional artist",
  },
  {
    docId: "portfolio-11",
    photoId: "photo-1531746020798-e6953c6e8e04",
    title: "Cultural Elegance",
    alt: "Traditional wedding glam — Nigerian bride",
  },
  {
    docId: "portfolio-12",
    photoId: "photo-1580618672591-eb180b1a973f",
    title: "Soft Glam Reveal",
    alt: "Before and after soft glam transformation",
  },
];

// Service images — using relevant Unsplash photos
const serviceImages: {
  docId: string;
  photoId: string;
  alt: string;
}[] = [
  {
    docId: "service-bridal",
    photoId: "photo-1562322140-8baeececf3df",
    alt: "Bridal makeup by Temilola",
  },
  {
    docId: "service-traditional",
    photoId: "photo-1519741497674-611481863552",
    alt: "Traditional bridal makeup by Temilola",
  },
  {
    docId: "service-soft-glam",
    photoId: "photo-1487412947147-5cebf100ffc2",
    alt: "Soft glam makeup by Temilola",
  },
  {
    docId: "service-event",
    photoId: "photo-1596462502278-27bfdc403348",
    alt: "Event glam makeup by Temilola",
  },
  {
    docId: "service-birthday",
    photoId: "photo-1560869713-7d0a29430803",
    alt: "Birthday glam makeup by Temilola",
  },
  {
    docId: "service-photoshoot",
    photoId: "photo-1524504388940-b1c1722653e1",
    alt: "Photoshoot makeup by Temilola",
  },
  {
    docId: "service-home",
    photoId: "photo-1516975080664-ed2fc6a32937",
    alt: "Home service makeup by Temilola",
  },
  {
    docId: "service-group",
    photoId: "photo-1580618672591-eb180b1a973f",
    alt: "Group booking makeup by Temilola",
  },
  {
    docId: "service-gele",
    photoId: "photo-1531746020798-e6953c6e8e04",
    alt: "Gele styling by Temilola",
  },
];

// About page / hero image
const aboutImage = {
  docId: "pageCopy-about",
  photoId: "photo-1503236823255-94609f598e71",
  alt: "Temilola — professional makeup artist in Lagos",
};

// Transformation before/after pairs
const transformationPairs = [
  {
    docId: "transformation-1",
    beforePhotoId: "photo-1512496015851-a90fb38ba796",
    afterPhotoId: "photo-1562322140-8baeececf3df",
    title: "Bridal Transformation",
    beforeAlt: "Before bridal makeup",
    afterAlt: "After bridal makeup — Elegant Bridal Glow",
    order: 1,
  },
  {
    docId: "transformation-2",
    beforePhotoId: "photo-1580618672591-eb180b1a973f",
    afterPhotoId: "photo-1487412947147-5cebf100ffc2",
    title: "Soft Glam Reveal",
    beforeAlt: "Before soft glam makeup",
    afterAlt: "After soft glam makeup",
    order: 2,
  },
  {
    docId: "transformation-3",
    beforePhotoId: "photo-1526045478516-99145907023c",
    afterPhotoId: "photo-1524504388940-b1c1722653e1",
    title: "Editorial Transformation",
    beforeAlt: "Before photoshoot makeup",
    afterAlt: "After photoshoot makeup",
    order: 3,
  },
  {
    docId: "transformation-4",
    beforePhotoId: "photo-1560869713-7d0a29430803",
    afterPhotoId: "photo-1519741497674-611481863552",
    title: "Traditional Glam",
    beforeAlt: "Before traditional makeup",
    afterAlt: "After traditional bridal makeup",
    order: 4,
  },
  {
    docId: "transformation-5",
    beforePhotoId: "photo-1503236823255-94609f598e71",
    afterPhotoId: "photo-1596462502278-27bfdc403348",
    title: "Event Glam Transformation",
    beforeAlt: "Before event glam makeup",
    afterAlt: "After event glam makeup",
    order: 5,
  },
  {
    docId: "transformation-6",
    beforePhotoId: "photo-1531746020798-e6953c6e8e04",
    afterPhotoId: "photo-1516975080664-ed2fc6a32937",
    title: "Cultural Elegance",
    beforeAlt: "Before traditional styling",
    afterAlt: "After traditional glam and gele",
    order: 6,
  },
];

// Blog post cover images
const blogImages: {
  docId: string;
  photoId: string;
  alt: string;
}[] = [
  {
    docId: "blog-post-1",
    photoId: "photo-1519741497674-611481863552",
    alt: "Bride getting makeup done — when to book your bridal makeup artist",
  },
  {
    docId: "blog-post-2",
    photoId: "photo-1487412947147-5cebf100ffc2",
    alt: "Soft glam vs bold glam makeup comparison",
  },
  {
    docId: "blog-post-3",
    photoId: "photo-1596462502278-27bfdc403348",
    alt: "Skin preparation before makeup application",
  },
];

async function fetchImageBuffer(photoId: string): Promise<Buffer> {
  const url = `https://images.unsplash.com/${photoId}?w=900&h=1125&fit=crop&auto=format&q=80`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function uploadImage(
  photoId: string,
  filename: string
): Promise<string> {
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
  return {
    _type: "image",
    asset: { _type: "reference", _ref: assetId },
  };
}

async function seedPortfolioImages() {
  console.log("\n── Portfolio Images ─────────────────────────");
  for (const item of portfolioImages) {
    try {
      const assetId = await uploadImage(item.photoId, item.docId);
      await client
        .patch(item.docId)
        .set({ image: imageRef(assetId), alt: item.alt })
        .commit();
      console.log(`  ✓ ${item.docId}: ${item.title}`);
    } catch (err) {
      console.error(`  ✗ ${item.docId}:`, err);
    }
  }
}

async function seedServiceImages() {
  console.log("\n── Service Images ───────────────────────────");
  for (const item of serviceImages) {
    try {
      const assetId = await uploadImage(item.photoId, item.docId);
      await client
        .patch(item.docId)
        .set({ image: imageRef(assetId) })
        .commit();
      console.log(`  ✓ ${item.docId}`);
    } catch (err) {
      console.error(`  ✗ ${item.docId}:`, err);
    }
  }
}

async function seedAboutImage() {
  console.log("\n── About / Hero Image ───────────────────────");
  try {
    const assetId = await uploadImage(aboutImage.photoId, "about-hero");
    await client
      .patch(aboutImage.docId)
      .set({ heroImage: imageRef(assetId) })
      .commit();
    console.log(`  ✓ About page hero image`);
  } catch (err) {
    console.error(`  ✗ About hero:`, err);
  }
}

async function seedTransformations() {
  console.log("\n── Transformations (Before & After) ─────────");
  for (const pair of transformationPairs) {
    try {
      // Create/replace transformation document
      const beforeAssetId = await uploadImage(
        pair.beforePhotoId,
        `${pair.docId}-before`
      );
      const afterAssetId = await uploadImage(
        pair.afterPhotoId,
        `${pair.docId}-after`
      );

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
}

async function seedBlogImages() {
  console.log("\n── Blog Cover Images ────────────────────────");
  for (const item of blogImages) {
    try {
      const assetId = await uploadImage(item.photoId, item.docId);
      await client
        .patch(item.docId)
        .set({ coverImage: imageRef(assetId) })
        .commit();
      console.log(`  ✓ ${item.docId}`);
    } catch (err) {
      console.error(`  ✗ ${item.docId}:`, err);
    }
  }
}

async function main() {
  console.log("Seeding images to Sanity (project: " + projectId + ")...");
  await seedPortfolioImages();
  await seedServiceImages();
  await seedAboutImage();
  await seedTransformations();
  await seedBlogImages();
  console.log("\nDone! All images seeded.\n");
}

main().catch((err) => {
  console.error("Image seed failed:", err);
  process.exit(1);
});
