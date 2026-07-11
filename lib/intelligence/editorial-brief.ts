import { client } from "@/sanity/client";
import { writeClient } from "@/sanity/write-client";
import { getKeywordDiscoveryTopicByKey } from "./keyword-discovery";
import { normalizeQuery, overlapScore } from "./keyword-utils";
import { isSearchConsoleConfigured, getQueryPageMatrix } from "./sources/search-console";

/**
 * Content Brief Compiler — the "research" phase of the editorial workflow,
 * built entirely from data the site already computes. Reuses Keyword
 * Discovery (target queries, intent, existing coverage), Competitor Gaps
 * (real crawled competitor topics), Knowledge Graph (established-but-
 * unconnected service/occasion pairs), and Search Console (real ranking
 * data if a page already exists) — no new research source, no LLM call.
 *
 * This produces a checklist, not a grade: requiredSubtopics/
 * requiredInternalLinks are what a drafted article is later diffed against
 * (see the Verification Suite) to compute the real coverage score. A brief
 * on its own doesn't score anything, because there's no draft yet to score.
 */

export type RequiredSubtopicSource = "competitor" | "knowledge-graph" | "sample-query";

export interface RequiredSubtopic {
  label: string;
  source: RequiredSubtopicSource;
  detail: string;
}

export interface CompetitorGapRef {
  competitorTopicLabel: string;
  priorityScore: number;
}

export interface KnowledgeGraphRef {
  serviceName: string;
  occasionName: string;
  priorityScore: number;
}

export type InternalLinkTargetType = "service" | "location" | "pillar-post" | "supporting-post";

export interface RequiredInternalLink {
  targetPath: string;
  targetLabel: string;
  targetType: InternalLinkTargetType;
  overlapScore: number;
}

export interface SearchConsoleSnapshot {
  clicks: number;
  impressions: number;
  position: number;
  fetchedAt: string;
}

export type AudienceLevel = "beginner" | "intermediate" | "advanced" | "general";

export interface ArticleBrief {
  topicKey: string;
  topicLabel: string;
  targetQueries: string[];
  searchIntent: string;
  audienceLevel: AudienceLevel;
  existingCoverage: string;
  matchedContentPath?: string;
  requiredSubtopics: RequiredSubtopic[];
  competitorGaps: CompetitorGapRef[];
  knowledgeGraphConnections: KnowledgeGraphRef[];
  requiredInternalLinks: RequiredInternalLink[];
  searchConsoleSnapshot: SearchConsoleSnapshot | null;
}

// Deliberately narrow, literal phrases rather than a broad heuristic — a
// wrong guess here is worse than no guess, so "general" (mixed or unclear)
// is the honest default, not a forced pick between beginner/advanced.
const BEGINNER_MARKERS = ["beginner", "beginners", "how to start", "basics", "first time", "for beginners", "step by step"];
const ADVANCED_MARKERS = ["advanced", "professional", "masterclass", "expert", "pro tips"];

function detectAudienceLevel(queries: string[]): AudienceLevel {
  const joined = queries.join(" | ").toLowerCase();
  const isBeginner = BEGINNER_MARKERS.some((m) => joined.includes(m));
  const isAdvanced = ADVANCED_MARKERS.some((m) => joined.includes(m));
  if (isBeginner && !isAdvanced) return "beginner";
  if (isAdvanced && !isBeginner) return "advanced";
  return "general";
}

const MIN_OVERLAP = 0.2; // same floor internal-links.ts uses for "real candidate, not a stretch"
const MAX_COMPETITOR_GAPS = 5;
const MAX_KG_CONNECTIONS = 5;
const MAX_INTERNAL_LINKS = 6;
const MAX_SAMPLE_QUERY_SUBTOPICS = 6;

