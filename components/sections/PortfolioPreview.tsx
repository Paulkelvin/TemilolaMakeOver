import { getPortfolioItems } from "@/sanity/fetch";
import { homeCopy } from "@/data/copy";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SectionWrapper } from "@/components/ui/BackgroundDecor";
import { Reveal } from "@/components/ui/Reveal";
import { PortfolioPreviewClient } from "./PortfolioPreviewClient";

const copy = homeCopy.portfolio;

export async function PortfolioPreview() {
  const portfolioItems = await getPortfolioItems();

  return (
    <SectionWrapper id="portfolio-preview" className="py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <SectionHeading
          label={copy.label}
          title={copy.headline}
          subtitle={copy.paragraph}
          compact
        />
        <PortfolioPreviewClient
          items={portfolioItems}
          footnote={copy.footnote}
          ctaLabel={copy.cta}
        />
      </div>
    </SectionWrapper>
  );
}
