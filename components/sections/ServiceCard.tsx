import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import type { Service } from "@/data/services";
import { formatPrice, cn } from "@/lib/utils";

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
  const bookUrl = `/book?service=${encodeURIComponent(service.slug)}#booking-form`;
  const isPopular = service.highlighted;
  const highlights = service.included.slice(0, 3);

  return (
    <div className={cn("relative", isPopular && "mt-4", className)}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
          <span className="inline-block px-4 py-1 text-[10px] font-bold uppercase tracking-[0.15em] bg-accent-rose text-white rounded-full shadow-md">
            Most Popular
          </span>
        </div>
      )}
    <article
      className={cn(
        "group relative flex flex-col items-center text-center rounded-2xl border p-6 md:p-8 transition-all duration-500 overflow-hidden bg-card text-text-primary border-border shadow-sm hover:shadow-lg hover:-translate-y-1",
        isPopular && "ring-2 ring-accent-rose md:scale-105"
      )}
    >
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-accent-rose/60 via-accent-gold/40 to-transparent" />

      <Link href={`/services/${service.slug}`} className="block flex-grow w-full">
        <h3 className="font-display text-xl md:text-2xl font-medium text-text-primary">
          {service.name}
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-text-muted">
          {service.shortDescription}
        </p>

        {service.priceFrom && (
          <div className="mt-5">
            <span className="block text-xs font-medium uppercase tracking-wide text-text-muted/70">
              From
            </span>
            <span className="font-display text-4xl md:text-5xl font-semibold leading-tight text-accent-rose">
              {formatPrice(service.priceFrom)}
            </span>
          </div>
        )}

        <div className="my-6 h-px w-full bg-border" />

        <ul className="space-y-3 inline-block text-left">
          {highlights.map((item) => (
            <li
              key={item}
              className="flex items-start gap-3 text-sm text-text-muted"
            >
              <Check className="w-4 h-4 mt-0.5 shrink-0 text-accent-gold" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Link>

      <div className="mt-8 w-full">
        <Link
          href={bookUrl}
          className="flex items-center justify-center gap-2 w-full rounded-full font-medium text-sm py-3 transition-all duration-300 bg-accent-rose hover:bg-accent-rose-dark text-white shadow-md hover:shadow-lg"
        >
          {ctaText} <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </article>
    </div>
  );
}
