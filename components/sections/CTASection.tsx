import { homeCopy } from "@/data/copy";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { Button, WhatsAppButton } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Container } from "@/components/ui/Container";
import { analyticsEvents } from "@/lib/analytics";

const defaults = homeCopy.finalCta;

interface CTASectionProps {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  variant?: "dark" | "blush";
  location?: string;
}

export function CTASection({
  title,
  subtitle,
  eyebrow,
  variant = "dark",
  location = "final_banner",
}: CTASectionProps) {
  const resolvedTitle = title ?? defaults.headline;
  const resolvedSubtitle = subtitle ?? defaults.paragraph;
  const resolvedEyebrow = eyebrow ?? defaults.eyebrow;
  const bookingUrl = buildWhatsAppUrl({ intent: "booking" });
  const isDark = variant === "dark";

  return (
    <section
      className={
        isDark
          ? "relative py-20 md:py-28 overflow-hidden bg-luxury-dark text-white"
          : "relative py-20 md:py-28 overflow-hidden bg-gradient-to-br from-bg-blush via-bg-cream to-bg-ivory"
      }
    >
      {isDark && (
        <>
          <div className="orb orb-rose w-96 h-96 top-0 right-0 opacity-20" />
          <div className="orb orb-gold w-64 h-64 bottom-0 left-0 opacity-15" />
        </>
      )}

      <Container size="narrow" className="relative z-10 text-center">
        <Reveal>
          <p
            className={
              isDark
                ? "text-xs font-semibold uppercase tracking-[0.2em] text-accent-gold mb-4"
                : "text-xs font-semibold uppercase tracking-[0.2em] text-accent-rose mb-4"
            }
          >
            {resolvedEyebrow}
          </p>
          <h2
            className={
              isDark
                ? "font-display text-3xl md:text-4xl lg:text-5xl font-medium leading-tight"
                : "font-display text-3xl md:text-4xl lg:text-5xl font-medium leading-tight text-text-primary"
            }
          >
            {resolvedTitle}
          </h2>
          <p
            className={
              isDark
                ? "mt-6 text-white/60 text-base md:text-lg max-w-xl mx-auto"
                : "mt-6 text-text-muted text-base md:text-lg max-w-xl mx-auto"
            }
          >
            {resolvedSubtitle}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              href="/book#booking-form"
              variant="primary"
              size="lg"
              analyticsEvent={analyticsEvents.availabilityCta}
              analyticsLabel={location}
            >
              {homeCopy.finalCta.primaryCta}
            </Button>
            <WhatsAppButton href={bookingUrl} size="lg">
              {homeCopy.finalCta.secondaryCta}
            </WhatsAppButton>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

/** @deprecated Use CTASection */
export function CTABanner() {
  return <CTASection />;
}
