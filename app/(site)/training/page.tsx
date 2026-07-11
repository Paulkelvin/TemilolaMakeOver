import { getTrainingCourses } from "@/sanity/fetch";
import { seoCopy, trainingPageCopy } from "@/data/copy";
import { createPageMetadata } from "@/lib/metadata";
import { PageHero } from "@/components/sections/PageHero";
import { SectionWrapper } from "@/components/ui/BackgroundDecor";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TrainingTierCard } from "@/components/sections/TrainingTierCard";
import { FAQSection } from "@/components/sections/FAQSection";
import { CTASection } from "@/components/sections/CTASection";
import { Reveal, StaggerGrid, StaggerItem } from "@/components/ui/Reveal";
import { Container } from "@/components/ui/Container";
import { Check } from "lucide-react";
import Link from "next/link";

export const metadata = createPageMetadata({
  title: seoCopy.training.title,
  description: seoCopy.training.description,
  path: "/training",
});

export default async function TrainingPage() {
  const copy = trainingPageCopy;
  const sanityTiers = await getTrainingCourses();

  const tiers =
    sanityTiers.length > 0
      ? sanityTiers.map((c) => ({
          level: c.level,
          title: c.title,
          description: c.description,
          price: c.price,
          duration: c.duration,
          classSize: c.classSize,
          certification: c.certification,
          curriculum: c.curriculum,
        }))
      : copy.staticTiers;

  return (
    <>
      <PageHero
        label={copy.hero.label}
        title={copy.hero.title}
        subtitle={copy.hero.subtitle}
      />

      <SectionWrapper>
        <Container>
          <Reveal>
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="font-display text-2xl md:text-3xl font-medium text-text-primary mb-4">
                {copy.intro.title}
              </h2>
              <p className="text-text-muted leading-relaxed">
                {copy.intro.body}
              </p>
              <p className="text-text-muted leading-relaxed mt-4">
                New to makeup? Try our free{" "}
                <Link
                  href="/blog/soft-glam-makeup-tutorial-step-by-step"
                  className="text-accent-rose font-medium hover:underline"
                >
                  step-by-step soft glam tutorial
                </Link>{" "}
                first to get a feel for the techniques before you enroll.
              </p>
            </div>
          </Reveal>

          <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tiers.map((tier, i) => (
              <StaggerItem key={tier.title}>
                <TrainingTierCard tier={tier} featured={i === 1} />
              </StaggerItem>
            ))}
          </StaggerGrid>
        </Container>
      </SectionWrapper>

      <SectionWrapper variant="blush">
        <Container>
          <SectionHeading
            label={copy.curriculum.label}
            title={copy.curriculum.title}
          />
          <Reveal>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
              {copy.curriculum.items.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 text-sm text-text-muted"
                >
                  <Check className="w-4 h-4 mt-0.5 shrink-0 text-accent-gold" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </Container>
      </SectionWrapper>

      <FAQSection limit={4} />

      <CTASection
        title={copy.finalCta.headline}
        subtitle={copy.finalCta.subtitle}
        location="training_page"
      />
    </>
  );
}
