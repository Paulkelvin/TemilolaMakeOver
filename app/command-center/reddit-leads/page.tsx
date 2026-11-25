import leadsData from "@/docs/reddit-seo/leads.json";
import { RedditLeadsClient, type RedditLead } from "@/components/command-center/RedditLeadsClient";

export const metadata = {
  title: "Reddit Leads | Gleam by Temi",
  robots: { index: false, follow: false },
};

export default function RedditLeadsPage() {
  return (
    <RedditLeadsClient
      updatedAt={leadsData.updatedAt}
      leads={leadsData.leads as RedditLead[]}
    />
  );
}
