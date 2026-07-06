import { isGoogleConfigured, getAccessToken } from "./google-auth";

// Requires the https://www.googleapis.com/auth/analytics.readonly scope,
// consented once during refresh-token setup (see scripts/get-google-refresh-token.ts).
const API_BASE = "https://analyticsdata.googleapis.com/v1beta";

export function isAnalyticsConfigured(): boolean {
  return isGoogleConfigured() && Boolean(process.env.GA4_PROPERTY_ID);
}

function propertyId(): string {
  return process.env.GA4_PROPERTY_ID ?? "";
}

// ─── GA4 Data API types (subset) ────────────────────────────────────────────

interface GA4DateRange {
  startDate: string;
  endDate: string;
}

interface GA4Dimension {
  name: string;
}

interface GA4Metric {
  name: string;
}

interface GA4Row {
  dimensionValues?: { value: string }[];
  metricValues?: { value: string }[];
}

interface GA4Response {
  rows?: GA4Row[];
  rowCount?: number;
}

async function runReport(body: {
  dateRanges: GA4DateRange[];
  dimensions?: GA4Dimension[];
  metrics: GA4Metric[];
  limit?: number;
  orderBys?: { metric?: { metricName: string }; desc?: boolean }[];
}): Promise<GA4Response> {
  const token = await getAccessToken();
  const res = await fetch(`${API_BASE}/properties/${propertyId()}:runReport`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GA4 Data API error (${res.status}): ${text}`);
  }
  return res.json() as Promise<GA4Response>;
}

// ─── Public types ───────────────────────────────────────────────────────────

export interface TrafficSummary {
  sessions: number;
  users: number;
  pageviews: number;
  bounceRate: number;
  avgSessionDuration: number;
  fetchedAt: string;
}

export interface TrafficByChannel {
  channel: string;
  sessions: number;
  users: number;
}

export interface TopPage {
  path: string;
  pageviews: number;
  users: number;
}

export interface DailyTraffic {
  date: string;
  sessions: number;
  users: number;
  pageviews: number;
}

// ─── Fetchers ───────────────────────────────────────────────────────────────

function dateRange(days: number): GA4DateRange {
  return { startDate: `${days}daysAgo`, endDate: "yesterday" };
}

function num(row: GA4Row, idx: number): number {
  return Number(row.metricValues?.[idx]?.value ?? 0);
}

function dim(row: GA4Row, idx: number): string {
  return row.dimensionValues?.[idx]?.value ?? "";
}

export async function getTrafficSummary(days = 28): Promise<TrafficSummary> {
  const data = await runReport({
    dateRanges: [dateRange(days)],
    metrics: [
      { name: "sessions" },
      { name: "totalUsers" },
      { name: "screenPageViews" },
      { name: "bounceRate" },
      { name: "averageSessionDuration" },
    ],
  });
  const row = data.rows?.[0];
  return {
    sessions: row ? num(row, 0) : 0,
    users: row ? num(row, 1) : 0,
    pageviews: row ? num(row, 2) : 0,
    bounceRate: row ? num(row, 3) : 0,
    avgSessionDuration: row ? num(row, 4) : 0,
    fetchedAt: new Date().toISOString(),
  };
}

export async function getTrafficByChannel(days = 28, limit = 8): Promise<TrafficByChannel[]> {
  const data = await runReport({
    dateRanges: [dateRange(days)],
    dimensions: [{ name: "sessionDefaultChannelGroup" }],
    metrics: [{ name: "sessions" }, { name: "totalUsers" }],
    limit,
    orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
  });
  return (data.rows ?? []).map((r) => ({
    channel: dim(r, 0),
    sessions: num(r, 0),
    users: num(r, 1),
  }));
}

export async function getTopPages(days = 28, limit = 10): Promise<TopPage[]> {
  const data = await runReport({
    dateRanges: [dateRange(days)],
    dimensions: [{ name: "pagePath" }],
    metrics: [{ name: "screenPageViews" }, { name: "totalUsers" }],
    limit,
    orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
  });
  return (data.rows ?? []).map((r) => ({
    path: dim(r, 0),
    pageviews: num(r, 0),
    users: num(r, 1),
  }));
}

export async function getDailyTraffic(days = 28): Promise<DailyTraffic[]> {
  const data = await runReport({
    dateRanges: [dateRange(days)],
    dimensions: [{ name: "date" }],
    metrics: [{ name: "sessions" }, { name: "totalUsers" }, { name: "screenPageViews" }],
    orderBys: [{ metric: { metricName: "sessions" }, desc: false }],
  });
  return (data.rows ?? []).map((r) => ({
    date: dim(r, 0),
    sessions: num(r, 0),
    users: num(r, 1),
    pageviews: num(r, 2),
  }));
}
