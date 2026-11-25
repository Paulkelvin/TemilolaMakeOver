"use client";

import { useEffect, useState } from "react";
import {
  Camera,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  MessageSquare,
  RotateCcw,
  ShieldAlert,
} from "lucide-react";

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

interface OriginalPostIdea {
  id: string;
  subreddit: string;
  needsPhoto: boolean;
  photoNote: string;
  title: string;
  body: string;
  ruleReminder: string;
}

const ORIGINAL_POST_IDEAS: OriginalPostIdea[] = [
  {
    id: "post-bridal-daylight-flash",
    subreddit: "r/MakeupAddiction or r/brownbeauty",
    needsPhoto: true,
    photoNote:
      "2-photo carousel: Photo 1 = natural window daylight, Photo 2 = rear-camera flash on the SAME finished soft-glam / bridal look. Zero filters, zero skin-smoothing, no watermark.",
    title:
      "Soft glam bridal look I did for Lagos humidity — natural daylight vs. camera flash (zero filter)",
    body: "Wanted to share how a skin-first bridal base holds up under flash on deeper skin tones. Keeping prep layers super thin and using a finely milled tinted setting powder instead of heavy translucent baking is what stops that grey flashback.\n\n(Post your full product list as the very first comment right after submitting!)",
    ruleReminder:
      "Mandatory: Post a full product list in the comments within 5 minutes or AutoMod removes the post. Zero links or brand promo.",
  },
  {
    id: "post-before-after-humidity",
    subreddit: "r/WeddingMakeup",
    needsPhoto: true,
    photoNote:
      "Clean, unedited close-up of a real bridal transformation (before & after) showing real skin texture—no ring-light blur or text overlays.",
    title:
      "Bridal soft glam built for 12+ hours in humid weather — happy to answer prep or longevity questions",
    body: "I'm a bridal MUA in Lagos so heat and humidity are basically my everyday baseline. Sharing this look because a lot of brides think long-wear has to feel heavy or cakey—when you prep in thin layers and lock cream products down with matching powders, it stays breathable all night. Drop any questions if you're troubleshooting your own wedding-day base!",
    ruleReminder:
      "No booking links or prices. Let curious brides click your profile or ask in the comments.",
  },
  {
    id: "post-lagos-wedding-ama",
    subreddit: "r/Nigeria or r/Lagos",
    needsPhoto: false,
    photoNote: "Text-only post (no photo needed—discussion posts perform best in r/Nigeria and r/Lagos).",
    title:
      "I'm a bridal makeup artist in Lagos — here's how to vet your MUA so you aren't late to your own wedding (AMA)",
    body: "Seeing a lot of wedding-planning stress lately, especially for diaspora brides flying into Lagos. Quick cheat sheet from behind the chair:\n\n1. Ask to see unedited flash photos, not just ring-light reels.\n2. Confirm exact turnaround time per face before paying a deposit.\n3. Ask how they handle traditional-to-white-wedding transitions and touch-ups.\n4. Book peak December dates early.\n\nHappy to answer any honest questions about bridal timelines, skin prep for Lagos heat, or what's actually worth paying for.",
    ruleReminder:
      "Wait until your account has 7–10 days of helpful comment history before posting this. Do NOT put a website link in the post body.",
  },
  {
    id: "post-mua-kit-tips",
    subreddit: "r/makeupartists",
    needsPhoto: false,
    photoNote: "Optional: clean flat-lay photo of your sanitized bridal kit, or text-only.",
    title:
      "Lessons from teaching beginner MUAs in high humidity — what actually separates hobbyists from booked artists",
    body: "Working and teaching small hands-on classes in Lagos, the biggest jump I see in new artists isn't buying more luxury palettes—it's learning to work on unfamiliar skin textures under a real clock, matching deep undertones without guesswork, and keeping prep layers thin enough to survive 10+ hours of heat. Curious what clicked fastest for other working artists here when you first started booking real clients?",
    ruleReminder:
      "Peer-to-peer discussion only. No course links or pitching.",
  },
];

