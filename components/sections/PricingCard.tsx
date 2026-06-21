import { ArrowRight, Check } from "lucide-react";
import type { Package } from "@/data/packages";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface PricingCardProps {
  pkg: Package;
}

export function PricingCard({ pkg }: PricingCardProps) {
  const url = buildWhatsAppUrl({ intent: "quote" });
  const isPopular = pkg.highlighted;
  const highlights = pkg.features.slice(0, 4);

  return (
    <article
      className={cn(
        "group relative flex flex-col items-center text-center rounded-2xl border p-6 md:p-8 transition-all duration-500 overflow-hidden",
        isPopular
          ? "bg-luxury-dark text-white border-luxury-dark shadow-xl md:scale-105"
          : "bg-card text-text-primary border-border shadow-sm hover:shadow-lg hover:-translate-y-1"
      )}
    >
      {isPopular && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <span className="inline-block px-4 py-1 text-[10px] font-bold uppercase tracking-[0.15em] bg-accent-gold text-white rounded-full shadow-md">
            Most Booked
          </span>
        </div>
      )}

      {!isPopular && (
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-accent-rose/60 via-accent-gold/40 to-transparent" />
      )}

      <h3 className={cn(
        "font-display text-xl md:text-2xl font-medium",
        isPopular ? "text-white mt-2" : "text-text-primary"
      )}>
        {pkg.name}
      </h3>

      <p className={cn(
        "mt-2 text-sm leading-relaxed",
        isPopular ? "text-white/70" : "text-text-muted"
      )}>
        {pkg.shortDescription}
      </p>

      <div className="mt-5">
        <span className={cn(
          "block text-xs font-medium uppercase tracking-wide",
          isPopular ? "text-white/50" : "text-text-muted/70"
        )}>
          From
        </span>
        <span className={cn(
          "font-display text-4xl md:text-5xl font-semibold leading-tight",
          isPopular ? "text-accent-gold" : "text-accent-rose"
        )}>
          {formatPrice(pkg.priceFrom)}
        </span>
      </div>

      <div className={cn(
        "my-6 h-px w-full",
        isPopular ? "bg-white/15" : "bg-border"
      )} />

      <ul className="space-y-3 w-full text-left flex-grow">
        {highlights.map((f) => (
          <li
            key={f}
            className={cn(
              "flex items-start gap-3 text-sm",
              isPopular ? "text-white/80" : "text-text-muted"
            )}
          >
            <Check className="w-4 h-4 mt-0.5 shrink-0 text-accent-gold" />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "mt-8 flex items-center justify-center gap-2 w-full rounded-full font-medium text-sm py-3 transition-all duration-300",
          isPopular
            ? "bg-accent-gold hover:bg-accent-gold/90 text-luxury-dark"
            : "bg-accent-rose hover:bg-accent-rose-dark text-white shadow-md hover:shadow-lg"
        )}
      >
        Request Quote <ArrowRight className="w-4 h-4" />
      </a>
    </article>
  );
}
