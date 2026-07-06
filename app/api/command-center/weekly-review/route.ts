import { NextResponse } from "next/server";
import { generateWeeklyReview, saveWeeklyReview } from "@/lib/intelligence/weekly-review";
import { createNotification } from "@/lib/intelligence/notifications";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const review = await generateWeeklyReview();
    const docId = await saveWeeklyReview(review);

    await createNotification({
      kind: "wbr_ready",
      severity: "info",
      title: `Weekly Business Review ready: ${review.weekStart} → ${review.weekEnd}`,
      body: review.healthScore !== null ? `Health score: ${review.healthScore}/100` : "Health score not yet computable.",
      metadata: { docId, weekStart: review.weekStart, weekEnd: review.weekEnd },
    });

    return NextResponse.json({ docId, weekStart: review.weekStart, weekEnd: review.weekEnd, healthScore: review.healthScore });
  } catch (err) {
    console.error("[WBR generation failed]", err);
    return NextResponse.json({ error: "WBR generation failed" }, { status: 500 });
  }
}
