import { services } from "@/data/services";
import { homeCopy } from "@/data/copy";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SectionWrapper } from "@/components/ui/BackgroundDecor";
import { ServiceCard } from "./ServiceCard";
import { StaggerGrid, StaggerItem } from "@/components/ui/Reveal";

const copy = homeCopy.services;

export function ServicesOverview() {
  return (
    <SectionWrapper id="services" variant="blush" className="py-12 md:py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <SectionHeading
          label={copy.label}
          title={copy.headline}
          subtitle={copy.intro}
          compact
        />
        <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <StaggerItem key={service.id}>
              <ServiceCard service={service} ctaText={copy.cardCta} />
            </StaggerItem>
          ))}
        </StaggerGrid>
      </div>
    </SectionWrapper>
  );
}
