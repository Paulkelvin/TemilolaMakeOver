import Image from "next/image";
import { getServices, getFaqItems } from "@/sanity/fetch";
import { servicesPageCopy, seoCopy } from "@/data/copy";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { createPageMetadata } from "@/lib/metadata";
import { formatPrice } from "@/lib/utils";
import { PageHero } from "@/components/sections/PageHero";
import { SectionWrapper } from "@/components/ui/BackgroundDecor";
import { FAQAccordion } from "@/components/sections/FAQAccordion";
import { CTASection } from "@/components/sections/CTASection";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { Container } from "@/components/ui/Container";
import { StaggerGrid, StaggerItem } from "@/components/ui/Reveal";
import { ServiceCard } from "@/components/sections/ServiceCard";
import { Check, Clock, Home } from "lucide-react";
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
          <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s) => (
              <StaggerItem key={s.id}>
                <ServiceCard service={s} ctaText={homeCopy.services.cardCta} />
              </StaggerItem>
            ))}
          </StaggerGrid>
        </Container>
      </SectionWrapper>

      <SectionWrapper>
        <Container size="narrow">
          <Reveal className="text-center mb-16">
            <h2 className="font-display text-2xl md:text-3xl text-text-primary">
              {copy.intro.title}
            </h2>
            <p className="mt-4 text-text-muted leading-relaxed">{copy.intro.body}</p>
          </Reveal>
        </Container>
      </SectionWrapper>

      {services.map((service, index) => {
        const imageUrl = (service as { imageUrl?: string }).imageUrl;
        const whatsappUrl = buildWhatsAppUrl({
          intent: "service",
          service: service.name,
        });

        return (
          <SectionWrapper
            key={service.id}
            id={service.slug}
            variant={index % 2 === 0 ? "cream" : "blush"}
          >
            <Container>
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <Reveal className={index % 2 === 1 ? "lg:order-2" : ""}>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-gold mb-3">
                    {service.name}
                  </p>
                  <h2 className="font-display text-3xl md:text-4xl font-medium text-text-primary">
                    {service.description}
                  </h2>
                  <p className="mt-3 text-sm text-accent-gold font-medium">
                    Best for: {service.bestFor}
                  </p>
                  <p className="mt-4 text-text-muted leading-relaxed">
                    <strong className="text-text-primary">Ideal for:</strong>{" "}
                    {service.whoFor}
                  </p>

                  <ul className="mt-6 space-y-2">
                    <li className="text-sm font-medium text-text-primary">
                      What&apos;s included:
                    </li>
                    {service.included.map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-2 text-sm text-text-muted"
                      >
                        <Check className="w-4 h-4 text-accent-gold" />
                        {item}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 flex flex-wrap gap-4 text-sm text-text-muted">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-accent-rose" />
                      {service.duration}
                    </span>
                    {service.homeService && (
                      <span className="flex items-center gap-1.5">
                        <Home className="w-4 h-4 text-accent-rose" />
                        Home service available
                      </span>
                    )}
                    {service.priceFrom && (
                      <span className="font-medium text-accent-rose">
                        From {formatPrice(service.priceFrom)}
                      </span>
                    )}
                  </div>

                  <div className="mt-8 flex flex-wrap gap-3">
                    <Button href={whatsappUrl} external variant="primary" size="lg">
                      Book This Service
                    </Button>
                    <Button
                      href={buildWhatsAppUrl({ intent: "quote" })}
                      external
                      variant="secondary"
                      size="lg"
                    >
                      Request Quote
                    </Button>
                  </div>
                </Reveal>

                <Reveal
                  delay={0.1}
                  className={index % 2 === 1 ? "lg:order-1" : ""}
                >
                  <div className="relative aspect-[4/5] rounded-3xl overflow-hidden border border-border shadow-lg">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={`${service.name} — Temilola Makeup Lagos`}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-bg-blush flex items-center justify-center">
                        <span className="text-text-muted text-sm">{service.name}</span>
                      </div>
                    )}
                  </div>
                </Reveal>
              </div>
            </Container>
          </SectionWrapper>
        );
      })}

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
