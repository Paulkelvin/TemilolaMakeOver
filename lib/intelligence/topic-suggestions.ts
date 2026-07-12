import { client } from "@/sanity/client";
import { writeClient } from "@/sanity/write-client";
import { fetchAllTaxonomyNodes, type FetchClient } from "./content";
import { getTopicMap, type TopicMapNode } from "./topic-map";
import { matchTopicToCluster } from "./cluster-authority";
import { getCompetitorGaps } from "./competitor-gap";
import { getKeywordDiscoveryTopics } from "./keyword-discovery";
import { getGoogleAutocomplete } from "./sources/keyword-discovery-sources";
import { getQueryPageMatrix, isSearchConsoleConfigured } from "./sources/search-console";
import { normalizeQuery, overlapScore, topicKeyFor, OVERLAP_THRESHOLDS, MAKEUP_SPECIFIC_VOCAB, type ConfidenceLevel } from "./keyword-utils";
import { blockText, type PortableTextBlockLite } from "./evidence-scan";
import {
  candidate,
  mergeCandidates,
  dedupeEvidence,
  scoreBucket,
  type SuggestionSource,
  type SuggestionEvidence,
  type RawCandidate,
} from "./topic-clustering";

/**
 * Topic Node Suggestion Engine — the Topic Map's "living knowledge graph"
 * intake. Mines 5 already-computed or already-fetchable sources for
 * candidate topics not yet represented anywhere in the hand-edited Topic
 * Map, attaches evidence to every candidate, and stops there: nothing here
 * ever writes a topicNode directly. A human reviews the evidence in the
 * Command Center and explicitly approves (creates the real topicNode) or
 * rejects each suggestion via approveTopicSuggestion/rejectTopicSuggestion
 * below — data-driven discovery, human-controlled editing.
 */

export interface TopicNodeSuggestion {
  suggestionKey: string;
  suggestedLabel: string;
  suggestedParentId?: string;
  suggestedParentLabel?: string;
  evidence: SuggestionEvidence[];
  sourceCount: number;
  priorityScore: number;
  confidenceLabel: ConfidenceLevel;
  confidenceScore: number;
  decisionTrace: string[];
}

const MERGE_OVERLAP = 0.5; // candidates from different sources merge into one suggestion above this
const MAX_SUGGESTIONS = 40;
const MIN_SC_IMPRESSIONS = 50;
const MIN_ENTITY_ARTICLE_COUNT = 3;
const MAX_AUTOCOMPLETE_SEEDS = 20;

// ─── Source miners ──────────────────────────────────────────────────────────

export async function mineCompetitorGaps(): Promise<RawCandidate[]> {
  const gaps = await getCompetitorGaps();
  return gaps
    .filter((g) => g.status !== "dismissed")
    .map((g) =>
      candidate(
        g.topicLabel,
        "competitor-gap",
        `Competitor "${g.competitorName}" already covers this (relevance ${g.topicalRelevanceScore}).`,
        g.priorityScore
      )
    );
}

export async function mineSearchConsole(): Promise<RawCandidate[]> {
  if (!isSearchConsoleConfigured()) return [];
  const matrix = await getQueryPageMatrix(90);
  const byQuery = new Map<string, { impressions: number; positionSum: number; rows: number }>();
  for (const row of matrix.current) {
    const agg = byQuery.get(row.query) ?? { impressions: 0, positionSum: 0, rows: 0 };
    agg.impressions += row.impressions;
    agg.positionSum += row.position;
    agg.rows += 1;
    byQuery.set(row.query, agg);
  }
  const candidates: RawCandidate[] = [];
  for (const [query, agg] of byQuery) {
    if (agg.impressions < MIN_SC_IMPRESSIONS) continue;
    const avgPosition = agg.positionSum / agg.rows;
    const priorityScore = Math.min(100, agg.impressions / 10) + (avgPosition <= 20 ? 15 : 0);
    candidates.push(
      candidate(
        query,
        "search-console",
        `Real Search Console query — ${agg.impressions} impressions, avg position ${avgPosition.toFixed(1)}.`,
        priorityScore
      )
    );
  }
  return candidates;
}

