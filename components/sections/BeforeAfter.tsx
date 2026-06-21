import Link from "next/link";
import { getTransformations } from "@/sanity/fetch";
import { homeCopy } from "@/data/copy";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SectionWrapper } from "@/components/ui/BackgroundDecor";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { BeforeAfterSlider } from "./BeforeAfterSlider";

const copy = homeCopy.beforeAfter;

export async function BeforeAfter() {
  const transformations = await getTransformations();
  const pairs = transformations.slice(0, 3);
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
            <Reveal key={pair.id} delay={i * 0.1}>
              <BeforeAfterSlider
                before={{ src: pair.beforeUrl, alt: pair.beforeAlt }}
                after={{ src: pair.afterUrl, alt: pair.afterAlt }}
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
