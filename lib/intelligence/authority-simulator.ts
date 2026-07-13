import { getClusterAuthorities } from "./cluster-authority";
import type { StrategicFitResult } from "./strategic-fit";

/**
 * Topical Authority Simulator — a bounded, transparent estimate of what
 * publishing a draft would do to the numbers the rest of this system
 * already tracks, computed BEFORE the draft is real (no blogPost exists
 * yet, so nothing here can be measured for real). Reuses
 * computeStrategicFit() for its closesGap/linksIntoCluster/cannibalization
 * signals rather than reimplementing that judgment — this is a diff
 * estimator layered on top of an existing decision, not a second scoring
 * model. Every movement is a small, capped heuristic nudge, never a real
 * recomputation of ClusterAuthority — deliberately, since the whole point
 * (per the explicit brief) is "estimates to help prioritize, not guarantees."
 */

const AUTHORITY_GAIN_IF_CLOSES_GAP = 3;
const AUTHORITY_GAIN_IF_LINKS_ONLY = 1;
const AUTHORITY_LOSS_IF_CANNIBALIZATION = 5;
const COVERAGE_GAIN_IF_CLOSES_GAP = 4;
const COVERAGE_GAIN_IF_LINKS_ONLY = 1;
const COVERAGE_LOSS_IF_CANNIBALIZATION = 4;

export interface SimulationMetric {
  label: string;
  before: number;
  after: number;
  unit: "%" | "count";
}

export interface SimulationInput {
  clusterId?: string;
  clusterLabel?: string;
  topicLabel: string;
  draftHeadings: string[];
  draftBodyText: string;
  draftLinkedPaths: string[];
}

export interface SimulationInputWithFit extends SimulationInput {
  // Callers already compute this via computeStrategicFit() for their own
  // needs (the Verification Suite route scores it as its own quality
  // category) — accepting it here instead of recomputing avoids running
  // computeStrategicFit()'s full-site content scan twice per Verify Draft
  // click.
  strategicFit: StrategicFitResult;
}

export interface AuthoritySimulationResult {
  applicable: boolean;
  clusterLabel?: string;
  metrics: SimulationMetric[];
  decisionTrace: string[];
  disclaimer: string;
}

const DISCLAIMER = "These are bounded estimates from the same signals the rest of the Command Center already tracks, not a guarantee — the real numbers only update once the article is actually published and the weekly snapshot recomputes them.";

