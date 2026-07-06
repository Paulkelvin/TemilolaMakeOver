"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

interface ModuleToggle {
  key: string;
  label: string;
  enabled: boolean;
  locked?: boolean;
}

interface NotifPref {
  kind: string;
  label: string;
  feedEnabled: boolean;
  emailEnabled: boolean;
}

interface SettingsFormProps {
  modules: ModuleToggle[];
  notifications: NotifPref[];
}

export function SettingsForm({ modules: initialModules, notifications: initialNotifs }: SettingsFormProps) {
  const [modules, setModules] = useState(initialModules);
  const [notifs, setNotifs] = useState(initialNotifs);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function toggleModule(key: string) {
    setModules((prev) =>
      prev.map((m) => (m.key === key && !m.locked ? { ...m, enabled: !m.enabled } : m))
    );
    setSaved(false);
  }

  function toggleNotifFeed(kind: string) {
    setNotifs((prev) =>
      prev.map((n) => (n.kind === kind ? { ...n, feedEnabled: !n.feedEnabled } : n))
    );
    setSaved(false);
  }

  function toggleNotifEmail(kind: string) {
    setNotifs((prev) =>
      prev.map((n) => (n.kind === kind ? { ...n, emailEnabled: !n.emailEnabled } : n))
    );
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      const disabledModules = modules.filter((m) => !m.enabled && !m.locked).map((m) => m.key);
      const notificationPreferences = notifs.map((n) => ({
        _type: "object" as const,
        _key: n.kind,
        kind: n.kind,
        feedEnabled: n.feedEnabled,
        emailEnabled: n.emailEnabled,
      }));

      const res = await fetch("/api/command-center/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ disabledModules, notificationPreferences }),
      });

      if (!res.ok) throw new Error("Save failed");
      setSaved(true);
      startTransition(() => router.refresh());
    } catch {
      alert("Failed to save settings. Check that SANITY_API_WRITE_TOKEN is set.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="cc-card">
        <h2 style={{ margin: "0 0 6px", fontSize: "1.0625rem" }}>Module visibility</h2>
        <p style={{ margin: "0 0 14px", fontSize: "0.8125rem", color: "var(--cc-text-muted)" }}>
          Disabled modules are hidden from the sidebar for all users. Overview and Settings cannot be disabled.
        </p>
        {modules.map((mod) => (
          <div key={mod.key} className="cc-setting-row">
            <div>
              <div className="cc-setting-label">{mod.label}</div>
              {mod.locked && <div className="cc-setting-hint">Always visible</div>}
            </div>
            <label className="cc-toggle">
              <input
                type="checkbox"
                checked={mod.enabled}
                disabled={mod.locked}
                onChange={() => toggleModule(mod.key)}
              />
              <span className="cc-toggle__track" />
            </label>
          </div>
        ))}
      </div>

      <div className="cc-card">
        <h2 style={{ margin: "0 0 6px", fontSize: "1.0625rem" }}>Notification preferences</h2>
        <p style={{ margin: "0 0 14px", fontSize: "0.8125rem", color: "var(--cc-text-muted)" }}>
          Control which notifications appear in the feed and which also trigger an email.
        </p>
        {notifs.map((n) => (
          <div key={n.kind} className="cc-setting-row">
            <div className="cc-setting-label">{n.label}</div>
            <div className="cc-setting-controls">
              <label>
                <span className="cc-toggle">
                  <input
                    type="checkbox"
                    checked={n.feedEnabled}
                    onChange={() => toggleNotifFeed(n.kind)}
                  />
                  <span className="cc-toggle__track" />
                </span>
                Feed
              </label>
              <label>
                <span className="cc-toggle">
                  <input
                    type="checkbox"
                    checked={n.emailEnabled}
                    onChange={() => toggleNotifEmail(n.kind)}
                  />
                  <span className="cc-toggle__track" />
                </span>
                Email
              </label>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
        <button
          className="cc-tier"
          style={{
            background: "var(--cc-accent)",
            color: "#fff",
            border: "none",
            padding: "8px 20px",
            borderRadius: 6,
            cursor: saving || isPending ? "wait" : "pointer",
            fontSize: "0.875rem",
            fontWeight: 500,
            opacity: saving || isPending ? 0.7 : 1,
          }}
          disabled={saving || isPending}
          onClick={handleSave}
        >
          {saving ? "Saving…" : "Save preferences"}
        </button>
        {saved && (
          <span style={{ fontSize: "0.8125rem", color: "var(--cc-good)" }}>
            Saved
          </span>
        )}
      </div>
    </>
  );
}