export async function mineKeywordDiscovery(): Promise<RawCandidate[]> {
  const topics = await getKeywordDiscoveryTopics();
  return topics
    .filter((t) => t.status !== "dismissed")
    .map((t) =>
      candidate(
        t.topicLabel,
        "keyword-discovery",
        `Discovered search demand — ${t.sampleQueries.length} sample quer${t.sampleQueries.length === 1 ? "y" : "ies"}, ${t.confidenceLevel} confidence.`,
        t.priorityScore
      )
    );
}

// Seeded from the site's real taxonomy names plus any already-mapped Topic
// Map labels, so this surfaces direct expansions of topics the business
// actually has ("Owambe Makeup" -> "owambe makeup for aso ebi guests")
// rather than re-running Keyword Discovery's own broader net.
export async function mineAutocomplete(seeds: string[]): Promise<RawCandidate[]> {
  const uniqueSeeds = Array.from(new Set(seeds.map((s) => s.trim()).filter(Boolean))).slice(0, MAX_AUTOCOMPLETE_SEEDS);
  const results = await Promise.all(
    uniqueSeeds.map(async (seed) => {
      const suggestions = await getGoogleAutocomplete(seed).catch(() => []);
      return suggestions
        .filter((s) => s.toLowerCase() !== seed.toLowerCase())
        .map((s) => candidate(s, "autocomplete", `Google Autocomplete suggests this for "${seed}".`, 35));
    })
  );
  // A broad seed (an occasion/wedding-type name like "Corporate" or
  // "Traditional Wedding") can pull back autocomplete noise that shares only
  // the seed's own generic word ("corporate lawyer salary", "wedding rings")
  // — require at least one genuinely makeup-specific token before keeping it.
  return results.flat().filter((c) => c.tokens.some((t) => MAKEUP_SPECIFIC_VOCAB.has(t)));
}

// No NLP library in this codebase — Title Case bigram/trigram matching is
// the same heuristic-first approach every other engine here uses. A phrase
// only counts once it recurs across multiple distinct verified (qualityScore
// present) articles, not just multiple times within one.
export async function mineRecurringEntities(fetchClient: FetchClient): Promise<RawCandidate[]> {
  const posts = await fetchClient.fetch<{ title: string; body?: PortableTextBlockLite[] }[]>(
    `*[_type == "blogPost" && defined(qualityScore)]{ title, body }`
  );
  const PHRASE_PATTERN = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2}\b/g;
  const byPhrase = new Map<string, { label: string; articles: Set<number> }>();

  posts.forEach((post, index) => {
    const text = `${post.title} ${(post.body ?? []).map(blockText).join(" ")}`;
    const seenInThisArticle = new Set<string>();
    for (const match of text.matchAll(PHRASE_PATTERN)) {
      const phrase = match[0].trim();
      const key = phrase.toLowerCase();
      if (seenInThisArticle.has(key)) continue;
      seenInThisArticle.add(key);
      const entry = byPhrase.get(key) ?? { label: phrase, articles: new Set<number>() };
      entry.articles.add(index);
      byPhrase.set(key, entry);
    }
  });

  const candidates: RawCandidate[] = [];
  for (const { label, articles } of byPhrase.values()) {
    if (articles.size < MIN_ENTITY_ARTICLE_COUNT) continue;
    candidates.push(
      candidate(label, "recurring-entity", `Recurring phrase across ${articles.size} verified articles.`, Math.min(100, articles.size * 20))
    );
  }
  return candidates;
}

// ─── Already-covered filter + cross-source merge ───────────────────────────

export function flattenAllNodes(nodes: TopicMapNode[]): TopicMapNode[] {
  return nodes.flatMap((n) => [n, ...flattenAllNodes(n.children)]);
}

