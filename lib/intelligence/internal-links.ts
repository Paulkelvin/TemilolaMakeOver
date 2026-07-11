import { client } from "@/sanity/client";
import { writeClient } from "@/sanity/write-client";
import type { FetchClient } from "./content";
import { TAXONOMY_TYPES } from "./registry";
import { createNotification } from "./notifications";
import { normalizeQuery, overlapScore, computePriorityScore } from "./keyword-utils";

/**
 * Internal Link Intelligence — the site's only real rich-text link surface
 * is blogPost.body (Portable Text default `link` marks, href as a plain
 * string — no internalLink reference type exists in the schema). This scans
 * every real blog post's markDefs for hrefs into service/location pages
 * (the only taxonomy types with a real public page today, per
 * registry.ts's publicPath), counts genuine inbound links per target page,
 * and flags pages with too few. Suggested fixes are always specific real
 * blog posts, matched by the same token-overlap scoring every other engine
 * uses — never a vague "add more links."
 */

export type LinkAction = "add_internal_links" | "create_new_blog_article";

export interface LinkingPost {
  path: string;
  title: string;
}

export interface SuggestedSource {
  path: string;
  title: string;
  overlapScore: number;
}

export interface ScoreBreakdown {
  importanceScore: number;
  linkDeficitScore: number;
  severityScore: number;
}

export interface InternalLinkGap {
  topicKey: string;
  targetPath: string;
  targetLabel: string;
  targetType: string;
  inboundLinkCount: number;
  linkingPosts: LinkingPost[];
  suggestedSources: SuggestedSource[];
  scoreBreakdown: ScoreBreakdown;
  priorityScore: number;
  recommendedAction: LinkAction;
  recommendedActionDetail: string;
  decisionTrace: string[];
}

const MIN_HEALTHY_LINKS = 2; // below this, a page is under-linked (0 = orphan)
export const MIN_OVERLAP_FOR_SUGGESTION = 0.25; // overlapScore floor for a post to be a real candidate — the site-wide standard for "real candidate, not a stretch"
const MAX_SUGGESTIONS = 3;

// Deterministic editorial tiering, not fabricated data: service pages are
// the direct conversion surface, so a missing link there matters more than
// on a location page — same convention as EFFORT_WEIGHTS' ordinal scale.
const IMPORTANCE_BY_TYPE: Record<string, number> = {
  service: 100,
  location: 70,
};
const DEFAULT_IMPORTANCE = 60;

interface RawBlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  body?: { markDefs?: { href?: string }[] }[];
}

function extractHrefs(body: RawBlogPost["body"]): string[] {
  if (!body) return [];
  const hrefs: string[] = [];
  for (const block of body) {
    for (const markDef of block.markDefs ?? []) {
      if (markDef.href) hrefs.push(normalizePath(markDef.href));
    }
  }
  return hrefs;
}

function normalizePath(href: string): string {
  try {
    // Absolute URLs pointing at this site still resolve to a real pathname;
    // external domains fall through unchanged and simply won't match any
    // real target path below.
    const url = href.startsWith("/") ? new URL(href, "https://placeholder.invalid") : new URL(href);
    const path = url.pathname;
    return path.length > 1 ? path.replace(/\/$/, "") : path;
  } catch {
    return href;
  }
}

function slug(path: string): string {
  return path.toLowerCase().replace(/^\/|\/$/g, "").replace(/[^a-z0-9]+/g, "-").slice(0, 40) || "root";
}

// ─── Recommended action (deterministic decision tree, explainable) ────────

