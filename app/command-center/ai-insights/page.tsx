import { PhasePlaceholder } from "@/components/command-center/PhasePlaceholder";

export default function AiInsightsPage() {
  return (
    <PhasePlaceholder
      title="AI Insights"
      dek="One engine, three surfaces: a ranked list of every candidate action (Opportunity Engine), a proactive daily brief (AI Business Advisor), and the Weekly Business Review report archive."
      phase="Phase 5"
      willShow={[
        "Opportunity Engine — ranked recommendations with banded impact and confidence tier",
        "AI Business Advisor — the single highest-impact action each morning, in plain language",
        "Weekly Business Review — revenue, bookings, SEO, content and portfolio growth, technical health, biggest opportunities and risks",
        "Real, event-sourced notifications replacing this placeholder",
      ]}
    />
  );
}
