import Link from "next/link";
import { getEditorialRoadmap, type StoredEditorialObjective } from "@/lib/intelligence/editorial-roadmap";
import { ActionCheckbox, MarkObjectiveDoneButton } from "@/components/command-center/RoadmapObjectiveActions";

function ObjectiveCard({ objective, hero }: { objective: StoredEditorialObjective; hero: boolean }) {
  return (
    <div className="cc-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 8 }}>
        <div>
          <h2 style={{ margin: "0 0 4px", fontSize: hero ? "1.25rem" : "1.0625rem" }}>
            {hero && <span style={{ color: "var(--cc-accent)" }}>Current Goal: </span>}
            {objective.objectiveText}
          </h2>
          <Link href={`/command-center/topic-map/${objective.clusterNodeId}`} style={{ fontSize: "0.8125rem", color: "var(--cc-text-muted)" }}>
            {objective.clusterLabel} cluster →
          </Link>
        </div>
        <span style={{ fontSize: "0.75rem", color: "var(--cc-text-muted)", whiteSpace: "nowrap" }}>
          priority {objective.priorityScore} · {objective.status}
        </span>
      </div>

      <p style={{ margin: "0 0 12px", fontSize: "0.8125rem", color: "var(--cc-text-muted)" }}>
        {objective.targetMetric.label}: {objective.targetMetric.current}% → {objective.targetMetric.target}%
      </p>

      <div style={{ marginBottom: 12 }}>
        {objective.actions.map((a, i) => (
          <ActionCheckbox key={i} objectiveId={objective._id} actionIndex={i} label={a.label} done={a.done} />
        ))}
      </div>

      <details style={{ marginBottom: hero && objective.status !== "done" ? 12 : 0 }}>
        <summary style={{ fontSize: "0.8125rem", color: "var(--cc-text-muted)", cursor: "pointer" }}>Why this is the priority</summary>
        <ol style={{ margin: "8px 0 0", paddingLeft: "1.2em", fontSize: "0.8125rem", color: "var(--cc-text-muted)", lineHeight: 1.8 }}>
          {objective.decisionTrace.map((step, i) => <li key={i}>{step}</li>)}
        </ol>
      </details>

      {hero && objective.status !== "done" && <MarkObjectiveDoneButton objectiveId={objective._id} />}
    </div>
  );
}

export default async function RoadmapPage() {
  const objectives = await getEditorialRoadmap();
  const active = objectives.filter((o) => o.status !== "done");
  const [top, ...rest] = active;
  const done = objectives.filter((o) => o.status === "done");

  return (
    <div>
      <h1 className="cc-page-title">Editorial Roadmap</h1>
      <p className="cc-page-dek">
        One current objective per Topic Map cluster, ranked by business priority, authority gap, and lifecycle stage —
        not a new scoring engine, just what Cluster Authority, Topical Authority, and the Topic Lifecycle already
        computed, turned into a goal and a checklist. Mark an objective done and the next-highest-priority cluster
        becomes the new top goal automatically.
      </p>

      {!top ? (
        <div className="cc-card">
          <div className="cc-empty">
            No objectives yet — the Topic Map needs at least one cluster (a topic with children) before a roadmap can
            be computed. Use the Initial Topic Map Wizard to get started.
          </div>
        </div>
      ) : (
        <ObjectiveCard objective={top} hero />
      )}

      {rest.length > 0 && (
        <>
          <h2 style={{ margin: "24px 0 12px", fontSize: "1.0625rem" }}>Next up ({rest.length})</h2>
          {rest.map((o) => <ObjectiveCard key={o._id} objective={o} hero={false} />)}
        </>
      )}

      {done.length > 0 && (
        <>
          <h2 style={{ margin: "24px 0 12px", fontSize: "1.0625rem" }}>Done ({done.length})</h2>
          {done.map((o) => <ObjectiveCard key={o._id} objective={o} hero={false} />)}
        </>
      )}
    </div>
  );
}
