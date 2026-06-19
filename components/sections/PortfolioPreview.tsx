import Image from "next/image";
import { portfolioItems } from "@/data/portfolio";
import { homeCopy } from "@/data/copy";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SectionWrapper } from "@/components/ui/BackgroundDecor";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

const previewItems = portfolioItems.slice(0, 6);
const copy = homeCopy.portfolio;

export function PortfolioPreview() {
  return (
    <SectionWrapper id="portfolio-preview" className="py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <SectionHeading
          label={copy.label}
          title={copy.headline}
          subtitle={copy.paragraph}
          compact
        />

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {previewItems.map((item, i) => (
            <Reveal
              key={item.id}
              delay={i * 0.05}
              className={
                i === 0 ? "col-span-2 md:col-span-1 md:row-span-2" : ""
              }
            >
              <div
                className={`group relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm hover:shadow-lg transition-all duration-500 ${
                  i === 0 ? "aspect-[4/3] md:aspect-[3/4]" : "aspect-square"
                }`}
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes={
                    i === 0
                      ? "(max-width: 768px) 50vw, 33vw"
                      : "(max-width: 768px) 50vw, 25vw"
                  }
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-luxury-dark/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <p className="text-white text-sm font-medium">{item.title}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-10 text-center">
          <p className="text-sm text-text-muted mb-4">{copy.footnote}</p>
          <Button href="/portfolio" variant="secondary" size="lg">
            {copy.cta}
          </Button>
        </Reveal>
      </div>
    </SectionWrapper>
  );
}
