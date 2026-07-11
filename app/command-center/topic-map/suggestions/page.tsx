import Link from "next/link";
import { getTopicSuggestions, type StoredTopicNodeSuggestion } from "@/lib/intelligence/topic-suggestions";
import { TopicSuggestionActions } from "@/components/command-center/TopicSuggestionActions";

const SOURCE_LABELS: Record<string, string> = {
  "competitor-gap": "Competitor Gap",
  "search-console": "Search Console",
  "keyword-discovery": "Keyword Discovery",
  autocomplete: "Google Autocomplete",
  "recurring-entity": "Recurring entity",
};

function SuggestionCard({ suggestion, showActions }: { suggestion: StoredTopicNodeSuggestion; showActions: boolean }) {
  return (
    <div className="cc-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 8 }}>
        <div>
          <h2 style={{ margin: "0 0 4px", fontSize: "1.0625rem" }}>{suggestion.suggestedLabel}</h2>
          <p style={{ margin: 0, fontSize: "0.8125rem", color: "var(--cc-text-muted)" }}>
            {suggestion.suggestedParentLabel ? (
              <>
                Under <strong>{suggestion.suggestedParentLabel}</strong>
              </>
            ) : (
              "New top-level topic — doesn't fit an existing cluster"
            )}
            {" · "}
            {suggestion.sourceCount} source{suggestion.sourceCount === 1 ? "" : "s"} · priority {suggestion.priorityScore}
          </p>
        </div>
        <span
          style={{
            fontSize: "0.75rem",
            fontWeight: 600,
            padding: "2px 10px",
            borderRadius: 999,
            textTransform: "capitalize",
            color:
              suggestion.status === "approved"
                ? "var(--cc-good)"
                : suggestion.status === "rejected"
                  ? "var(--cc-text-muted)"
                  : "var(--cc-accent)",
            border: "1px solid var(--cc-border)",
            whiteSpace: "nowrap",
          }}
        >
          {suggestion.status}
        </span>
      </div>

      <div style={{ marginBottom: 10 }}>
        {suggestion.evidence.map((e, i) => (
          <div key={i} className="cc-pending-row" style={{ alignItems: "flex-start", flexDirection: "column", gap: 2 }}>
            <span style={{ color: "var(--cc-text)", fontWeight: 600, fontSize: "0.8125rem" }}>
              {SOURCE_LABELS[e.source] ?? e.source} <span style={{ fontWeight: 400, color: "var(--cc-text-muted)" }}>(priority {e.priorityScore})</span>
            </span>
            <span style={{ fontSize: "0.75rem", color: "var(--cc-text-muted)" }}>{e.detail}</span>
          </div>
        ))}
      </div>

      <details style={{ marginBottom: showActions ? 12 : 0 }}>
        <summary style={{ fontSize: "0.8125rem", color: "var(--cc-text-muted)", cursor: "pointer" }}>Why this was suggested</summary>
        <ol style={{ margin: "8px 0 0", paddingLeft: "1.2em", fontSize: "0.8125rem", color: "var(--cc-text-muted)", lineHeight: 1.8 }}>
          {suggestion.decisionTrace.map((step, i) => <li key={i}>{step}</li>)}
        </ol>
      </details>

      {suggestion.createdTopicNodeId && (
        <p style={{ margin: "10px 0 0", fontSize: "0.8125rem" }}>
          <Link href="/command-center/topic-map" style={{ color: "var(--cc-accent)" }}>
            View in Topic Map →
          </Link>
        </p>
      )}

      {showActions && <TopicSuggestionActions suggestionId={suggestion._id} />}
    </div>
  );
}

export default async function TopicSuggestionsPage() {
  const suggestions = await getTopicSuggestions();
  const pending = suggestions.filter((s) => s.status === "pending");
  const decided = suggestions.filter((s) => s.status !== "pending");

  return (
    <div>
      <p style={{ margin: "0 0 6px" }}>
        <Link href="/command-center/topic-map" style={{ color: "var(--cc-text-muted)", fontSize: "0.8125rem" }}>
          &larr; Topic Map
        </Link>
      </p>
      <h1 className="cc-page-title">Topic Suggestions</h1>
      <p className="cc-page-dek">
        Mined from Competitor Gaps, Search Console, Keyword Discovery, Google Autocomplete, and recurring entities in
        verified articles — recomputed weekly. Nothing here is written to the Topic Map until you approve it: approving
        creates a real topicNode (under the suggested cluster, or as a new top-level topic); rejecting just records the
        decision so the same idea won&rsquo;t need reviewing twice.
      </p>

      {pending.length === 0 ? (
        <div className="cc-card">
          <div className="cc-empty">No pending suggestions right now — check back after the next weekly run.</div>
        </div>
      ) : (
        pending.map((s) => <SuggestionCard key={s._id} suggestion={s} showActions />)
      )}

      {decided.length > 0 && (
        <>
          <h2 style={{ margin: "24px 0 12px", fontSize: "1.0625rem" }}>Past decisions ({decided.length})</h2>
          {decided.map((s) => <SuggestionCard key={s._id} suggestion={s} showActions={false} />)}
        </>
      )}
    </div>
  );
}
