import { getTopicNodeCount } from "./topic-map-wizard";
import { getCurrentTopPriorityObjective, type StoredEditorialObjective } from "./editorial-roadmap";
import { getTopPendingSuggestion, type StoredTopicNodeSuggestion } from "./topic-suggestions";

/**
 * Editor-in-Chief Mode — the single answer to "what's the highest-impact
 * thing to do next," replacing the instinct to check ten separate
 * dashboards. This is pure synthesis: it recomputes nothing on its own,
 * only compares the two things every other phase already ranked —
 * the Editorial Roadmap's top objective (grow an existing cluster) and
 * the top pending Topic Suggestion (add real, evidenced demand to the
 * map) — and explains which one wins and why. Both of those scores
 * already fold in Cluster Authority, Competitor Gaps, Keyword Discovery,
 * Search Console, Knowledge Graph, Topic Lifecycle, and Business
 * Priority upstream, so comparing them here is comparing fully-formed
 * conclusions, not raw signals.
 */

export interface EditorInChiefRecommendation {
  headline: string;
  detail: string;
  actionHref: string;
  actionLabel: string;
  decisionTrace: string[];
}

export async function computeTopRecommendation(): Promise<EditorInChiefRecommendation> {
  const topicNodeCount = await getTopicNodeCount();
  if (topicNodeCount === 0) {
    return {
      headline: "Generate your Initial Topic Map",
      detail:
        "The Topic Map is empty, so nothing else here can be prioritized yet — Cluster Authority, the Editorial Roadmap, and Topic Suggestions all depend on a real hierarchy existing first.",
      actionHref: "/command-center/topic-map/wizard",
      actionLabel: "Run the Initial Topic Map Wizard",
      decisionTrace: ["Topic Map has 0 nodes — this is the one prerequisite every other engine in this system depends on."],
    };
  }

  const [topObjective, topSuggestion] = await Promise.all([
    getCurrentTopPriorityObjective(),
    getTopPendingSuggestion(),
  ]);

  if (!topObjective && !topSuggestion) {
    return {
      headline: "Nothing urgent right now",
      detail: "No open Editorial Roadmap objectives and no pending Topic Suggestions — the site is in a stable state.",
      actionHref: "/command-center/roadmap",
      actionLabel: "View Editorial Roadmap",
      decisionTrace: ["No active clusters need attention and no new topics are awaiting review."],
    };
  }

  const objectiveScore = topObjective?.priorityScore ?? -1;
  // A speculative, single-source suggestion shouldn't outrank a well-evidenced
  // roadmap objective just because its raw priority number happens to be
  // higher — weight it down by its own confidence before comparing.
  const effectiveSuggestionScore = topSuggestion ? Math.round((topSuggestion.priorityScore * topSuggestion.confidenceScore) / 100) : -1;

  if (!topSuggestion || objectiveScore >= effectiveSuggestionScore) {
    return buildObjectiveRecommendation(topObjective!, topSuggestion, effectiveSuggestionScore);
  }
  return buildSuggestionRecommendation(topSuggestion, topObjective, objectiveScore);
}

function buildObjectiveRecommendation(
  objective: StoredEditorialObjective,
  topSuggestion: StoredTopicNodeSuggestion | null,
  effectiveSuggestionScore: number
): EditorInChiefRecommendation {
  const remainingActions = objective.actions.filter((a) => !a.done);
  const trace = [
    topSuggestion
      ? `Editorial Roadmap's top objective (${objective.clusterLabel}, priority ${objective.priorityScore}) outranks the top pending Topic Suggestion (${topSuggestion.suggestedLabel}, effective priority ${effectiveSuggestionScore} after confidence weighting).`
      : `Editorial Roadmap's top objective (${objective.clusterLabel}, priority ${objective.priorityScore}) — no pending Topic Suggestions to compare against.`,
    ...objective.decisionTrace,
  ];
  return {
    headline: objective.objectiveText,
    detail: `${objective.clusterLabel} — ${remainingActions.length} action${remainingActions.length === 1 ? "" : "s"} remaining: ${remainingActions.slice(0, 3).map((a) => a.label).join("; ")}${remainingActions.length > 3 ? "…" : ""}`,
    actionHref: "/command-center/roadmap",
    actionLabel: "View in Editorial Roadmap",
    decisionTrace: trace,
  };
}

function buildSuggestionRecommendation(
  suggestion: StoredTopicNodeSuggestion,
  topObjective: StoredEditorialObjective | null,
  objectiveScore: number
): EditorInChiefRecommendation {
  const trace = [
    topObjective
      ? `Top pending Topic Suggestion (${suggestion.suggestedLabel}, priority ${suggestion.priorityScore}, ${suggestion.confidenceLabel} confidence) outranks the top Editorial Roadmap objective (${topObjective.clusterLabel}, priority ${objectiveScore}) even after confidence weighting.`
      : `Top pending Topic Suggestion (${suggestion.suggestedLabel}, priority ${suggestion.priorityScore}, ${suggestion.confidenceLabel} confidence) — no open Editorial Roadmap objectives to compare against.`,
    ...suggestion.decisionTrace,
  ];
  return {
    headline: `Review the topic suggestion: "${suggestion.suggestedLabel}"`,
    detail: `${suggestion.confidenceLabel} confidence from ${suggestion.sourceCount} independent source${suggestion.sourceCount === 1 ? "" : "s"} — approving it adds real, evidenced demand to the Topic Map${suggestion.suggestedParentLabel ? ` under ${suggestion.suggestedParentLabel}` : ""}.`,
    actionHref: "/command-center/topic-map/suggestions",
    actionLabel: "Review Topic Suggestions",
    decisionTrace: trace,
  };
}
