import { Reveal } from "@/components/ui/Reveal";
import { BackgroundDecor } from "@/components/ui/BackgroundDecor";

interface PageHeroProps {
  label?: string;
  title: string;
  subtitle?: string;
}

export function PageHero({ label, title, subtitle }: PageHeroProps) {
  return (
    <section className="relative pt-32 pb-16 md:pt-40 md:pb-20 bg-bg-cream overflow-hidden">
      <BackgroundDecor />
      <div className="relative z-10 mx-auto max-w-4xl px-4 md:px-6 text-center">
        <Reveal>
          {label && (
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-gold mb-4">
              {label}
            </p>
          )}
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-medium text-text-primary leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-6 text-base md:text-lg text-text-muted max-w-2xl mx-auto leading-relaxed">
              {subtitle}
            </p>
          )}
        </Reveal>
      </div>
    </section>
  );
}
