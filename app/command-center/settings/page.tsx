import { getCurrentRole } from "@/lib/command-center/auth";
import { AccessGuard } from "@/components/command-center/AccessGuard";
import { getCCSettings } from "@/lib/command-center/settings";
import { COMMAND_CENTER_MODULES } from "@/lib/command-center/modules";
import { SettingsForm } from "@/components/command-center/SettingsForm";
import type { NotificationKind } from "@/lib/intelligence/notifications";

const CHECKS = [
  { key: "COMMAND_CENTER_PASSWORD", label: "Command Center access gate (owner)" },
  { key: "COMMAND_CENTER_STAFF_PASSWORD", label: "Command Center access gate (staff)" },
  { key: "SANITY_API_TOKEN", label: "Sanity read access" },
  { key: "SANITY_API_WRITE_TOKEN", label: "Sanity write access (snapshots)" },
  { key: "GMAIL_APP_PASSWORD", label: "Email delivery (notifications)" },
  { key: "GOOGLE_SERVICE_ACCOUNT_EMAIL", label: "Google service account" },
  { key: "GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY", label: "Google private key" },
  { key: "SEARCH_CONSOLE_SITE_URL", label: "Search Console property" },
  { key: "GA4_PROPERTY_ID", label: "Google Analytics (GA4)" },
  { key: "VERCEL_API_TOKEN", label: "Vercel API token" },
  { key: "VERCEL_PROJECT_ID", label: "Vercel project" },
  { key: "CRON_SECRET", label: "Snapshot cron auth" },
] as const;

const INTEGRATIONS = [
  {
    name: "Search Console",
    requires: ["GOOGLE_SERVICE_ACCOUNT_EMAIL", "GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY", "SEARCH_CONSOLE_SITE_URL"],
    powers: "SEO page, SEO Health sub-score",
  },
  {
    name: "Google Analytics (GA4)",
    requires: ["GOOGLE_SERVICE_ACCOUNT_EMAIL", "GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY", "GA4_PROPERTY_ID"],
    powers: "Website page (traffic), sessions tile on Overview",
  },
  {
    name: "Vercel",
    requires: ["VERCEL_API_TOKEN", "VERCEL_PROJECT_ID"],
    powers: "Website page (deploys, CWV), Website Health sub-score",
  },
] as const;

const NOTIF_KIND_LABELS: Record<NotificationKind, string> = {
  booking_received: "Booking received",
  payment_confirmed: "Payment confirmed",
  deploy_failure: "Deploy failure",
  ranking_drop: "Ranking drop",
  content_gap: "Content gap detected",
  new_review: "New review",
  wbr_ready: "Weekly Business Review ready",
  metric_alert: "Metric alert",
};

const ALL_NOTIF_KINDS: NotificationKind[] = [
  "booking_received",
  "payment_confirmed",
  "deploy_failure",
  "ranking_drop",
  "content_gap",
  "new_review",
  "wbr_ready",
  "metric_alert",
];

const LOCKED_MODULES = new Set(["overview", "settings"]);

export default async function SettingsPage() {
  const [role, settings] = await Promise.all([getCurrentRole(), getCCSettings()]);
  const disabledSet = new Set(settings.disabledModules);

  const moduleToggles = COMMAND_CENTER_MODULES.map((mod) => ({
    key: mod.key,
    label: mod.label,
    enabled: !disabledSet.has(mod.key),
    locked: LOCKED_MODULES.has(mod.key),
  }));

  const notifPrefs = ALL_NOTIF_KINDS.map((kind) => {
    const saved = settings.notificationPreferences.find((p) => p.kind === kind);
    return {
      kind,
      label: NOTIF_KIND_LABELS[kind],
      feedEnabled: saved ? saved.feedEnabled : true,
      emailEnabled: saved ? saved.emailEnabled : false,
    };
  });

  return (
    <AccessGuard moduleKey="settings">
      <div>
        <h1 className="cc-page-title">Settings</h1>
        <p className="cc-page-dek">
          Connection status, module visibility, and notification preferences.
          {role === "owner" && " You have owner access."}
        </p>

        <div className="cc-card">
          <h2 style={{ margin: "0 0 14px", fontSize: "1.0625rem" }}>Integrations</h2>
          {INTEGRATIONS.map((integ) => {
            const allSet = integ.requires.every((k) => Boolean(process.env[k]));
            const missing = integ.requires.filter((k) => !process.env[k]);
            return (
              <div key={integ.name} style={{ marginBottom: 16 }}>
                <div className="cc-pending-row" style={{ borderTop: "none" }}>
                  <span style={{ color: "var(--cc-text)", fontWeight: 500 }}>{integ.name}</span>
                  <span
                    className="cc-tier"
                    data-tier={allSet ? "established" : "insufficient-data"}
                  >
                    {allSet ? "Connected" : "Not connected"}
                  </span>
                </div>
                <div style={{ fontSize: "0.8125rem", color: "var(--cc-text-muted)", paddingLeft: 2 }}>
                  Powers: {integ.powers}
                </div>
                {missing.length > 0 && (
                  <div style={{ fontSize: "0.75rem", color: "var(--cc-warn)", marginTop: 4, paddingLeft: 2 }}>
                    Missing: {missing.map((k) => <code key={k} style={{ marginRight: 6 }}>{k}</code>)}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="cc-card">
          <h2 style={{ margin: "0 0 12px", fontSize: "1.0625rem" }}>All environment variables</h2>
          {CHECKS.map((check) => {
            const configured = Boolean(process.env[check.key]);
            return (
              <div key={check.key} className="cc-pending-row">
                <span style={{ color: "var(--cc-text)" }}>{check.label}</span>
                <span
                  className="cc-tier"
                  data-tier={configured ? "established" : "insufficient-data"}
                >
                  {configured ? "Set" : "Not set"}
                </span>
              </div>
            );
          })}
        </div>

        <div className="cc-card">
          <h2 style={{ margin: "0 0 6px", fontSize: "1.0625rem" }}>Daily snapshots</h2>
          <p style={{ margin: "0 0 8px", fontSize: "0.875rem", color: "var(--cc-text-muted)" }}>
            External metrics are stored as daily snapshots via <code>POST /api/command-center/snapshot</code>.
            Set up a cron job (Vercel Cron, GitHub Actions, or any scheduler) to hit this endpoint daily.
          </p>
          <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--cc-text-muted)" }}>
            Protect the endpoint with <code>CRON_SECRET</code> — pass it as <code>Authorization: Bearer &lt;secret&gt;</code>.
          </p>
        </div>

        {role === "owner" && (
          <SettingsForm modules={moduleToggles} notifications={notifPrefs} />
        )}
      </div>
    </AccessGuard>
  );
}
