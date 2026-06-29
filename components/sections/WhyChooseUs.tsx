import Image from "next/image";
import { getWhyChooseUs, getPortfolioItems } from "@/sanity/fetch";
import { homeCopy } from "@/data/copy";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SectionWrapper } from "@/components/ui/BackgroundDecor";
import { Reveal, StaggerGrid, StaggerItem } from "@/components/ui/Reveal";
import { Sparkles } from "lucide-react";

const copy = homeCopy.whyChooseUs;

export async function WhyChooseUs() {
  const [items, portfolioItems] = await Promise.all([
    getWhyChooseUs(),
    getPortfolioItems(),
  ]);
  const aboutImage = portfolioItems[2] ?? portfolioItems[0];

  return (
    <SectionWrapper id="why-us" className="py-12 md:py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div>
            <SectionHeading
              label={copy.label}
              title={copy.headline}
              subtitle={copy.paragraph}
              align="left"
              compact
            />
            <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {items.map((item) => (
                <StaggerItem key={item.id}>
                  <div className="rounded-xl border border-border bg-card p-5 hover:shadow-md transition-shadow duration-300">
                    <Sparkles className="w-4 h-4 text-accent-gold mb-3" strokeWidth={1.5} />
                    <h3 className="font-medium text-text-primary">{item.title}</h3>
                    <p className="mt-1 text-sm text-text-muted">{item.description}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerGrid>
          </div>

          {aboutImage?.src && (
            <Reveal>
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-xl border border-border corner-accent">
                <Image
                  src={aboutImage.src}
                  alt="Professional makeup application — Gleam by Temi, Lagos"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </Reveal>
          )}
        </div>
      </div>
    </SectionWrapper>
  );
}
