import { getPortfolioItems } from "@/sanity/fetch";
import type { PageCopySection } from "@/sanity/fetch";
import { homeCopy } from "@/data/copy";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SectionWrapper } from "@/components/ui/BackgroundDecor";
import { PortfolioPreviewClient } from "./PortfolioPreviewClient";

const defaults = homeCopy.portfolio;

interface PortfolioPreviewProps {
  sectionCopy?: PageCopySection;
}

export async function PortfolioPreview({ sectionCopy }: PortfolioPreviewProps) {
  const portfolioItems = await getPortfolioItems();

  return (
    <SectionWrapper id="portfolio-preview" className="py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <SectionHeading
          label={sectionCopy?.label ?? defaults.label}
          title={sectionCopy?.headline ?? defaults.headline}
          subtitle={sectionCopy?.paragraph ?? defaults.paragraph}
          compact
        />
        <PortfolioPreviewClient
          items={portfolioItems}
          footnote={sectionCopy?.footnote ?? defaults.footnote}
          ctaLabel={sectionCopy?.cta ?? defaults.cta}
        />
      </div>
    </SectionWrapper>
  );
}
