"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface SnapshotResult {
  date: string;
  snapshotsWritten: number;
  seoOpportunities?: { upserted: number; notifications: number };
  keywordDiscovery?: { upserted: number; linked: number };
  errors?: string[];
}

export function RunSnapshotButton() {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "running" | "done" | "error">("idle");
  const [result, setResult] = useState<SnapshotResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleClick() {
    setState("running");
    setErrorMessage(null);
    try {
      const res = await fetch("/api/command-center/run-now", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
      setResult(data);
      setState("done");
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
          background: "var(--cc-accent)",
          color: "#fff",
          border: "none",
          padding: "8px 20px",
          borderRadius: 6,
          cursor: state === "running" ? "wait" : "pointer",
          fontSize: "0.875rem",
          fontWeight: 500,
          opacity: state === "running" ? 0.7 : 1,
        }}
      >
        {state === "running" ? "Running…" : "Run now"}
      </button>

      {state === "done" && result && (
        <p style={{ margin: "10px 0 0", fontSize: "0.8125rem", color: "var(--cc-text-muted)" }}>
          Done — {result.snapshotsWritten} metric snapshot{result.snapshotsWritten === 1 ? "" : "s"} written
          {result.seoOpportunities && `, ${result.seoOpportunities.upserted} SEO opportunities recomputed`}
          {result.keywordDiscovery && `, ${result.keywordDiscovery.upserted} keyword discovery topics recomputed`}
          {!result.seoOpportunities && !result.keywordDiscovery &&
            " (weekly-gated jobs skipped — they only recompute once 7 days have passed since the last run)."}
          {result.errors && result.errors.length > 0 && (
            <>
              {" "}
              <span style={{ color: "var(--cc-warn)" }}>Some sources had errors: {result.errors.join("; ")}</span>
            </>
          )}
        </p>
      )}

      {state === "error" && (
        <p style={{ margin: "10px 0 0", fontSize: "0.8125rem", color: "var(--cc-critical)" }}>
          Failed: {errorMessage}
        </p>
      )}
    </div>
  );
}
