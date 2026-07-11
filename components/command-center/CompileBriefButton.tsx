"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CompileBriefButton({ topicKey }: { topicKey: string }) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "running" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleClick() {
    setState("running");
    setErrorMessage(null);
    try {
      const res = await fetch("/api/command-center/compile-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicKey }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
      router.push(`/command-center/editorial/${encodeURIComponent(topicKey)}`);
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
        {state === "running" ? "Compiling brief…" : "Compile Brief"}
      </button>
      {state === "error" && (
        <p style={{ margin: "10px 0 0", fontSize: "0.8125rem", color: "var(--cc-critical)" }}>
          Failed: {errorMessage}
        </p>
      )}
    </div>
  );
}
