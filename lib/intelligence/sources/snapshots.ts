import { client } from "@/sanity/client";
import { writeClient } from "@/sanity/write-client";

export interface MetricSnapshot {
  source: string;
  metric: string;
  date: string;
  value: number;
  fetchedAt: string;
}

export async function getLatestSnapshot(source: string, metric: string): Promise<MetricSnapshot | null> {
  return client.fetch<MetricSnapshot | null>(
    `*[_type == "metricSnapshot" && source == $source && metric == $metric] | order(date desc)[0]{
      source, metric, date, value, fetchedAt
    }`,
    { source, metric }
  );
}

export async function getSnapshotSeries(
  source: string,
  metric: string,
  days = 30
): Promise<MetricSnapshot[]> {
  const cutoff = new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);
  return client.fetch<MetricSnapshot[]>(
    `*[_type == "metricSnapshot" && source == $source && metric == $metric && date >= $cutoff] | order(date asc){
      source, metric, date, value, fetchedAt
    }`,
    { source, metric, cutoff }
  );
}

export async function getLatestSnapshots(source: string): Promise<MetricSnapshot[]> {
  return client.fetch<MetricSnapshot[]>(
    `*[_type == "metricSnapshot" && source == $source] | order(date desc){
      source, metric, date, value, fetchedAt
    }`,
    { source }
  );
}

export async function upsertSnapshot(snapshot: Omit<MetricSnapshot, "fetchedAt">): Promise<void> {
  const docId = `snapshot-${snapshot.source}-${snapshot.metric}-${snapshot.date}`;
  await writeClient.createOrReplace({
    _id: docId,
    _type: "metricSnapshot",
    source: snapshot.source,
    metric: snapshot.metric,
    date: snapshot.date,
    value: snapshot.value,
    fetchedAt: new Date().toISOString(),
  });
}

export async function upsertSnapshots(snapshots: Omit<MetricSnapshot, "fetchedAt">[]): Promise<void> {
  if (snapshots.length === 0) return;
  let tx = writeClient.transaction();
  for (const s of snapshots) {
    const docId = `snapshot-${s.source}-${s.metric}-${s.date}`;
    tx = tx.createOrReplace({
      _id: docId,
      _type: "metricSnapshot",
      source: s.source,
      metric: s.metric,
      date: s.date,
      value: s.value,
      fetchedAt: new Date().toISOString(),
    });
  }
  await tx.commit();
}