const SAFETY_RULES = [
  {
    title: "Never open Reddit in an automated/debugger browser",
    detail:
      "If Chrome shows a green banner saying 'controlled by automated test software', close it. Always use your normal Reddit mobile app or a normal browser.",
  },
  {
    title: "Never create a second account to bypass an active ban",
    detail:
      "Wait for Reddit's appeal decision first. Making a new account on the same device/network while another is banned triggers Reddit's ban-evasion filter.",
  },
  {
    title: "Warm up for 7–10 days before making original posts",
    detail:
      "Spend your first 7–10 days leaving 2–3 helpful comments per day to earn 'karma' (Reddit's trust score). That proves you're a real human before you start posting.",
  },
  {
    title: "Zero links in comments",
    detail:
      "Don't drop gleambytemi.com or Instagram links in comments. Let your Profile Bio + Pinned Post convert curious readers safely.",
  },
  {
    title: "Never cold-DM brides or posters",
    detail:
      "Messaging strangers to pitch bookings or training gets accounts permanently suspended. Only reply via DM if they message you first.",
  },
  {
    title: "Only mention 'Gleam by Temi' when invited or in Tier 1 recs",
    detail:
      "In strict Tier 2 beauty subs (r/MakeupAddiction, r/brownbeauty, r/weddingplanning), use a subtle credential drop ('I'm a bridal MUA in Lagos') with zero brand name unless someone asks.",
  },
  {
    title: "Beauty photos must be 100% unedited + include a product list",
    detail:
      "No filters, no Facetune, no heavy ring-light smoothing, and no big text flyers. Always post the full product list in the comments right after uploading.",
  },
];

const STORAGE_KEY = "gleam_reddit_leads_done_v1";

