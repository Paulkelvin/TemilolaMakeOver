/**
 * Adds three new blog posts: skin-tone/skin-type makeup guidance, home
 * service (mobile) pricing breakdown, and what a bridal makeup trial
 * actually involves. Additive only — createIfNotExists, so re-running
 * this is a no-op if the documents already exist.
 *
 * Usage:
 *   npx tsx sanity/migrations/2026-07-06-add-blog-posts-skin-mobile-trial.ts --dry-run
 *   npx tsx sanity/migrations/2026-07-06-add-blog-posts-skin-mobile-trial.ts
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

/** A paragraph built from one or more segments; segments with `href` become inline links. */
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

// ─── Post 1: Skin tone / skin type ──────────────────────────────────────────

const post1 = {
  _id: "blog-post-11",
  _type: "blogPost",
  title: "Makeup for Every Nigerian Skin Tone and Skin Type",
  slug: { _type: "slug", current: "makeup-for-every-nigerian-skin-tone-and-skin-type" },
  excerpt:
    "Shade-matching is only half the job. Here's how undertone, skin type, and Lagos heat actually determine whether your makeup looks flawless or ashy by the time photos are taken.",
  category: "Skin Prep",
  author: "Temilola",
  publishedAt: "2026-07-06T10:00:00Z",
  order: 11,
  body: [
    p(
      "One of the most common worries I hear from new clients isn't about style at all — it's \"will you have my shade?\" and \"will this go ashy or grey by the time we're taking pictures?\" Both are fair questions, and both come down to the same thing: understanding skin tone and skin type together, not just picking a shade off a chart."
    ),
    h2("Skin Tone Isn't One Chart — Undertone Matters More Than Depth"),
    p(
      "Nigerian skin spans an enormous range, from fair to deep, but depth alone isn't what causes a bad match. The real culprit is undertone — warm/yellow, neutral, or red/olive undertones exist across every depth of skin, and a foundation that's the right depth but the wrong undertone is exactly what produces that ashy or grey cast in photos, especially under flash or venue lighting. I always shade-match in natural daylight first, then confirm again under lighting closer to what your event will actually have, because a shade that looks perfect by a window can read completely differently by evening."
    ),
    h2("Why Foundation \"Oxidizes\" in Lagos Heat"),
    p([
      { text: "A shade that matched perfectly at application can darken a tone or two within an hour in Lagos heat and humidity — this is oxidation, and it's one of the most common complaints I hear from brides who've had bad experiences elsewhere. It's rarely a shade problem; it's almost always a prep and setting problem. I cover exactly how I prevent this in " },
      { text: "How to Make Your Makeup Last All Day in Lagos Heat", href: "/blog/how-to-make-makeup-last-all-day-lagos-heat" },
      { text: ", but the short version is: the right primer and setting routine for your specific skin type matters more than the foundation brand." },
    ]),
    h2("Oily, Dry, or Combination — the Technique Changes, Not Just the Product"),
    p([
      { text: "Oily skin needs an oil-controlling primer and strategic powder in the T-zone so shine doesn't break through by hour three. Dry skin needs the opposite — hydrating prep, cream-based products, and a lighter hand with powder so it doesn't cling to flaky patches and age the finish. Combination skin usually needs both approaches applied zone by zone rather than one blanket routine for the whole face. This is exactly why skin prep isn't a step I skip or rush — I go through the full approach in " },
      { text: "Preparing Your Skin Before Makeup Application", href: "/blog/preparing-your-skin-before-makeup-application" },
      { text: "." },
    ]),
    h2("This Is Assessed at Consultation, Not Guessed on the Day"),
    p([
      { text: "Shade and skin type are never something I'm figuring out for the first time on the morning of your event — they're part of the consultation, and confirmed again at your " },
      { text: "trial", href: "/blog/what-happens-at-a-bridal-makeup-trial" },
      { text: " if you book one. Take a look at my " },
      { text: "services", href: "/services" },
      { text: " and " },
      { text: "pricing", href: "/pricing" },
      { text: ", or " },
      { text: "book a consultation", href: "/book" },
      { text: " and I'll advise honestly on what to expect for your specific skin." },
    ]),
  ],
};

// ─── Post 2: Home service / mobile makeup pricing ───────────────────────────

