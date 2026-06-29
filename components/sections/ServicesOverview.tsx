import Link from "next/link";
import { getServices } from "@/sanity/fetch";
import type { PageCopySection } from "@/sanity/fetch";
import { homeCopy } from "@/data/copy";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SectionWrapper } from "@/components/ui/BackgroundDecor";
import { ServiceCard } from "./ServiceCard";
import { StaggerGrid, StaggerItem } from "@/components/ui/Reveal";

const defaults = homeCopy.services;

interface ServicesOverviewProps {
  sectionCopy?: PageCopySection;
}

export async function ServicesOverview({ sectionCopy }: ServicesOverviewProps) {
  const services = await getServices();

  return (
    <SectionWrapper id="services" variant="blush" className="py-12 md:py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <SectionHeading
          label={sectionCopy?.label ?? defaults.label}
          title={sectionCopy?.headline ?? defaults.headline}
          subtitle={sectionCopy?.intro ?? defaults.intro}
          compact
        />
        <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <StaggerItem key={service.id} className={i >= 3 ? "hidden md:block" : undefined}>
              <ServiceCard service={service} ctaText={sectionCopy?.cta ?? defaults.cardCta} />
            </StaggerItem>
          ))}
        </StaggerGrid>

        {services.length > 3 && (
          <div className="mt-8 text-center md:hidden">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 rounded-full border border-accent-rose text-accent-rose px-6 py-3 text-sm font-medium hover:bg-accent-rose hover:text-white transition-colors"
            >
              View All Services
            </Link>
          </div>
        )}
      </div>
    </SectionWrapper>
  );
}
