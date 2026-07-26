import Link from "next/link";
import { getEditorialRoadmap, type StoredEditorialObjective } from "@/lib/intelligence/editorial-roadmap";
import { getNextActions, SOURCE_LABEL, SOURCE_BASIS } from "@/lib/intelligence/next-actions";
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

// One label map for every engine's recommendedAction vocabulary. The three
// engines overlap in meaning where the exact string differs, and the merged
// queue has to render them all in one column.
const ACTION_LABELS: Record<string, string> = {
  create_new_pillar: "Create a new pillar page",
  create_cluster_article: "Write a cluster article",
  create_new_blog_article: "Write a new article",
  improve_existing_page: "Improve the existing page",
  expand_pillar_page: "Expand the pillar page",
  add_faqs: "Add an FAQ",
  improve_existing_faq: "Improve an existing FAQ",
  add_portfolio: "Add portfolio items",
  add_portfolio_examples: "Add portfolio items",
  add_internal_links: "Add internal links",
  strengthen_internal_links: "Strengthen internal links",
};

export default async function RoadmapPage() {
  const [objectives, nextActions] = await Promise.all([getEditorialRoadmap(), getNextActions()]);
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

      <h2 style={{ margin: "28px 0 6px", fontSize: "1.0625rem" }}>Topic queue ({nextActions.length})</h2>
      <p className="cc-page-dek" style={{ margin: "0 0 12px" }}>
        Every discovered topic, competitor gap, and Search Console opportunity in one ranked list. All three score on
        the same value-over-effort scale, so the order is directly comparable. Open a row for the full reasoning.
      </p>
      {nextActions.length === 0 ? (
        <div className="cc-card">
          <div className="cc-empty">
            Nothing queued. Run a snapshot from Settings to populate the intelligence engines.
          </div>
        </div>
      ) : (
        <div className="cc-card" style={{ overflowX: "auto" }}>
          <table className="cc-table">
            <thead>
              <tr>
                <th>Priority</th>
                <th>Topic</th>
                <th>Evidence</th>
                <th>Suggested action</th>
              </tr>
            </thead>
            <tbody>
              {nextActions.map((a) => (
                <tr key={`${a.source}-${a.key}`}>
                  <td style={{ fontFamily: "var(--cc-mono)", whiteSpace: "nowrap" }}>{a.priorityScore}</td>
                  <td>
                    <Link href={a.href}>{a.label}</Link>
                  </td>
                  <td>
                    <span className="cc-nav-item__phase" title={SOURCE_BASIS[a.source]}>
                      {SOURCE_LABEL[a.source]}
                    </span>
                    {a.impressions != null && (
                      <span style={{ marginLeft: 6, color: "var(--cc-text-muted)", fontSize: "0.75rem" }}>
                        {a.impressions} impr.
                      </span>
                    )}
                  </td>
                  <td style={{ color: "var(--cc-text-muted)" }}>{ACTION_LABELS[a.action] ?? a.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
