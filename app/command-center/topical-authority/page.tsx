import Link from "next/link";
import { getTopicalAuthorityNodes, type StoredTopicalAuthorityNode } from "@/lib/intelligence/topical-authority";

function CountsLine({ node }: { node: StoredTopicalAuthorityNode }) {
  const c = node.coverage;
  return (
    <span style={{ fontSize: "0.8125rem", color: "var(--cc-text-muted)" }}>
      Portfolio: {c.portfolioItem} · Testimonials: {c.testimonial} · Transformations: {c.transformation} · FAQs: {c.faq} ·
      {" "}Articles: {c.blogPost} · Internal Links: {c.internalLinks ?? "N/A"} · Coverage Score: {node.coverageScore.totalScore}%
    </span>
  );
}

export default async function TopicalAuthorityPage() {
  const nodes = await getTopicalAuthorityNodes();
  const grouped = new Map<string, StoredTopicalAuthorityNode[]>();
  for (const node of nodes) {
    const list = grouped.get(node.taxonomyTypeLabel) ?? [];
    list.push(node);
    grouped.set(node.taxonomyTypeLabel, list);
  }

  return (
    <div>
      <h1 className="cc-page-title">Topical Authority</h1>
      <p className="cc-page-dek">
        Real evidence per taxonomy node — portfolio, testimonials, transformations, FAQs, articles, internal links,
        structured data, images, and related taxonomy — rolled into a Coverage Score and an Authority Score. No
        description-length guessing: every number here is a real Sanity count. Weakest topics surface first, since
        those are the actionable ones. Click a row for the full dimension-by-dimension breakdown.
      </p>

      {nodes.length === 0 ? (
        <div className="cc-card">
          <h2 style={{ margin: "0 0 12px", fontSize: "1.0625rem" }}>Topical Authority Engine</h2>
          <div className="cc-empty">
            No topics computed yet. This runs weekly from the daily snapshot cron (self-gated) — trigger it manually
            via the &ldquo;Run now&rdquo; button on Settings, or <code>POST /api/command-center/snapshot</code>, to
            compute the first batch now.
          </div>
        </div>
      ) : (
        Array.from(grouped.entries()).map(([typeLabel, group]) => (
          <div key={typeLabel} className="cc-card">
            <h2 style={{ margin: "0 0 12px", fontSize: "1.0625rem" }}>{typeLabel}</h2>
            {group.map((node) => (
              <Link
                key={node.taxonomyId}
                href={`/command-center/topical-authority/${node.taxonomyType}/${node.taxonomyId}`}
                style={{ textDecoration: "none", color: "inherit", display: "block", padding: "10px 0", borderBottom: "1px solid var(--cc-border)" }}
              >
                <div className="cc-score-row" style={{ padding: 0, border: "none" }}>
                  <span className="cc-score-label">{node.taxonomyName}</span>
                  <div className="cc-score-track">
                    <div className="cc-score-fill" style={{ width: `${node.authorityScore.totalScore}%` }} />
                  </div>
                  <span className="cc-score-val">{node.authorityScore.totalScore}</span>
                </div>
                <CountsLine node={node} />
              </Link>
            ))}
          </div>
        ))
      )}
    </div>
  );
}
