import Link from "next/link";
import { getWizardProposals, getTopicNodeCount, type ProposedNode, type StoredWizardProposal } from "@/lib/intelligence/topic-map-wizard";
import { GenerateProposalButton, WizardProposalActions } from "@/components/command-center/TopicMapWizardActions";

const SOURCE_LABELS: Record<string, string> = {
  taxonomy: "Real site taxonomy",
  "competitor-gap": "Competitor Gap",
  "search-console": "Search Console",
  "keyword-discovery": "Keyword Discovery",
  autocomplete: "Google Autocomplete",
  "recurring-entity": "Recurring entity",
};

function NodeRow({ node, depth }: { node: ProposedNode; depth: number }) {
  return (
    <div style={{ paddingLeft: depth * 24, padding: "8px 0", borderBottom: "1px solid var(--cc-border)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
        <span style={{ color: "var(--cc-text)", fontWeight: depth === 0 ? 600 : 400 }}>
          {node.label}
          {node.linkedTaxonomy && (
            <span style={{ marginLeft: 6, fontSize: "0.6875rem", color: "var(--cc-text-muted)" }}>(linked to real page)</span>
          )}
        </span>
        <span style={{ fontSize: "0.75rem", color: "var(--cc-text-muted)", whiteSpace: "nowrap" }}>
          priority {node.priorityScore} · confidence {node.confidenceScore}% ({node.confidenceLabel})
        </span>
      </div>
      <div style={{ marginTop: 2, fontSize: "0.75rem", color: "var(--cc-text-muted)" }}>
        {node.evidence.map((e, i) => (
          <span key={i}>
            {i > 0 && " · "}
            {SOURCE_LABELS[e.source] ?? e.source}: {e.detail}
          </span>
        ))}
      </div>
    </div>
  );
}

function ProposalTree({ proposal }: { proposal: StoredWizardProposal }) {
  const topLevel = proposal.proposedNodes.filter((n) => !n.parentTempId);
  const childrenByParent = new Map<string, ProposedNode[]>();
  for (const node of proposal.proposedNodes) {
    if (!node.parentTempId) continue;
    const list = childrenByParent.get(node.parentTempId) ?? [];
    list.push(node);
    childrenByParent.set(node.parentTempId, list);
  }

  return (
    <div className="cc-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div>
          <h2 style={{ margin: "0 0 4px", fontSize: "1.0625rem" }}>
            Proposed structure — {proposal.proposedNodes.length} node{proposal.proposedNodes.length === 1 ? "" : "s"}
          </h2>
          <p style={{ margin: 0, fontSize: "0.8125rem", color: "var(--cc-text-muted)" }}>
            Generated {new Date(proposal.generatedAt).toLocaleString()}
          </p>
        </div>
        {proposal.status === "draft" && <WizardProposalActions proposalId={proposal._id} />}
        {proposal.status !== "draft" && (
          <span style={{ fontSize: "0.75rem", fontWeight: 600, color: proposal.status === "approved" ? "var(--cc-good)" : "var(--cc-text-muted)" }}>
            {proposal.status} {proposal.createdNodeCount ? `· ${proposal.createdNodeCount} nodes created` : ""}
          </span>
        )}
      </div>

      {topLevel.map((node) => (
        <div key={node.tempId}>
          <NodeRow node={node} depth={0} />
          {(childrenByParent.get(node.tempId) ?? []).map((child) => (
            <NodeRow key={child.tempId} node={child} depth={1} />
          ))}
        </div>
      ))}
    </div>
  );
}

export default async function TopicMapWizardPage() {
  const [proposals, topicNodeCount] = await Promise.all([getWizardProposals(), getTopicNodeCount()]);
  const latestDraft = proposals.find((p) => p.status === "draft");
  const decided = proposals.filter((p) => p.status !== "draft");

  return (
    <div>
      <p style={{ margin: "0 0 6px" }}>
        <Link href="/command-center/topic-map" style={{ color: "var(--cc-text-muted)", fontSize: "0.8125rem" }}>
          &larr; Topic Map
        </Link>
      </p>
      <h1 className="cc-page-title">Initial Topic Map Wizard</h1>
      <p className="cc-page-dek">
        Analyzes Competitor Gaps, Search Console, Keyword Discovery, Google Autocomplete, verified articles, and the
        site&rsquo;s real taxonomy (Services, Makeup Styles, Occasions, Wedding Types) to propose a whole starting
        hierarchy in one pass{topicNodeCount > 0 ? ` — the Topic Map currently has ${topicNodeCount} node${topicNodeCount === 1 ? "" : "s"}, so this only proposes what's genuinely missing` : ", since the Topic Map is currently empty"}.
        Nothing is created until you review and approve the whole structure.
      </p>

      {!latestDraft && (
        <div className="cc-card">
          <div className="cc-empty" style={{ marginBottom: 16 }}>
            No draft proposal right now.
          </div>
          <GenerateProposalButton />
        </div>
      )}

      {latestDraft && <ProposalTree proposal={latestDraft} />}

      {decided.length > 0 && (
        <>
          <h2 style={{ margin: "24px 0 12px", fontSize: "1.0625rem" }}>Past proposals ({decided.length})</h2>
          {decided.map((p) => (
            <ProposalTree key={p._id} proposal={p} />
          ))}
        </>
      )}
    </div>
  );
}
