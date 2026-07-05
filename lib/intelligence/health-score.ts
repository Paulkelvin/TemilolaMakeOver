import { client } from "@/sanity/client";
import { fetchAllTaxonomyNodes, computeCoverage, computeCompleteness, type FetchClient } from "./content";

/**
 * Phase 1 scope: only the three sub-scores computable from Sanity alone.
 * SEO Health (Search Console) and Website Health (Vercel) arrive in Phase 4;
 * Customer Health needs booking.amountPaid, arriving in Phase 3. Each is
 * listed as "pending" on the BusinessHealthScore rather than faked as zero.
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

// Phase 1 weights sum to 1 across only the three measurable sub-scores.
// Rebalanced once SEO/Website/Customer Health come online in Phase 3/4.
const PHASE_1_WEIGHTS: Record<string, number> = { content: 0.34, booking: 0.33, portfolio: 0.33 };

export async function computeBusinessHealthScore(fetchClient: FetchClient = client): Promise<BusinessHealthScore> {
  const subScores = await Promise.all([
    computeContentHealth(fetchClient),
    computeBookingHealth(fetchClient),
    computePortfolioHealth(fetchClient),
  ]);

  const measurable = subScores.filter((s): s is SubScore & { score: number } => s.score !== null);
  const weightTotal = measurable.reduce((sum, s) => sum + (PHASE_1_WEIGHTS[s.key] ?? 0), 0);
  const overall =
    measurable.length > 0 && weightTotal > 0
      ? Math.round(measurable.reduce((sum, s) => sum + s.score * (PHASE_1_WEIGHTS[s.key] ?? 0), 0) / weightTotal)
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
    pending: [
      { key: "seo", label: "SEO Health", note: "Requires Search Console — arrives Phase 4." },
      { key: "website", label: "Website Health", note: "Requires Vercel API — arrives Phase 4." },
      { key: "customer", label: "Customer Health", note: "Requires booking.amountPaid — arrives Phase 3." },
    ],
  };
}
