import { NextResponse } from "next/server";
import { isSearchConsoleConfigured, getSummary as gscSummary } from "@/lib/intelligence/sources/search-console";
import { isAnalyticsConfigured, getTrafficSummary } from "@/lib/intelligence/sources/analytics";
import { isVercelConfigured, getDeploymentSummary, getWebVitals } from "@/lib/intelligence/sources/vercel-api";
import { getSanityUsageSnapshot, getDocumentLimit } from "@/lib/intelligence/sources/sanity-usage";
import { upsertSnapshots, getLatestSnapshot } from "@/lib/intelligence/sources/snapshots";
import { createNotification } from "@/lib/intelligence/notifications";
import { computeSeoOpportunities, persistSeoOpportunities } from "@/lib/intelligence/seo-opportunities";
import { computeKeywordDiscoveryTopics, persistKeywordDiscoveryTopics } from "@/lib/intelligence/keyword-discovery";
import { computeTopicalAuthority, persistTopicalAuthority } from "@/lib/intelligence/topical-authority";
import { computeCompetitorGaps, persistCompetitorGaps } from "@/lib/intelligence/competitor-gap";
import { computeCannibalization, persistCannibalization } from "@/lib/intelligence/cannibalization";
import { computeInternalLinkGaps, persistInternalLinkGaps } from "@/lib/intelligence/internal-links";
import { computeKnowledgeGraphGaps, persistKnowledgeGraphGaps } from "@/lib/intelligence/knowledge-graph";
import { client } from "@/sanity/client";

export const dynamic = "force-dynamic";

