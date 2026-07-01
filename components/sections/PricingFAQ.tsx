"use client";

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: items.map((item) => ({
              "@type": "Question",
              name: item.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: item.answer,
              },
            })),
          }),
        }}
      />
    </div>
  );
}
