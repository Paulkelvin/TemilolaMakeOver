import { client } from "@/sanity/client";
import { writeClient } from "@/sanity/write-client";
import type { FetchClient } from "./content";
import { createNotification } from "./notifications";
import { computePriorityScore } from "./keyword-utils";

/**
 * Knowledge Graph Utilization — the site's own real reference graph
 * (portfolioItem/testimonial/faq/blogPost each reference a real service and
 * a real occasion) already encodes which Service × Occasion combinations
 * are covered. A "graph gap" is a pair where both nodes are individually
 * well-established (each has real content elsewhere) but the graph has no
 * real edge connecting them yet — the site knows about both independently,
 * it just hasn't connected them. Pure reference counting, no guessed demand.
 *
 * Service × Occasion, not Service × Location: a live check of the real
 * dataset found zero leaf content anywhere tagged with a location reference
 * (0 of 48 portfolio/testimonial/faq/blog documents), while occasion and
 * style tagging are both actively used (portfolio: 7 occasion, 4 style;
 * faq: 5 occasion; blog: 4 occasion, 3 style). Building this around Location
 * would have shipped an engine that could never surface a real gap yet —
 * Occasion is the pairing the site's real data actually supports today.
 */

export type GraphAction = "create_new_blog_article" | "add_portfolio_examples";

export interface KnowledgeGraphGap {
  topicKey: string;
  serviceName: string;
  occasionName: string;
  servicePath?: string;
  serviceContentCount: number;
  occasionContentCount: number;
  scoreBreakdown: { serviceStrengthScore: number; occasionStrengthScore: number; importanceScore: number };
  priorityScore: number;
  recommendedAction: GraphAction;
  recommendedActionDetail: string;
  decisionTrace: string[];
}

const MIN_NODE_STRENGTH = 2; // each side must have this much real content elsewhere to count as "established"

interface RefRow {
  serviceId?: string;
  occasionId?: string;
}

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40) || "x";
}

function recommendAction(): { action: GraphAction; trace: string[] } {
  const trace: string[] = [];
  trace.push("1. Real content connecting these two nodes? no (0 found)");
  trace.push("-> create_new_blog_article (an article naturally carries both a service and an occasion tag)");
  return { action: "create_new_blog_article", trace };
}

export async function computeKnowledgeGraphGaps(fetchClient: FetchClient = client): Promise<KnowledgeGraphGap[]> {
  const [services, occasions, portfolioRows, testimonialRows, faqRows, blogRows] = await Promise.all([
    fetchClient.fetch<{ _id: string; name: string; slug?: string }[]>(
      `*[_type == "service" && defined(slug.current)]{ _id, name, "slug": slug.current }`
    ),
    fetchClient.fetch<{ _id: string; name: string; slug?: string }[]>(
      `*[_type == "occasion" && defined(slug.current)]{ _id, name, "slug": slug.current }`
    ),
    fetchClient.fetch<RefRow[]>(`*[_type == "portfolioItem"]{ "serviceId": service._ref, "occasionId": occasion._ref }`),
    fetchClient.fetch<RefRow[]>(`*[_type == "testimonial"]{ "serviceId": service._ref, "occasionId": occasion._ref }`),
    fetchClient.fetch<RefRow[]>(`*[_type == "faq"]{ "serviceId": service._ref, "occasionId": occasion._ref }`),
    fetchClient.fetch<RefRow[]>(
      `*[_type == "blogPost"]{ "serviceId": primaryService._ref, "occasionId": relatedOccasion._ref }`
    ),
  ]);

  const serviceTotal = new Map<string, number>();
  const occasionTotal = new Map<string, number>();
  const pairCount = new Map<string, number>();

  const bump = (map: Map<string, number>, key: string | undefined) => {
    if (!key) return;
    map.set(key, (map.get(key) ?? 0) + 1);
  };
  const pairKey = (s: string, o: string) => `${s}|||${o}`;

  for (const row of [...portfolioRows, ...testimonialRows, ...faqRows, ...blogRows]) {
    bump(serviceTotal, row.serviceId);
    bump(occasionTotal, row.occasionId);
    if (row.serviceId && row.occasionId) bump(pairCount, pairKey(row.serviceId, row.occasionId));
  }

  const gaps: KnowledgeGraphGap[] = [];

  for (const service of services) {
    const sTotal = serviceTotal.get(service._id) ?? 0;
    if (sTotal < MIN_NODE_STRENGTH) continue;

    for (const occasion of occasions) {
      const oTotal = occasionTotal.get(occasion._id) ?? 0;
      if (oTotal < MIN_NODE_STRENGTH) continue;

      const count = pairCount.get(pairKey(service._id, occasion._id)) ?? 0;
      if (count > 0) continue; // real edge already exists — not a gap

      const serviceStrengthScore = Math.min(100, sTotal * 20);
      const occasionStrengthScore = Math.min(100, oTotal * 20);
      const importanceScore = Math.min(serviceStrengthScore, occasionStrengthScore);

      const { action, trace } = recommendAction();
      trace.push(`2. Service "${service.name}" has ${sTotal} real content items elsewhere (established, >= ${MIN_NODE_STRENGTH})`);
      trace.push(`3. Occasion "${occasion.name}" has ${oTotal} real content items elsewhere (established, >= ${MIN_NODE_STRENGTH})`);
      trace.push("-> both nodes are real and established, but the graph has no edge between them — a genuine knowledge-graph gap");

      const priorityScore = computePriorityScore(importanceScore, action);
      const detail = `"${service.name}" and "${occasion.name}" are each covered elsewhere on the site, but no real content connects them. Write a blog article (or add a portfolio example) about ${service.name} for ${occasion.name}, tagged with both.`;

      gaps.push({
        topicKey: `graph-${slug(service.name)}-${slug(occasion.name)}`,
        serviceName: service.name,
        occasionName: occasion.name,
        servicePath: service.slug ? `/services/${service.slug}` : undefined,
        serviceContentCount: sTotal,
        occasionContentCount: oTotal,
        scoreBreakdown: { serviceStrengthScore, occasionStrengthScore, importanceScore },
        priorityScore,
        recommendedAction: action,
        recommendedActionDetail: detail,
        decisionTrace: trace,
      });
    }
  }

  return gaps.sort((a, b) => b.priorityScore - a.priorityScore);
}

