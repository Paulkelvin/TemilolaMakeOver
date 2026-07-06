import { NextResponse } from "next/server";
import { isSearchConsoleConfigured, getSummary as gscSummary } from "@/lib/intelligence/sources/search-console";
import { isAnalyticsConfigured, getTrafficSummary } from "@/lib/intelligence/sources/analytics";
import { isVercelConfigured, getDeploymentSummary, getWebVitals } from "@/lib/intelligence/sources/vercel-api";
import { upsertSnapshots } from "@/lib/intelligence/sources/snapshots";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const today = new Date().toISOString().slice(0, 10);
  const snapshots: { source: string; metric: string; date: string; value: number }[] = [];
  const errors: string[] = [];

  if (isSearchConsoleConfigured()) {
    try {
      const summary = await gscSummary();
      snapshots.push(
        { source: "search-console", metric: "impressions", date: today, value: summary.totalImpressions },
        { source: "search-console", metric: "clicks", date: today, value: summary.totalClicks },
        { source: "search-console", metric: "avg_ctr", date: today, value: summary.averageCtr },
        { source: "search-console", metric: "avg_position", date: today, value: summary.averagePosition },
      );
    } catch (err) {
      errors.push(`search-console: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  if (isAnalyticsConfigured()) {
    try {
      const traffic = await getTrafficSummary();
      snapshots.push(
        { source: "ga4", metric: "sessions", date: today, value: traffic.sessions },
        { source: "ga4", metric: "users", date: today, value: traffic.users },
        { source: "ga4", metric: "pageviews", date: today, value: traffic.pageviews },
        { source: "ga4", metric: "bounce_rate", date: today, value: traffic.bounceRate },
      );
    } catch (err) {
      errors.push(`ga4: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  if (isVercelConfigured()) {
    try {
      const [deploys, vitals] = await Promise.all([getDeploymentSummary(), getWebVitals()]);
      snapshots.push(
        { source: "vercel", metric: "deploy_success_rate", date: today, value: deploys.successRate },
      );
      if (deploys.avgBuildTimeMs !== null) {
        snapshots.push({ source: "vercel", metric: "avg_build_time_ms", date: today, value: deploys.avgBuildTimeMs });
      }
      if (vitals.lcp) snapshots.push({ source: "vercel", metric: "lcp", date: today, value: vitals.lcp.value });
      if (vitals.cls) snapshots.push({ source: "vercel", metric: "cls", date: today, value: vitals.cls.value });
      if (vitals.inp) snapshots.push({ source: "vercel", metric: "inp", date: today, value: vitals.inp.value });
      if (vitals.fcp) snapshots.push({ source: "vercel", metric: "fcp", date: today, value: vitals.fcp.value });
      if (vitals.ttfb) snapshots.push({ source: "vercel", metric: "ttfb", date: today, value: vitals.ttfb.value });
    } catch (err) {
      errors.push(`vercel: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  if (snapshots.length > 0) {
    try {
      await upsertSnapshots(snapshots);
    } catch (err) {
      errors.push(`sanity-write: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return NextResponse.json({
    date: today,
    snapshotsWritten: snapshots.length,
    errors: errors.length > 0 ? errors : undefined,
  });
}
