import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

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
// here (services, FAQ, locations, site settings, taxonomy, etc.) keeps the
// full-site fallback below — those either render in the global nav/footer on
// every page or haven't been verified as page-scoped.
const NARROW_REVALIDATE_PATHS: Record<string, string[]> = {
  blogPost: ["/blog"],
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

  if (type && INTERNAL_ONLY_TYPES.has(type)) {
    return NextResponse.json({ revalidated: false, skipped: type, now: Date.now() });
  }

  const narrowPaths = type ? NARROW_REVALIDATE_PATHS[type] : undefined;

  if (narrowPaths) {
    for (const path of narrowPaths) {
      revalidatePath(path);
    }
    if (type === "blogPost") {
      revalidatePath("/blog/[slug]", "page");
    }
    return NextResponse.json({ revalidated: true, scope: "narrow", paths: narrowPaths, now: Date.now() });
  }

  revalidatePath("/", "layout");

  return NextResponse.json({ revalidated: true, scope: "full", now: Date.now() });
}
