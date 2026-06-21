import { Check } from "lucide-react";
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
  const Icon = service.icon;
  const whatsappUrl = buildWhatsAppUrl({
    intent: "service",
    service: service.name,
  });

  return (
    <article
      className={cn(
        "group relative flex flex-col items-center text-center rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 overflow-hidden",
        className
      )}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent-rose/80 via-accent-gold/70 to-transparent" />
      <div className="w-12 h-12 rounded-full bg-bg-blush flex items-center justify-center mb-4">
        <Icon className="w-5 h-5 text-accent-rose" strokeWidth={1.5} />
      </div>
      <h3 className="font-display text-xl md:text-2xl font-medium text-text-primary">
        {service.name}
      </h3>
      <p className="mt-1 text-xs text-accent-gold font-medium tracking-wide">
        {service.bestFor}
      </p>

      {service.priceFrom && (
        <p className="mt-4 font-display text-2xl md:text-3xl font-semibold text-accent-rose">
          From {formatPrice(service.priceFrom)}
        </p>
      )}

      <p className="mt-3 text-sm text-text-muted leading-relaxed">
        {service.shortDescription}
      </p>

      <ul className="mt-5 w-full space-y-2.5 text-left">
        {service.included.map((item) => (
          <li
            key={item}
            className="flex items-start gap-2.5 text-sm text-text-muted"
          >
            <Check className="w-4 h-4 mt-0.5 shrink-0 text-accent-gold" />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6 w-full flex flex-col gap-2">
        <Button href={whatsappUrl} external variant="primary" size="sm" className="w-full">
          {ctaText}
        </Button>
        <a
          href={`/services/${service.slug}`}
          className="text-xs font-medium text-text-muted hover:text-accent-rose transition-colors py-1"
        >
          View Details
        </a>
      </div>
    </article>
  );
}
