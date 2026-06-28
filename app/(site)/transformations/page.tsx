import { getTransformations } from "@/sanity/fetch";
import { createPageMetadata } from "@/lib/metadata";
import { PageHero } from "@/components/sections/PageHero";
import { SectionWrapper } from "@/components/ui/BackgroundDecor";
import { Container } from "@/components/ui/Container";
import { BeforeAfterSlider } from "@/components/sections/BeforeAfterSlider";
import { CTASection } from "@/components/sections/CTASection";

export const metadata = createPageMetadata({
  title: "Before & After Transformations | Temilola Makeup",
  description:
    "Drag to compare real before and after makeup transformations by Temilola Makeup in Lagos. Bridal, soft glam, event, and photoshoot results.",
  path: "/transformations",
});

export default async function TransformationsPage() {
  const transformations = await getTransformations();

  return (
    <>
      <PageHero
        label="Before & After"
        title="Real Transformations You Can Drag to Compare"
        subtitle="Drag the slider to reveal the full before and after in the same frame."
      />

      <SectionWrapper>
        <Container>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {transformations.map((pair) => (
              <BeforeAfterSlider
                key={pair.id}
                before={{ src: pair.beforeUrl, alt: pair.beforeAlt, position: pair.beforePosition }}
                after={{ src: pair.afterUrl, alt: pair.afterAlt, position: pair.afterPosition }}
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
