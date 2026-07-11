import { client } from "@/sanity/client";
import type { FetchClient } from "./content";
import { normalizeQuery, overlapScore, buildContentIndex, matchContent } from "./keyword-utils";
import { getClusterAuthorityByNodeId } from "./cluster-authority";

/**
 * Strategic Fit — the "editor-in-chief" check the Quality Score was missing:
 * a draft can be well-written and still be the wrong thing to publish if it
 * duplicates an already-strong page in its own cluster, or the right thing
 * to publish if it closes a real, already-known gap. Every signal here is
 * read from what Cluster Authority already computed (lib/intelligence/
 * cluster-authority.ts) plus the site's own existing content index — no new
 * scoring model, just a question the other categories never asked: does
 * this article make the cluster it belongs to stronger?
 */

export interface StrategicFitInput {
  clusterId?: string;
  clusterLabel?: string;
  topicLabel: string;
  draftHeadings: string[];
  draftBodyText: string;
  draftLinkedPaths: string[];
}

export interface StrategicFitResult {
  score: number; // 0-100
  clusterLabel?: string;
  closesGap: boolean;
  closedGapLabel?: string;
  cannibalizationRisk: boolean;
  cannibalizationPath?: string;
  linksIntoCluster: boolean;
  decisionTrace: string[];
}

const GAP_MATCH_THRESHOLD = 0.25; // same floor internal-links.ts/editorial-brief.ts use for "real match"
// No cluster to measure against isn't a strategic failure — it just means
// this topic hasn't been planned into the Topic Map yet. Neutral, not zero.
const NEUTRAL_SCORE = 70;

export async function computeStrategicFit(
  input: StrategicFitInput,
  fetchClient: FetchClient = client
): Promise<StrategicFitResult> {
  const trace: string[] = [];

  if (!input.clusterId) {
    trace.push("1. No Topic Map cluster matched this brief's topic.");
    trace.push(`-> Scored neutral (${NEUTRAL_SCORE}/100) — nothing to measure strategic fit against yet, not treated as a failure.`);
    return { score: NEUTRAL_SCORE, closesGap: false, cannibalizationRisk: false, linksIntoCluster: false, decisionTrace: trace };
  }

  const cluster = await getClusterAuthorityByNodeId(input.clusterId);
  if (!cluster) {
    trace.push(`1. Cluster "${input.clusterLabel}" matched but not yet computed — run the weekly cron (or Run Now) to populate it.`);
    trace.push(`-> Scored neutral (${NEUTRAL_SCORE}/100).`);
    return { score: NEUTRAL_SCORE, clusterLabel: input.clusterLabel, closesGap: false, cannibalizationRisk: false, linksIntoCluster: false, decisionTrace: trace };
  }

  const topicTokens = normalizeQuery(input.topicLabel).tokens;
  const allGaps = [...cluster.missingSubtopics, ...cluster.competitorGaps, ...cluster.knowledgeGraphGaps];
  const closedGap = allGaps.find((g) => overlapScore(topicTokens, normalizeQuery(g.label).tokens) >= GAP_MATCH_THRESHOLD);
  trace.push(
    `1. Does this topic match one of "${cluster.clusterLabel}"'s ${allGaps.length} known open gap(s)? ${closedGap ? `yes — "${closedGap.label}"` : "no"}`
  );

  // A hypothetical draft has no Search Console history, so real GSC-driven
  // cannibalization (cannibalization.ts) can't see it. This asks the honest
  // substitute question instead: does the draft's own text already read as
  // a near-duplicate of a page this cluster already has and that page is
  // already strong? overlapScore/matchContent are the same building blocks
  // editorial-brief.ts uses for "does this match an existing page."
  const draftTokens = normalizeQuery(`${input.draftHeadings.join(" ")} ${input.draftBodyText}`).tokens;
  const contentIndex = await buildContentIndex(fetchClient);
  const { coverage, matchedPath } = matchContent([draftTokens], contentIndex);
  const cannibalizationRisk = coverage === "existing-strong" && Boolean(matchedPath) && cluster.linkedPaths.includes(matchedPath!);
  trace.push(`2. Does the draft closely match an already-strong page in this same cluster? ${cannibalizationRisk ? `yes — ${matchedPath}` : "no"}`);

  const linksIntoCluster = input.draftLinkedPaths.some((p) => cluster.linkedPaths.includes(p.replace(/\/$/, "")));
  trace.push(`3. Does the draft link to at least one other page in this cluster? ${linksIntoCluster ? "yes" : "no"}`);

  let score = 50; // baseline: mapped to a real cluster, but doing nothing special for it either way
  if (closedGap) {
    score += 35;
    trace.push("-> +35 for closing a real, already-known gap in this cluster");
  }
  if (linksIntoCluster) {
    score += 15;
    trace.push("-> +15 for linking into the cluster, strengthening its internal link graph");
  }
  if (cannibalizationRisk) {
    score -= 40;
    trace.push("-> -40 for likely duplicating existing strong content in the same cluster instead of adding new ground");
  }
  score = Math.max(0, Math.min(100, score));

  return {
    score,
    clusterLabel: cluster.clusterLabel,
    closesGap: Boolean(closedGap),
    closedGapLabel: closedGap?.label,
    cannibalizationRisk,
    cannibalizationPath: cannibalizationRisk ? matchedPath : undefined,
    linksIntoCluster,
    decisionTrace: trace,
  };
}
