import Link from "next/link";
import { getKeywordDiscoveryTopics, type StoredKeywordDiscoveryTopic } from "@/lib/intelligence/keyword-discovery";

const ACTION_LABELS: Record<string, string> = {
  create_new_pillar: "Create new pillar",
  create_cluster_article: "Create cluster article",
  improve_existing_page: "Improve existing page",
  add_faqs: "Add FAQs",
  add_portfolio: "Add portfolio",
  add_internal_links: "Add internal links",
};

const CONFIDENCE_COLOR: Record<string, string> = {
  high: "var(--cc-good)",
  medium: "var(--cc-warn)",
  low: "var(--cc-text-muted)",
};

function TopicRow({ topic, rank }: { topic: StoredKeywordDiscoveryTopic; rank?: number }) {
  return (
    <tr style={{ borderBottom: "1px solid var(--cc-border)" }}>
      {rank !== undefined && (
        <td style={{ padding: "6px 8px", fontFamily: "var(--cc-mono)", color: "var(--cc-text-muted)" }}>{rank}</td>
      )}
      <td style={{ padding: "6px 8px" }}>
        <Link href={`/command-center/keyword-discovery/${topic.topicKey}`} style={{ color: "inherit" }}>
          {topic.linkedSeoOpportunityKey && "🔗 "}
          {topic.isSeasonal && "🗓 "}
          {topic.topicLabel}
        </Link>
      </td>
      <td style={{ padding: "6px 8px", textAlign: "right", fontFamily: "var(--cc-mono)" }}>
        {topic.scoreBreakdown.totalScore.toFixed(0)}
      </td>
      <td style={{ padding: "6px 8px", textTransform: "capitalize" }}>{topic.queryBreadth}</td>
      <td style={{ padding: "6px 8px" }}>{topic.intent}</td>
      <td style={{ padding: "6px 8px", color: CONFIDENCE_COLOR[topic.confidenceLevel] }}>{topic.confidenceLevel}</td>
      <td style={{ padding: "6px 8px" }}>{ACTION_LABELS[topic.recommendedAction] ?? topic.recommendedAction}</td>
      <td style={{ padding: "6px 8px", textTransform: "capitalize" }}>{topic.status.replace("_", " ")}</td>
    </tr>
  );
}

function TopicTable({ topics, ranked }: { topics: StoredKeywordDiscoveryTopic[]; ranked?: boolean }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", fontSize: "0.8125rem", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--cc-border)", color: "var(--cc-text-muted)" }}>
            {ranked && <th style={{ textAlign: "left", padding: "6px 8px", fontWeight: 500 }}>#</th>}
            <th style={{ textAlign: "left", padding: "6px 8px", fontWeight: 500 }}>Topic</th>
            <th style={{ textAlign: "right", padding: "6px 8px", fontWeight: 500 }}>Score</th>
            <th style={{ textAlign: "left", padding: "6px 8px", fontWeight: 500 }}>Breadth</th>
            <th style={{ textAlign: "left", padding: "6px 8px", fontWeight: 500 }}>Intent</th>
            <th style={{ textAlign: "left", padding: "6px 8px", fontWeight: 500 }}>Confidence</th>
            <th style={{ textAlign: "left", padding: "6px 8px", fontWeight: 500 }}>Recommended action</th>
            <th style={{ textAlign: "left", padding: "6px 8px", fontWeight: 500 }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {topics.map((t, i) => <TopicRow key={t.topicKey} topic={t} rank={ranked ? i + 1 : undefined} />)}
        </tbody>
      </table>
    </div>
  );
}

export default async function KeywordDiscoveryPage() {
  const topics = await getKeywordDiscoveryTopics();
  const queue = topics.slice(0, 10);
  const linkedCount = topics.filter((t) => t.linkedSeoOpportunityKey).length;

  return (
    <div>
      <h1 className="cc-page-title">Keyword Discovery</h1>
      <p className="cc-page-dek">
        Content opportunities discovered from free external autocomplete sources (Google + YouTube) — works
        independent of Search Console, so it surfaces ideas from day one. No search volume or keyword-difficulty
        number is ever fabricated: &ldquo;query breadth&rdquo; (head vs. long-tail) is used as an honest, observable
        stand-in, and confidence reflects real cross-source corroboration.
      </p>

      {topics.length === 0 ? (
        <div className="cc-card">
          <h2 style={{ margin: "0 0 12px", fontSize: "1.0625rem" }}>Keyword Discovery Engine</h2>
          <div className="cc-empty">
            No topics computed yet. This runs weekly from the daily snapshot cron (self-gated) — trigger it manually
            via <code>POST /api/command-center/snapshot</code> to compute the first batch now.
          </div>
        </div>
      ) : (
        <>
          <div className="cc-card">
            <h2 style={{ margin: "0 0 4px", fontSize: "1.0625rem" }}>🎯 Next 10 highest-ROI pieces</h2>
            <p style={{ margin: "0 0 12px", fontSize: "0.8125rem", color: "var(--cc-text-muted)" }}>
              Your prioritized content queue — start at the top.
            </p>
            <TopicTable topics={queue} ranked />
          </div>

          <div className="cc-card">
            <h2 style={{ margin: "0 0 4px", fontSize: "1.0625rem" }}>All discovered topics</h2>
            <p style={{ margin: "0 0 12px", fontSize: "0.8125rem", color: "var(--cc-text-muted)" }}>
              {topics.length} topic{topics.length === 1 ? "" : "s"} clustered from autocomplete suggestions, sorted by
              score.{" "}
              {linkedCount > 0 &&
                `${linkedCount} ${linkedCount === 1 ? "is" : "are"} now confirmed by real Search Console data (🔗).`}
            </p>
            <TopicTable topics={topics} />
          </div>
        </>
      )}
    </div>
  );
}