export async function simulateArticleImpact(input: SimulationInputWithFit): Promise<AuthoritySimulationResult> {
  const { strategicFit } = input;
  if (!input.clusterId) {
    return {
      applicable: false,
      metrics: [],
      decisionTrace: ["This topic isn't matched to a Topic Map cluster, so there's no cluster-level baseline to simulate against yet."],
      disclaimer: DISCLAIMER,
    };
  }

  const allClusters = await getClusterAuthorities();
  const cluster = allClusters.find((c) => c.clusterNodeId === input.clusterId) ?? null;

  if (!cluster) {
    return {
      applicable: false,
      clusterLabel: input.clusterLabel,
      metrics: [],
      decisionTrace: [`Cluster "${input.clusterLabel}" matched but Cluster Authority hasn't been computed for it yet — run the weekly cron (or Run Now) first.`],
      disclaimer: DISCLAIMER,
    };
  }

  const trace: string[] = [];
  let authorityDelta = 0;
  let coverageDelta = 0;

  if (strategicFit.cannibalizationRisk) {
    authorityDelta -= AUTHORITY_LOSS_IF_CANNIBALIZATION;
    coverageDelta -= COVERAGE_LOSS_IF_CANNIBALIZATION;
    trace.push(`Likely duplicates an already-strong page in this cluster (${strategicFit.cannibalizationPath}) — modeled as a small authority/coverage loss rather than a gain.`);
  } else if (strategicFit.closesGap) {
    authorityDelta += AUTHORITY_GAIN_IF_CLOSES_GAP;
    coverageDelta += COVERAGE_GAIN_IF_CLOSES_GAP;
    trace.push(`Closes a known gap ("${strategicFit.closedGapLabel}") — modeled as a meaningful authority/coverage gain.`);
  } else if (strategicFit.linksIntoCluster) {
    authorityDelta += AUTHORITY_GAIN_IF_LINKS_ONLY;
    coverageDelta += COVERAGE_GAIN_IF_LINKS_ONLY;
    trace.push("Doesn't close a specific known gap, but links into the cluster — modeled as a small gain from strengthening the internal link graph alone.");
  } else {
    trace.push("Doesn't close a known gap and doesn't link into the cluster — modeled as no change to authority/coverage.");
  }

  const newAuthority = Math.max(0, Math.min(100, cluster.avgAuthorityScore + authorityDelta));
  const newCoverage = Math.max(0, Math.min(100, cluster.avgCoverageScore + coverageDelta));

  // Real, discrete decrement — only if the closed gap is actually in the
  // competitor-sourced list (not the keyword-discovery or knowledge-graph
  // ones), so this number stays literally true rather than a vibe.
  const closesCompetitorGap = strategicFit.closesGap && cluster.competitorGaps.some((g) => g.label === strategicFit.closedGapLabel);
  const newCompetitorGapCount = Math.max(0, cluster.competitorGaps.length - (closesCompetitorGap ? 1 : 0));

  const linksIntoClusterCount = input.draftLinkedPaths.filter((p) => cluster.linkedPaths.includes(p.replace(/\/$/, ""))).length;
  const totalLinkSlots = cluster.internalLinkHealth.healthyCount + cluster.internalLinkHealth.underlinkedCount + cluster.internalLinkHealth.orphanCount;
  const beforeHealthPct = totalLinkSlots > 0 ? Math.round((cluster.internalLinkHealth.healthyCount / totalLinkSlots) * 100) : 100;
  const newHealthy = cluster.internalLinkHealth.healthyCount + Math.min(linksIntoClusterCount, cluster.internalLinkHealth.underlinkedCount);
  const afterHealthPct = totalLinkSlots > 0 ? Math.round((newHealthy / totalLinkSlots) * 100) : 100;
  if (linksIntoClusterCount > 0) {
    trace.push(`Links to ${linksIntoClusterCount} page${linksIntoClusterCount === 1 ? "" : "s"} already in this cluster — modeled as improving internal link health for that many under-linked pages.`);
  }

  const otherClustersAuthoritySum = allClusters
    .filter((c) => c.clusterNodeId !== input.clusterId)
    .reduce((sum, c) => sum + c.avgAuthorityScore, 0);
  const siteBeforeAvg = allClusters.length > 0 ? Math.round((otherClustersAuthoritySum + cluster.avgAuthorityScore) / allClusters.length) : 0;
  const siteAfterAvg = allClusters.length > 0 ? Math.round((otherClustersAuthoritySum + newAuthority) / allClusters.length) : 0;

  const metrics: SimulationMetric[] = [
    { label: `${cluster.clusterLabel} Authority`, before: cluster.avgAuthorityScore, after: newAuthority, unit: "%" },
    { label: "Cluster Coverage", before: cluster.avgCoverageScore, after: newCoverage, unit: "%" },
    { label: "Competitor Gaps (open)", before: cluster.competitorGaps.length, after: newCompetitorGapCount, unit: "count" },
    { label: "Internal Link Health", before: beforeHealthPct, after: afterHealthPct, unit: "%" },
    { label: "Overall Site Authority", before: siteBeforeAvg, after: siteAfterAvg, unit: "%" },
  ];

  return {
    applicable: true,
    clusterLabel: cluster.clusterLabel,
    metrics,
    decisionTrace: trace,
    disclaimer: DISCLAIMER,
  };
}
