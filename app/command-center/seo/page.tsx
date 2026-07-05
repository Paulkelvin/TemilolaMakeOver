import { PhasePlaceholder } from "@/components/command-center/PhasePlaceholder";

export default function SeoPage() {
  return (
    <PhasePlaceholder
      title="SEO"
      dek="Indexing, rankings, and search performance from Search Console, plus the missing-metadata/OG/structured-data audit already performed on this codebase."
      phase="Phase 4"
      willShow={[
        "Indexed pages, impressions, clicks, CTR, rankings",
        "Top pages, declining pages, growing pages",
        "Missing metadata, Open Graph, and structured data",
        "Internal linking opportunities and sitemap/redirect health",
      ]}
    />
  );
}