function recommendAction(
  candidates: SuggestedSource[],
  targetLabel: string,
  targetPath: string
): { action: LinkAction; detail: string; trace: string[] } {
  const trace: string[] = [];
  trace.push(`1. Real topically-overlapping blog posts found that don't already link here? ${candidates.length > 0 ? "YES" : "no"} (${candidates.length} candidate${candidates.length === 1 ? "" : "s"} found, overlap >= ${(MIN_OVERLAP_FOR_SUGGESTION * 100).toFixed(0)}%)`);

  if (candidates.length > 0) {
    trace.push("-> add_internal_links (cheap fix — real relevant content already exists, it just isn't linked yet)");
    return {
      action: "add_internal_links",
      detail: `Add a link to ${targetPath} from: ${candidates.map((c) => `"${c.title}"`).join(", ")}. Each already covers a topically related subject.`,
      trace,
    };
  }

  trace.push("-> create_new_blog_article (no existing content is topically close enough to link from honestly)");
  return {
    action: "create_new_blog_article",
    detail: `No existing blog post is topically close enough to ${targetLabel} to link naturally. Write a new article about ${targetLabel} and link it to ${targetPath}.`,
    trace,
  };
}

// ─── Main computation ───────────────────────────────────────────────────────

export async function computeInternalLinkGaps(fetchClient: FetchClient = client): Promise<InternalLinkGap[]> {
  const [blogPosts, ...taxonomyResults] = await Promise.all([
    fetchClient.fetch<RawBlogPost[]>(
      `*[_type == "blogPost"]{ _id, title, "slug": slug.current, excerpt, body }`
    ),
    ...TAXONOMY_TYPES.filter((t) => t.publicPath).map((t) =>
      fetchClient.fetch<{ _id: string; name: string; slug: string }[]>(
        `*[_type == $type && defined(slug.current)]{ _id, "name": ${t.nameField}, "slug": slug.current }`,
        { type: t.type }
      )
    ),
  ]);

  const postPaths = blogPosts.map((p) => ({
    path: `/blog/${p.slug}`,
    title: p.title,
    hrefs: extractHrefs(p.body),
    tokens: normalizeQuery(`${p.title} ${p.excerpt ?? ""}`).tokens,
  }));

  const targetTypes = TAXONOMY_TYPES.filter((t) => t.publicPath);
  const gaps: InternalLinkGap[] = [];

  targetTypes.forEach((typeConfig, i) => {
    const nodes = taxonomyResults[i] as { _id: string; name: string; slug: string }[];
    for (const node of nodes) {
      if (!node.slug) continue;
      const targetPath = typeConfig.publicPath!(node.slug);
      const linkingPosts = postPaths.filter((p) => p.hrefs.includes(targetPath));
      const inboundLinkCount = linkingPosts.length;
      if (inboundLinkCount >= MIN_HEALTHY_LINKS) continue;

      const targetTokens = normalizeQuery(node.name).tokens;
      const alreadyLinkingPaths = new Set(linkingPosts.map((p) => p.path));
      const candidates: SuggestedSource[] = postPaths
        .filter((p) => !alreadyLinkingPaths.has(p.path))
        .map((p) => ({ path: p.path, title: p.title, overlapScore: overlapScore(targetTokens, p.tokens) }))
        .filter((c) => c.overlapScore >= MIN_OVERLAP_FOR_SUGGESTION)
        .sort((a, b) => b.overlapScore - a.overlapScore)
        .slice(0, MAX_SUGGESTIONS);

      const importanceScore = IMPORTANCE_BY_TYPE[typeConfig.type] ?? DEFAULT_IMPORTANCE;
      const linkDeficitScore = inboundLinkCount === 0 ? 100 : 50;
      const severityScore = importanceScore * 0.5 + linkDeficitScore * 0.5;

      const { action, detail, trace } = recommendAction(candidates, node.name, targetPath);
      const priorityScore = computePriorityScore(severityScore, action);

      gaps.push({
        topicKey: `link-${slug(targetPath)}`,
        targetPath,
        targetLabel: node.name,
        targetType: typeConfig.type,
        inboundLinkCount,
        linkingPosts: linkingPosts.map((p) => ({ path: p.path, title: p.title })),
        suggestedSources: candidates,
        scoreBreakdown: { importanceScore, linkDeficitScore, severityScore },
        priorityScore,
        recommendedAction: action,
        recommendedActionDetail: detail,
        decisionTrace: trace,
      });
    }
  });

  return gaps.sort((a, b) => b.priorityScore - a.priorityScore);
}