export function RedditLeadsClient({
  updatedAt,
  leads,
}: {
  updatedAt: string;
  leads: RedditLead[];
}) {
  const [section, setSection] = useState<"replies" | "posts" | "safety">("replies");
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

  const copyText = async (id: string, text: string) => {
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
          Reddit Leads Hub
        </h1>
        <p style={{ opacity: 0.75, fontSize: "0.9rem", marginTop: "0.35rem" }}>
          Last updated: <strong>{updatedAt}</strong> · Tap <strong>Copy</strong>, then open Reddit on
          your phone to post manually.
        </p>
      </div>

      {/* Main Section Tabs */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          marginBottom: "1.25rem",
          flexWrap: "wrap",
          borderBottom: "1px solid rgba(128,128,128,0.22)",
          paddingBottom: "0.75rem",
        }}
      >
        {(
          [
            { key: "replies", label: `Replies (${todoCount})`, icon: MessageSquare },
            { key: "posts", label: "Original Posts & Photos", icon: Camera },
            { key: "safety", label: "Safety & Ban Rules", icon: ShieldAlert },
          ] as const
        ).map(({ key, label, icon: Icon }) => {
          const active = section === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setSection(key)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.55rem 0.95rem",
                borderRadius: 10,
                border: active ? "1px solid #c86d7f" : "1px solid rgba(128,128,128,0.3)",
                background: active ? "#c86d7f" : "transparent",
                color: active ? "#fff" : "inherit",
                fontWeight: 600,
                fontSize: "0.85rem",
                cursor: "pointer",
              }}
            >
              <Icon size={15} />
              {label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: DAILY REPLIES */}
      {section === "replies" && (
        <>
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
                    padding: "0.4rem 0.85rem",
                    borderRadius: 999,
                    border: "1px solid currentColor",
                    opacity: active ? 1 : 0.65,
                    fontWeight: active ? 600 : 400,
                    fontSize: "0.82rem",
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
                      style={{
                        display: "block",
                        fontSize: "0.75rem",
                        opacity: 0.7,
                        marginBottom: "0.3rem",
                      }}
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
                        onClick={() => copyText(lead.id, drafts[lead.id] ?? "")}
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
        </>
      )}

      {/* TAB 2: ORIGINAL POSTS & PHOTO GUIDE */}
      {section === "posts" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div
            style={{
              padding: "1rem",
              borderRadius: 12,
              border: "1px solid rgba(200, 109, 127, 0.4)",
              background: "rgba(200, 109, 127, 0.08)",
              fontSize: "0.88rem",
              lineHeight: 1.55,
            }}
          >
            <strong>Photo Rules for Reddit Beauty Subs (Read First):</strong>
            <ul style={{ margin: "0.45rem 0 0", paddingLeft: "1.2rem" }}>
              <li>
                <strong>Zero filters or skin smoothing</strong> — real skin texture in window daylight or
                rear-camera flash gets the most upvotes (edited/ring-light-blurred photos get deleted).
              </li>
              <li>
                <strong>No flyers or big watermarks</strong> — post clean photos like a real person.
              </li>
              <li>
                <strong>Post a full product list in the comments</strong> right after uploading to{" "}
                <code>r/MakeupAddiction</code> or <code>r/brownbeauty</code>.
              </li>
              <li>
                <strong>Wait 7–10 days of helpful comments first</strong> before making your first
                original post.
              </li>
            </ul>
          </div>

          {ORIGINAL_POST_IDEAS.map((idea) => {
            const titleCopied = copiedId === `${idea.id}-title`;
            const bodyCopied = copiedId === `${idea.id}-body`;
            return (
              <article
                key={idea.id}
                style={{
                  borderRadius: 12,
                  border: "1px solid rgba(128,128,128,0.25)",
                  padding: "1rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.4rem",
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
                    {idea.subreddit}
                  </span>
                  <span
                    style={{
                      padding: "0.2rem 0.55rem",
                      borderRadius: 999,
                      background: idea.needsPhoto
                        ? "rgba(168, 85, 247, 0.18)"
                        : "rgba(59, 130, 246, 0.16)",
                      fontWeight: 600,
                    }}
                  >
                    {idea.needsPhoto ? "Photo Post" : "Text Post"}
                  </span>
                </div>

                <h2 style={{ fontSize: "1.02rem", fontWeight: 600, margin: "0 0 0.5rem" }}>
                  {idea.title}
                </h2>
                <p style={{ fontSize: "0.84rem", opacity: 0.85, margin: "0 0 0.5rem" }}>
                  <strong>Photo guide:</strong> {idea.photoNote}
                </p>
                <p
                  style={{
                    fontSize: "0.86rem",
                    whiteSpace: "pre-line",
                    padding: "0.7rem",
                    borderRadius: 8,
                    border: "1px solid rgba(128,128,128,0.25)",
                    margin: "0 0 0.6rem",
                    lineHeight: 1.5,
                  }}
                >
                  {idea.body}
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
                  <strong>Rule check:</strong> {idea.ruleReminder}
                </p>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  <button
                    type="button"
                    onClick={() => copyText(`${idea.id}-title`, idea.title)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      padding: "0.5rem 0.9rem",
                      borderRadius: 8,
                      border: "none",
                      background: titleCopied ? "#16a34a" : "#c86d7f",
                      color: "#fff",
                      fontWeight: 600,
                      fontSize: "0.83rem",
                      cursor: "pointer",
                    }}
                  >
                    {titleCopied ? <Check size={14} /> : <Copy size={14} />}
                    {titleCopied ? "Title Copied!" : "Copy Title"}
                  </button>
                  <button
                    type="button"
                    onClick={() => copyText(`${idea.id}-body`, idea.body)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      padding: "0.5rem 0.9rem",
                      borderRadius: 8,
                      border: "1px solid rgba(128,128,128,0.35)",
                      background: bodyCopied ? "rgba(22, 163, 74, 0.18)" : "transparent",
                      color: "inherit",
                      fontWeight: 600,
                      fontSize: "0.83rem",
                      cursor: "pointer",
                    }}
                  >
                    {bodyCopied ? <Check size={14} /> : <Copy size={14} />}
                    {bodyCopied ? "Body Copied!" : "Copy Body"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* TAB 3: SAFETY & BAN GUARDRAILS */}
      {section === "safety" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {SAFETY_RULES.map((rule, idx) => (
            <div
              key={rule.title}
              style={{
                borderRadius: 12,
                border: "1px solid rgba(128,128,128,0.25)",
                padding: "0.95rem 1rem",
              }}
            >
              <div style={{ fontWeight: 600, fontSize: "0.95rem", marginBottom: "0.25rem" }}>
                {idx + 1}. {rule.title}
              </div>
              <p style={{ margin: 0, fontSize: "0.86rem", opacity: 0.82, lineHeight: 1.5 }}>
                {rule.detail}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
