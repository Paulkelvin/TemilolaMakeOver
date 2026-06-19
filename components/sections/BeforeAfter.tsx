import Link from "next/link";
import { portfolioItems } from "@/data/portfolio";
import { homeCopy } from "@/data/copy";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SectionWrapper } from "@/components/ui/BackgroundDecor";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { BeforeAfterSlider } from "./BeforeAfterSlider";

const beforeItems = portfolioItems.filter(
  (p) => p.category === "Before & After"
);
const pair1 = beforeItems[0] ?? portfolioItems[8];
const pair2 = beforeItems[1] ?? portfolioItems[11];
const copy = homeCopy.beforeAfter;

const pairs = [
  { before: pair1, after: portfolioItems[0] },
  { before: pair2, after: portfolioItems[1] },
  { before: portfolioItems[9], after: portfolioItems[4] },
];

export function BeforeAfter() {
  const url = buildWhatsAppUrl({ intent: "booking" });

  return (
    <SectionWrapper id="transformations" variant="blush">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <SectionHeading
          label={copy.label}
          title={copy.headline}
          subtitle={copy.paragraph}
          compact
        />

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {pairs.map((pair, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <BeforeAfterSlider
                before={{
                  src: pair.before.src,
                  alt: `Before makeup — ${pair.before.title}`,
                }}
                after={{
                  src: pair.after.src,
                  alt: `After makeup — ${pair.after.title}`,
                }}
              />
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-8 flex flex-wrap items-center justify-center gap-3 text-center">
          <Button href={url} external variant="primary" size="lg">
            {copy.cta}
          </Button>
          <Button href="/transformations" variant="secondary" size="lg">
            See More Transformations
          </Button>
          <Link
            href="/transformations"
            className="text-sm font-medium text-accent-rose hover:underline sm:hidden"
          >
            See more
          </Link>
        </Reveal>
      </div>
    </SectionWrapper>
  );
}
