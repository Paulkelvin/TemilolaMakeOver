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
        "group relative flex flex-col rounded-2xl border border-border bg-card p-5 md:p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 overflow-hidden",
        className
      )}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent-rose/80 via-accent-gold/70 to-transparent" />
      <div className="w-11 h-11 rounded-full bg-bg-blush flex items-center justify-center mb-4">
        <Icon className="w-5 h-5 text-accent-rose" strokeWidth={1.5} />
      </div>
      <h3 className="font-display text-lg md:text-xl font-medium text-text-primary">
        {service.name}
      </h3>
      <p className="mt-2 text-xs text-accent-gold font-medium tracking-wide">
        Best for: {service.bestFor}
      </p>
      <p className="mt-2 text-sm text-text-muted leading-relaxed flex-grow">
        {service.shortDescription}
      </p>
      {service.priceFrom && (
        <p className="mt-4 text-sm font-medium text-accent-rose">
          From {formatPrice(service.priceFrom)}
        </p>
      )}
      <div className="mt-5 flex flex-col sm:flex-row gap-2">
        <Button href={whatsappUrl} external variant="primary" size="sm">
          {ctaText}
        </Button>
        <Button href={`/services#${service.slug}`} variant="ghost" size="sm">
          View Details
        </Button>
      </div>
    </article>
  );
}
