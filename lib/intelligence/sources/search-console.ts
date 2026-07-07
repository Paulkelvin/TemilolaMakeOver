import { isGoogleConfigured, getAccessToken } from "./google-auth";

// Requires the https://www.googleapis.com/auth/webmasters.readonly scope,
// consented once during refresh-token setup (see scripts/get-google-refresh-token.ts).
const API_BASE = "https://searchconsole.googleapis.com/webmasters/v3";

export function isSearchConsoleConfigured(): boolean {
  return isGoogleConfigured() && Boolean(process.env.SEARCH_CONSOLE_SITE_URL);
}

function siteUrl(): string {
  return process.env.SEARCH_CONSOLE_SITE_URL ?? "";
}

async function gscFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getAccessToken();
  const encoded = encodeURIComponent(siteUrl());
  const res = await fetch(`${API_BASE}/sites/${encoded}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Search Console API error (${res.status}): ${text}`);
  }
  return res.json() as Promise<T>;
}

// ─── Types ──────────────────────────────────────────────────────────────────

export interface SearchAnalyticsRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface SearchAnalyticsResponse {
  rows?: SearchAnalyticsRow[];
  responseAggregationType?: string;
}

export interface SearchConsoleSummary {
  totalClicks: number;
  totalImpressions: number;
  averageCtr: number;
  averagePosition: number;
  fetchedAt: string;
}

export interface PagePerformance {
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface QueryPerformance {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface DailyPerformance {
  date: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface IndexingStatus {
  totalIndexed: number | null;
  fetchedAt: string;
}

export interface QueryPageRow {
  query: string;
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface QueryPageMatrix {
  current: QueryPageRow[];
  prior: QueryPageRow[];
  currentRange: { startDate: string; endDate: string };
  priorRange: { startDate: string; endDate: string };
}

// ─── Fetchers ───────────────────────────────────────────────────────────────

function dateRange(days: number): { startDate: string; endDate: string } {
  const end = new Date();
  end.setDate(end.getDate() - 3); // GSC data lags ~3 days
  const start = new Date(end);
  start.setDate(start.getDate() - days);
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}

export async function getSummary(days = 28): Promise<SearchConsoleSummary> {
  const range = dateRange(days);
  const data = await gscFetch<SearchAnalyticsResponse>("/searchAnalytics/query", {
    method: "POST",
    body: JSON.stringify({ ...range, dimensions: [] }),
  });
  const row = data.rows?.[0];
  return {
    totalClicks: row?.clicks ?? 0,
    totalImpressions: row?.impressions ?? 0,
    averageCtr: row?.ctr ?? 0,
    averagePosition: row?.position ?? 0,
    fetchedAt: new Date().toISOString(),
  };
}

export async function getTopPages(days = 28, limit = 10): Promise<PagePerformance[]> {
  const range = dateRange(days);
  const data = await gscFetch<SearchAnalyticsResponse>("/searchAnalytics/query", {
    method: "POST",
    body: JSON.stringify({ ...range, dimensions: ["page"], rowLimit: limit }),
  });
  return (data.rows ?? []).map((r) => ({
    page: r.keys[0],
    clicks: r.clicks,
    impressions: r.impressions,
    ctr: r.ctr,
    position: r.position,
  }));
}

export async function getTopQueries(days = 28, limit = 10): Promise<QueryPerformance[]> {
  const range = dateRange(days);
  const data = await gscFetch<SearchAnalyticsResponse>("/searchAnalytics/query", {
    method: "POST",
    body: JSON.stringify({ ...range, dimensions: ["query"], rowLimit: limit }),
  });
  return (data.rows ?? []).map((r) => ({
    query: r.keys[0],
    clicks: r.clicks,
    impressions: r.impressions,
    ctr: r.ctr,
    position: r.position,
  }));
}

export async function getDailyPerformance(days = 28): Promise<DailyPerformance[]> {
  const range = dateRange(days);
  const data = await gscFetch<SearchAnalyticsResponse>("/searchAnalytics/query", {
    method: "POST",
    body: JSON.stringify({ ...range, dimensions: ["date"] }),
  });
  return (data.rows ?? []).map((r) => ({
    date: r.keys[0],
    clicks: r.clicks,
    impressions: r.impressions,
    ctr: r.ctr,
    position: r.position,
  }));
}

function priorDateRange(days: number): { startDate: string; endDate: string } {
  const end = new Date();
  end.setDate(end.getDate() - 3 - days);
  const start = new Date(end);
  start.setDate(start.getDate() - days);
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}

async function fetchQueryPageRows(range: { startDate: string; endDate: string }): Promise<QueryPageRow[]> {
  const data = await gscFetch<SearchAnalyticsResponse>("/searchAnalytics/query", {
    method: "POST",
    body: JSON.stringify({ ...range, dimensions: ["query", "page"], rowLimit: 25000 }),
  });
  return (data.rows ?? []).map((r) => ({
    query: r.keys[0],
    page: r.keys[1],
    clicks: r.clicks,
    impressions: r.impressions,
    ctr: r.ctr,
    position: r.position,
  }));
}

/**
 * Every (query, page) row for a trailing window plus the immediately-prior
 * window of equal length, for period-over-period deltas. One call each —
 * GSC's 25,000-row cap comfortably covers a small business site's query
 * volume, no pagination needed.
 */
export async function getQueryPageMatrix(days = 90): Promise<QueryPageMatrix> {
  const currentRange = dateRange(days);
  const priorRange = priorDateRange(days);
  const [current, prior] = await Promise.all([
    fetchQueryPageRows(currentRange),
    fetchQueryPageRows(priorRange),
  ]);
  return { current, prior, currentRange, priorRange };
}

export async function getIndexingStatus(): Promise<IndexingStatus> {
  try {
    const data = await gscFetch<SearchAnalyticsResponse>("/searchAnalytics/query", {
      method: "POST",
      body: JSON.stringify({
        ...dateRange(28),
        dimensions: ["page"],
        rowLimit: 25000,
      }),
    });
    return {
      totalIndexed: data.rows?.length ?? 0,
      fetchedAt: new Date().toISOString(),
    };
  } catch {
    return { totalIndexed: null, fetchedAt: new Date().toISOString() };
  }
}
