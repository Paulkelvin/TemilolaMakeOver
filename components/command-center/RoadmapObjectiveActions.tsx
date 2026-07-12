"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

async function call(body: Record<string, unknown>) {
  const res = await fetch("/api/command-center/roadmap-action", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
  return data;
}

export function ActionCheckbox({ objectiveId, label, done }: { objectiveId: string; label: string; done: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleToggle() {
    setPending(true);
    try {
      await call({ objectiveId, action: "toggle-action", actionLabel: label });
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <label style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0", opacity: pending ? 0.6 : 1, cursor: "pointer" }}>
      <input type="checkbox" checked={done} disabled={pending} onChange={handleToggle} />
      <span style={{ textDecoration: done ? "line-through" : "none", color: done ? "var(--cc-text-muted)" : "var(--cc-text)" }}>{label}</span>
    </label>
  );
}

export function MarkObjectiveDoneButton({ objectiveId }: { objectiveId: string }) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "running" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleClick() {
    setState("running");
    setErrorMessage(null);
    try {
      await call({ objectiveId, action: "set-status", status: "done" });
      router.refresh();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : String(err));
      setState("error");
    }
  }

  return (
    <div>
    <button
      type="button"
      onClick={handleClick}
      disabled={state === "running"}
      style={{
        background: "var(--cc-good)",
        color: "#fff",
        border: "none",
        padding: "8px 20px",
        borderRadius: 6,
        cursor: state === "running" ? "wait" : "pointer",
        fontSize: "0.875rem",
        fontWeight: 600,
        opacity: state === "running" ? 0.7 : 1,
      }}
    >
      {state === "running" ? "Working…" : "Mark objective as done"}
    </button>
    {state === "error" && (
      <p style={{ margin: "8px 0 0", fontSize: "0.8125rem", color: "var(--cc-critical)" }}>Failed: {errorMessage}</p>
    )}
    </div>
  );
}
