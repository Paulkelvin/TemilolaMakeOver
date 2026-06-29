import { getTestimonials } from "@/sanity/fetch";
import { homeCopy } from "@/data/copy";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SectionWrapper } from "@/components/ui/BackgroundDecor";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { TestimonialsMarquee } from "@/components/ui/TestimonialsMarquee";

const copy = homeCopy.testimonials;

export async function Testimonials() {
  const testimonials = await getTestimonials();

  return (
    <SectionWrapper id="testimonials" className="overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <SectionHeading
          label={copy.label}
          title={copy.headline}
          subtitle={copy.intro}
        />
      </div>

      <TestimonialsMarquee items={testimonials} />

      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <Reveal className="mt-10 text-center">
          <p className="text-text-muted mb-4">{copy.ctaIntro}</p>
          <Button href="/book#booking-form" variant="primary" size="lg">
            {copy.cta}
          </Button>
        </Reveal>
      </div>
    </SectionWrapper>
  );
}