// ─── Persistence ────────────────────────────────────────────────────────────

interface StoredGapLite {
  _id: string;
  topicKey: string;
  status?: string;
  actionedAt?: string;
  history?: { date: string; importanceScore: number }[];
  firstSeenAt?: string;
}

function docIdForTopic(topicKey: string): string {
  return `knowledge-graph-gap-${topicKey}`;
}

export async function persistKnowledgeGraphGaps(
  gaps: KnowledgeGraphGap[]
): Promise<{ upserted: number; notifications: number }> {
  const today = new Date().toISOString().slice(0, 10);
  const nowIso = new Date().toISOString();

  const existing = await client.fetch<StoredGapLite[]>(
    `*[_type == "knowledgeGraphGap"]{ _id, topicKey, status, actionedAt, history, firstSeenAt }`
  );
  const existingByKey = new Map(existing.map((e) => [e.topicKey, e]));

  let notifications = 0;
  let tx = writeClient.transaction();

  for (const gap of gaps) {
    const prior = existingByKey.get(gap.topicKey);
    const history = [...(prior?.history ?? [])];
    if (history[history.length - 1]?.date !== today) {
      history.push({ date: today, importanceScore: gap.scoreBreakdown.importanceScore });
    }

    tx = tx.createOrReplace({
      _id: docIdForTopic(gap.topicKey),
      _type: "knowledgeGraphGap",
      topicKey: gap.topicKey,
      serviceName: gap.serviceName,
      occasionName: gap.occasionName,
      servicePath: gap.servicePath,
      serviceContentCount: gap.serviceContentCount,
      occasionContentCount: gap.occasionContentCount,
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

    if (!prior && gap.scoreBreakdown.importanceScore >= 80) {
      await createNotification({
        kind: "content_gap",
        severity: "info",
        title: `Knowledge graph gap: ${gap.serviceName} × ${gap.occasionName}`,
        body: gap.recommendedActionDetail,
        metadata: { topicKey: gap.topicKey },
      });
      notifications++;
    }
  }

  await tx.commit();
  return { upserted: gaps.length, notifications };
}

// ─── Read helpers (for the UI — no recomputation, just what's stored) ──────

export interface StoredKnowledgeGraphGap extends KnowledgeGraphGap {
  status: "new" | "acknowledged" | "in_progress" | "done" | "dismissed";
  actionedAt?: string;
  history: { date: string; importanceScore: number }[];
  firstSeenAt: string;
  lastComputedAt: string;
}

const GAP_PROJECTION = `{
  topicKey, serviceName, occasionName, servicePath,
  serviceContentCount, occasionContentCount, scoreBreakdown, priorityScore,
  recommendedAction, recommendedActionDetail, decisionTrace,
  status, actionedAt, history, firstSeenAt, lastComputedAt
}`;

export async function getKnowledgeGraphGaps(): Promise<StoredKnowledgeGraphGap[]> {
  return client.fetch<StoredKnowledgeGraphGap[]>(
    `*[_type == "knowledgeGraphGap"] | order(priorityScore desc) ${GAP_PROJECTION}`
  );
}

export async function getKnowledgeGraphGapByKey(topicKey: string): Promise<StoredKnowledgeGraphGap | null> {
  return client.fetch<StoredKnowledgeGraphGap | null>(
    `*[_type == "knowledgeGraphGap" && topicKey == $topicKey][0] ${GAP_PROJECTION}`,
    { topicKey }
  );
}
