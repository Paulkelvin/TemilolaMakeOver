import { getTestimonials } from "@/sanity/fetch";
import type { PageCopySection } from "@/sanity/fetch";
import { homeCopy } from "@/data/copy";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SectionWrapper } from "@/components/ui/BackgroundDecor";
import { Reveal } from "@/components/ui/Reveal";
import { TestimonialsMarquee } from "@/components/ui/TestimonialsMarquee";
import { CheckAvailabilityButton } from "@/components/ui/CheckAvailabilityButton";

const defaults = homeCopy.testimonials;

interface TestimonialsProps {
  sectionCopy?: PageCopySection;
  blockedDates?: string[];
}

export async function Testimonials({ sectionCopy, blockedDates = [] }: TestimonialsProps) {
  const testimonials = await getTestimonials();

  return (
    <SectionWrapper id="testimonials" className="overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <SectionHeading
          label={sectionCopy?.label ?? defaults.label}
          title={sectionCopy?.headline ?? defaults.headline}
          subtitle={sectionCopy?.intro ?? defaults.intro}
        />
      </div>

      <TestimonialsMarquee items={testimonials} />

      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <Reveal className="mt-10 text-center">
          <p className="text-text-muted mb-4">{defaults.ctaIntro}</p>
          <CheckAvailabilityButton
            blockedDates={blockedDates}
            label={sectionCopy?.cta ?? defaults.cta}
            analyticsLabel="testimonials_section"
          />
        </Reveal>
      </div>
    </SectionWrapper>
  );
}
