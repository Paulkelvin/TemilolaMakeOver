"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function TopicSuggestionActions({ suggestionId }: { suggestionId: string }) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "running" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function act(action: "approve" | "reject") {
    setState("running");
    setErrorMessage(null);
    try {
      const res = await fetch("/api/command-center/topic-suggestion-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suggestionId, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
      router.refresh();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : String(err));
      setState("error");
    }
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          type="button"
          onClick={() => act("approve")}
          disabled={state === "running"}
          style={{
            background: "var(--cc-good)",
            color: "#fff",
            border: "none",
            padding: "6px 14px",
            borderRadius: 6,
            cursor: state === "running" ? "wait" : "pointer",
            fontSize: "0.8125rem",
            fontWeight: 500,
            opacity: state === "running" ? 0.7 : 1,
          }}
        >
          {state === "running" ? "Working…" : "Approve — create node"}
        </button>
        <button
          type="button"
          onClick={() => act("reject")}
          disabled={state === "running"}
          style={{
            background: "transparent",
            color: "var(--cc-text-muted)",
            border: "1px solid var(--cc-border)",
            padding: "6px 14px",
            borderRadius: 6,
            cursor: state === "running" ? "wait" : "pointer",
            fontSize: "0.8125rem",
            fontWeight: 500,
          }}
        >
          Reject
        </button>
      </div>
      {state === "error" && (
        <p style={{ margin: "8px 0 0", fontSize: "0.8125rem", color: "var(--cc-critical)" }}>Failed: {errorMessage}</p>
      )}
    </div>
  );
}
