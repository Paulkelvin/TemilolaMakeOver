const CHECKS = [
  { key: "COMMAND_CENTER_PASSWORD", label: "Command Center access gate" },
  { key: "SANITY_API_TOKEN", label: "Sanity write access" },
  { key: "GMAIL_APP_PASSWORD", label: "Email delivery (Weekly Review, notifications)" },
] as const;

export default function SettingsPage() {
  return (
    <div>
      <h1 className="cc-page-title">Settings</h1>
      <p className="cc-page-dek">
        What&rsquo;s configured today. Owner/Staff permissions and per-module access controls arrive in Phase 6,
        once a second internal user is real.
      </p>

      <div className="cc-card">
        <h2 style={{ margin: "0 0 12px", fontSize: "1.0625rem" }}>Environment</h2>
        {CHECKS.map((check) => {
          const configured = Boolean(process.env[check.key]);
          return (
            <div key={check.key} className="cc-pending-row">
              <span style={{ color: "var(--cc-text)" }}>{check.label}</span>
              <span
                className="cc-tier"
                data-tier={configured ? "established" : "insufficient-data"}
              >
                {configured ? "Configured" : "Not set"}
              </span>
            </div>
          );
        })}
      </div>

      <div className="cc-empty">
        Permissions (Owner vs. Staff), module toggles, and integration credentials for Search Console / GA4 /
        Vercel move here as each is added in Phase 4–6.
      </div>
    </div>
  );
}
