import Link from "next/link";
import { notFound } from "next/navigation";
import { getClusterAuthorityByNodeId } from "@/lib/intelligence/cluster-authority";
import { computeLifecycleForCluster, LIFECYCLE_STAGE_LABEL } from "@/lib/intelligence/topic-lifecycle";
import { TimeSeriesChart } from "@/components/command-center/TimeSeriesChart";

const SOURCE_LABELS: Record<string, string> = {
  "keyword-discovery": "Real discovered query",
  "competitor-gap": "Competitor covers this",
  "knowledge-graph": "Knowledge Graph connection gap",
};

function GapList({ title, items }: { title: string; items: { label: string; source: string; priorityScore: number; detail: string }[] }) {
  return (
    <div className="cc-card">
      <h2 style={{ margin: "0 0 12px", fontSize: "1.0625rem" }}>{title} ({items.length})</h2>
      {items.length === 0 ? (
        <div className="cc-empty">None found for this cluster right now.</div>
      ) : (
        items.map((item, i) => (
          <div key={i} className="cc-pending-row" style={{ alignItems: "flex-start", flexDirection: "column", gap: 2 }}>
            <span style={{ color: "var(--cc-text)", fontWeight: 600 }}>{item.label}</span>
            <span style={{ fontSize: "0.75rem", color: "var(--cc-text-muted)" }}>
              {SOURCE_LABELS[item.source] ?? item.source} · priority {item.priorityScore.toFixed(1)} — {item.detail}
            </span>
          </div>
        ))
      )}
    </div>
  );
}

export default async function ClusterDetailPage({
  params,
}: {
  params: Promise<{ clusterId: string }>;
}) {
  const { clusterId } = await params;
  const cluster = await getClusterAuthorityByNodeId(clusterId);
  if (!cluster) notFound();
  const lifecycle = await computeLifecycleForCluster(clusterId, cluster.clusterLabel);

  return (
    <div>
      <p style={{ margin: "0 0 6px" }}>
        <Link href="/command-center/topic-map" style={{ color: "var(--cc-text-muted)", fontSize: "0.8125rem" }}>
          &larr; Topic Map
        </Link>
      </p>
      <h1 className="cc-page-title">{cluster.clusterLabel}</h1>
      <p className="cc-page-dek">
        Topical authority tracked at the cluster level — every number below is a rollup of what the site&rsquo;s
        other engines already computed for the {cluster.descendantCount} topic{cluster.descendantCount === 1 ? "" : "s"} under
        this cluster, filtered down to what genuinely belongs to it. The goal here is the cluster&rsquo;s authority
        going up over time, not any single article.
      </p>

      <div className="cc-tiles">
        <div className="cc-tile">
          <div className="cc-tile__label">Average authority</div>
          <div className="cc-tile__value">{cluster.avgAuthorityScore}%</div>
        </div>
        <div className="cc-tile">
          <div className="cc-tile__label">Average coverage</div>
          <div className="cc-tile__value">{cluster.avgCoverageScore}%</div>
        </div>
        <div className="cc-tile">
          <div className="cc-tile__label">Real pages in cluster</div>
          <div className="cc-tile__value">{cluster.linkedDescendantCount} / {cluster.descendantCount}</div>
        </div>
        <div className="cc-tile">
          <div className="cc-tile__label">Open gaps</div>
          <div className="cc-tile__value">{cluster.openGapCount}</div>
        </div>
      </div>

      <div className="cc-card">
        <h2 style={{ margin: "0 0 4px", fontSize: "1.0625rem" }}>Lifecycle: {LIFECYCLE_STAGE_LABEL[lifecycle.result.stage]}</h2>
        <ol style={{ margin: "8px 0 0", paddingLeft: "1.2em", fontSize: "0.8125rem", color: "var(--cc-text-muted)", lineHeight: 1.8 }}>
          {lifecycle.result.decisionTrace.map((step, i) => <li key={i}>{step}</li>)}
        </ol>
      </div>

      <div className="cc-card">
        <h2 style={{ margin: "0 0 12px", fontSize: "1.0625rem" }}>Internal link health</h2>
        <div className="cc-tiles">
          <div className="cc-tile">
            <div className="cc-tile__label">Healthy</div>
            <div className="cc-tile__value" style={{ color: "var(--cc-good)" }}>{cluster.internalLinkHealth.healthyCount}</div>
          </div>
          <div className="cc-tile">
            <div className="cc-tile__label">Under-linked</div>
            <div className="cc-tile__value" style={{ color: "var(--cc-warn, #b8631a)" }}>{cluster.internalLinkHealth.underlinkedCount}</div>
          </div>
          <div className="cc-tile">
            <div className="cc-tile__label">Orphaned</div>
            <div className="cc-tile__value" style={{ color: "var(--cc-critical)" }}>{cluster.internalLinkHealth.orphanCount}</div>
          </div>
        </div>
      </div>

      <div className="cc-card">
        <h2 style={{ margin: "0 0 4px", fontSize: "1.0625rem" }}>Recommended next content</h2>
        <p style={{ margin: "0 0 12px", fontSize: "0.8125rem", color: "var(--cc-text-muted)" }}>
          The top candidates across every gap source below, ranked by priority — what to compile a brief for next to
          move this cluster&rsquo;s authority forward.
        </p>
        {cluster.recommendedNextContent.length === 0 ? (
          <div className="cc-empty">No open gaps mapped to this cluster right now — it&rsquo;s in good shape.</div>
        ) : (
          cluster.recommendedNextContent.map((item, i) => (
            <div key={i} className="cc-pending-row">
              <span style={{ color: "var(--cc-text)" }}>{item.label}</span>
              <span style={{ fontFamily: "var(--cc-mono)", fontSize: "0.8125rem" }}>{item.priorityScore.toFixed(1)}</span>
            </div>
          ))
        )}
      </div>

      <GapList title="Missing subtopics" items={cluster.missingSubtopics} />
      <GapList title="Competitor gaps" items={cluster.competitorGaps} />
      <GapList title="Knowledge graph gaps" items={cluster.knowledgeGraphGaps} />

      <div className="cc-card">
        <h2 style={{ margin: "0 0 12px", fontSize: "1.0625rem" }}>Authority over time</h2>
        {cluster.history.length <= 1 ? (
          <div className="cc-empty">Only one computation run so far — history builds up week over week.</div>
        ) : (
          <TimeSeriesChart data={cluster.history.map((h) => ({ date: h.date, score: h.avgAuthorityScore }))} label="Authority" />
        )}
        <p style={{ margin: "10px 0 0", fontSize: "0.75rem", color: "var(--cc-text-muted)" }}>
          First seen {new Date(cluster.firstSeenAt).toLocaleDateString()} · last computed{" "}
          {new Date(cluster.lastComputedAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
