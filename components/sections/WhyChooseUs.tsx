import Image from "next/image";
import { getWhyChooseUs, getPortfolioItems } from "@/sanity/fetch";
import type { PageCopySection } from "@/sanity/fetch";
import { homeCopy } from "@/data/copy";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SectionWrapper } from "@/components/ui/BackgroundDecor";
import { Reveal } from "@/components/ui/Reveal";
import { WhyUsCardMarquee } from "@/components/ui/WhyUsCardMarquee";

const defaults = homeCopy.whyChooseUs;

interface WhyChooseUsProps {
  aboutImageUrl?: string;
  sectionCopy?: PageCopySection;
}

export async function WhyChooseUs({ aboutImageUrl, sectionCopy }: WhyChooseUsProps) {
  const [items, portfolioItems] = await Promise.all([
    getWhyChooseUs(),
    getPortfolioItems(),
  ]);

  const fallbackImage = portfolioItems[2] ?? portfolioItems[0];
  const imageSrc = aboutImageUrl ?? fallbackImage?.src;

  return (
    <SectionWrapper id="why-us" className="py-12 md:py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <SectionHeading
          label={sectionCopy?.label ?? defaults.label}
          title={sectionCopy?.headline ?? defaults.headline}
          subtitle={sectionCopy?.paragraph ?? defaults.paragraph}
          align="left"
          compact
        />
      </div>

      <WhyUsCardMarquee items={items} />

      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 mt-8 md:mt-12">
        {imageSrc && (
          <Reveal>
            <div className="relative w-full aspect-[16/10] sm:aspect-[16/8] lg:aspect-[16/7] max-h-[480px] rounded-3xl overflow-hidden shadow-xl border border-border corner-accent">
              <Image
                src={imageSrc}
                alt="Professional makeup application — Gleam by Temi, Lagos"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1200px"
                className="object-cover"
              />
            </div>
          </Reveal>
        )}
      </div>
    </SectionWrapper>
  );
}
