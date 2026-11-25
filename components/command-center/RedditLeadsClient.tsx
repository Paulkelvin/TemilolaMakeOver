"use client";

import { useEffect, useState } from "react";
import { Check, CheckCircle2, Copy, ExternalLink, RotateCcw } from "lucide-react";

export interface RedditLead {
  id: string;
  date: string;
  title: string;
  subreddit: string;
  tier: string;
  mode: string;
  discoveryType: string;
  url: string;
  ruleCheck: string;
  context: string;
  draftReply: string;
}

const STORAGE_KEY = "gleam_reddit_leads_done_v1";

export function RedditLeadsClient({
  updatedAt,
  leads,
}: {
  updatedAt: string;
  leads: RedditLead[];
}) {
  const [doneIds, setDoneIds] = useState<string[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>(() =>
    Object.fromEntries(leads.map((l) => [l.id, l.draftReply]))
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"todo" | "all" | "done">("todo");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setDoneIds(JSON.parse(saved) as string[]);
    } catch {
      // ignore storage errors
    }
  }, []);

  const toggleDone = (id: string) => {
    setDoneIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  };

  const handleCopy = async (id: string) => {
    const text = drafts[id] ?? "";
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId((cur) => (cur === id ? null : cur)), 2000);
    } catch {
      // fallback if clipboard API unavailable
    }
  };

  const todoCount = leads.filter((l) => !doneIds.includes(l.id)).length;
  const doneCount = leads.length - todoCount;

  const visibleLeads = leads.filter((l) => {
    const isDone = doneIds.includes(l.id);
    if (filter === "todo") return !isDone;
    if (filter === "done") return isDone;
    return true;
  });

  return (
    <div style={{ maxWidth: 820, margin: "0 auto", padding: "1.5rem 1rem 3rem" }}>
      <div style={{ marginBottom: "1.25rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>
          Reddit Leads
        </h1>
        <p style={{ opacity: 0.75, fontSize: "0.9rem", marginTop: "0.35rem" }}>
          Last updated: <strong>{updatedAt}</strong> · Tap <strong>Copy Reply</strong>, then{" "}
          <strong>Open Thread</strong> on your phone to post manually.
        </p>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
        {(
          [
            { key: "todo", label: `To Post (${todoCount})` },
            { key: "done", label: `Done (${doneCount})` },
            { key: "all", label: `All (${leads.length})` },
          ] as const
        ).map((tab) => {
          const active = filter === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilter(tab.key)}
              style={{
                padding: "0.45rem 0.9rem",
                borderRadius: 999,
                border: "1px solid currentColor",
                opacity: active ? 1 : 0.65,
                fontWeight: active ? 600 : 400,
                fontSize: "0.85rem",
                cursor: "pointer",
                background: active ? "rgba(217, 119, 138, 0.16)" : "transparent",
                color: "inherit",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {visibleLeads.length === 0 ? (
        <div
          style={{
            padding: "2rem",
            borderRadius: 12,
            border: "1px solid rgba(128,128,128,0.25)",
            textAlign: "center",
            opacity: 0.8,
          }}
        >
          {filter === "todo"
            ? "You're all caught up! Fresh leads will appear here after the next scheduled run."
            : "No leads in this view yet."}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {visibleLeads.map((lead) => {
            const isDone = doneIds.includes(lead.id);
            const isCopied = copiedId === lead.id;
            const isBrandMention = lead.mode.toLowerCase().includes("brand");

            return (
              <article
                key={lead.id}
                style={{
                  borderRadius: 12,
                  border: "1px solid rgba(128,128,128,0.25)",
                  padding: "1rem",
                  opacity: isDone ? 0.65 : 1,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.4rem",
                    alignItems: "center",
                    fontSize: "0.75rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  <span
                    style={{
                      padding: "0.2rem 0.55rem",
                      borderRadius: 999,
                      background: "rgba(128,128,128,0.16)",
                      fontWeight: 600,
                    }}
                  >
                    {lead.subreddit}
                  </span>
                  <span
                    style={{
                      padding: "0.2rem 0.55rem",
                      borderRadius: 999,
                      background: isBrandMention
                        ? "rgba(34, 197, 94, 0.18)"
                        : "rgba(59, 130, 246, 0.16)",
                      fontWeight: 600,
                    }}
                  >
                    {lead.mode}
                  </span>
                  <span style={{ opacity: 0.7 }}>{lead.tier}</span>
                  <span style={{ opacity: 0.55, marginLeft: "auto" }}>{lead.date}</span>
                </div>

                <h2 style={{ fontSize: "1.05rem", fontWeight: 600, margin: "0 0 0.35rem" }}>
                  {lead.title}
                </h2>
                <p style={{ fontSize: "0.85rem", opacity: 0.8, margin: "0 0 0.45rem" }}>
                  {lead.context}
                </p>
                <p
                  style={{
                    fontSize: "0.8rem",
                    margin: "0 0 0.75rem",
                    padding: "0.4rem 0.6rem",
                    borderRadius: 8,
                    background: "rgba(245, 158, 11, 0.12)",
                  }}
                >
                  <strong>Rule check:</strong> {lead.ruleCheck}
                </p>

                <label
                  htmlFor={`draft-${lead.id}`}
                  style={{ display: "block", fontSize: "0.75rem", opacity: 0.7, marginBottom: "0.3rem" }}
                >
                  Draft reply (tap to tweak before copying):
                </label>
                <textarea
                  id={`draft-${lead.id}`}
                  rows={5}
                  value={drafts[lead.id] ?? ""}
                  onChange={(e) =>
                    setDrafts((prev) => ({ ...prev, [lead.id]: e.target.value }))
                  }
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    borderRadius: 8,
                    border: "1px solid rgba(128,128,128,0.3)",
                    padding: "0.65rem",
                    fontSize: "0.9rem",
                    lineHeight: 1.5,
                    fontFamily: "inherit",
                    background: "transparent",
                    color: "inherit",
                    resize: "vertical",
                    marginBottom: "0.75rem",
                  }}
                />

                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  <button
                    type="button"
                    onClick={() => handleCopy(lead.id)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      padding: "0.55rem 0.95rem",
                      borderRadius: 8,
                      border: "none",
                      background: isCopied ? "#16a34a" : "#c86d7f",
                      color: "#fff",
                      fontWeight: 600,
                      fontSize: "0.85rem",
                      cursor: "pointer",
                    }}
                  >
                    {isCopied ? <Check size={15} /> : <Copy size={15} />}
                    {isCopied ? "Copied!" : "Copy Reply"}
                  </button>

                  <a
                    href={lead.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      padding: "0.55rem 0.95rem",
                      borderRadius: 8,
                      border: "1px solid rgba(128,128,128,0.35)",
                      color: "inherit",
                      textDecoration: "none",
                      fontWeight: 600,
                      fontSize: "0.85rem",
                    }}
                  >
                    <ExternalLink size={15} />
                    Open Thread
                  </a>

                  <button
                    type="button"
                    onClick={() => toggleDone(lead.id)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      padding: "0.55rem 0.85rem",
                      borderRadius: 8,
                      border: "1px solid rgba(128,128,128,0.35)",
                      background: "transparent",
                      color: "inherit",
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      marginLeft: "auto",
                    }}
                  >
                    {isDone ? <RotateCcw size={15} /> : <CheckCircle2 size={15} />}
                    {isDone ? "Move to To Post" : "Mark Done"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
