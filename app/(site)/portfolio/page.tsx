import { getPortfolioItems, getPortfolioCategories } from "@/sanity/fetch";
import { portfolioPageCopy, seoCopy } from "@/data/copy";
import { createPageMetadata } from "@/lib/metadata";
import { PageHero } from "@/components/sections/PageHero";
import { SectionWrapper } from "@/components/ui/BackgroundDecor";
import { PortfolioGallery } from "@/components/sections/PortfolioGallery";
import { CTASection } from "@/components/sections/CTASection";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Container } from "@/components/ui/Container";
import { ScrollToHash } from "@/components/ui/ScrollToHash";

export const metadata = createPageMetadata({
  title: seoCopy.portfolio.title,
  description: seoCopy.portfolio.description,
  path: "/portfolio",
});

export default async function PortfolioPage() {
  const { getPageCopy } = await import("@/sanity/fetch");
  const [items, categories, pageCopy] = await Promise.all([
    getPortfolioItems(),
    getPortfolioCategories(),
    getPageCopy("portfolio"),
  ]);
  const copy = portfolioPageCopy;
  const url = buildWhatsAppUrl({ intent: "look", look: "Portfolio inspiration" });

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
          <Reveal className="mb-10 max-w-2xl mx-auto text-center">
            <p className="text-text-muted leading-relaxed">{copy.intro}</p>
          </Reveal>
          <div id="gallery" className="scroll-mt-24" />
          <PortfolioGallery
            items={items}
            categories={categories}
            bookLookLabel={copy.galleryCta}
          />
          <Reveal className="mt-12 text-center">
            <p className="text-text-muted mb-4">{copy.midCta.text}</p>
            <Button href={url} external variant="primary" size="lg">
              {copy.midCta.button}
            </Button>
          </Reveal>
        </Container>
      </SectionWrapper>

      <CTASection location="portfolio_page" />
    </>
  );
}
