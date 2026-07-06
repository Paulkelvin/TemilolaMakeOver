import { client } from "@/sanity/client";
import {
  fetchAllTaxonomyNodes,
  computeCoverage,
  computeCompleteness,
  detectOrphanedAndUntagged,
  detectBrokenRelationships,
  detectThinContent,
  detectStaleContent,
  type FetchClient,
} from "./content";
import { LEAF_TYPES } from "./registry";
import { getBookingFunnel, getRevenueSummary, getReviewTrend } from "./sources/sanity";
import { getLatestSnapshot } from "./sources/snapshots";

export type ImpactBand = "high" | "medium" | "low";
export type OpportunityCategory = "content" | "booking" | "portfolio" | "customer" | "seo" | "website";

export interface Opportunity {
  id: string;
  category: OpportunityCategory;
  impact: ImpactBand;
  title: string;
  action: string;
  reason: string;
  sortWeight: number;
}

const IMPACT_WEIGHT: Record<ImpactBand, number> = { high: 3, medium: 2, low: 1 };

function opp(
  category: OpportunityCategory,
  impact: ImpactBand,
  title: string,
  action: string,
  reason: string,
): Opportunity {
  return {
    id: `${category}-${title.toLowerCase().replace(/\s+/g, "-").slice(0, 40)}`,
    category,
    impact,
    title,
    action,
    reason,
    sortWeight: IMPACT_WEIGHT[impact],
  };
}

