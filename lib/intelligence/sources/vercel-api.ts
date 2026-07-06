const API_BASE = "https://api.vercel.com";

export function isVercelConfigured(): boolean {
  return Boolean(process.env.VERCEL_API_TOKEN && process.env.VERCEL_PROJECT_ID);
}

async function vercelFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Vercel API error (${res.status}): ${text}`);
  }
  return res.json() as Promise<T>;
}

// ─── Types ──────────────────────────────────────────────────────────────────

export interface Deployment {
  uid: string;
  name: string;
  url: string;
  state: string;
  created: number;
  ready?: number;
  buildingAt?: number;
}

export interface DeploymentSummary {
  latest: Deployment | null;
  recentCount: number;
  successRate: number;
  avgBuildTimeMs: number | null;
  fetchedAt: string;
}

export interface WebVitals {
  lcp: WebVitalMetric | null;
  fid: WebVitalMetric | null;
  cls: WebVitalMetric | null;
  inp: WebVitalMetric | null;
  fcp: WebVitalMetric | null;
  ttfb: WebVitalMetric | null;
  fetchedAt: string;
}

export interface WebVitalMetric {
  value: number;
  rating: "good" | "needs-improvement" | "poor";
}

// ─── Fetchers ───────────────────────────────────────────────────────────────

interface VercelDeploymentResponse {
  deployments: {
    uid: string;
    name: string;
    url: string;
    state: string;
    created: number;
    ready?: number;
    buildingAt?: number;
  }[];
}

export async function getDeploymentSummary(limit = 20): Promise<DeploymentSummary> {
  const projectId = process.env.VERCEL_PROJECT_ID!;
  const data = await vercelFetch<VercelDeploymentResponse>(
    `/v6/deployments?projectId=${projectId}&limit=${limit}&target=production`
  );

  const deployments = data.deployments ?? [];
  if (deployments.length === 0) {
    return { latest: null, recentCount: 0, successRate: 0, avgBuildTimeMs: null, fetchedAt: new Date().toISOString() };
  }

  const successful = deployments.filter((d) => d.state === "READY");
  const buildTimes = deployments
    .filter((d) => d.ready && d.buildingAt)
    .map((d) => d.ready! - d.buildingAt!);

  const latest = deployments[0];

  return {
    latest: {
      uid: latest.uid,
      name: latest.name,
      url: latest.url,
      state: latest.state,
      created: latest.created,
      ready: latest.ready,
      buildingAt: latest.buildingAt,
    },
    recentCount: deployments.length,
    successRate: deployments.length > 0 ? successful.length / deployments.length : 0,
    avgBuildTimeMs: buildTimes.length > 0 ? Math.round(buildTimes.reduce((a, b) => a + b, 0) / buildTimes.length) : null,
    fetchedAt: new Date().toISOString(),
  };
}

interface SpeedInsightsResponse {
  data?: {
    datasets?: {
      id: string;
      data: { avg: number }[];
    }[];
  };
}

function rateVital(metric: string, value: number): WebVitalMetric["rating"] {
  const thresholds: Record<string, [number, number]> = {
    lcp: [2500, 4000],
    fid: [100, 300],
    cls: [0.1, 0.25],
    inp: [200, 500],
    fcp: [1800, 3000],
    ttfb: [800, 1800],
  };
  const [good, poor] = thresholds[metric] ?? [Infinity, Infinity];
  if (value <= good) return "good";
  if (value <= poor) return "needs-improvement";
  return "poor";
}

export async function getWebVitals(): Promise<WebVitals> {
  const projectId = process.env.VERCEL_PROJECT_ID!;
  try {
    const data = await vercelFetch<SpeedInsightsResponse>(
      `/v1/speed-insights/${projectId}?target=production&period=28d`
    );

    const datasets = data.data?.datasets ?? [];
    const findMetric = (id: string): WebVitalMetric | null => {
      const ds = datasets.find((d) => d.id === id);
      if (!ds || ds.data.length === 0) return null;
      const value = ds.data[ds.data.length - 1].avg;
      return { value, rating: rateVital(id, value) };
    };

    return {
      lcp: findMetric("lcp"),
      fid: findMetric("fid"),
      cls: findMetric("cls"),
      inp: findMetric("inp"),
      fcp: findMetric("fcp"),
      ttfb: findMetric("ttfb"),
      fetchedAt: new Date().toISOString(),
    };
  } catch {
    return { lcp: null, fid: null, cls: null, inp: null, fcp: null, ttfb: null, fetchedAt: new Date().toISOString() };
  }
}
