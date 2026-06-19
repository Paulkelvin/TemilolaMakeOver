import { packages } from "@/data/packages";
import { homeCopy } from "@/data/copy";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SectionWrapper } from "@/components/ui/BackgroundDecor";
import { PricingCard } from "./PricingCard";
import { Button } from "@/components/ui/Button";
import { Reveal, StaggerGrid, StaggerItem } from "@/components/ui/Reveal";

const previewPackages = packages.filter(
  (p) => !["bridesmaids", "home-service"].includes(p.id)
);
const copy = homeCopy.pricing;

export function PricingPreview() {
  return (
    <SectionWrapper id="pricing" variant="blush">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <SectionHeading
          label={copy.label}
          title={copy.headline}
          subtitle={copy.intro}
        />

        <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {previewPackages.map((pkg) => (
            <StaggerItem key={pkg.id}>
              <PricingCard pkg={pkg} />
            </StaggerItem>
          ))}
        </StaggerGrid>

        <Reveal className="mt-8 text-center">
          <p className="text-sm text-text-muted mb-4">{copy.note}</p>
          <Button href="/pricing" variant="secondary" size="lg">
            {copy.cta}
          </Button>
        </Reveal>
      </div>
    </SectionWrapper>
  );
}
