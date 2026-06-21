"use client";

import { motion, useReducedMotion } from "framer-motion";
import { homeCopy } from "@/data/copy";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ImageCollage } from "@/components/sections/ImageCollage";
import { analyticsEvents } from "@/lib/analytics";
import { Container } from "@/components/ui/Container";
import type { PortfolioItem } from "@/data/portfolio";

interface HeroProps {
  portfolioItems: PortfolioItem[];
}

const { hero } = homeCopy;

export function Hero({ portfolioItems }: HeroProps) {
  const reduced = useReducedMotion();
  const availabilityUrl = buildWhatsAppUrl({ intent: "availability" });

  const heroMain = portfolioItems[1] ?? portfolioItems[0];
  const heroFloat = portfolioItems[5] ?? portfolioItems[0];
  const heroDetail = portfolioItems[2] ?? portfolioItems[0];

  return (
    <section className="relative min-h-[100svh] flex items-center pt-20 md:pt-24 pb-6 md:pb-8 overflow-hidden bg-bg-cream">
      <div className="orb orb-rose w-[500px] h-[500px] -top-40 -right-40" />
      <div className="orb orb-gold w-80 h-80 bottom-0 left-0" />

      <Container className="relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[calc(100svh-7rem)] md:min-h-[calc(100svh-8rem)]">
          <div>
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <Badge variant="gold" className="mb-6">
                {hero.eyebrow}
              </Badge>
            </motion.div>

            <motion.h1
              className="font-display text-3xl sm:text-4xl lg:text-5xl font-medium leading-[1.08] text-text-primary"
              initial={reduced ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              {hero.headline}
            </motion.h1>

            <motion.p
              className="mt-4 text-sm md:text-base text-text-muted leading-relaxed max-w-lg"
              initial={reduced ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              {hero.subheadline}
            </motion.p>

            <motion.div
              className="mt-6 flex flex-col sm:flex-row gap-3"
              initial={reduced ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <Button
                href={availabilityUrl}
                external
                variant="primary"
                size="lg"
                analyticsEvent={analyticsEvents.availabilityCta}
                analyticsLabel="hero_primary"
              >
                {hero.primaryCta}
              </Button>
              <Button href="/book#booking-form" variant="secondary" size="lg">
                {hero.secondaryCta}
              </Button>
            </motion.div>

            <motion.p
              className="mt-4 text-xs md:text-sm text-text-muted"
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              {hero.trustLine}
            </motion.p>
          </div>

          {heroMain?.src && (
            <div>
              <ImageCollage
                main={{ src: heroMain.src, alt: heroMain.alt }}
                secondary={{ src: heroFloat.src, alt: heroFloat.alt }}
                tertiary={heroDetail ? { src: heroDetail.src, alt: heroDetail.alt } : undefined}
                badges={hero.badges.map((label, i) => ({
                  label,
                  variant: (i < 2 ? "outline" : i === 2 ? "rose" : "gold") as
                    | "outline"
                    | "rose"
                    | "gold",
                }))}
                priority
              />
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
