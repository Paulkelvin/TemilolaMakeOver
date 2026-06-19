import { bookPageCopy, seoCopy } from "@/data/copy";
import { createPageMetadata } from "@/lib/metadata";
import { PageHero } from "@/components/sections/PageHero";
import { SectionWrapper } from "@/components/ui/BackgroundDecor";
import { BookingForm } from "@/components/forms/BookingForm";
import { ContactCard } from "@/components/sections/ContactCard";
import { Reveal } from "@/components/ui/Reveal";
import { Container } from "@/components/ui/Container";

export const metadata = createPageMetadata({
  title: seoCopy.book.title,
  description: seoCopy.book.description,
  path: "/book",
});

export default function BookPage() {
  const copy = bookPageCopy;

  return (
    <>
      <PageHero
        label={copy.hero.label}
        title={copy.hero.title}
        subtitle={copy.hero.subtitle}
      />

      <SectionWrapper>
        <Container>
          <div className="grid lg:grid-cols-5 gap-10 lg:gap-12">
            <div className="lg:col-span-3">
              <Reveal>
                <h2 className="font-display text-2xl text-text-primary mb-2">
                  {copy.form.title}
                </h2>
                <p className="text-sm text-text-muted mb-6">{copy.form.intro}</p>
                <BookingForm />
              </Reveal>
            </div>
            <div className="lg:col-span-2">
              <Reveal delay={0.1}>
                <ContactCard />
              </Reveal>
            </div>
          </div>
        </Container>
      </SectionWrapper>

      <SectionWrapper variant="blush">
        <Container size="narrow">
          <Reveal className="text-center">
            <h2 className="font-display text-2xl md:text-3xl text-text-primary mb-4">
              {copy.afterSubmit.title}
            </h2>
            <div className="grid md:grid-cols-3 gap-6 text-left mt-8">
              {copy.afterSubmit.steps.map((step, i) => (
                <div
                  key={step}
                  className="rounded-xl border border-border bg-card p-6"
                >
                  <span className="text-accent-rose font-display text-lg font-semibold">
                    0{i + 1}
                  </span>
                  <p className="mt-2 text-sm text-text-muted leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </Container>
      </SectionWrapper>
    </>
  );
}
