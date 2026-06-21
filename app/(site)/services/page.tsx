import { getServices, getFaqItems } from "@/sanity/fetch";
import { servicesPageCopy, seoCopy } from "@/data/copy";
import { createPageMetadata } from "@/lib/metadata";
import { PageHero } from "@/components/sections/PageHero";
import { SectionWrapper } from "@/components/ui/BackgroundDecor";
import { FAQAccordion } from "@/components/sections/FAQAccordion";
import { CTASection } from "@/components/sections/CTASection";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Container } from "@/components/ui/Container";
import { StaggerGrid, StaggerItem } from "@/components/ui/Reveal";
import { ServiceCard } from "@/components/sections/ServiceCard";
import { homeCopy } from "@/data/copy";

export const metadata = createPageMetadata({
  title: seoCopy.services.title,
  description: seoCopy.services.description,
  path: "/services",
});

export default async function ServicesPage() {
  const [services, faqItems] = await Promise.all([getServices(), getFaqItems()]);
  const copy = servicesPageCopy;

  return (
    <>
      <PageHero
        label={copy.hero.label}
        title={copy.hero.title}
        subtitle={copy.hero.subtitle}
      />

      <SectionWrapper variant="blush" decor={false}>
        <Container>
          <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {services.map((s) => (
              <StaggerItem key={s.id}>
                <ServiceCard service={s} ctaText={homeCopy.services.cardCta} />
              </StaggerItem>
            ))}
          </StaggerGrid>
        </Container>
      </SectionWrapper>

      <SectionWrapper>
        <Container>
          <SectionHeading
            label="FAQ"
            title="Common Questions About Services"
            subtitle="Still deciding? These answers help most clients choose with confidence."
          />
          <FAQAccordion items={faqItems.slice(0, 6)} />
        </Container>
      </SectionWrapper>

      <CTASection
        title={copy.finalCta.headline}
        subtitle={copy.finalCta.subtitle}
        location="services_page"
      />
    </>
  );
}