export function isAlreadyCovered(tokens: string[], existingNodeTokenSets: string[][]): boolean {
  return existingNodeTokenSets.some((nodeTokens) => overlapScore(tokens, nodeTokens) >= OVERLAP_THRESHOLDS.alreadyDuplicate);
}

export async function computeTopicSuggestions(fetchClient: FetchClient = client): Promise<TopicNodeSuggestion[]> {
  const tree = await getTopicMap();
  const allNodes = flattenAllNodes(tree);
  const existingNodeTokenSets = allNodes.map((n) => normalizeQuery(n.label).tokens);

  const taxonomyNodes = await fetchAllTaxonomyNodes(fetchClient);
  const autocompleteSeeds = [...taxonomyNodes.map((n) => n.name), ...allNodes.map((n) => n.label)];

  const [competitorCandidates, searchConsoleCandidates, keywordDiscoveryCandidates, autocompleteCandidates, entityCandidates] =
    await Promise.all([
      mineCompetitorGaps(),
      mineSearchConsole(),
      mineKeywordDiscovery(),
      mineAutocomplete(autocompleteSeeds),
      mineRecurringEntities(fetchClient),
    ]);

  const allCandidates = [
    ...competitorCandidates,
    ...searchConsoleCandidates,
    ...keywordDiscoveryCandidates,
    ...autocompleteCandidates,
    ...entityCandidates,
  ].filter((c) => c.tokens.length > 0 && !isAlreadyCovered(c.tokens, existingNodeTokenSets));

  const buckets = mergeCandidates(allCandidates, MERGE_OVERLAP);

  const suggestions = await Promise.all(
    buckets.map(async (bucket): Promise<TopicNodeSuggestion> => {
      const label = bucket.representative.label;
      const tokens = bucket.representative.tokens;
      const evidence = dedupeEvidence(bucket.evidence);
      const { priorityScore, confidenceLabel, confidenceScore } = scoreBucket(evidence, bucket.sources.size);
      const parentMatch = await matchTopicToCluster(tokens);

      const trace: string[] = [
        `Surfaced by ${bucket.sources.size} source${bucket.sources.size === 1 ? "" : "s"}: ${Array.from(bucket.sources).join(", ")} — confidence ${confidenceLabel} (${confidenceScore}%).`,
        `Not already represented in the Topic Map — no existing node's label overlaps this by ${Math.round(OVERLAP_THRESHOLDS.alreadyDuplicate * 100)}% or more.`,
        parentMatch
          ? `Best fits under the existing "${parentMatch.clusterLabel}" cluster (overlap ${parentMatch.overlap.toFixed(2)}).`
          : `Doesn't overlap any existing cluster closely enough — candidate for a brand new top-level topic.`,
      ];

      return {
        suggestionKey: topicKeyFor(tokens, label),
        suggestedLabel: label,
        suggestedParentId: parentMatch?.clusterNodeId,
        suggestedParentLabel: parentMatch?.clusterLabel,
        evidence,
        sourceCount: bucket.sources.size,
        priorityScore,
        confidenceLabel,
        confidenceScore,
        decisionTrace: trace,
      };
    })
  );

  return suggestions.sort((a, b) => b.priorityScore - a.priorityScore).slice(0, MAX_SUGGESTIONS);
}

// ─── Persistence ────────────────────────────────────────────────────────────

interface StoredSuggestionLite {
  _id: string;
  status?: string;
  actionedAt?: string;
  createdTopicNodeId?: string;
  firstSeenAt?: string;
}

function docIdForSuggestion(key: string): string {
  return `topic-suggestion-${key}`;
}

