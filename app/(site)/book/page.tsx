import Link from "next/link";
import { bookPageCopy, seoCopy } from "@/data/copy";
import { createPageMetadata } from "@/lib/metadata";
import { PageHero } from "@/components/sections/PageHero";
import { SectionWrapper } from "@/components/ui/BackgroundDecor";
import { BookingForm } from "@/components/forms/BookingForm";
import { ContactCard } from "@/components/sections/ContactCard";
import { Reveal } from "@/components/ui/Reveal";
import { Container } from "@/components/ui/Container";
import { ScrollToHash } from "@/components/ui/ScrollToHash";
import { getBlockedDates } from "@/sanity/fetch";

export const metadata = createPageMetadata({
  title: seoCopy.book.title,
  description: seoCopy.book.description,
  path: "/book",
});

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const preselectedService = typeof params.service === "string" ? params.service : undefined;
  const preselectedDate = typeof params.date === "string" ? params.date : undefined;
  const preselectedTime = typeof params.time === "string" ? params.time : undefined;
  const { getPageCopy } = await import("@/sanity/fetch");
  const [blockedDates, pageCopy] = await Promise.all([getBlockedDates(), getPageCopy("book")]);
  const copy = bookPageCopy;

  return (
    <>
      <ScrollToHash />
      <PageHero
        label={copy.hero.label}
        title={pageCopy.heroTitle ?? copy.hero.title}
        subtitle={pageCopy.heroSubtitle ?? copy.hero.subtitle}
      />

      <SectionWrapper>
        <Container>
          <div className="grid lg:grid-cols-5 gap-10 lg:gap-12">
            <div className="lg:col-span-3">
              <Reveal>
                <h2 id="booking-form" className="scroll-mt-20 font-display text-2xl text-text-primary mb-2">
                  {copy.form.title}
                </h2>
                <p className="text-sm text-text-muted mb-6">{copy.form.intro}</p>
                <BookingForm
                  preselectedService={preselectedService}
                  preselectedDate={preselectedDate}
                  preselectedTime={preselectedTime}
                  blockedDates={blockedDates}
                />
              </Reveal>
            </div>
            <div className="lg:col-span-2">
              <Reveal>
                <ContactCard />
              </Reveal>
            </div>
          </div>
        </Container>
      </SectionWrapper>

      <SectionWrapper variant="blush">
        <Container size="narrow">
          <Reveal className="mb-12 rounded-2xl border border-border bg-card p-6 text-center">
            <h3 className="font-display text-xl text-text-primary mb-3">
              Helpful reads while you wait
            </h3>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
              <Link href="/blog/how-much-does-bridal-makeup-cost-in-lagos" className="text-sm text-accent-rose font-medium hover:underline">
                Bridal Makeup Cost Guide
              </Link>
              <Link href="/blog/what-is-soft-glam-makeup" className="text-sm text-accent-rose font-medium hover:underline">
                What Is Soft Glam?
              </Link>
              <Link href="/blog/how-early-should-you-book-your-bridal-makeup-artist" className="text-sm text-accent-rose font-medium hover:underline">
                When to Book Your Artist
              </Link>
            </div>
          </Reveal>

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
