"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface SnapshotResult {
  date: string;
  snapshotsWritten: number;
  seoOpportunities?: { upserted: number; notifications: number };
  keywordDiscovery?: { upserted: number; linked: number };
  topicalAuthority?: { upserted: number };
  competitorGaps?: { upserted: number };
  cannibalization?: { upserted: number; notifications: number };
  internalLinks?: { upserted: number; notifications: number };
  knowledgeGraph?: { upserted: number; notifications: number };
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
        <div style={{ margin: "10px 0 0", fontSize: "0.8125rem", color: "var(--cc-text-muted)" }}>
          <p style={{ margin: "0 0 4px" }}>
            Done — {result.snapshotsWritten} metric snapshot{result.snapshotsWritten === 1 ? "" : "s"} written.
          </p>
          {(result.seoOpportunities || result.keywordDiscovery || result.topicalAuthority ||
            result.competitorGaps || result.cannibalization || result.internalLinks || result.knowledgeGraph) && (
            <ul style={{ margin: "4px 0 0", paddingLeft: 20 }}>
              {result.seoOpportunities && <li>{result.seoOpportunities.upserted} SEO opportunities recomputed</li>}
              {result.keywordDiscovery && <li>{result.keywordDiscovery.upserted} keyword discovery topics recomputed</li>}
              {result.topicalAuthority && <li>{result.topicalAuthority.upserted} topical authority nodes recomputed</li>}
              {result.competitorGaps && <li>{result.competitorGaps.upserted} competitor gap topics recomputed</li>}
              {result.cannibalization && <li>{result.cannibalization.upserted} cannibalization issues recomputed</li>}
              {result.internalLinks && <li>{result.internalLinks.upserted} internal link gaps recomputed</li>}
              {result.knowledgeGraph && <li>{result.knowledgeGraph.upserted} knowledge graph gaps recomputed</li>}
            </ul>
          )}
          {result.errors && result.errors.length > 0 && (
            <p style={{ margin: "4px 0 0", color: "var(--cc-warn)" }}>
              Some sources had errors: {result.errors.join("; ")}
            </p>
          )}
        </div>
      )}

      {state === "error" && (
        <p style={{ margin: "10px 0 0", fontSize: "0.8125rem", color: "var(--cc-critical)" }}>
          Failed: {errorMessage}
        </p>
      )}
    </div>
  );
}
