"use client";

import { useState } from "react";
import type { QualityScoreResult } from "@/lib/intelligence/quality-score";
import type { OriginalityResult } from "@/lib/intelligence/originality";
import type { EvidenceGap, EvidenceSummary } from "@/lib/intelligence/evidence-scan";
import type { CoverageRecheckResult } from "@/lib/intelligence/coverage-recheck";
import type { ReadabilityResult, KeywordStuffingResult, OpportunityFlags } from "@/lib/intelligence/seo-mechanics";
import type { StrategicFitResult } from "@/lib/intelligence/strategic-fit";

interface VerifyReport {
  originality: OriginalityResult;
  evidenceGaps: EvidenceGap[];
  evidenceSummary: EvidenceSummary;
  coverage: CoverageRecheckResult;
  readability: ReadabilityResult;
  stuffing: KeywordStuffingResult;
  opportunities: OpportunityFlags;
  strategicFit: StrategicFitResult;
  qualityScore: QualityScoreResult;
}

function ScoreBar({ label, value, floor }: { label: string; value: number; floor?: number }) {
  const belowFloor = floor !== undefined && value < floor;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem", marginBottom: 3 }}>
        <span style={{ color: "var(--cc-text)" }}>
          {label} {floor !== undefined && <span style={{ color: "var(--cc-text-muted)", fontSize: "0.75rem" }}>(floor {floor})</span>}
        </span>
        <span style={{ fontFamily: "var(--cc-mono)", color: belowFloor ? "var(--cc-critical)" : "var(--cc-text)" }}>{value}</span>
      </div>
      <div style={{ height: 6, background: "var(--cc-border)", borderRadius: 3, overflow: "hidden" }}>
        <div
          style={{
            width: `${value}%`,
            height: "100%",
            background: belowFloor ? "var(--cc-critical)" : "var(--cc-accent)",
          }}
        />
      </div>
    </div>
  );
}

