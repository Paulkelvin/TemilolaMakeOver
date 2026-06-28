import { Star } from "lucide-react";
import { getTestimonials } from "@/sanity/fetch";
import { homeCopy } from "@/data/copy";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SectionWrapper } from "@/components/ui/BackgroundDecor";
import { Button } from "@/components/ui/Button";
import { Reveal, StaggerGrid, StaggerItem } from "@/components/ui/Reveal";

const copy = homeCopy.testimonials;

export async function Testimonials() {
  const testimonials = await getTestimonials();

  return (
    <SectionWrapper id="testimonials">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <SectionHeading
          label={copy.label}
          title={copy.headline}
          subtitle={copy.intro}
        />

        <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((t) => (
            <StaggerItem key={t.id}>
              <blockquote className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow duration-300 h-full flex flex-col">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-accent-gold text-accent-gold"
                    />
                  ))}
                </div>
                <p className="text-text-primary leading-relaxed flex-grow">
                  &ldquo;{t.text}&rdquo;
                </p>
                <footer className="mt-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-bg-blush flex items-center justify-center text-sm font-medium text-accent-rose">
                    {t.initials}
                  </div>
                  <div>
                    <cite className="not-italic font-medium text-text-primary text-sm">
                      {t.name}
                    </cite>
                    <p className="text-xs text-text-muted">{t.event}</p>
                  </div>
                </footer>
              </blockquote>
            </StaggerItem>
          ))}
        </StaggerGrid>

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
