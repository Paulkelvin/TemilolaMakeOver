import { client } from "@/sanity/client";
import { fetchAllTaxonomyNodes, computeCoverage, computeCompleteness, type FetchClient } from "./content";
import { getLatestSnapshot } from "./sources/snapshots";

/**
 * Content, Booking, Portfolio, and (as of Phase 3) Customer Health are
 * computable from Sanity alone. SEO Health (Search Console) and Website
 * Health (Vercel) still require an external integration and are listed as
 * "pending" on the BusinessHealthScore, arriving Phase 4.
 */

export type ConfidenceTier = "established" | "emerging" | "insufficient-data";

export const CONFIDENCE_LABELS: Record<ConfidenceTier, string> = {
  established: "Established",
  emerging: "Emerging",
  "insufficient-data": "Insufficient data",
};

export interface SubScore {
  key: string;
  label: string;
  /** null = not enough data to compute a meaningful score yet. */
  score: number | null;
  confidence: ConfidenceTier;
  sampleSize: number;
  reason: string;
}

function tierFor(sampleSize: number, emergingFloor: number, establishedFloor: number): ConfidenceTier {
  if (sampleSize >= establishedFloor) return "established";
  if (sampleSize >= emergingFloor) return "emerging";
  return "insufficient-data";
}

export async function computeContentHealth(fetchClient: FetchClient = client): Promise<SubScore> {
  const nodes = await fetchAllTaxonomyNodes(fetchClient);
  if (nodes.length === 0) {
    return {
      key: "content",
      label: "Content Health",
      score: null,
      confidence: "insufficient-data",
      sampleSize: 0,
      reason: "No taxonomy documents exist yet.",
    };
  }

  const completenessScores = await Promise.all(
    nodes.map(async (node) => computeCompleteness(node, await computeCoverage(fetchClient, node)).total)
  );
  const average = Math.round(completenessScores.reduce((a, b) => a + b, 0) / completenessScores.length);

  return {
    key: "content",
    label: "Content Health",
    score: average,
    confidence: tierFor(nodes.length, 5, 15),
    sampleSize: nodes.length,
    reason: `Average Content Intelligence completeness across ${nodes.length} taxonomy documents (services, styles, occasions, wedding types, locations, artists).`,
  };
}

export async function computeBookingHealth(fetchClient: FetchClient = client): Promise<SubScore> {
  const [total, confirmedOrPaid, cancelled, paid] = await Promise.all([
    fetchClient.fetch<number>(`count(*[_type == "booking"])`),
    fetchClient.fetch<number>(`count(*[_type == "booking" && status in ["confirmed", "paid"]])`),
    fetchClient.fetch<number>(`count(*[_type == "booking" && status == "cancelled"])`),
    fetchClient.fetch<number>(`count(*[_type == "booking" && status == "paid"])`),
  ]);

  if (total === 0) {
    return {
      key: "booking",
      label: "Booking Health",
      score: null,
      confidence: "insufficient-data",
      sampleSize: 0,
      reason: "No bookings recorded yet.",
    };
  }

  const confirmationRate = confirmedOrPaid / total;
  const cancellationRate = cancelled / total;
  const paidRate = paid / total;
  const score = Math.round(
    Math.min(100, Math.max(0, confirmationRate * 60 + paidRate * 40 - cancellationRate * 50))
  );

  return {
    key: "booking",
    label: "Booking Health",
    score,
    confidence: tierFor(total, 5, 20),
    sampleSize: total,
    reason: `${confirmedOrPaid} of ${total} bookings confirmed or paid; ${cancelled} cancelled.`,
  };
}

