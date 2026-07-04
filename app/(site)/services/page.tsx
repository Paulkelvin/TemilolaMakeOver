import { getServices, getFaqItemsByCategory } from "@/sanity/fetch";
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
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";

export const metadata = createPageMetadata({
  title: seoCopy.services.title,
  description: seoCopy.services.description,
  path: "/services",
});

export default async function ServicesPage() {
  const { getPageCopy } = await import("@/sanity/fetch");
  const [services, faqItems, pageCopy] = await Promise.all([getServices(), getFaqItemsByCategory("general"), getPageCopy("services")]);
  const copy = servicesPageCopy;

  return (
    <>
      <PageHero
        label={copy.hero.label}
        title={pageCopy.heroTitle ?? copy.hero.title}
        subtitle={pageCopy.heroSubtitle ?? copy.hero.subtitle}
      />

      <SectionWrapper variant="blush" decor={false}>
        <Container>
          <SectionHeading
            label={copy.hero.label}
            title="Our Services"
            subtitle="Explore every service and find the perfect fit for your event or occasion."
            compact
          />
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
          <Reveal className="mb-12 rounded-2xl border border-border bg-bg-blush p-6 md:p-8">
            <h3 className="font-display text-xl md:text-2xl text-text-primary mb-3">
              Not sure which look is right for you?
            </h3>
            <p className="text-sm text-text-muted leading-relaxed mb-4">
              Read our popular guides to help you decide:
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/blog/soft-glam-vs-bold-glam-choosing-your-event-look" className="text-sm font-medium text-accent-rose hover:underline">
                Soft Glam vs Bold Glam →
              </Link>
              <span className="text-border">·</span>
              <Link href="/blog/what-is-soft-glam-makeup" className="text-sm font-medium text-accent-rose hover:underline">
                What Is Soft Glam? →
              </Link>
              <span className="text-border">·</span>
              <Link href="/blog/preparing-your-skin-before-makeup-application" className="text-sm font-medium text-accent-rose hover:underline">
                How to Prep Your Skin →
              </Link>
              <span className="text-border">·</span>
              <Link href="/blog/complete-skin-prep-routine-for-flawless-makeup" className="text-sm font-medium text-accent-rose hover:underline">
                Full Skin Prep Routine →
              </Link>
            </div>
          </Reveal>

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
