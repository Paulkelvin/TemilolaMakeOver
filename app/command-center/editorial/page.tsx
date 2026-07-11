import Link from "next/link";
import { getAllArticleBriefs, type StoredArticleBrief } from "@/lib/intelligence/editorial-brief";

const STATUS_COLOR: Record<string, string> = {
  new: "var(--cc-text-muted)",
  drafting: "var(--cc-accent)",
  verified: "var(--cc-good)",
  published: "var(--cc-good)",
};

function BriefRow({ brief }: { brief: StoredArticleBrief }) {
  return (
    <tr style={{ borderBottom: "1px solid var(--cc-border)" }}>
      <td style={{ padding: "6px 8px" }}>
        <Link href={`/command-center/editorial/${brief.topicKey}`} style={{ color: "inherit" }}>
          {brief.topicLabel}
        </Link>
      </td>
      <td style={{ padding: "6px 8px", textTransform: "capitalize", color: STATUS_COLOR[brief.status] }}>{brief.status}</td>
      <td style={{ padding: "6px 8px", textTransform: "capitalize" }}>{brief.existingCoverage}</td>
      <td style={{ padding: "6px 8px" }}>{brief.sourceMaterial ? "✅" : "—"}</td>
      <td style={{ padding: "6px 8px" }}>{brief.linkedBlogPost ? "✅" : "—"}</td>
      <td style={{ padding: "6px 8px", textAlign: "right", fontFamily: "var(--cc-mono)" }}>{brief.requiredSubtopics.length}</td>
      <td style={{ padding: "6px 8px" }}>
        <Link href={`/command-center/editorial/${brief.topicKey}/verify`} style={{ fontWeight: 600, color: "var(--cc-accent)" }}>
          Verify a draft →
        </Link>
      </td>
    </tr>
  );
}

export default async function EditorialPage() {
  const briefs = await getAllArticleBriefs();

  return (
    <div>
      <h1 className="cc-page-title">Editorial</h1>
      <p className="cc-page-dek">
        Self-service, from research to publish-ready — no developer step required. Pick a topic in{" "}
        <Link href="/command-center/keyword-discovery" style={{ color: "var(--cc-accent)" }}>Keyword Discovery</Link>, compile
        its brief, paste your finished draft into Verify, read the report, revise the draft (in Claude, or however you write),
        paste it back in, and repeat until it&rsquo;s publishable. Nothing here auto-writes or auto-publishes anything.
      </p>

      <div className="cc-card">
        <h2 style={{ margin: "0 0 10px", fontSize: "1.0625rem" }}>How this works</h2>
        <ol style={{ margin: 0, paddingLeft: "1.2em", fontSize: "0.875rem", color: "var(--cc-text)", lineHeight: 1.9 }}>
          <li>
            Open <Link href="/command-center/keyword-discovery" style={{ color: "var(--cc-accent)" }}>Keyword Discovery</Link>,
            open the topic you want to write about, and click <strong>Compile Brief</strong>. That gives you the checklist
            below — target queries, required subtopics, and real internal links to include.
          </li>
          <li>
            Paste your research/source material into the brief&rsquo;s <strong>Source Material</strong> field in Sanity Studio
            (the Originality Scorer checks your draft against this).
          </li>
          <li>Write the article. Come back to the brief page and click <strong>Verify a draft →</strong>.</li>
          <li>
            Paste the finished draft into the Verify form — mark section headings with a line starting &ldquo;## &rdquo; so
            the report can attribute checks to the right section — and click <strong>Run Verification</strong>.
          </li>
          <li>
            Read the report: Quality Score, Originality, Evidence/E-E-A-T gaps, Coverage vs. brief, SEO mechanics. Anything
            below 85 or under a category floor is not yet publishable.
          </li>
          <li>Revise the draft to close the gaps the report flagged, paste it back in, and verify again. Repeat until it passes.</li>
          <li>
            Publish the article as a blog post in Studio, link it back to the brief (<strong>Content Brief</strong> field on
            the post, and <strong>Linked blog post</strong> field on the brief), then click <strong>Save score to linked
            post</strong> on the verify report to record the final score.
          </li>
        </ol>
      </div>

      {briefs.length === 0 ? (
        <div className="cc-card">
          <div className="cc-empty">
            No content briefs compiled yet. Go to{" "}
            <Link href="/command-center/keyword-discovery" style={{ color: "var(--cc-accent)" }}>Keyword Discovery</Link>, open
            a topic, and click <strong>Compile Brief</strong> to create the first one.
          </div>
        </div>
      ) : (
        <div className="cc-card">
          <h2 style={{ margin: "0 0 4px", fontSize: "1.0625rem" }}>Compiled briefs ({briefs.length})</h2>
          <p style={{ margin: "0 0 12px", fontSize: "0.8125rem", color: "var(--cc-text-muted)" }}>
            &ldquo;Source&rdquo; = source material saved for originality checking. &ldquo;Linked&rdquo; = a published post is
            connected, enabling the score to be saved to it.
          </p>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", fontSize: "0.8125rem", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--cc-border)", color: "var(--cc-text-muted)" }}>
                  <th style={{ textAlign: "left", padding: "6px 8px", fontWeight: 500 }}>Topic</th>
                  <th style={{ textAlign: "left", padding: "6px 8px", fontWeight: 500 }}>Status</th>
                  <th style={{ textAlign: "left", padding: "6px 8px", fontWeight: 500 }}>Existing coverage</th>
                  <th style={{ textAlign: "left", padding: "6px 8px", fontWeight: 500 }}>Source</th>
                  <th style={{ textAlign: "left", padding: "6px 8px", fontWeight: 500 }}>Linked</th>
                  <th style={{ textAlign: "right", padding: "6px 8px", fontWeight: 500 }}>Subtopics</th>
                  <th style={{ textAlign: "left", padding: "6px 8px", fontWeight: 500 }}></th>
                </tr>
              </thead>
              <tbody>
                {briefs.map((b) => <BriefRow key={b.topicKey} brief={b} />)}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
