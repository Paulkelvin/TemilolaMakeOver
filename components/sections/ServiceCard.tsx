import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import type { Service } from "@/data/services";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface ServiceCardProps {
  service: Service;
  className?: string;
  ctaText?: string;
}

export function ServiceCard({
  service,
  className,
  ctaText = "Book This Service",
}: ServiceCardProps) {
  const whatsappUrl = buildWhatsAppUrl({
    intent: "service",
    service: service.name,
  });
  const isPopular = service.highlighted;
  const highlights = service.included.slice(0, 4);

  return (
    <article
      className={cn(
        "group relative flex flex-col rounded-2xl border p-6 md:p-8 transition-all duration-500 overflow-hidden",
        isPopular
          ? "bg-luxury-dark text-white border-luxury-dark shadow-xl scale-[1.02]"
          : "bg-card text-text-primary border-border shadow-sm hover:shadow-lg hover:-translate-y-1",
        className
      )}
    >
      {isPopular && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <span className="inline-block px-4 py-1 text-[10px] font-bold uppercase tracking-[0.15em] bg-accent-gold text-white rounded-full shadow-md">
            Most Popular
          </span>
        </div>
      )}

      {!isPopular && (
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-accent-rose/60 via-accent-gold/40 to-transparent" />
      )}

      <h3 className={cn(
        "font-display text-xl md:text-2xl font-medium mt-2",
        isPopular ? "text-white" : "text-text-primary"
      )}>
        {service.name}
      </h3>

      <p className={cn(
        "mt-2 text-sm leading-relaxed",
        isPopular ? "text-white/70" : "text-text-muted"
      )}>
        {service.shortDescription}
      </p>

      {service.priceFrom && (
        <p className={cn(
          "mt-5 font-display text-3xl md:text-4xl font-semibold",
          isPopular ? "text-accent-gold" : "text-accent-rose"
        )}>
          {formatPrice(service.priceFrom)}
        </p>
      )}

      <div className={cn(
        "my-6 h-px",
        isPopular ? "bg-white/15" : "bg-border"
      )} />

      <ul className="space-y-3 flex-grow">
        {highlights.map((item) => (
          <li
            key={item}
            className={cn(
              "flex items-start gap-3 text-sm",
              isPopular ? "text-white/80" : "text-text-muted"
            )}
          >
            <Check className={cn(
              "w-4 h-4 mt-0.5 shrink-0",
              isPopular ? "text-accent-gold" : "text-accent-gold"
            )} />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-col gap-3">
        <Button
          href={whatsappUrl}
          external
          variant={isPopular ? "primary" : "primary"}
          size="md"
          className={cn(
            "w-full justify-center",
            isPopular && "bg-accent-gold hover:bg-accent-gold/90 text-luxury-dark font-semibold"
          )}
        >
          {ctaText} <ArrowRight className="w-4 h-4" />
        </Button>
        <Link
          href={`/services/${service.slug}`}
          className={cn(
            "text-xs font-medium text-center py-1.5 transition-colors",
            isPopular
              ? "text-white/50 hover:text-white"
              : "text-text-muted/60 hover:text-accent-rose"
          )}
        >
          View Details
        </Link>
      </div>
    </article>
  );
}
