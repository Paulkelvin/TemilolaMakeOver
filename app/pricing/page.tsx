import { packages, pricingFactors } from "@/data/packages";
import { siteConfig } from "@/lib/site-config";
import { pricingPageCopy, seoCopy } from "@/data/copy";
import { createPageMetadata } from "@/lib/metadata";
import { PageHero } from "@/components/sections/PageHero";
import { SectionWrapper } from "@/components/ui/BackgroundDecor";
import { PricingCard } from "@/components/sections/PricingCard";
import { FAQSection } from "@/components/sections/FAQSection";
import { CTASection } from "@/components/sections/CTASection";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal, StaggerGrid, StaggerItem } from "@/components/ui/Reveal";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export const metadata = createPageMetadata({
  title: seoCopy.pricing.title,
  description: seoCopy.pricing.description,
  path: "/pricing",
});

export default function PricingPage() {
  const copy = pricingPageCopy;
  const quoteUrl = buildWhatsAppUrl({ intent: "quote" });

  return (
    <>
      <PageHero
        label={copy.hero.label}
        title={copy.hero.title}
        subtitle={copy.hero.subtitle}
      />

      <SectionWrapper variant="blush">
        <Container>
          <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <StaggerItem key={pkg.id}>
                <PricingCard pkg={pkg} />
              </StaggerItem>
            ))}
          </StaggerGrid>

          <Reveal className="mt-12 rounded-2xl border border-border bg-card p-6 md:p-8 text-center">
            <p className="text-sm text-text-muted">{siteConfig.pricingDisclaimer}</p>
          </Reveal>
        </Container>
      </SectionWrapper>

      <SectionWrapper>
        <Container>
          <div className="grid md:grid-cols-2 gap-12">
            <Reveal>
              <SectionHeading
                label="Pricing Guide"
                title={copy.explanation.title}
                align="left"
              />
              <p className="text-text-muted leading-relaxed -mt-8 mb-6">
                {copy.explanation.body}
              </p>
              <ul className="space-y-3">
                {pricingFactors.map((factor) => (
                  <li
                    key={factor}
                    className="flex items-start gap-2 text-sm text-text-muted"
                  >
                    <span className="text-accent-gold mt-1">—</span>
                    {factor}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="space-y-6">
                <div className="rounded-2xl border border-border bg-bg-blush p-6">
                  <h3 className="font-display text-xl text-text-primary">
                    {copy.deposit.title}
                  </h3>
                  <p className="mt-2 text-sm text-text-muted leading-relaxed">
                    {copy.deposit.body}
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-card p-6">
                  <h3 className="font-display text-xl text-text-primary">
                    {copy.travel.title}
                  </h3>
                  <p className="mt-2 text-sm text-text-muted leading-relaxed">
                    {copy.travel.body}
                  </p>
                </div>
              </div>
            </Reveal>
          </div>

          <Reveal className="mt-12 text-center">
            <Button href={quoteUrl} external variant="primary" size="lg">
              {copy.finalCta.cta}
            </Button>
          </Reveal>
        </Container>
      </SectionWrapper>

      <FAQSection limit={6} />
      <CTASection
        title={copy.finalCta.headline}
        subtitle={copy.finalCta.subtitle}
        location="pricing_page"
      />
    </>
  );
}