export function VerifyDraftForm({
  topicKey,
  defaultSourceMaterial,
  hasLinkedBlogPost,
}: {
  topicKey: string;
  defaultSourceMaterial: string;
  hasLinkedBlogPost: boolean;
}) {
  const [draftBodyText, setDraftBodyText] = useState("");
  const [draftLinkedPaths, setDraftLinkedPaths] = useState("");
  const [hasFaqSection, setHasFaqSection] = useState(false);
  const [imageCount, setImageCount] = useState(0);
  const [videoEmbedCount, setVideoEmbedCount] = useState(0);
  // Initialized from the saved brief but tracked as a distinct field from
  // then on — the raw value (including an intentionally-cleared "") is
  // always sent as-is, never silently swapped back for the saved material.
  const [sourceTextOverride, setSourceTextOverride] = useState(defaultSourceMaterial);

  const [state, setState] = useState<"idle" | "running" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [report, setReport] = useState<VerifyReport | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("running");
    setErrorMessage(null);
    setSaveState("idle");
    try {
      const res = await fetch("/api/command-center/verify-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicKey,
          draftBodyText,
          draftLinkedPaths: draftLinkedPaths.split("\n").map((p) => p.trim()).filter(Boolean),
          hasFaqSection,
          imageCount,
          videoEmbedCount,
          sourceTextOverride,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
      setReport(data);
      setState("idle");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : String(err));
      setState("error");
    }
  }

  async function handleSaveScore() {
    if (!report) return;
    setSaveState("saving");
    try {
      const res = await fetch("/api/command-center/save-quality-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicKey, qualityScore: report.qualityScore }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
      setSaveState("saved");
    } catch {
      setSaveState("error");
    }
  }

  const textareaStyle: React.CSSProperties = {
    width: "100%",
    fontSize: "0.8125rem",
    fontFamily: "inherit",
    padding: 10,
    borderRadius: 6,
    border: "1px solid var(--cc-border)",
    background: "var(--cc-bg)",
    color: "var(--cc-text)",
    resize: "vertical",
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="cc-card">
        <h2 style={{ margin: "0 0 12px", fontSize: "1.0625rem" }}>Draft</h2>
        <label style={{ display: "block", fontSize: "0.8125rem", marginBottom: 4, color: "var(--cc-text-muted)" }}>
          Body text — mark section headings with a line starting with &ldquo;## &rdquo;, e.g. &ldquo;## Choosing the Right Foundation&rdquo;.
          This keeps headings attached to the paragraphs that actually follow them.
        </label>
        <textarea rows={16} value={draftBodyText} onChange={(e) => setDraftBodyText(e.target.value)} style={{ ...textareaStyle, marginBottom: 12 }} />

        <label style={{ display: "block", fontSize: "0.8125rem", marginBottom: 4, color: "var(--cc-text-muted)" }}>
          Internal links used (one path per line, e.g. /services/bridal-makeup)
        </label>
        <textarea rows={3} value={draftLinkedPaths} onChange={(e) => setDraftLinkedPaths(e.target.value)} style={{ ...textareaStyle, marginBottom: 12 }} />

        <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
          <label style={{ fontSize: "0.8125rem", display: "flex", alignItems: "center", gap: 6 }}>
            <input type="checkbox" checked={hasFaqSection} onChange={(e) => setHasFaqSection(e.target.checked)} />
            Has FAQ section
          </label>
          <label style={{ fontSize: "0.8125rem", display: "flex", alignItems: "center", gap: 6 }}>
            Images: <input type="number" min={0} value={imageCount} onChange={(e) => setImageCount(Number(e.target.value))} style={{ width: 50 }} />
          </label>
          <label style={{ fontSize: "0.8125rem", display: "flex", alignItems: "center", gap: 6 }}>
            Video embeds: <input type="number" min={0} value={videoEmbedCount} onChange={(e) => setVideoEmbedCount(Number(e.target.value))} style={{ width: 50 }} />
          </label>
        </div>

        <label style={{ display: "block", fontSize: "0.8125rem", marginBottom: 4, color: "var(--cc-text-muted)" }}>
          Source material to check originality against (prefilled from the brief if already pasted in Studio)
        </label>
        <textarea rows={6} value={sourceTextOverride} onChange={(e) => setSourceTextOverride(e.target.value)} style={{ ...textareaStyle, marginBottom: 12 }} />

        <button
          type="submit"
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
          {state === "running" ? "Verifying…" : "Run Verification"}
        </button>
        {state === "error" && (
          <p style={{ margin: "10px 0 0", fontSize: "0.8125rem", color: "var(--cc-critical)" }}>Failed: {errorMessage}</p>
        )}
      </form>

      {report && (
        <>
          <div className="cc-card">
            <h2 style={{ margin: "0 0 4px", fontSize: "1.0625rem" }}>
              Quality Score: {report.qualityScore.weightedTotal}/100
            </h2>
            <p style={{ margin: "0 0 16px", fontSize: "0.875rem", fontWeight: 600, color: report.qualityScore.publishable ? "var(--cc-good)" : "var(--cc-critical)" }}>
              {report.qualityScore.publishable ? "✅ Publishable" : `🚫 ${report.qualityScore.reasonIfBlocked}`}
            </p>
            {report.qualityScore.categories.map((c) => (
              <ScoreBar key={c.category} label={`${c.category} (${c.weight}%)`} value={c.score} floor={c.floor} />
            ))}
            {hasLinkedBlogPost ? (
              <div style={{ marginTop: 12 }}>
                <button
                  type="button"
                  onClick={handleSaveScore}
                  disabled={saveState === "saving"}
                  style={{
                    background: "transparent",
                    color: "var(--cc-accent)",
                    border: "1px solid var(--cc-accent)",
                    padding: "6px 14px",
                    borderRadius: 6,
                    cursor: saveState === "saving" ? "wait" : "pointer",
                    fontSize: "0.8125rem",
                    fontWeight: 500,
                  }}
                >
                  {saveState === "saving" ? "Saving…" : saveState === "saved" ? "✅ Saved to linked post" : "Save score to linked post"}
                </button>
                {saveState === "error" && (
                  <p style={{ margin: "6px 0 0", fontSize: "0.8125rem", color: "var(--cc-critical)" }}>Failed to save.</p>
                )}
              </div>
            ) : (
              <p style={{ margin: "12px 0 0", fontSize: "0.8125rem", color: "var(--cc-text-muted)" }}>
                No blog post linked to this brief yet — set <strong>Linked blog post</strong> in Studio once the article is
                published to be able to save this score to it.
              </p>
            )}
          </div>

          <div className="cc-card">
            <h2 style={{ margin: "0 0 4px", fontSize: "1.0625rem" }}>Strategic Fit</h2>
            {report.strategicFit.clusterLabel ? (
              <p style={{ margin: "0 0 10px", fontSize: "0.875rem" }}>
                Cluster: <strong>{report.strategicFit.clusterLabel}</strong>
              </p>
            ) : (
              <p style={{ margin: "0 0 10px", fontSize: "0.8125rem", color: "var(--cc-text-muted)" }}>
                This topic isn&rsquo;t matched to a Topic Map cluster, so this scored neutral rather than measuring
                against a cluster that doesn&rsquo;t exist yet.
              </p>
            )}
            <div className="cc-pending-row">
              <span style={{ color: "var(--cc-text)" }}>{report.strategicFit.closesGap ? "✅" : "❌"} Closes a known gap</span>
              <span style={{ fontSize: "0.8125rem", color: "var(--cc-text-muted)" }}>{report.strategicFit.closedGapLabel ?? "—"}</span>
            </div>
            <div className="cc-pending-row">
              <span style={{ color: "var(--cc-text)" }}>{report.strategicFit.linksIntoCluster ? "✅" : "❌"} Links into the cluster</span>
            </div>
            <div className="cc-pending-row">
              <span style={{ color: report.strategicFit.cannibalizationRisk ? "var(--cc-critical)" : "var(--cc-text)" }}>
                {report.strategicFit.cannibalizationRisk ? "⚠️" : "✅"} Cannibalization risk
              </span>
              <span style={{ fontSize: "0.8125rem", color: "var(--cc-text-muted)" }}>{report.strategicFit.cannibalizationPath ?? "—"}</span>
            </div>
            <details style={{ marginTop: 10 }}>
              <summary style={{ fontSize: "0.8125rem", color: "var(--cc-text-muted)", cursor: "pointer" }}>Why this score (decision trail)</summary>
              <ol style={{ margin: "8px 0 0", paddingLeft: "1.2em", fontSize: "0.8125rem", color: "var(--cc-text-muted)", lineHeight: 1.8, fontFamily: "var(--cc-mono)" }}>
                {report.strategicFit.decisionTrace.map((step, i) => <li key={i}>{step}</li>)}
              </ol>
            </details>
          </div>

          <div className="cc-card">
            <h2 style={{ margin: "0 0 12px", fontSize: "1.0625rem" }}>Originality</h2>
            <p style={{ margin: "0 0 8px", fontSize: "0.875rem" }}>
              Structural: {report.originality.structuralOriginality ?? "—"} · Lexical: {report.originality.lexicalOriginality} · Composite: {report.originality.paraphraseScore}
            </p>
            {report.originality.structuralOriginality === null && (
              <p style={{ margin: "0 0 8px", fontSize: "0.8125rem", color: "var(--cc-text-muted)" }}>
                No heading-like lines detected in the source material, so structural comparison was skipped — the composite score is lexical originality alone.
              </p>
            )}
            {report.originality.flaggedSentences.length > 0 ? (
              <>
                <p style={{ margin: "0 0 6px", fontSize: "0.8125rem", color: "var(--cc-text-muted)" }}>
                  Sentences closest to the source — review, don&rsquo;t auto-rewrite:
                </p>
                <ul style={{ margin: 0, paddingLeft: "1.2em", fontSize: "0.8125rem" }}>
                  {report.originality.flaggedSentences.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </>
            ) : (
              <div className="cc-empty">No close matches to the source found.</div>
            )}
          </div>

          <div className="cc-card">
            <h2 style={{ margin: "0 0 12px", fontSize: "1.0625rem" }}>Evidence / E-E-A-T gaps ({report.evidenceSummary.totalGaps})</h2>
            {report.evidenceGaps.length === 0 && <div className="cc-empty">No unsubstantiated claims detected.</div>}
            {report.evidenceGaps.map((g, i) => (
              <div key={i} className="cc-pending-row" style={{ alignItems: "flex-start", flexDirection: "column", gap: 2 }}>
                <span style={{ color: "var(--cc-text)", fontWeight: 600 }}>⚠️ {g.placeholderText}</span>
                <span style={{ fontSize: "0.75rem", color: "var(--cc-text-muted)" }}>&ldquo;{g.matchedSentence}&rdquo;</span>
              </div>
            ))}
          </div>

          <div className="cc-card">
            <h2 style={{ margin: "0 0 12px", fontSize: "1.0625rem" }}>Coverage vs. Brief</h2>
            <p style={{ margin: "0 0 10px", fontSize: "0.875rem" }}>
              Topical coverage: {report.coverage.topicalCoverageScore}%
              {!report.coverage.subtopicsRequired && (
                <span style={{ color: "var(--cc-text-muted)", fontSize: "0.75rem" }}> (no required subtopics — score is vacuous, not a real signal)</span>
              )}
              {" · "}Internal linking: {report.coverage.internalLinkingScore}%
              {!report.coverage.linksRequired && (
                <span style={{ color: "var(--cc-text-muted)", fontSize: "0.75rem" }}> (no required links — score is vacuous, not a real signal)</span>
              )}
            </p>
            {report.coverage.subtopics.map((s, i) => (
              <div key={i} className="cc-pending-row">
                <span style={{ color: "var(--cc-text)" }}>{s.covered ? "✅" : "❌"} {s.label}</span>
                <span style={{ fontFamily: "var(--cc-mono)", fontSize: "0.75rem" }}>{s.bestOverlap}</span>
              </div>
            ))}
            {report.coverage.internalLinks.map((l, i) => (
              <div key={i} className="cc-pending-row">
                <span style={{ color: "var(--cc-text)" }}>{l.linked ? "✅" : "❌"} {l.targetLabel}</span>
                <span style={{ fontFamily: "var(--cc-mono)", fontSize: "0.75rem" }}>{l.targetPath}</span>
              </div>
            ))}
          </div>

          <div className="cc-card">
            <h2 style={{ margin: "0 0 12px", fontSize: "1.0625rem" }}>SEO mechanics</h2>
            <p style={{ margin: "0 0 6px", fontSize: "0.875rem" }}>
              Readability (Flesch): {report.readability.fleschScore} · Avg sentence length: {report.readability.avgSentenceLength} words
            </p>
            <p style={{ margin: "0 0 12px", fontSize: "0.875rem" }}>
              Keyword stuffing: {report.stuffing.stuffed ? `⚠️ "${report.stuffing.worstTerm}" at ${Math.round(report.stuffing.worstRatio * 100)}%` : "✅ Not detected"}
            </p>
            <ul style={{ margin: 0, paddingLeft: "1.2em", fontSize: "0.8125rem", color: "var(--cc-text-muted)" }}>
              {report.opportunities.featuredSnippetOpportunity && <li>Featured snippet opportunity — a question-form heading is present</li>}
              {report.opportunities.faqOpportunity && <li>FAQ opportunity — target queries are question-form but no FAQ section exists</li>}
              {report.opportunities.imageOpportunity && <li>Image opportunity — visual language used but no images added</li>}
              {report.opportunities.videoOpportunity && <li>Video opportunity — step-by-step content with no video embed</li>}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
