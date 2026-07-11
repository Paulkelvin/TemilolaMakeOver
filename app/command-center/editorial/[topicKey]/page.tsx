import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticleBriefByTopicKey } from "@/lib/intelligence/editorial-brief";

const SOURCE_LABELS: Record<string, string> = {
  competitor: "Competitor covers this",
  "knowledge-graph": "Knowledge Graph connection gap",
  "sample-query": "Real discovered query",
};

const TARGET_TYPE_LABELS: Record<string, string> = {
  service: "Service",
  location: "Location",
  "pillar-post": "Pillar post",
  "supporting-post": "Supporting post",
};

export default async function ContentBriefPage({
  params,
}: {
  params: Promise<{ topicKey: string }>;
}) {
  const { topicKey } = await params;
  const brief = await getArticleBriefByTopicKey(topicKey);
  if (!brief) notFound();

  return (
    <div>
      <p style={{ margin: "0 0 6px" }}>
        <Link href={`/command-center/keyword-discovery/${topicKey}`} style={{ color: "var(--cc-text-muted)", fontSize: "0.8125rem" }}>
          &larr; Keyword Discovery topic
        </Link>
      </p>
      <h1 className="cc-page-title">{brief.topicLabel}</h1>
      <p className="cc-page-dek">
        Everything a writer needs before drafting — compiled from real Keyword Discovery, Competitor Gap, Knowledge
        Graph, Internal Link, and Search Console data. Nothing here is guessed; the coverage score comes later, once
        a draft exists to check against this checklist.
        {" · "}
        <Link href={`/command-center/editorial/${topicKey}/verify`} style={{ fontWeight: 600, color: "var(--cc-accent)" }}>
          Verify a draft →
        </Link>
      </p>

      {!brief.sourceMaterial && (
        <div className="cc-card" style={{ borderColor: "var(--cc-warn, #b8631a)" }}>
          <p style={{ margin: 0, fontSize: "0.875rem" }}>
            ⚠️ No source material saved yet. Paste the transcript, notes, or article you&rsquo;re researching from
            into this brief&rsquo;s <strong>Source Material</strong> field in Sanity Studio before verifying a draft
            — the Originality Scorer needs it to check the draft against.
          </p>
        </div>
      )}

      <div className="cc-tiles">
        <div className="cc-tile">
          <div className="cc-tile__label">Search intent</div>
          <div className="cc-tile__value" style={{ textTransform: "capitalize" }}>{brief.searchIntent}</div>
        </div>
        <div className="cc-tile">
          <div className="cc-tile__label">Audience level</div>
          <div className="cc-tile__value" style={{ textTransform: "capitalize" }}>{brief.audienceLevel}</div>
        </div>
        <div className="cc-tile">
          <div className="cc-tile__label">Existing coverage</div>
          <div className="cc-tile__value" style={{ textTransform: "capitalize", fontSize: "1.125rem" }}>{brief.existingCoverage}</div>
        </div>
        <div className="cc-tile">
          <div className="cc-tile__label">Status</div>
          <div className="cc-tile__value" style={{ textTransform: "capitalize" }}>{brief.status}</div>
        </div>
      </div>

      <div className="cc-card">
        <h2 style={{ margin: "0 0 8px", fontSize: "1.0625rem" }}>Topic Map cluster</h2>
        {brief.clusterId ? (
          <p style={{ margin: 0, fontSize: "0.875rem" }}>
            This brief belongs to{" "}
            <Link href={`/command-center/topic-map/${brief.clusterId}`} style={{ fontWeight: 600, color: "var(--cc-accent)" }}>
              {brief.clusterLabel}
            </Link>{" "}
            — check its open gaps before writing so this article closes one instead of overlapping existing coverage.
          </p>
        ) : (
          <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--cc-text-muted)" }}>
            No Topic Map cluster matched this topic&rsquo;s vocabulary closely enough — this is a real gap, not a
            forced guess. Add a topicNode in Studio to plan where this topic fits before writing, or proceed without
            one; the Verification Suite will simply skip Strategic Fit scoring for this brief.
          </p>
        )}
      </div>

      {brief.matchedContentPath && (
        <div className="cc-card">
          <h2 style={{ margin: "0 0 8px", fontSize: "1.0625rem" }}>Existing matched page</h2>
          <a href={brief.matchedContentPath} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.875rem" }}>
            {brief.matchedContentPath}
          </a>
          {brief.searchConsoleSnapshot && (
            <p style={{ margin: "8px 0 0", fontSize: "0.8125rem", color: "var(--cc-text-muted)" }}>
              Real Search Console data (last 90 days): {brief.searchConsoleSnapshot.clicks} clicks,{" "}
              {brief.searchConsoleSnapshot.impressions} impressions, average position{" "}
              {brief.searchConsoleSnapshot.position}.
            </p>
          )}
        </div>
      )}

      <div className="cc-card">
        <h2 style={{ margin: "0 0 12px", fontSize: "1.0625rem" }}>Target queries ({brief.targetQueries.length})</h2>
        {brief.targetQueries.length === 0 && <div className="cc-empty">No sample queries on the source topic.</div>}
        <ul style={{ margin: 0, paddingLeft: "1.2em", fontSize: "0.875rem", color: "var(--cc-text)", lineHeight: 1.8 }}>
          {brief.targetQueries.map((q, i) => <li key={i}>{q}</li>)}
        </ul>
      </div>

      <div className="cc-card">
        <h2 style={{ margin: "0 0 12px", fontSize: "1.0625rem" }}>Required subtopics ({brief.requiredSubtopics.length})</h2>
        <p style={{ margin: "0 0 12px", fontSize: "0.8125rem", color: "var(--cc-text-muted)" }}>
          The checklist the finished draft gets diffed against to compute its real coverage score.
        </p>
        {brief.requiredSubtopics.length === 0 && <div className="cc-empty">No required subtopics surfaced for this topic.</div>}
        {brief.requiredSubtopics.map((s, i) => (
          <div key={i} className="cc-pending-row" style={{ alignItems: "flex-start", flexDirection: "column", gap: 2 }}>
            <span style={{ color: "var(--cc-text)", fontWeight: 600 }}>{s.label}</span>
            <span style={{ fontSize: "0.75rem", color: "var(--cc-text-muted)" }}>
              {SOURCE_LABELS[s.source] ?? s.source} — {s.detail}
            </span>
          </div>
        ))}
      </div>

      <div className="cc-card">
        <h2 style={{ margin: "0 0 12px", fontSize: "1.0625rem" }}>Required internal links ({brief.requiredInternalLinks.length})</h2>
        {brief.requiredInternalLinks.length === 0 && (
          <div className="cc-empty">No existing page scored a real topical overlap with this topic — don&rsquo;t force a link that isn&rsquo;t genuine.</div>
        )}
        {brief.requiredInternalLinks.map((l, i) => (
          <div key={i} className="cc-pending-row">
            <span style={{ color: "var(--cc-text)" }}>
              {l.targetLabel} <span style={{ color: "var(--cc-text-muted)", fontSize: "0.75rem" }}>({TARGET_TYPE_LABELS[l.targetType]})</span>
            </span>
            <span style={{ fontFamily: "var(--cc-mono)", fontSize: "0.8125rem" }}>{l.targetPath}</span>
          </div>
        ))}
      </div>

      {brief.competitorGaps.length > 0 && (
        <div className="cc-card">
          <h2 style={{ margin: "0 0 12px", fontSize: "1.0625rem" }}>Real competitor gaps ({brief.competitorGaps.length})</h2>
          {brief.competitorGaps.map((c, i) => (
            <div key={i} className="cc-pending-row">
              <span style={{ color: "var(--cc-text)" }}>{c.competitorTopicLabel}</span>
              <span style={{ fontFamily: "var(--cc-mono)", fontSize: "0.8125rem" }}>{c.priorityScore.toFixed(1)}</span>
            </div>
          ))}
        </div>
      )}

      {brief.knowledgeGraphConnections.length > 0 && (
        <div className="cc-card">
          <h2 style={{ margin: "0 0 12px", fontSize: "1.0625rem" }}>Knowledge Graph connections ({brief.knowledgeGraphConnections.length})</h2>
          {brief.knowledgeGraphConnections.map((k, i) => (
            <div key={i} className="cc-pending-row">
              <span style={{ color: "var(--cc-text)" }}>{k.serviceName} × {k.occasionName}</span>
              <span style={{ fontFamily: "var(--cc-mono)", fontSize: "0.8125rem" }}>{k.priorityScore.toFixed(1)}</span>
            </div>
          ))}
        </div>
      )}

      <p style={{ margin: "10px 0 0", fontSize: "0.75rem", color: "var(--cc-text-muted)" }}>
        First seen {new Date(brief.firstSeenAt).toLocaleDateString()} · last computed{" "}
        {new Date(brief.lastComputedAt).toLocaleDateString()}
      </p>
    </div>
  );
}