export async function generateOpportunities(fetchClient: FetchClient = client): Promise<Opportunity[]> {
  const opportunities: Opportunity[] = [];

  // ─── Content opportunities ──────────────────────────────────────────────

  const nodes = await fetchAllTaxonomyNodes(fetchClient);
  const coverageMap = new Map<string, Awaited<ReturnType<typeof computeCoverage>>>();
  for (const node of nodes) {
    const coverage = await computeCoverage(fetchClient, node);
    coverageMap.set(node.id, coverage);
  }

  const lowScoreNodes = nodes
    .map((node) => {
      const coverage = coverageMap.get(node.id)!;
      const completeness = computeCompleteness(node, coverage);
      return { node, completeness: completeness.total, coverage };
    })
    .filter((n) => n.completeness < 50)
    .sort((a, b) => a.completeness - b.completeness);

  for (const { node, completeness } of lowScoreNodes.slice(0, 5)) {
    const impact: ImpactBand = completeness < 25 ? "high" : "medium";
    opportunities.push(
      opp("content", impact,
        `Strengthen ${node.name} content`,
        `Add portfolio items, testimonials, or blog posts referencing "${node.name}" to raise its completeness from ${completeness}%.`,
        `${node.typeLabel} "${node.name}" has only ${completeness}% content completeness — missing supporting content weakens this page.`,
      )
    );
  }

  const [orphaned, broken] = await Promise.all([
    detectOrphanedAndUntagged(fetchClient),
    detectBrokenRelationships(fetchClient),
  ]);

  if (broken.length > 0) {
    opportunities.push(
      opp("content", "high",
        `Fix ${broken.length} broken reference${broken.length > 1 ? "s" : ""}`,
        `Open the Content Intelligence tool in Sanity Studio to see which documents reference deleted items, and re-link or remove them.`,
        `Broken references can cause runtime errors or missing data on live pages.`,
      )
    );
  }

  if (orphaned.length >= 3) {
    opportunities.push(
      opp("content", "low",
        `Tag ${orphaned.length} orphaned content items`,
        `Open untagged portfolio items and testimonials in Studio and assign a service, style, or location so they surface on the right pages.`,
        `Orphaned content doesn't appear on any taxonomy-driven page — it's effectively invisible to visitors.`,
      )
    );
  }

  const [thin, stale] = await Promise.all([
    detectThinContent(fetchClient),
    detectStaleContent(fetchClient),
  ]);

  if (thin.length > 0) {
    opportunities.push(
      opp("content", "medium",
        `Expand ${thin.length} thin content item${thin.length > 1 ? "s" : ""}`,
        `Review the thin content list on the Content page — each needs more body text to rank well and serve visitors.`,
        `Short-form content underperforms in search and provides less value to potential clients.`,
      )
    );
  }

  if (stale.length > 0) {
    opportunities.push(
      opp("content", "low",
        `Refresh ${stale.length} stale article${stale.length > 1 ? "s" : ""}`,
        `Update or add a fresh-date disclaimer to blog posts and FAQs that haven't been edited in over a year.`,
        `Search engines favor recently updated content; stale posts gradually lose ranking authority.`,
      )
    );
  }

  // ─── Booking & revenue opportunities ────────────────────────────────────

  const [funnel, revenue] = await Promise.all([
    getBookingFunnel(fetchClient),
    getRevenueSummary(fetchClient),
  ]);

  if (funnel.total > 0 && funnel.conversionRate < 0.5) {
    opportunities.push(
      opp("booking", funnel.conversionRate < 0.3 ? "high" : "medium",
        "Improve booking conversion rate",
        `Only ${Math.round(funnel.conversionRate * 100)}% of bookings convert to confirmed/paid. Review pending bookings and consider faster follow-up or clearer deposit instructions.`,
        `${funnel.pending} bookings are still pending — each one is potential revenue that hasn't been captured.`,
      )
    );
  }

  if (funnel.total > 0 && funnel.cancellationRate > 0.2) {
    opportunities.push(
      opp("booking", "medium",
        "Reduce cancellation rate",
        `${Math.round(funnel.cancellationRate * 100)}% of bookings were cancelled. Look for patterns (timing, service type, location) and consider adding a cancellation-reason field.`,
        `High cancellations mean wasted calendar slots and lost revenue.`,
      )
    );
  }

  if (revenue.paidCount > 0 && revenue.averageBookingValue !== null && revenue.averageBookingValue < 30000) {
    opportunities.push(
      opp("booking", "low",
        "Explore upsell opportunities",
        `Average booking value is ${revenue.averageBookingValue.toLocaleString()}. Consider offering add-ons (gele, touchup kit) or premium tiers to increase per-booking revenue.`,
        `Higher average booking value is the fastest way to grow revenue without more bookings.`,
      )
    );
  }

  // ─── Customer opportunities ─────────────────────────────────────────────

  const reviews = await getReviewTrend(fetchClient);

  if (reviews.total > 0 && reviews.recent90Days === 0) {
    opportunities.push(
      opp("customer", "medium",
        "Request new testimonials",
        `No new testimonials in the last 90 days. Send a follow-up request to recent clients — fresh reviews improve trust and SEO.`,
        `Testimonials are the strongest social proof on the site and power the review-coverage component of Customer Health.`,
      )
    );
  }

  // ─── Portfolio opportunities ────────────────────────────────────────────

  const portfolioCount = await fetchClient.fetch<number>(`count(*[_type == "portfolioItem"])`);
  const untaggedPortfolio = await fetchClient.fetch<number>(
    `count(*[_type == "portfolioItem" && !defined(service) && !defined(style) && !defined(occasion)])`
  );

  if (portfolioCount < 10) {
    opportunities.push(
      opp("portfolio", "high",
        "Add more portfolio items",
        `Only ${portfolioCount} portfolio items exist. Aim for 15+ to give each service and style enough visual proof.`,
        `Portfolio is one of the strongest conversion tools — clients need to see your work before booking.`,
      )
    );
  }

  if (untaggedPortfolio > 0 && portfolioCount > 0) {
    const pct = Math.round((untaggedPortfolio / portfolioCount) * 100);
    if (pct > 30) {
      opportunities.push(
        opp("portfolio", "medium",
          `Tag ${untaggedPortfolio} untagged portfolio items`,
          `${pct}% of portfolio items have no service, style, or occasion tag — they won't appear on taxonomy-driven pages.`,
          `Tagged portfolio items surface automatically on service, style, and occasion pages, increasing visual proof where it matters.`,
        )
      );
    }
  }

  // ─── SEO opportunities (from snapshots) ─────────────────────────────────

  const [positionSnap, impressionsSnap, clicksSnap] = await Promise.all([
    getLatestSnapshot("search-console", "avg_position"),
    getLatestSnapshot("search-console", "impressions"),
    getLatestSnapshot("search-console", "clicks"),
  ]);

  if (positionSnap && positionSnap.value > 20) {
    opportunities.push(
      opp("seo", "high",
        "Improve average search position",
        `Average position is ${positionSnap.value.toFixed(1)} — most clicks go to positions 1–10. Focus on internal linking, fresh content, and page speed.`,
        `Pages beyond position 20 get almost zero organic clicks.`,
      )
    );
  }

  if (impressionsSnap && clicksSnap && impressionsSnap.value > 100) {
    const ctr = clicksSnap.value / impressionsSnap.value;
    if (ctr < 0.02) {
      opportunities.push(
        opp("seo", "medium",
          "Improve click-through rate",
          `CTR is ${(ctr * 100).toFixed(1)}% across ${impressionsSnap.value.toLocaleString()} impressions. Rewrite meta titles and descriptions to be more compelling — test with the top-impression pages first.`,
          `Low CTR with decent impressions means people see you in search but don't click — a title/description problem.`,
        )
      );
    }
  }

  // ─── Website opportunities (from snapshots) ─────────────────────────────

  const lcpSnap = await getLatestSnapshot("vercel", "lcp");
  if (lcpSnap && lcpSnap.value > 2500) {
    opportunities.push(
      opp("website", lcpSnap.value > 4000 ? "high" : "medium",
        "Improve page load speed (LCP)",
        `LCP is ${(lcpSnap.value / 1000).toFixed(2)}s (threshold: 2.5s). Optimize hero images, reduce render-blocking resources, or enable edge caching.`,
        `Core Web Vitals directly affect search ranking and user experience.`,
      )
    );
  }

  const clsSnap = await getLatestSnapshot("vercel", "cls");
  if (clsSnap && clsSnap.value > 0.1) {
    opportunities.push(
      opp("website", clsSnap.value > 0.25 ? "high" : "medium",
        "Fix layout shift (CLS)",
        `CLS is ${clsSnap.value.toFixed(3)} (threshold: 0.1). Add explicit width/height to images, avoid injecting content above the fold after load.`,
        `Layout shift degrades user experience and hurts search ranking.`,
      )
    );
  }

  return opportunities.sort((a, b) => b.sortWeight - a.sortWeight);
}
