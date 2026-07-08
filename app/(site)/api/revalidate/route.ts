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

  revalidatePath("/", "layout");

  return NextResponse.json({ revalidated: true, now: Date.now() });
}