export async function computeArticleBrief(topicKey: string): Promise<ArticleBrief> {
  const topic = await getKeywordDiscoveryTopicByKey(topicKey);
  if (!topic) {
    throw new Error(
      `No Keyword Discovery topic found for "${topicKey}" — a brief is compiled from an existing discovered topic, not from scratch.`
    );
  }

  const targetQueries = topic.sampleQueries.map((q) => q.query);
  const topicTokens = normalizeQuery(topic.topicLabel).tokens;

  const [competitorGapDocs, knowledgeGraphDocs, services, locations, blogPosts] = await Promise.all([
    client.fetch<{ topicLabel: string; priorityScore: number }[]>(
      `*[_type == "competitorGapTopic"]{ topicLabel, priorityScore }`
    ),
    client.fetch<{ serviceName: string; occasionName: string; priorityScore: number }[]>(
      `*[_type == "knowledgeGraphGap"]{ serviceName, occasionName, priorityScore }`
    ),
    client.fetch<{ name: string; slug: string; shortDescription?: string }[]>(
      `*[_type == "service" && defined(slug.current)]{ name, "slug": slug.current, shortDescription }`
    ),
    client.fetch<{ name: string; slug: string }[]>(
      `*[_type == "location" && defined(slug.current) && status == "published"]{ name, "slug": slug.current }`
    ),
    client.fetch<{ title: string; slug: string; excerpt?: string; category?: string }[]>(
      `*[_type == "blogPost" && defined(slug.current)]{ title, "slug": slug.current, excerpt, category }`
    ),
  ]);

  const competitorGaps: CompetitorGapRef[] = competitorGapDocs
    .map((c) => ({ ...c, overlap: overlapScore(topicTokens, normalizeQuery(c.topicLabel).tokens) }))
    .filter((c) => c.overlap >= MIN_OVERLAP)
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, MAX_COMPETITOR_GAPS)
    .map((c) => ({ competitorTopicLabel: c.topicLabel, priorityScore: c.priorityScore }));

  const knowledgeGraphConnections: KnowledgeGraphRef[] = knowledgeGraphDocs
    .filter((k) => overlapScore(topicTokens, normalizeQuery(`${k.serviceName} ${k.occasionName}`).tokens) >= MIN_OVERLAP)
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, MAX_KG_CONNECTIONS)
    .map((k) => ({ serviceName: k.serviceName, occasionName: k.occasionName, priorityScore: k.priorityScore }));

  const requiredSubtopics: RequiredSubtopic[] = [
    ...competitorGaps.map((c) => ({
      label: c.competitorTopicLabel,
      source: "competitor" as const,
      detail: "A real, crawled competitor page covers this — this site currently doesn't.",
    })),
    ...knowledgeGraphConnections.map((k) => ({
      label: `${k.serviceName} for ${k.occasionName}`,
      source: "knowledge-graph" as const,
      detail: `"${k.serviceName}" and "${k.occasionName}" are each independently established on this site, but no content connects them.`,
    })),
    ...targetQueries.slice(0, MAX_SAMPLE_QUERY_SUBTOPICS).map((q) => ({
      label: q,
      source: "sample-query" as const,
      detail: "A real discovered query this article should answer.",
    })),
  ];

  const candidateServices = services.map((s) => ({
    targetPath: `/services/${s.slug}`,
    targetLabel: s.name,
    targetType: "service" as InternalLinkTargetType,
    overlap: overlapScore(topicTokens, normalizeQuery(`${s.name} ${s.shortDescription ?? ""}`).tokens),
  }));
  const candidateLocations = locations.map((l) => ({
    targetPath: `/locations/${l.slug}`,
    targetLabel: l.name,
    targetType: "location" as InternalLinkTargetType,
    overlap: overlapScore(topicTokens, normalizeQuery(l.name).tokens),
  }));
  const candidatePosts = blogPosts.map((p) => ({
    targetPath: `/blog/${p.slug}`,
    targetLabel: p.title,
    // No explicit "pillar" flag exists on blogPost today — a post is treated
    // as a pillar candidate only if its own category name says so; everything
    // else defaults to supporting-post rather than guessing.
    targetType: (p.category?.toLowerCase().includes("pillar") ? "pillar-post" : "supporting-post") as InternalLinkTargetType,
    overlap: overlapScore(topicTokens, normalizeQuery(`${p.title} ${p.excerpt ?? ""}`).tokens),
  }));

  const requiredInternalLinks: RequiredInternalLink[] = [...candidateServices, ...candidateLocations, ...candidatePosts]
    .filter((c) => c.overlap >= MIN_OVERLAP)
    .sort((a, b) => b.overlap - a.overlap)
    .slice(0, MAX_INTERNAL_LINKS)
    .map((c) => ({
      targetPath: c.targetPath,
      targetLabel: c.targetLabel,
      targetType: c.targetType,
      overlapScore: Math.round(c.overlap * 100) / 100,
    }));

  let searchConsoleSnapshot: SearchConsoleSnapshot | null = null;
  if (isSearchConsoleConfigured() && topic.matchedContentPath) {
    try {
      const matrix = await getQueryPageMatrix(90);
      const rows = matrix.current.filter((r) => r.page.endsWith(topic.matchedContentPath!));
      if (rows.length > 0) {
        const clicks = rows.reduce((sum, r) => sum + r.clicks, 0);
        const impressions = rows.reduce((sum, r) => sum + r.impressions, 0);
        const avgPosition = rows.reduce((sum, r) => sum + r.position, 0) / rows.length;
        searchConsoleSnapshot = {
          clicks,
          impressions,
          position: Math.round(avgPosition * 10) / 10,
          fetchedAt: new Date().toISOString(),
        };
      }
    } catch {
      // A Search Console fetch failure shouldn't block the rest of an
      // otherwise-real brief — everything else here still stands on its own.
    }
  }

  return {
    topicKey: topic.topicKey,
    topicLabel: topic.topicLabel,
    targetQueries,
    searchIntent: topic.intent,
    audienceLevel: detectAudienceLevel(targetQueries),
    existingCoverage: topic.contentCoverage,
    matchedContentPath: topic.matchedContentPath,
    requiredSubtopics,
    competitorGaps,
    knowledgeGraphConnections,
    requiredInternalLinks,
    searchConsoleSnapshot,
  };
}

function docIdForBrief(topicKey: string): string {
  return `content-brief-${topicKey}`;
}

export async function persistArticleBrief(brief: ArticleBrief): Promise<{ id: string }> {
  const id = docIdForBrief(brief.topicKey);
  const existing = await client.fetch<{ firstSeenAt?: string; status?: string } | null>(
    `*[_id == $id][0]{ firstSeenAt, status }`,
    { id }
  );
  const nowIso = new Date().toISOString();

  await writeClient.createOrReplace({
    _id: id,
    _type: "contentBrief",
    ...brief,
    status: existing?.status ?? "new",
    firstSeenAt: existing?.firstSeenAt ?? nowIso,
    lastComputedAt: nowIso,
  });

  return { id };
}

export interface StoredArticleBrief extends ArticleBrief {
  _id: string;
  status: "new" | "drafting" | "verified" | "published";
  firstSeenAt: string;
  lastComputedAt: string;
}

export async function getArticleBriefByTopicKey(topicKey: string): Promise<StoredArticleBrief | null> {
  return client.fetch<StoredArticleBrief | null>(
    `*[_type == "contentBrief" && topicKey == $topicKey][0]`,
    { topicKey }
  );
}