const post2 = {
  _id: "blog-post-12",
  _type: "blogPost",
  title: "Home Service Makeup Pricing in Lagos: What Actually Affects the Cost",
  slug: { _type: "slug", current: "home-service-makeup-pricing-lagos" },
  excerpt:
    "The first question after \"are you available\" is almost always \"how much extra for home service?\" Here's exactly what goes into that number, so you can compare quotes fairly.",
  category: "Pricing Guide",
  author: "Temilola",
  publishedAt: "2026-07-06T10:05:00Z",
  order: 12,
  body: [
    p(
      "One of the first questions I get after confirming availability for a date is \"how much extra is home service?\" It's a completely fair question, but the honest answer is that it depends on more than distance alone. Here's exactly what goes into that number, so you're not comparing quotes that aren't actually apples to apples."
    ),
    h2("Travel Zone Is the Starting Point, Not the Whole Story"),
    p([
      { text: "Home service pricing starts with your travel zone — broadly, areas like Lekki/VI/Ikoyi, Ikeja and the mainland, Surulere/Yaba, Festac/Amuwo, and Ikorodu and further out each carry a different base travel fee, since they represent genuinely different drive times and traffic risk. Rather than publish numbers here that can go stale, the most accurate way to get your real fee is to put your exact location into the " },
      { text: "booking form", href: "/book" },
      { text: " or check current packages on the " },
      { text: "pricing page", href: "/pricing" },
      { text: " — both reflect live rates, not a guess." },
    ]),
    h2("What You're Actually Paying For Beyond the Drive"),
    p(
      "The travel fee isn't just fuel and time on the road. It covers bringing a full professional kit and proper lighting to wherever you are, so the result matches studio quality rather than being limited by whatever light your room happens to have. It also covers a realistic time buffer — for early or important bookings, I build in extra time against Lagos traffic rather than risk arriving late and rushing your face."
    ),
    h2("Group Bookings Change the Math"),
    p(
      "A bridal party or multiple people getting ready together isn't priced the same way as a single booking — it's usually a per-person add-on, and for larger groups it may need a second artist so everyone is genuinely ready on time rather than the last person rushing out the door. If you're booking for a group, the honest advice is to reach out earlier than you think you need to, both for scheduling and for an accurate group quote."
    ),
    h2("How to Get an Accurate Quote, Not a Guess"),
    p([
      { text: "Giving your exact date, location, number of people, and service upfront is what gets you a real number instantly rather than a vague estimate — Lagos pricing genuinely does vary by these factors, and I'd rather tell you the true cost early than have you budget around a guess. If you want the fuller picture on bridal pricing specifically, " },
      { text: "How Much Does Bridal Makeup Cost in Lagos", href: "/blog/how-much-does-bridal-makeup-cost-in-lagos" },
      { text: " is a good next read, or go straight to " },
      { text: "booking", href: "/book" },
      { text: " with your details and I'll confirm the exact figure." },
    ]),
  ],
};

// ─── Post 3: What happens at a bridal makeup trial ──────────────────────────

const post3 = {
  _id: "blog-post-13",
  _type: "blogPost",
  title: "What Really Happens at a Bridal Makeup Trial (And Why Skipping One Is a Risk)",
  slug: { _type: "slug", current: "what-happens-at-a-bridal-makeup-trial" },
  excerpt:
    "A trial isn't just \"trying on makeup for fun.\" Here's what it actually tests, what to bring, and why treating it as optional is the riskiest way to plan your wedding-day face.",
  category: "Bridal Tips",
  author: "Temilola",
  publishedAt: "2026-07-06T10:10:00Z",
  order: 13,
  body: [
    p(
      "I've mentioned trials before in passing — when I talk about booking early, part of why timing matters is that it leaves room for one. But a trial deserves its own explanation, because most brides walk in thinking it's just \"trying on makeup for fun,\" when it's actually doing several very specific jobs at once."
    ),
    h2("What a Trial Actually Tests"),
    p(
      "A real trial checks how your skin reacts to the products over a few hours, confirms your shade under the kind of lighting your actual event will have (not just the room we're in), tests one or two looks against your real outfit or gele colour rather than guessing, and gives an honest read on longevity — how it's holding up two, three, four hours in, not just in the first ten minutes."
    ),
    h2("What to Bring to Get the Most Out of It"),
    p(
      "Reference photos help, but only if they're specific — not just \"pretty makeup,\" but the actual elements you want or specifically don't want. A swatch of your outfit fabric or gele colour, or a photo of your venue if you have one, lets me test the look against reality rather than in the abstract. And give the session enough time — a rushed trial answers fewer of the questions it's meant to answer."
    ),
    h2("When to Schedule It"),
    p([
      { text: "The same window applies here as booking generally — " },
      { text: "three to six months out", href: "/blog/how-early-should-you-book-your-bridal-makeup-artist" },
      { text: " is the ideal range, which leaves time to make any adjustment before the day itself rather than discovering an issue when there's no room left to fix it." },
    ]),
    h2("What Happens If You Skip It"),
    p(
      "Skipping the trial means leaving your wedding-day face to chance — no chance to catch a shade that oxidizes differently than expected, no chance to test longevity against your actual schedule, no chance to adjust a look that photographs differently than it looks in person. It isn't fear-mongering to say this plainly: a trial is the only real insurance you have against a surprise on the one day you can't redo."
    ),
    p([
      { text: "Trials are included as part of my bridal packages — you can see exactly what's included on the " },
      { text: "pricing page", href: "/pricing" },
      { text: ", or go ahead and " },
      { text: "book", href: "/book" },
      { text: " with your date and I'll walk you through scheduling one." },
    ]),
  ],
};

const posts = [post1, post2, post3];

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