// ─── Persistence ────────────────────────────────────────────────────────────

interface StoredGapLite {
  _id: string;
  topicKey: string;
  status?: string;
  actionedAt?: string;
  history?: { date: string; severityScore: number }[];
  firstSeenAt?: string;
}

function docIdForTopic(topicKey: string): string {
  return `internal-link-gap-${topicKey}`;
}

export async function persistInternalLinkGaps(
  gaps: InternalLinkGap[]
): Promise<{ upserted: number; notifications: number }> {
  const today = new Date().toISOString().slice(0, 10);
  const nowIso = new Date().toISOString();

  const existing = await client.fetch<StoredGapLite[]>(
    `*[_type == "internalLinkGap"]{ _id, topicKey, status, actionedAt, history, firstSeenAt }`
  );
  const existingByKey = new Map(existing.map((e) => [e.topicKey, e]));

  let notifications = 0;
  let tx = writeClient.transaction();

  for (const gap of gaps) {
    const prior = existingByKey.get(gap.topicKey);
    const history = [...(prior?.history ?? [])];
    if (history[history.length - 1]?.date !== today) {
      history.push({ date: today, severityScore: gap.scoreBreakdown.severityScore });
    }

    tx = tx.createOrReplace({
      _id: docIdForTopic(gap.topicKey),
      _type: "internalLinkGap",
      topicKey: gap.topicKey,
      targetPath: gap.targetPath,
      targetLabel: gap.targetLabel,
      targetType: gap.targetType,
      inboundLinkCount: gap.inboundLinkCount,
      linkingPosts: gap.linkingPosts,
      suggestedSources: gap.suggestedSources,
      scoreBreakdown: gap.scoreBreakdown,
      priorityScore: gap.priorityScore,
      recommendedAction: gap.recommendedAction,
      recommendedActionDetail: gap.recommendedActionDetail,
      decisionTrace: gap.decisionTrace,
      status: prior?.status ?? "new",
      actionedAt: prior?.actionedAt,
      history,
      firstSeenAt: prior?.firstSeenAt ?? nowIso,
      lastComputedAt: nowIso,
    });

    if (!prior && gap.inboundLinkCount === 0 && gap.targetType === "service") {
      await createNotification({
        kind: "internal_link_gap",
        severity: "info",
        title: `Orphan service page: ${gap.targetLabel}`,
        body: gap.recommendedActionDetail,
        metadata: { topicKey: gap.topicKey, targetPath: gap.targetPath },
      });
      notifications++;
    }
  }

  await tx.commit();
  return { upserted: gaps.length, notifications };
}

// ─── Read helpers (for the UI — no recomputation, just what's stored) ──────

export interface StoredInternalLinkGap extends InternalLinkGap {
  status: "new" | "acknowledged" | "in_progress" | "done" | "dismissed";
  actionedAt?: string;
  history: { date: string; severityScore: number }[];
  firstSeenAt: string;
  lastComputedAt: string;
}

const GAP_PROJECTION = `{
  topicKey, targetPath, targetLabel, targetType, inboundLinkCount, linkingPosts,
  suggestedSources, scoreBreakdown, priorityScore, recommendedAction,
  recommendedActionDetail, decisionTrace, status, actionedAt, history,
  firstSeenAt, lastComputedAt
}`;

export async function getInternalLinkGaps(): Promise<StoredInternalLinkGap[]> {
  return client.fetch<StoredInternalLinkGap[]>(
    `*[_type == "internalLinkGap"] | order(priorityScore desc) ${GAP_PROJECTION}`
  );
}

export async function getInternalLinkGapByKey(topicKey: string): Promise<StoredInternalLinkGap | null> {
  return client.fetch<StoredInternalLinkGap | null>(
    `*[_type == "internalLinkGap" && topicKey == $topicKey][0] ${GAP_PROJECTION}`,
    { topicKey }
  );
}
