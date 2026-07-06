/**
 * Adds two new blog posts derived from YouTube tutorial scripts the client
 * supplied (correct application order, and contour vs. bronzer technique).
 * Rewritten originally in Gleam's own voice — not copied from the source
 * transcripts — while keeping the technique terminology intact since
 * that's the actual searchable keyword substance. Additive only
 * (createIfNotExists), so re-running this is a no-op if already applied.
 *
 * Usage:
 *   npx tsx sanity/migrations/2026-07-06-add-blog-posts-video-derived-tutorials.ts --dry-run
 *   npx tsx sanity/migrations/2026-07-06-add-blog-posts-video-derived-tutorials.ts
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

// ─── Portable Text helpers ──────────────────────────────────────────────────

let keyCounter = 0;
function nextKey(prefix: string): string {
  keyCounter += 1;
  return `${prefix}-${keyCounter}`;
}

interface Segment {
  text: string;
  href?: string;
}

function p(segments: Segment[] | string) {
  const parts: Segment[] = typeof segments === "string" ? [{ text: segments }] : segments;
  const blockKey = nextKey("b");

  const markDefs = parts
    .filter((s) => s.href)
    .map((s, i) => ({ _type: "link" as const, _key: `${blockKey}-l${i}`, href: s.href! }));

  const children = parts.map((s, i) => {
    const def = s.href ? markDefs.find((m) => m.href === s.href) : undefined;
    return {
      _type: "span" as const,
      _key: `${blockKey}-s${i}`,
      text: s.text,
      marks: def ? [def._key] : [],
    };
  });

  return { _type: "block" as const, _key: blockKey, style: "normal" as const, markDefs, children };
}

function h2(text: string) {
  const blockKey = nextKey("h");
  return {
    _type: "block" as const,
    _key: blockKey,
    style: "h2" as const,
    markDefs: [],
    children: [{ _type: "span" as const, _key: `${blockKey}-s0`, text, marks: [] }],
  };
}

// ─── Post 4: Correct order to apply makeup ──────────────────────────────────

const post4 = {
  _id: "blog-post-14",
  _type: "blogPost",
  title: "The Correct Order to Apply Your Makeup (And Why Sequence Matters More Than the Products)",
  slug: { _type: "slug", current: "correct-order-to-apply-makeup" },
  excerpt:
    "Most bad makeup days get blamed on the products. Nine times out of ten, it's actually the order things went on in. Here's the sequence that actually holds up.",
  category: "Tutorials",
  author: "Temilola",
  publishedAt: "2026-07-06T10:15:00Z",
  order: 14,
  body: [
    p(
      "Most people troubleshoot a bad makeup day by blaming the products — wrong foundation, wrong brush, wrong shade. Just as often, the real issue is sequence. Applied in the wrong order, even good products fight each other. Applied in the right order, an average product performs far better than it has any right to."
    ),
    h2("Brows Come First, Before Anything Touches Your Skin"),
    p(
      "Brow product needs to grip clean, bare skin — not slide around on top of primer or foundation that's already down. Doing brows midway through or last is one of the most common beginner mistakes, and it's almost always why a brow gel \"won't hold\" or a pencil drags through makeup you already spent time blending. Always start bare-faced."
    ),
    h2("Eyes Before Base — Not After"),
    p(
      "This feels backwards to a lot of beginners, but eyeshadow fallout is genuinely easier to clean off bare skin than off a foundation you've already spent ten minutes perfecting. Doing the eye look first also means lash application — strip lashes or mascara — doesn't risk smudging a base that's already set."
    ),
    h2("Prime and Correct Before Foundation, Not as an Afterthought"),
    p([
      { text: "Your primer should match your actual skin type, not just whatever's in front of you — a mattifying formula for oily skin, a hydrating one for dry skin. I go through this in more detail in " },
      { text: "Preparing Your Skin Before Makeup Application", href: "/blog/preparing-your-skin-before-makeup-application" },
      { text: " and " },
      { text: "Makeup for Every Nigerian Skin Tone and Skin Type", href: "/blog/makeup-for-every-nigerian-skin-tone-and-skin-type" },
      { text: ". And if foundation tends to turn grey or ashy around the mouth or under the eyes by midday, that's usually a missing color-correcting step before foundation, not a foundation problem." },
    ]),
    h2("Contour and Concealer Go On Together, Then You Set in Stages"),
    p(
      "A cream contour, two to three shades deeper than your base, rebuilds the shadow and structure that foundation flattens out. Concealer does the brightening and correcting work. Both go on before anything gets set with powder — and the setting itself should happen in stages, under-eyes first so you don't lock in a crease, then the rest of the face, so nothing shifts as the look builds."
    ),
    h2("Setting Spray Comes Before Mascara, Not After"),
    p(
      "This is a sequencing detail even people who've worn makeup for years get wrong. Not every mascara is waterproof, and finishing with setting spray after mascara risks smudging it straight down your lid. Spray first, mascara after, lips last."
    ),
    p([
      { text: "This exact sequencing matters even more on a day nothing can be redone — a wedding day especially, which is exactly what a " },
      { text: "trial session", href: "/blog/what-happens-at-a-bridal-makeup-trial" },
      { text: " exists to test in advance. See what's included on my " },
      { text: "services", href: "/services" },
      { text: " and " },
      { text: "pricing", href: "/pricing" },
      { text: " pages, or " },
      { text: "book", href: "/book" },
      { text: " to talk it through." },
    ]),
  ],
};

// ─── Post 5: Contour vs. bronzer ─────────────────────────────────────────────

const post5 = {
  _id: "blog-post-15",
  _type: "blogPost",
  title: "Contour vs. Bronzer: What They Actually Do (and Why You Probably Need Both)",
  slug: { _type: "slug", current: "contour-vs-bronzer-difference" },
  excerpt:
    "\"Contour\" and \"bronzer\" get used interchangeably online, and it's genuinely confusing when even the packaging looks identical. They do two different jobs.",
  category: "Beauty Education",
  author: "Temilola",
  publishedAt: "2026-07-06T10:20:00Z",
  order: 15,
  body: [
    p(
      "\"Contour\" and \"bronzer\" get used interchangeably online constantly, and it's genuinely confusing when even the products themselves are sometimes packaged to look identical. They do two different jobs, and knowing which one you're actually reaching for changes the result completely."
    ),
    h2("Contour Rebuilds Shadow — It's Not About Colour"),
    p(
      "Foundation flattens your face into one even tone, which also erases the natural shadow that gives bone structure its definition. Contour brings that shadow back — placed at the hollows of the cheekbones, the jawline, the sides of the nose, the temples: the areas light naturally avoids. It should read two to three shades cooler or deeper than your base, never warm, or it stops reading as shadow and starts reading as dirt."
    ),
    h2("Bronzer Adds Warmth — It's Not About Shadow"),
    p(
      "Bronzer does the opposite job: it warms the skin back up, mimicking a natural sun-kissed tone rather than rebuilding structure. That's why it can be swept more broadly across the high points — forehead, cheeks, nose bridge — areas where contour would just look muddy. Pigmented bronzers need a genuinely light hand; a little goes much further than it looks like it will on first swipe."
    ),
    h2("Highlighting Concealer Is a Third, Separate Step"),
    p(
      "Distinct from both of the above — a concealer a shade or two lighter than your base, placed only where light naturally hits (under the eyes, brow bone, cupid's bow, chin), brightens without adding shadow or warmth. Combined correctly, contour plus bronzer plus highlight is what gives a \"your skin, just better\" finish, instead of a flat, one-dimensional one."
    ),
    h2("Tools Change the Result as Much as the Product Does"),
    p(
      "A dense brush builds more precise, buildable coverage — better suited to contour, where placement needs to stay controlled. A damp sponge gives a softer, more diffused finish — better for bronzer, and for blending edges so nothing reads as a hard line. Neither is the \"correct\" tool; it depends on how sharp or how soft you want the final result to read, especially once it's under camera lighting rather than just in person."
    ),
    p([
      { text: "Getting this balance right — knowing exactly how much of each your face actually needs — is exactly what a " },
      { text: "trial session", href: "/blog/what-happens-at-a-bridal-makeup-trial" },
      { text: " is for before a big day. Take a look at my " },
      { text: "services", href: "/services" },
      { text: " and " },
      { text: "pricing", href: "/pricing" },
      { text: ", or " },
      { text: "book", href: "/book" },
      { text: " and we'll figure out what your face specifically needs." },
    ]),
  ],
};

const posts = [post4, post5];

async function main() {
  console.log(dryRun ? "DRY RUN — no writes will be made\n" : "LIVE RUN — writing to Sanity\n");

  for (const post of posts) {
    console.log(`${post._id}: "${post.title}" (${post.body.length} blocks)`);
    if (!dryRun) {
      await client.createIfNotExists(post);
      console.log(`  -> created (or already existed)`);
    }
  }

  console.log(`\n${dryRun ? "Would create" : "Done —"} ${posts.length} blog posts.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
