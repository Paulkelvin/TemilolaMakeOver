import { PhasePlaceholder } from "@/components/command-center/PhasePlaceholder";

export default function WebsitePage() {
  return (
    <PhasePlaceholder
      title="Website"
      dek="How the site itself is performing — deploys, Core Web Vitals, and traffic by channel, all in one place instead of split across Vercel and GA4."
      phase="Phase 4"
      willShow={[
        "Latest deployment and build status (Vercel API)",
        "Core Web Vitals from Vercel Speed Insights field data",
        "Organic, direct, and referral traffic (GA4 Data API)",
        "Broken links, 404s, and image optimization audit",
      ]}
    />
  );
}
