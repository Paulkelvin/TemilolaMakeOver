import { createPageMetadata } from "@/lib/metadata";
import { portfolioItems } from "@/data/portfolio";
import { PageHero } from "@/components/sections/PageHero";
import { SectionWrapper } from "@/components/ui/BackgroundDecor";
import { Container } from "@/components/ui/Container";
import { BeforeAfterSlider } from "@/components/sections/BeforeAfterSlider";
import { CTASection } from "@/components/sections/CTASection";

const beforeItems = portfolioItems.filter((item) => item.category === "Before & After");

const sliderPairs = [
  { before: beforeItems[0] ?? portfolioItems[8], after: portfolioItems[0] },
  { before: beforeItems[1] ?? portfolioItems[11], after: portfolioItems[1] },
  { before: portfolioItems[9], after: portfolioItems[4] },
  { before: portfolioItems[7], after: portfolioItems[3] },
  { before: portfolioItems[6], after: portfolioItems[2] },
  { before: portfolioItems[10], after: portfolioItems[5] },
];

export const metadata = createPageMetadata({
  title: "Before & After Transformations | Temilola Makeup",
  description:
    "Drag to compare real before and after makeup transformations by Temilola Makeup in Lagos. Bridal, soft glam, event, and photoshoot results.",
  path: "/transformations",
});

export default function TransformationsPage() {
  return (
    <>
      <PageHero
        label="Before & After"
        title="Real Transformations You Can Drag to Compare"
        subtitle="Slide each image to see full before and full after in the same frame. Use the magnifier for close details."
      />

      <SectionWrapper>
        <Container>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {sliderPairs.map((pair, index) => (
              <BeforeAfterSlider
                key={`${pair.before.id}-${pair.after.id}-${index}`}
                before={{
                  src: pair.before.src,
                  alt: `Before makeup — ${pair.before.title}`,
                }}
                after={{
                  src: pair.after.src,
                  alt: `After makeup — ${pair.after.title}`,
                }}
              />
            ))}
          </div>
        </Container>
      </SectionWrapper>

      <CTASection
        location="transformations_page"
        title="Want This Kind of Result for Your Date?"
        subtitle="Send your date, location, and preferred look. We'll confirm availability quickly."
      />
    </>
  );
}

