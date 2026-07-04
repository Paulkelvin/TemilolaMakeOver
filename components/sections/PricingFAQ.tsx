import { SectionHeading } from "@/components/ui/SectionHeading";
import { FAQAccordion } from "./FAQAccordion";
import type { FAQItem } from "@/data/faq";

interface PricingFAQProps {
  items: FAQItem[];
}

export function PricingFAQ({ items }: PricingFAQProps) {
  return (
    <div>
      <SectionHeading
        label="Pricing FAQ"
        title="Pricing Questions Answered"
      />
      <FAQAccordion items={items} />
    </div>
  );
}
