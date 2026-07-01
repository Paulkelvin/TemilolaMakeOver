import Image from "next/image";
import { getPortfolioItems, getPageCopy, findSection, getAboutValues } from "@/sanity/fetch";
import { aboutPageCopy, seoCopy } from "@/data/copy";
import { createPageMetadata } from "@/lib/metadata";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { PageHero } from "@/components/sections/PageHero";
import { SectionWrapper } from "@/components/ui/BackgroundDecor";
import { CTASection } from "@/components/sections/CTASection";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Container } from "@/components/ui/Container";
import { Heart, Award, Sparkles, Star, Shield } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export const metadata = createPageMetadata({
  title: seoCopy.about.title,
  description: seoCopy.about.description,
  path: "/about",
});

const iconMap: Record<string, LucideIcon> = {
  heart: Heart,
  award: Award,
  sparkles: Sparkles,
  star: Star,
  shield: Shield,
};

const hardcodedValues = [
  { icon: "heart", title: "Beauty with intention", text: "Every choice — from primer to powder — serves how you need to look and feel for your specific event." },
  { icon: "award", title: "Professional without the pressure", text: "Punctual, prepared, and calm. Your getting-ready time should feel like care, not chaos." },
  { icon: "sparkles", title: "Confidence that lasts", text: "Makeup that holds through photos, hugs, dancing, and Lagos heat — still looking like you at the end." },
];

const defaults = aboutPageCopy;

export default async function AboutPage() {
  const [portfolioItems, pageCopy, aboutValues] = await Promise.all([
    getPortfolioItems(),
    getPageCopy("about"),
    getAboutValues(),
  ]);

  const url = buildWhatsAppUrl({ intent: "availability" });
  const portrait = portfolioItems[0];
  const portraitSrc = pageCopy.heroImageUrl ?? portrait?.src;

  const introSec = findSection(pageCopy, "intro");
  const philosophySec = findSection(pageCopy, "philosophy");
  const trustSec = findSection(pageCopy, "trust");

  const introTitle = introSec?.title ?? defaults.intro.title;
  const introParagraphs = introSec?.paragraphs?.length
    ? introSec.paragraphs
    : defaults.intro.paragraphs;
  const philosophyTitle = philosophySec?.title ?? defaults.philosophy.title;
  const trustTitle = trustSec?.title ?? defaults.trust.title;
  const trustBody = trustSec?.body ?? defaults.trust.body;

  const values = aboutValues.length ? aboutValues : hardcodedValues;

  return (
    <>
      <PageHero
        label={pageCopy.heroLabel ?? defaults.hero.label}
        title={pageCopy.heroTitle ?? defaults.hero.title}
        subtitle={pageCopy.heroSubtitle ?? defaults.hero.subtitle}
      />

      <SectionWrapper>
        <Container>
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <Reveal>
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden border border-border shadow-xl corner-accent">
                {portraitSrc ? (
                  <Image
                    src={portraitSrc}
                    alt={`${siteConfig.artistName} — professional makeup artist in Lagos`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="w-full h-full bg-bg-blush" />
                )}
              </div>
            </Reveal>

            <Reveal>
              <h2 className="font-display text-3xl md:text-4xl font-medium text-text-primary">
                {introTitle}
              </h2>
              <div className="mt-6 space-y-4 text-text-muted leading-relaxed">
                {introParagraphs.map((p) => (
                  <p key={p.slice(0, 40)}>{p}</p>
                ))}
              </div>
              <Button href={url} external variant="primary" size="lg" className="mt-8">
                {introSec?.cta ?? defaults.cta}
              </Button>
            </Reveal>
          </div>
        </Container>
      </SectionWrapper>

      <SectionWrapper variant="blush">
        <Container>
          <Reveal className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-gold mb-3">
              {philosophySec?.label ?? defaults.philosophy.label}
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-medium text-text-primary">
              {philosophyTitle}
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6">
            {values.map((v) => {
              const Icon = iconMap[v.icon] ?? Sparkles;
              return (
                <Reveal key={v.title}>
                  <div className="rounded-2xl border border-border bg-card p-8 text-center h-full">
                    <Icon className="w-8 h-8 text-accent-rose mx-auto mb-4" strokeWidth={1.5} />
                    <h3 className="font-display text-xl text-text-primary">{v.title}</h3>
                    <p className="mt-3 text-sm text-text-muted leading-relaxed">{v.text}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>

          <Reveal className="mt-16 max-w-2xl mx-auto text-center">
            <h3 className="font-display text-2xl text-text-primary">{trustTitle}</h3>
            <p className="mt-4 text-text-muted leading-relaxed">{trustBody}</p>
            <p className="mt-4 text-sm text-text-muted">
              Learn more about my approach on the{" "}
              <Link href="/blog" className="text-accent-rose font-medium hover:underline">
                blog
              </Link>.
            </p>
          </Reveal>
        </Container>
      </SectionWrapper>

      <CTASection location="about_page" />
    </>
  );
}
