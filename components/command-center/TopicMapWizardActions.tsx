"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { postCommandCenterAction } from "@/lib/command-center/client";

function call(body: Record<string, unknown>) {
  return postCommandCenterAction("/api/command-center/topic-map-wizard-action", body);
}

export function GenerateProposalButton() {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "running" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleClick() {
    setState("running");
    setErrorMessage(null);
    try {
      await call({ action: "generate" });
      router.refresh();
      setState("idle");
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
        {state === "running" ? "Analyzing evidence…" : "Generate Proposal"}
      </button>
      {state === "error" && (
        <p style={{ margin: "10px 0 0", fontSize: "0.8125rem", color: "var(--cc-critical)" }}>Failed: {errorMessage}</p>
      )}
    </div>
  );
}

export function WizardProposalActions({ proposalId }: { proposalId: string }) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "running" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function act(action: "approve" | "discard") {
    if (action === "approve" && !window.confirm("This will create real Topic Map nodes for every node in this proposal. Continue?")) {
      return;
    }
    setState("running");
    setErrorMessage(null);
    try {
      await call({ action, proposalId });
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
            padding: "8px 20px",
            borderRadius: 6,
            cursor: state === "running" ? "wait" : "pointer",
            fontSize: "0.875rem",
            fontWeight: 600,
            opacity: state === "running" ? 0.7 : 1,
          }}
        >
          {state === "running" ? "Working…" : "Approve — build the Topic Map"}
        </button>
        <button
          type="button"
          onClick={() => act("discard")}
          disabled={state === "running"}
          style={{
            background: "transparent",
            color: "var(--cc-text-muted)",
            border: "1px solid var(--cc-border)",
            padding: "8px 20px",
            borderRadius: 6,
            cursor: state === "running" ? "wait" : "pointer",
            fontSize: "0.875rem",
            fontWeight: 500,
          }}
        >
          Discard
        </button>
      </div>
      {state === "error" && (
        <p style={{ margin: "10px 0 0", fontSize: "0.8125rem", color: "var(--cc-critical)" }}>Failed: {errorMessage}</p>
      )}
    </div>
  );
}
