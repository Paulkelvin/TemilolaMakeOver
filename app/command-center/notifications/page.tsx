import { getNotifications, getUnreadCount, type Notification, type NotificationKind } from "@/lib/intelligence/notifications";
import { MetricBadge } from "@/components/command-center/MetricBadge";
import { getCCSettings } from "@/lib/command-center/settings";

function severityIcon(severity: string): string {
  if (severity === "critical") return "●";
  if (severity === "warning") return "●";
  return "●";
}

function severityColor(severity: string): string {
  if (severity === "critical") return "var(--cc-critical)";
  if (severity === "warning") return "var(--cc-warn)";
  return "var(--cc-accent)";
}

function kindLabel(kind: string): string {
  const labels: Record<string, string> = {
    booking_received: "Booking",
    payment_confirmed: "Payment",
    deploy_failure: "Deploy",
    ranking_drop: "SEO",
    content_gap: "Content",
    new_review: "Review",
    wbr_ready: "WBR",
    metric_alert: "Metric",
    seo_opportunity: "SEO",
    keyword_cannibalization: "Cannibalization",
    internal_link_gap: "Links",
  };
  return labels[kind] ?? kind;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

function NotificationRow({ n }: { n: Notification }) {
  return (
    <div
      style={{
        padding: "12px 16px",
        borderBottom: "1px solid var(--cc-border)",
        background: n.read ? "transparent" : "var(--cc-accent-soft)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <span style={{ color: severityColor(n.severity), fontSize: "0.625rem" }}>
          {severityIcon(n.severity)}
        </span>
        <span className="cc-tier" data-tier="emerging" style={{ background: "var(--cc-surface-2)", color: "var(--cc-text-muted)" }}>
          {kindLabel(n.kind)}
        </span>
        <span style={{ fontFamily: "var(--cc-mono)", fontSize: "0.6875rem", color: "var(--cc-text-muted)", marginLeft: "auto" }}>
          {timeAgo(n._createdAt)}
        </span>
      </div>
      <div style={{ fontWeight: n.read ? 400 : 600, fontSize: "0.875rem" }}>{n.title}</div>
      {n.body && (
        <div style={{ fontSize: "0.8125rem", color: "var(--cc-text-muted)", marginTop: 2 }}>{n.body}</div>
      )}
    </div>
  );
}

export default async function NotificationsPage() {
  const settings = await getCCSettings();
  const enabledKinds = settings.notificationPreferences.length > 0
    ? new Set(settings.notificationPreferences.filter((p) => p.feedEnabled).map((p) => p.kind as NotificationKind))
    : undefined;
  const [notifications, unread] = await Promise.all([
    getNotifications(50, enabledKinds),
    getUnreadCount(),
  ]);

  return (
    <div>
      <h1 className="cc-page-title">Notifications</h1>
      <p className="cc-page-dek">
        Event-sourced alerts — each one traces back to a real trigger in the system (Paystack webhook,
        snapshot diff, content gap detection).
        {unread > 0 && <strong style={{ color: "var(--cc-accent)" }}> {unread} unread.</strong>}
      </p>

      <div className="cc-tiles" style={{ marginBottom: 16 }}>
        <div className="cc-tile">
          <div className="cc-tile__label">Total</div>
          <div className="cc-tile__value">{notifications.length}</div>
          <MetricBadge source="sanity" freshness="live" />
        </div>
        <div className="cc-tile">
          <div className="cc-tile__label">Unread</div>
          <div className="cc-tile__value">{unread}</div>
          <MetricBadge source="sanity" freshness="live" />
        </div>
      </div>

      <div className="cc-card" style={{ padding: 0, overflow: "hidden" }}>
        {notifications.length === 0 ? (
          <div className="cc-empty" style={{ border: "none", borderRadius: 0 }}>
            No notifications yet. They&rsquo;ll appear as bookings come in, payments are confirmed, metrics shift, or weekly reviews are generated.
          </div>
        ) : (
          notifications.map((n) => <NotificationRow key={n._id} n={n} />)
        )}
      </div>
    </div>
  );
}