export async function persistTopicSuggestions(suggestions: TopicNodeSuggestion[]): Promise<{ upserted: number; newCount: number }> {
  const nowIso = new Date().toISOString();

  const existing = await client.fetch<StoredSuggestionLite[]>(
    `*[_type == "topicNodeSuggestion"]{ _id, status, actionedAt, createdTopicNodeId, firstSeenAt }`
  );
  const existingById = new Map(existing.map((e) => [e._id, e]));

  let newCount = 0;
  let tx = writeClient.transaction();
  for (const s of suggestions) {
    const id = docIdForSuggestion(s.suggestionKey);
    const prior = existingById.get(id);
    if (!prior) newCount += 1;

    tx = tx.createOrReplace({
      _id: id,
      _type: "topicNodeSuggestion",
      ...s,
      status: prior?.status ?? "pending",
      actionedAt: prior?.actionedAt,
      createdTopicNodeId: prior?.createdTopicNodeId,
      firstSeenAt: prior?.firstSeenAt ?? nowIso,
      lastComputedAt: nowIso,
    });
  }
  await tx.commit();

  return { upserted: suggestions.length, newCount };
}

export interface StoredTopicNodeSuggestion extends TopicNodeSuggestion {
  _id: string;
  status: "pending" | "approved" | "rejected";
  actionedAt?: string;
  createdTopicNodeId?: string;
  firstSeenAt: string;
  lastComputedAt: string;
}

export async function getTopicSuggestions(): Promise<StoredTopicNodeSuggestion[]> {
  return client.fetch<StoredTopicNodeSuggestion[]>(`*[_type == "topicNodeSuggestion"] | order(priorityScore desc)`);
}

export async function getPendingTopicSuggestionCount(): Promise<number> {
  return client.fetch<number>(`count(*[_type == "topicNodeSuggestion" && status == "pending"])`);
}

export async function getTopicSuggestionById(id: string): Promise<StoredTopicNodeSuggestion | null> {
  return client.fetch<StoredTopicNodeSuggestion | null>(`*[_id == $id][0]`, { id });
}

// ─── Approval workflow — the one place this engine ever writes a topicNode ─

async function nextSiblingOrder(parentId?: string): Promise<number> {
  const maxOrder = await client.fetch<number | null>(
    parentId
      ? `*[_type == "topicNode" && parent._ref == $parentId] | order(order desc)[0].order`
      : `*[_type == "topicNode" && !defined(parent)] | order(order desc)[0].order`,
    parentId ? { parentId } : {}
  );
  return (maxOrder ?? -1) + 1;
}

export async function approveTopicSuggestion(suggestionId: string): Promise<{ createdTopicNodeId: string }> {
  const suggestion = await client.fetch<StoredTopicNodeSuggestion | null>(`*[_id == $id][0]`, { id: suggestionId });
  if (!suggestion) throw new Error(`Suggestion ${suggestionId} not found.`);
  if (suggestion.status !== "pending") throw new Error(`Suggestion is already ${suggestion.status}.`);

  const order = await nextSiblingOrder(suggestion.suggestedParentId);
  const created = await writeClient.create({
    _type: "topicNode",
    label: suggestion.suggestedLabel,
    order,
    ...(suggestion.suggestedParentId ? { parent: { _type: "reference", _ref: suggestion.suggestedParentId } } : {}),
  });

  await writeClient
    .patch(suggestionId)
    .set({ status: "approved", actionedAt: new Date().toISOString(), createdTopicNodeId: created._id })
    .commit();

  return { createdTopicNodeId: created._id };
}

export async function rejectTopicSuggestion(suggestionId: string): Promise<void> {
  const suggestion = await client.fetch<StoredTopicNodeSuggestion | null>(`*[_id == $id][0]`, { id: suggestionId });
  if (!suggestion) throw new Error(`Suggestion ${suggestionId} not found.`);
  if (suggestion.status !== "pending") throw new Error(`Suggestion is already ${suggestion.status}.`);

  await writeClient.patch(suggestionId).set({ status: "rejected", actionedAt: new Date().toISOString() }).commit();
}
