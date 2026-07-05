import { PhasePlaceholder } from "@/components/command-center/PhasePlaceholder";

export default function NotificationsPage() {
  return (
    <PhasePlaceholder
      title="Notifications"
      dek="Event-sourced, not generic — each notification maps to a real trigger already wired into this codebase."
      phase="Phase 5"
      willShow={[
        "Booking received / payment confirmed (Paystack webhook)",
        "Deployment failure (Vercel webhook)",
        "Ranking drop / indexing issue (Search Console snapshot diff)",
        "Missing tags, missing portfolio, schema issues (Content Intelligence gap detection)",
        "New review, Weekly Business Review ready",
      ]}
    />
  );
}