export async function runSnapshot() {
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

  try {
    const usage = await getSanityUsageSnapshot(client);
    snapshots.push(
      { source: "sanity-usage", metric: "documents", date: today, value: usage.totalDocuments },
      { source: "sanity-usage", metric: "asset-bytes", date: today, value: usage.assetBytes },
    );
  } catch (err) {
    errors.push(`sanity-usage: ${err instanceof Error ? err.message : String(err)}`);
  }

  if (snapshots.length > 0) {
    try {
      await upsertSnapshots(snapshots);
    } catch (err) {
      errors.push(`sanity-write: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  // ─── SEO Opportunity Engine (weekly-gated — query-level GSC analysis is
  // comparatively expensive and doesn't need daily recomputation) ─────────
  let seoOpportunityResult: { upserted: number; notifications: number } | undefined;
  if (isSearchConsoleConfigured()) {
    try {
      const lastComputed = await client.fetch<string | null>(
        `*[_type == "seoOpportunity"] | order(lastComputedAt desc)[0].lastComputedAt`
      );
      const daysSinceLastRun = lastComputed
        ? (Date.now() - new Date(lastComputed).getTime()) / 86_400_000
        : Infinity;
      if (daysSinceLastRun >= 7) {
        const topics = await computeSeoOpportunities(client);
        seoOpportunityResult = await persistSeoOpportunities(topics);
      }
    } catch (err) {
      errors.push(`seo-opportunities: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  // ─── Keyword Discovery Engine (weekly-gated — external autocomplete calls
  // add up; runs unconditionally, no Search Console dependency) ───────────
  let keywordDiscoveryResult: { upserted: number; linked: number } | undefined;
  try {
    const lastComputed = await client.fetch<string | null>(
      `*[_type == "keywordDiscoveryTopic"] | order(lastComputedAt desc)[0].lastComputedAt`
    );
    const daysSinceLastRun = lastComputed
      ? (Date.now() - new Date(lastComputed).getTime()) / 86_400_000
      : Infinity;
    if (daysSinceLastRun >= 7) {
      const topics = await computeKeywordDiscoveryTopics(client);
      keywordDiscoveryResult = await persistKeywordDiscoveryTopics(topics);
    }
  } catch (err) {
    errors.push(`keyword-discovery: ${err instanceof Error ? err.message : String(err)}`);
  }

  // ─── Topical Authority Engine (weekly-gated — real evidence counts per
  // taxonomy node don't change fast enough to need daily recomputation) ───
  let topicalAuthorityResult: { upserted: number } | undefined;
  try {
    const lastComputed = await client.fetch<string | null>(
      `*[_type == "topicalAuthorityNode"] | order(lastComputedAt desc)[0].lastComputedAt`
    );
    const daysSinceLastRun = lastComputed
      ? (Date.now() - new Date(lastComputed).getTime()) / 86_400_000
      : Infinity;
    if (daysSinceLastRun >= 7) {
      const nodes = await computeTopicalAuthority(client);
      topicalAuthorityResult = await persistTopicalAuthority(nodes);
    }
  } catch (err) {
    errors.push(`topical-authority: ${err instanceof Error ? err.message : String(err)}`);
  }

  // ─── Competitor Content Gap Engine (weekly-gated — real crawling of a
  // real competitor site respecting their crawl-delay; runs unconditionally,
  // no Search Console dependency) ─────────────────────────────────────────
  let competitorGapResult: { upserted: number } | undefined;
  try {
    const lastComputed = await client.fetch<string | null>(
      `*[_type == "competitorGapTopic"] | order(lastComputedAt desc)[0].lastComputedAt`
    );
    const daysSinceLastRun = lastComputed
      ? (Date.now() - new Date(lastComputed).getTime()) / 86_400_000
      : Infinity;
    if (daysSinceLastRun >= 7) {
      const gaps = await computeCompetitorGaps(client);
      competitorGapResult = await persistCompetitorGaps(gaps);
    }
  } catch (err) {
    errors.push(`competitor-gap: ${err instanceof Error ? err.message : String(err)}`);
  }

  // ─── Cannibalization Detection Engine (weekly-gated — query-level GSC
  // analysis is comparatively expensive; needs Search Console, same as SEO
  // Opportunities) ─────────────────────────────────────────────────────────
  let cannibalizationResult: { upserted: number; notifications: number } | undefined;
  if (isSearchConsoleConfigured()) {
    try {
      const lastComputed = await client.fetch<string | null>(
        `*[_type == "cannibalizationIssue"] | order(lastComputedAt desc)[0].lastComputedAt`
      );
      const daysSinceLastRun = lastComputed
        ? (Date.now() - new Date(lastComputed).getTime()) / 86_400_000
        : Infinity;
      if (daysSinceLastRun >= 7) {
        const issues = await computeCannibalization();
        cannibalizationResult = await persistCannibalization(issues);
      }
    } catch (err) {
      errors.push(`cannibalization: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  // ─── Internal Link Intelligence Engine (weekly-gated — Sanity-only, no
  // external API dependency, but content doesn't change fast enough to need
  // daily recomputation) ───────────────────────────────────────────────────
  let internalLinkResult: { upserted: number; notifications: number } | undefined;
  try {
    const lastComputed = await client.fetch<string | null>(
      `*[_type == "internalLinkGap"] | order(lastComputedAt desc)[0].lastComputedAt`
    );
    const daysSinceLastRun = lastComputed
      ? (Date.now() - new Date(lastComputed).getTime()) / 86_400_000
      : Infinity;
    if (daysSinceLastRun >= 7) {
      const gaps = await computeInternalLinkGaps(client);
      internalLinkResult = await persistInternalLinkGaps(gaps);
    }
  } catch (err) {
    errors.push(`internal-links: ${err instanceof Error ? err.message : String(err)}`);
  }

  // ─── Knowledge Graph Utilization Engine (weekly-gated — Sanity-only, pure
  // reference counting over the site's own existing taxonomy relationships) ─
  let knowledgeGraphResult: { upserted: number; notifications: number } | undefined;
  try {
    const lastComputed = await client.fetch<string | null>(
      `*[_type == "knowledgeGraphGap"] | order(lastComputedAt desc)[0].lastComputedAt`
    );
    const daysSinceLastRun = lastComputed
      ? (Date.now() - new Date(lastComputed).getTime()) / 86_400_000
      : Infinity;
    if (daysSinceLastRun >= 7) {
      const gaps = await computeKnowledgeGraphGaps(client);
      knowledgeGraphResult = await persistKnowledgeGraphGaps(gaps);
    }
  } catch (err) {
    errors.push(`knowledge-graph: ${err instanceof Error ? err.message : String(err)}`);
  }

  // ─── Metric-drop notifications ─────────────────────────────────────────
  try {
    const alertChecks: { source: string; metric: string; label: string; dropThreshold: number }[] = [
      { source: "search-console", metric: "impressions", label: "Search impressions", dropThreshold: 0.3 },
      { source: "search-console", metric: "clicks", label: "Search clicks", dropThreshold: 0.3 },
      { source: "ga4", metric: "sessions", label: "GA4 sessions", dropThreshold: 0.3 },
    ];

    for (const check of alertChecks) {
      const current = snapshots.find((s) => s.source === check.source && s.metric === check.metric);
      if (!current || current.value === 0) continue;

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const prior = await getLatestSnapshot(check.source, check.metric);
      if (!prior || prior.date === today || prior.value === 0) continue;

      const dropPct = (prior.value - current.value) / prior.value;
      if (dropPct >= check.dropThreshold) {
        await createNotification({
          kind: "metric_alert",
          severity: dropPct >= 0.5 ? "critical" : "warning",
          title: `${check.label} dropped ${Math.round(dropPct * 100)}%`,
          body: `${check.label} went from ${prior.value.toLocaleString()} to ${current.value.toLocaleString()} (${prior.date} → ${today}).`,
          metadata: { source: check.source, metric: check.metric, prior: prior.value, current: current.value },
        });
      }
    }
  } catch (err) {
    errors.push(`notifications: ${err instanceof Error ? err.message : String(err)}`);
  }

  // ─── Sanity usage threshold notifications ──────────────────────────────
  try {
    const usageSnap = snapshots.find((s) => s.source === "sanity-usage" && s.metric === "documents");
    if (usageSnap) {
      const limit = getDocumentLimit();
      const currentPct = (usageSnap.value / limit) * 100;
      const prior = await getLatestSnapshot("sanity-usage", "documents");
      const priorPct = prior && prior.date !== today ? (prior.value / limit) * 100 : 0;

      for (const threshold of [95, 90, 75]) {
        if (priorPct < threshold && currentPct >= threshold) {
          await createNotification({
            kind: "metric_alert",
            severity: threshold >= 90 ? "critical" : "warning",
            title: `Sanity document usage crossed ${threshold}%`,
            body: `Using ${usageSnap.value.toLocaleString()} of an assumed ${limit.toLocaleString()}-document limit (${currentPct.toFixed(1)}%). Check the Sanity Usage page and plan ahead if this is your real plan tier.`,
            metadata: { metric: "documents", value: usageSnap.value, limit, pct: currentPct },
          });
          break;
        }
      }
    }
  } catch (err) {
    errors.push(`sanity-usage-alerts: ${err instanceof Error ? err.message : String(err)}`);
  }

  return {
    date: today,
    snapshotsWritten: snapshots.length,
    seoOpportunities: seoOpportunityResult,
    keywordDiscovery: keywordDiscoveryResult,
    topicalAuthority: topicalAuthorityResult,
    competitorGaps: competitorGapResult,
    cannibalization: cannibalizationResult,
    internalLinks: internalLinkResult,
    knowledgeGraph: knowledgeGraphResult,
    errors: errors.length > 0 ? errors : undefined,
  };
}

export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const result = await runSnapshot();
  return NextResponse.json(result);
}
