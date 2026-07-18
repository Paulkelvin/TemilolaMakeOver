import { getFaqItems } from "@/sanity/fetch";
import { faqItems as staticFaqItems } from "@/data/faq";
import { seoCopy } from "@/data/copy";
import { createPageMetadata } from "@/lib/metadata";
import { FAQPageJsonLd } from "@/lib/seo/structured-data";
import { PageHero } from "@/components/sections/PageHero";
import { FAQAccordion } from "@/components/sections/FAQAccordion";
import { CTASection } from "@/components/sections/CTASection";
import { SectionWrapper } from "@/components/ui/BackgroundDecor";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Container } from "@/components/ui/Container";
import { AskQuestionForm } from "@/components/forms/AskQuestionForm";

export const metadata = createPageMetadata({
  title: seoCopy.faq.title,
  description: seoCopy.faq.description,
  path: "/faq",
});

export default async function FAQPage() {
  let items = await getFaqItems();
  if (!items.length) items = staticFaqItems;

  return (
    <>
      <FAQPageJsonLd items={items} />
      <PageHero
        label="FAQ"
        title="Frequently Asked Questions"
        subtitle="Straight answers to help you plan your booking — pricing, bridal trials, home service, and more."
      />

      <SectionWrapper variant="blush">
        <Container size="narrow">
          <SectionHeading
            label="FAQ"
            title="Everything You Need to Know"
            subtitle="Booking, pricing, home service, bridal trials, and more — answered in one place."
            compact
          />
          <FAQAccordion items={items} />
        </Container>
      </SectionWrapper>

      <SectionWrapper>
        <Container size="narrow">
          <SectionHeading
            label="Still Have Questions?"
            title="Ask Us Anything"
            subtitle="Send your question below and we'll reply to your email within 24 hours."
            compact
          />
          <AskQuestionForm />
        </Container>
      </SectionWrapper>

      <CTASection
        title="Prefer a Faster Answer?"
        subtitle="Message me on WhatsApp — I'll respond with honest answers, usually the same day."
        location="faq_page"
      />
    </>
  );
}
