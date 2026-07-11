import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticleBriefByTopicKey } from "@/lib/intelligence/editorial-brief";
import { VerifyDraftForm } from "@/components/command-center/VerifyDraftForm";

export default async function VerifyDraftPage({
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
        <Link href={`/command-center/editorial/${topicKey}`} style={{ color: "var(--cc-text-muted)", fontSize: "0.8125rem" }}>
          &larr; {brief.topicLabel}
        </Link>
      </p>
      <h1 className="cc-page-title">Verify Draft</h1>
      <p className="cc-page-dek">
        Paste the finished draft below. This never touches Sanity — it&rsquo;s a check, not a publish action. Nothing
        is auto-rewritten and no evidence is invented; unsubstantiated claims are flagged for you to fill in with
        something real.
      </p>
      <VerifyDraftForm
        topicKey={topicKey}
        defaultSourceMaterial={brief.sourceMaterial ?? ""}
        hasLinkedBlogPost={Boolean(brief.linkedBlogPost?._ref)}
      />
    </div>
  );
}
