import { client } from "@/sanity/client";
import { writeClient } from "@/sanity/write-client";
import { computeBusinessHealthScore } from "./health-score";
import { getBookingFunnel, getRevenueSummary, getReviewTrend } from "./sources/sanity";
import { getSnapshotSeries } from "./sources/snapshots";
import { generateOpportunities } from "./opportunities";
import type { FetchClient } from "./content";

export interface WeeklyReviewSection {
  heading: string;
  body: string;
}

export interface WeeklyReview {
  weekStart: string;
  weekEnd: string;
  healthScore: number | null;
  sections: WeeklyReviewSection[];
  metrics: Record<string, unknown>;
  generatedAt: string;
}

function mondayOf(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function delta(current: number, previous: number | null): string {
  if (previous === null || previous === 0) return "no prior data";
  const pct = ((current - previous) / previous) * 100;
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(0)}% vs prior week`;
}

export async function generateWeeklyReview(fetchClient: FetchClient = client): Promise<WeeklyReview> {
  const now = new Date();
  const weekEnd = new Date(now);
  weekEnd.setDate(weekEnd.getDate() - 1);
  const weekStart = mondayOf(weekEnd);
  const priorWeekStart = new Date(weekStart);
  priorWeekStart.setDate(priorWeekStart.getDate() - 7);

  const [health, funnel, revenue, reviews, opportunities] = await Promise.all([
    computeBusinessHealthScore(fetchClient),
    getBookingFunnel(fetchClient),
    getRevenueSummary(fetchClient),
    getReviewTrend(fetchClient),
    generateOpportunities(fetchClient),
  ]);

  const [impressionsSeries, sessionsSeries] = await Promise.all([
    getSnapshotSeries("search-console", "impressions", 14),
    getSnapshotSeries("ga4", "sessions", 14),
  ]);

  const thisWeekImpressions = impressionsSeries
    .filter((s) => s.date >= formatDate(weekStart))
    .reduce((sum, s) => sum + s.value, 0);
  const priorWeekImpressions = impressionsSeries
    .filter((s) => s.date >= formatDate(priorWeekStart) && s.date < formatDate(weekStart))
    .reduce((sum, s) => sum + s.value, 0);

  const thisWeekSessions = sessionsSeries
    .filter((s) => s.date >= formatDate(weekStart))
    .reduce((sum, s) => sum + s.value, 0);
  const priorWeekSessions = sessionsSeries
    .filter((s) => s.date >= formatDate(priorWeekStart) && s.date < formatDate(weekStart))
    .reduce((sum, s) => sum + s.value, 0);

  const sections: WeeklyReviewSection[] = [];

  sections.push({
    heading: "Business Health",
    body: health.overall !== null
      ? `Overall health score: ${health.overall}/100 (${health.overallConfidence}). ${health.subScores.filter((s) => s.score !== null).map((s) => `${s.label}: ${s.score}`).join(", ")}.`
      : "Not enough data to compute an overall health score yet.",
  });

  sections.push({
    heading: "Bookings & Revenue",
    body: [
      `${funnel.total} total bookings (${funnel.paid} paid, ${funnel.confirmed} confirmed, ${funnel.pending} pending, ${funnel.cancelled} cancelled).`,
      `Conversion rate: ${Math.round(funnel.conversionRate * 100)}%.`,
      `Total revenue (paid deposits): ₦${revenue.totalRevenue.toLocaleString()}.`,
      revenue.averageBookingValue !== null ? `Average booking value: ₦${revenue.averageBookingValue.toLocaleString()}.` : "",
    ].filter(Boolean).join(" "),
  });

  const seoLines: string[] = [];
  if (impressionsSeries.length > 0) {
    seoLines.push(`Search impressions this week: ${thisWeekImpressions.toLocaleString()} (${delta(thisWeekImpressions, priorWeekImpressions || null)}).`);
  }
  if (sessionsSeries.length > 0) {
    seoLines.push(`GA4 sessions this week: ${thisWeekSessions.toLocaleString()} (${delta(thisWeekSessions, priorWeekSessions || null)}).`);
  }
  if (seoLines.length === 0) {
    seoLines.push("Search Console and GA4 not connected yet — no traffic data available.");
  }
  sections.push({ heading: "SEO & Traffic", body: seoLines.join(" ") });

  sections.push({
    heading: "Customer & Reviews",
    body: `${reviews.total} total testimonials on file; ${reviews.recent90Days} added in the last 90 days.`,
  });

  const topOpps = opportunities.slice(0, 3);
  if (topOpps.length > 0) {
    sections.push({
      heading: "Top Opportunities",
      body: topOpps.map((o, i) => `${i + 1}. [${o.impact.toUpperCase()}] ${o.title}: ${o.action}`).join("\n"),
    });
  }

  const metrics = {
    healthScore: health.overall,
    bookingsTotal: funnel.total,
    bookingsPaid: funnel.paid,
    conversionRate: funnel.conversionRate,
    revenue: revenue.totalRevenue,
    avgBookingValue: revenue.averageBookingValue,
    impressions: thisWeekImpressions,
    sessions: thisWeekSessions,
    reviewsTotal: reviews.total,
    reviews90d: reviews.recent90Days,
  };

  return {
    weekStart: formatDate(weekStart),
    weekEnd: formatDate(weekEnd),
    healthScore: health.overall,
    sections,
    metrics,
    generatedAt: new Date().toISOString(),
  };
}

export async function saveWeeklyReview(review: WeeklyReview): Promise<string> {
  const docId = `wbr-${review.weekStart}`;
  await writeClient.createOrReplace({
    _id: docId,
    _type: "weeklyReview",
    weekStart: review.weekStart,
    weekEnd: review.weekEnd,
    healthScore: review.healthScore,
    sections: review.sections,
    metrics: JSON.stringify(review.metrics),
    generatedAt: review.generatedAt,
  });
  return docId;
}

export async function getRecentReviews(limit = 8): Promise<{
  _id: string;
  weekStart: string;
  weekEnd: string;
  healthScore: number | null;
  generatedAt: string;
}[]> {
  return client.fetch(
    `*[_type == "weeklyReview"] | order(weekStart desc)[0...${limit}]{
      _id, weekStart, weekEnd, healthScore, generatedAt
    }`
  );
}

export async function getReviewById(id: string): Promise<WeeklyReview | null> {
  const doc = await client.fetch<{
    weekStart: string;
    weekEnd: string;
    healthScore: number | null;
    sections: WeeklyReviewSection[];
    metrics: string;
    generatedAt: string;
  } | null>(
    `*[_type == "weeklyReview" && _id == $id][0]{
      weekStart, weekEnd, healthScore, sections, metrics, generatedAt
    }`,
    { id }
  );
  if (!doc) return null;
  return {
    ...doc,
    metrics: JSON.parse(doc.metrics || "{}"),
  };
}