export async function computePortfolioHealth(fetchClient: FetchClient = client): Promise<SubScore> {
  const total = await fetchClient.fetch<number>(`count(*[_type == "portfolioItem"])`);
  if (total === 0) {
    return {
      key: "portfolio",
      label: "Portfolio Health",
      score: null,
      confidence: "insufficient-data",
      sampleSize: 0,
      reason: "No portfolio items exist yet.",
    };
  }

  const dimensions = ["service", "style", "occasion", "weddingType", "location"];
  const taggedCounts = await Promise.all(
    dimensions.map((field) =>
      fetchClient.fetch<number>(`count(*[_type == "portfolioItem" && defined(${field})])`)
    )
  );
  const averageTagged = taggedCounts.reduce((a, b) => a + b, 0) / dimensions.length;
  const score = Math.round(Math.min(100, (averageTagged / total) * 100));

  return {
    key: "portfolio",
    label: "Portfolio Health",
    score,
    confidence: tierFor(total, 5, 15),
    sampleSize: total,
    reason: `On average ${Math.round(averageTagged)} of ${total} portfolio items are tagged per taxonomy dimension (service, style, occasion, wedding type, location).`,
  };
}

export async function computeCustomerHealth(fetchClient: FetchClient = client): Promise<SubScore> {
  const bookings = await fetchClient.fetch<{ email?: string; phone?: string }[]>(
    `*[_type == "booking" && status in ["confirmed", "paid"]]{ email, phone }`
  );

  if (bookings.length === 0) {
    return {
      key: "customer",
      label: "Customer Health",
      score: null,
      confidence: "insufficient-data",
      sampleSize: 0,
      reason: "No confirmed or paid bookings yet.",
    };
  }

  // De-dupe by email (falling back to phone) rather than adding a separate
  // customer document type — a computed rollup over booking, not new
  // content to keep in sync.
  const bookingsPerCustomer = new Map<string, number>();
  for (const b of bookings) {
    const identity = b.email?.trim().toLowerCase() || b.phone?.trim();
    if (!identity) continue;
    bookingsPerCustomer.set(identity, (bookingsPerCustomer.get(identity) ?? 0) + 1);
  }

  const uniqueCustomers = bookingsPerCustomer.size;
  if (uniqueCustomers === 0) {
    return {
      key: "customer",
      label: "Customer Health",
      score: null,
      confidence: "insufficient-data",
      sampleSize: 0,
      reason: "Confirmed/paid bookings exist but none carry an email or phone to identify a customer by.",
    };
  }

  const returningCustomers = [...bookingsPerCustomer.values()].filter((c) => c > 1).length;
  const repeatRate = returningCustomers / uniqueCustomers;

  const testimonialCount = await fetchClient.fetch<number>(
    `count(*[_type == "testimonial" && audienceType != "student"])`
  );
  const reviewCoverage = Math.min(1, testimonialCount / uniqueCustomers);

  const score = Math.round(Math.min(100, repeatRate * 60 + reviewCoverage * 40));

  return {
    key: "customer",
    label: "Customer Health",
    score,
    confidence: tierFor(uniqueCustomers, 5, 20),
    sampleSize: uniqueCustomers,
    reason: `${returningCustomers} of ${uniqueCustomers} unique customers have booked more than once; ${testimonialCount} testimonials on file.`,
  };
}

export async function computeSeoHealth(): Promise<SubScore> {
  const [impressions, clicks, position] = await Promise.all([
    getLatestSnapshot("search-console", "impressions"),
    getLatestSnapshot("search-console", "clicks"),
    getLatestSnapshot("search-console", "avg_position"),
  ]);

  const hasData = impressions || clicks || position;
  if (!hasData) {
    return {
      key: "seo",
      label: "SEO Health",
      score: null,
      confidence: "insufficient-data",
      sampleSize: 0,
      reason: "Search Console not connected yet — connect it in Settings to light up this score.",
    };
  }

  const imp = impressions?.value ?? 0;
  const clk = clicks?.value ?? 0;
  const pos = position?.value ?? 50;

  const ctrScore = imp > 0 ? Math.min(40, (clk / imp) * 400) : 0;
  const positionScore = Math.min(30, Math.max(0, (20 - pos) / 20) * 30);
  const volumeScore = Math.min(30, Math.log10(Math.max(1, imp)) * 10);
  const score = Math.round(Math.min(100, ctrScore + positionScore + volumeScore));

  return {
    key: "seo",
    label: "SEO Health",
    score,
    confidence: tierFor(imp, 100, 1000),
    sampleSize: imp,
    reason: `${clk} clicks from ${imp} impressions; average position ${pos.toFixed(1)}.`,
  };
}

