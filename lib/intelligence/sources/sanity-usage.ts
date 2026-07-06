import type { FetchClient } from "../content";

/**
 * Sanity's Management API exposes no usage or plan-limit endpoint — only
 * project structure (id, members, datasets). Everything here is therefore
 * either a live count/sum computed straight from the dataset, or an
 * admin-entered assumption (plan name, document/asset limits) used purely
 * to turn a real count into a percentage. Callers must label each value
 * accordingly — see MetricBadge's "calculated" vs "sanity" variants.
 */

const IMAGE_ASSET_TYPE = "sanity.imageAsset";
const FILE_ASSET_TYPE = "sanity.fileAsset";

export interface DocumentTypeCount {
  type: string;
  label: string;
  count: number;
}

export interface SanityUsageSnapshot {
  totalDocuments: number;
  contentDocuments: number;
  byType: DocumentTypeCount[];
  assetCount: number;
  assetBytes: number;
  fetchedAt: string;
}

function humanizeType(type: string): string {
  if (type === IMAGE_ASSET_TYPE) return "Image assets";
  if (type === FILE_ASSET_TYPE) return "File assets";
  return type
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

export async function getSanityUsageSnapshot(client: FetchClient): Promise<SanityUsageSnapshot> {
  const [typeRows, assetSizes] = await Promise.all([
    client.fetch<{ type: string }[]>(`*[]{"type": _type}`),
    client.fetch<number[]>(
      `*[_type in ["${IMAGE_ASSET_TYPE}","${FILE_ASSET_TYPE}"]].size`
    ),
  ]);

  const counts = new Map<string, number>();
  for (const { type } of typeRows) {
    counts.set(type, (counts.get(type) ?? 0) + 1);
  }

  const assetCount = (counts.get(IMAGE_ASSET_TYPE) ?? 0) + (counts.get(FILE_ASSET_TYPE) ?? 0);
  const assetBytes = assetSizes.reduce((sum, size) => sum + (size ?? 0), 0);

  const byType: DocumentTypeCount[] = Array.from(counts.entries())
    .filter(([type]) => type !== IMAGE_ASSET_TYPE && type !== FILE_ASSET_TYPE && !type.startsWith("system."))
    .map(([type, count]) => ({ type, label: humanizeType(type), count }))
    .sort((a, b) => b.count - a.count);

  const contentDocuments = byType.reduce((sum, t) => sum + t.count, 0);

  return {
    totalDocuments: typeRows.length,
    contentDocuments,
    byType,
    assetCount,
    assetBytes,
    fetchedAt: new Date().toISOString(),
  };
}

// ─── Admin-entered limits (no API provides these) ──────────────────────────

const DEFAULT_DOCUMENT_LIMIT = 10_000; // Sanity's published Free-tier figure
const DEFAULT_ASSET_LIMIT_GB = 100; // Published Free/Growth asset allotment

export function getDocumentLimit(): number {
  const parsed = process.env.SANITY_DOCUMENT_LIMIT ? parseInt(process.env.SANITY_DOCUMENT_LIMIT, 10) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_DOCUMENT_LIMIT;
}

export function isDocumentLimitConfigured(): boolean {
  return Boolean(process.env.SANITY_DOCUMENT_LIMIT);
}

export function getAssetLimitBytes(): number {
  const parsed = process.env.SANITY_ASSET_LIMIT_GB ? parseFloat(process.env.SANITY_ASSET_LIMIT_GB) : NaN;
  const gb = Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_ASSET_LIMIT_GB;
  return gb * 1024 * 1024 * 1024;
}

export function isAssetLimitConfigured(): boolean {
  return Boolean(process.env.SANITY_ASSET_LIMIT_GB);
}

export function getPlanName(): string {
  return process.env.SANITY_PLAN_NAME?.trim() || "Not configured";
}

export function isPlanNameConfigured(): boolean {
  return Boolean(process.env.SANITY_PLAN_NAME?.trim());
}

// ─── Warning tiers ──────────────────────────────────────────────────────────

export type UsageWarningTier = "ok" | "warning" | "critical" | "severe";

export function usageWarningTier(pct: number): UsageWarningTier {
  if (pct >= 95) return "severe";
  if (pct >= 90) return "critical";
  if (pct >= 75) return "warning";
  return "ok";
}

// ─── Growth projection ──────────────────────────────────────────────────────

export interface GrowthProjection {
  dailyGrowthRate: number | null;
  daysUntilLimit: number | null;
  projectedLimitDate: string | null;
}

export function computeGrowthProjection(
  series: { date: string; value: number }[],
  limit: number
): GrowthProjection {
  if (series.length < 2) {
    return { dailyGrowthRate: null, daysUntilLimit: null, projectedLimitDate: null };
  }

  const first = series[0];
  const last = series[series.length - 1];
  const daysElapsed = (new Date(last.date).getTime() - new Date(first.date).getTime()) / 86_400_000;
  if (daysElapsed <= 0) {
    return { dailyGrowthRate: null, daysUntilLimit: null, projectedLimitDate: null };
  }

  const dailyGrowthRate = (last.value - first.value) / daysElapsed;
  if (dailyGrowthRate <= 0) {
    return { dailyGrowthRate, daysUntilLimit: null, projectedLimitDate: null };
  }

  const remaining = limit - last.value;
  if (remaining <= 0) {
    return { dailyGrowthRate, daysUntilLimit: 0, projectedLimitDate: last.date };
  }

  const daysUntilLimit = Math.round(remaining / dailyGrowthRate);
  const projectedLimitDate = new Date(Date.now() + daysUntilLimit * 86_400_000).toISOString().slice(0, 10);
  return { dailyGrowthRate, daysUntilLimit, projectedLimitDate };
}
