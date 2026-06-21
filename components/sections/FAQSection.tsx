import { getFaqItems } from "@/sanity/fetch";
import { homeCopy } from "@/data/copy";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SectionWrapper } from "@/components/ui/BackgroundDecor";
import { FAQAccordion } from "./FAQAccordion";

interface FAQSectionProps {
  limit?: number;
}

export async function FAQSection({ limit = 8 }: FAQSectionProps) {
  const faqItems = await getFaqItems();
  const copy = homeCopy.faq;

  return (
    <SectionWrapper id="faq" variant="blush">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <SectionHeading
          label={copy.label}
          title={copy.headline}
          subtitle={copy.subtitle}
        />
        <FAQAccordion items={faqItems} limit={limit} />
      </div>
    </SectionWrapper>
  );
}