export async function computeWebsiteHealth(): Promise<SubScore> {
  const [lcp, cls, sessions, deploySuccess] = await Promise.all([
    getLatestSnapshot("vercel", "lcp"),
    getLatestSnapshot("vercel", "cls"),
    getLatestSnapshot("ga4", "sessions"),
    getLatestSnapshot("vercel", "deploy_success_rate"),
  ]);

  const hasData = lcp || cls || sessions || deploySuccess;
  if (!hasData) {
    return {
      key: "website",
      label: "Website Health",
      score: null,
      confidence: "insufficient-data",
      sampleSize: 0,
      reason: "Vercel and GA4 not connected yet — connect them in Settings to light up this score.",
    };
  }

  let parts = 0;
  let total = 0;

  if (lcp) {
    const lcpScore = lcp.value <= 2500 ? 30 : lcp.value <= 4000 ? 15 : 5;
    total += lcpScore;
    parts++;
  }
  if (cls) {
    const clsScore = cls.value <= 0.1 ? 20 : cls.value <= 0.25 ? 10 : 3;
    total += clsScore;
    parts++;
  }
  if (deploySuccess) {
    total += Math.round(deploySuccess.value * 25);
    parts++;
  }
  if (sessions) {
    const trafficScore = Math.min(25, Math.log10(Math.max(1, sessions.value)) * 8);
    total += trafficScore;
    parts++;
  }

  const maxPossible = parts > 0 ? (parts / 4) * 100 : 0;
  const score = maxPossible > 0 ? Math.round((total / maxPossible) * 100) : null;

  return {
    key: "website",
    label: "Website Health",
    score,
    confidence: tierFor(parts, 2, 3),
    sampleSize: parts,
    reason: [
      lcp ? `LCP ${lcp.value}ms` : null,
      cls ? `CLS ${cls.value}` : null,
      sessions ? `${sessions.value} sessions (28d)` : null,
      deploySuccess ? `${Math.round(deploySuccess.value * 100)}% deploy success` : null,
    ]
      .filter(Boolean)
      .join("; ") || "Partial data available.",
  };
}

export interface PendingSubScore {
  key: string;
  label: string;
  note: string;
}

export interface BusinessHealthScore {
  overall: number | null;
  overallConfidence: ConfidenceTier;
  subScores: SubScore[];
  pending: PendingSubScore[];
}

const CURRENT_WEIGHTS: Record<string, number> = {
  content: 0.20,
  booking: 0.20,
  portfolio: 0.15,
  customer: 0.15,
  seo: 0.15,
  website: 0.15,
};

export async function computeBusinessHealthScore(fetchClient: FetchClient = client): Promise<BusinessHealthScore> {
  const subScores = await Promise.all([
    computeContentHealth(fetchClient),
    computeBookingHealth(fetchClient),
    computePortfolioHealth(fetchClient),
    computeCustomerHealth(fetchClient),
    computeSeoHealth(),
    computeWebsiteHealth(),
  ]);

  const measurable = subScores.filter((s): s is SubScore & { score: number } => s.score !== null);
  const weightTotal = measurable.reduce((sum, s) => sum + (CURRENT_WEIGHTS[s.key] ?? 0), 0);
  const overall =
    measurable.length > 0 && weightTotal > 0
      ? Math.round(measurable.reduce((sum, s) => sum + s.score * (CURRENT_WEIGHTS[s.key] ?? 0), 0) / weightTotal)
      : null;

  const overallConfidence: ConfidenceTier = subScores.some((s) => s.confidence === "insufficient-data")
    ? "insufficient-data"
    : subScores.some((s) => s.confidence === "emerging")
      ? "emerging"
      : "established";

  return {
    overall,
    overallConfidence,
    subScores,
    pending: [],
  };
}
