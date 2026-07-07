import { client } from "@/sanity/client";
import { writeClient } from "@/sanity/write-client";

export type NotificationKind =
  | "booking_received"
  | "payment_confirmed"
  | "deploy_failure"
  | "ranking_drop"
  | "content_gap"
  | "new_review"
  | "wbr_ready"
  | "metric_alert"
  | "seo_opportunity";

export type Severity = "info" | "warning" | "critical";

export interface NotificationInput {
  kind: NotificationKind;
  severity?: Severity;
  title: string;
  body?: string;
  metadata?: Record<string, unknown>;
}

export interface Notification {
  _id: string;
  kind: NotificationKind;
  severity: Severity;
  title: string;
  body: string | null;
  read: boolean;
  metadata: Record<string, unknown> | null;
  _createdAt: string;
}

export async function createNotification(input: NotificationInput): Promise<void> {
  await writeClient.create({
    _type: "notification",
    kind: input.kind,
    severity: input.severity ?? "info",
    title: input.title,
    body: input.body ?? "",
    read: false,
    metadata: input.metadata ? JSON.stringify(input.metadata) : undefined,
  });
}

export async function getNotifications(limit = 30, feedFilter?: Set<NotificationKind>): Promise<Notification[]> {
  const raw = await client.fetch<(Omit<Notification, "metadata"> & { metadata?: string })[]>(
    `*[_type == "notification"] | order(_createdAt desc)[0...${limit * 2}]{
      _id, kind, severity, title, body, read, metadata, _createdAt
    }`
  );
  const all = raw.map((n) => ({
    ...n,
    metadata: n.metadata ? JSON.parse(n.metadata) : null,
  }));
  if (!feedFilter) return all.slice(0, limit);
  return all.filter((n) => feedFilter.has(n.kind)).slice(0, limit);
}

export async function getUnreadCount(): Promise<number> {
  return client.fetch<number>(`count(*[_type == "notification" && read != true])`);
}

export async function markAsRead(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  let tx = writeClient.transaction();
  for (const id of ids) {
    tx = tx.patch(id, (p) => p.set({ read: true }));
  }
  await tx.commit();
}
