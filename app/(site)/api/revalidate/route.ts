import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { client } from "@/sanity/client";

// Business Command Center document types — never rendered on any public
// page, so a publish/patch to one of these has nothing to revalidate.
// Bookings and notifications in particular fire constantly (every customer
// submission, every daily snapshot cron run); without this skip, each one
// was triggering a full-site revalidation for zero visible benefit. The
// Topical Authority Engine's document types belong here too: each weekly
// snapshot cron run upserts a whole batch of these in one go, and every
// one of them is Command-Center-only.
const INTERNAL_ONLY_TYPES = new Set([
  "booking",
  "metricSnapshot",
  "weeklyReview",
  "notification",
  "ccSettings",
  "seoOpportunity",
  "keywordDiscoveryTopic",
  "topicalAuthorityNode",
  "topicNode",
  "competitorGapTopic",
  "cannibalizationIssue",
  "internalLinkGap",
  "knowledgeGraphGap",
]);

// Document types whose real fetch call sites are verified to be confined to a
// small, specific set of pages (not the root layout/header/footer), so a full
// site-wide revalidation is unnecessary blast radius. Everything NOT listed
// here (locations, site settings, taxonomy, etc.) keeps the full-site
// fallback below — those either render in the global nav/footer on every
// page or haven't been verified as page-scoped. blogPost and faq are handled
// as their own special cases above this table (see below) since their real
// scope depends on the specific document, not just its type.
const NARROW_REVALIDATE_PATHS: Record<string, string[]> = {
  portfolioItem: ["/", "/about", "/portfolio"],
  testimonial: ["/"],
  transformation: ["/transformations"],
  trainingCourse: ["/training"],
  bioLink: ["/links"],
  linksPageSettings: ["/links"],
  aboutValue: ["/about"],
  whyChooseUs: ["/TemilolaShyllon"],
  shopLink: ["/TemilolaShyllon"],
  shopPageSettings: ["/TemilolaShyllon"],
  bookingStep: ["/book"],
  travelZone: ["/book"],
};

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");

  if (secret !== process.env.SANITY_REVALIDATE_SECRET) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const type = body?._type as string | undefined;
  const id = body?._id as string | undefined;

  if (type && INTERNAL_ONLY_TYPES.has(type)) {
    return NextResponse.json({ revalidated: false, skipped: type, now: Date.now() });
  }

  if (type === "blogPost") {
    // Revalidating just the one literal path that actually changed is far
    // cheaper than the whole blog — but Route Handlers only mark a dynamic-
    // segment pattern ("/blog/[slug]") for revalidation on next visit to
    // that exact pattern match, which doesn't reliably invalidate an
    // already-cached concrete slug at the Vercel edge. So look the document
    // up by _id (always present, unlike payload shape) to get its real slug,
    // and only fall back to revalidating every post when that lookup comes
    // back empty — e.g. the document was deleted and its old slug is
    // unknowable, or the webhook payload didn't include an _id at all.
    const doc = id
      ? await client.fetch<{ slug?: string } | null>(`*[_id == $id][0]{"slug": slug.current}`, { id })
      : null;

    revalidatePath("/blog");
    if (doc?.slug) {
      revalidatePath(`/blog/${doc.slug}`);
      return NextResponse.json({ revalidated: true, scope: "narrow", paths: ["/blog", `/blog/${doc.slug}`], now: Date.now() });
    }

    const slugs = await client.fetch<string[]>(
      `*[_type == "blogPost" && defined(slug.current)].slug.current`
    );
    for (const slug of slugs) {
      revalidatePath(`/blog/${slug}`);
    }
    return NextResponse.json({ revalidated: true, scope: "narrow-all-posts", now: Date.now() });
  }

  if (type === "faq") {
    // The root layout's site-wide FAQPage JSON-LD only includes FAQs with no
    // service/occasion/location reference (see FAQ_GENERAL_QUERY) — so a FAQ
    // tied to one service only needs that service's page revalidated, not
    // the whole site. Look the document up by _id to find out which case
    // this is; an unknown/deleted document falls back to full-site since we
    // can't rule out it was a general one.
    const doc = id
      ? await client.fetch<{ isServiceOnly: boolean; serviceSlug?: string } | null>(
          `*[_id == $id][0]{
            "isServiceOnly": defined(service) && !defined(occasion) && !defined(location),
            "serviceSlug": service->slug.current
          }`,
          { id }
        )
      : null;

    if (doc?.isServiceOnly && doc.serviceSlug) {
      const paths = ["/faq", "/pricing", "/training", `/services/${doc.serviceSlug}`];
      for (const path of paths) revalidatePath(path);
      return NextResponse.json({ revalidated: true, scope: "narrow", paths, now: Date.now() });
    }

    revalidatePath("/", "layout");
    return NextResponse.json({ revalidated: true, scope: "full", reason: "faq-general-or-unknown", now: Date.now() });
  }

  const narrowPaths = type ? NARROW_REVALIDATE_PATHS[type] : undefined;

  if (narrowPaths) {
    for (const path of narrowPaths) {
      revalidatePath(path);
    }
    return NextResponse.json({ revalidated: true, scope: "narrow", paths: narrowPaths, now: Date.now() });
  }

  revalidatePath("/", "layout");

  return NextResponse.json({ revalidated: true, scope: "full", now: Date.now() });
}
