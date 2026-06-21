import { getBookingSteps } from "@/sanity/fetch";
import { homeCopy } from "@/data/copy";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SectionWrapper } from "@/components/ui/BackgroundDecor";
import { Button } from "@/components/ui/Button";
import { Reveal, StaggerGrid, StaggerItem } from "@/components/ui/Reveal";

const copy = homeCopy.bookingProcess;

export async function BookingProcess() {
  const bookingSteps = await getBookingSteps();

  return (
    <SectionWrapper id="how-it-works">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <SectionHeading
          label={copy.label}
          title={copy.headline}
          subtitle={copy.intro}
        />

        <StaggerGrid className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {bookingSteps.map((step) => (
            <StaggerItem key={step.id}>
              <div className="relative rounded-2xl border border-border bg-card p-8 text-center hover:shadow-lg transition-all duration-500">
                <span className="inline-flex w-12 h-12 items-center justify-center rounded-full bg-accent-rose/10 text-accent-rose font-display text-xl font-semibold mb-4">
                  {step.step}
                </span>
                <h3 className="font-display text-xl font-medium text-text-primary">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm text-text-muted leading-relaxed">
                  {step.description}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGrid>

        <Reveal className="mt-10 text-center">
          <Button href="/book" variant="primary" size="lg">
            {copy.cta}
          </Button>
        </Reveal>
      </div>
    </SectionWrapper>
  );
}
