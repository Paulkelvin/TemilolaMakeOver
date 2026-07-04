import { ArrowRight, Check } from "lucide-react";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface PricingCardData {
  name: string;
  shortDescription: string;
  priceFrom?: number;
  included: string[];
  highlighted?: boolean;
}

interface PricingCardProps {
  pkg: PricingCardData;
}

export function PricingCard({ pkg }: PricingCardProps) {
  const url = buildWhatsAppUrl({ intent: "quote" });
  const isPopular = pkg.highlighted;
  const highlights = pkg.included.slice(0, 4);

  return (
    <div className={cn("relative", isPopular && "mt-4")}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
          <span className="inline-block px-4 py-1 text-[10px] font-bold uppercase tracking-[0.15em] bg-accent-rose text-white rounded-full shadow-md">
            Most Booked
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

      <h3 className="font-display text-xl md:text-2xl font-semibold text-text-primary">
        {pkg.name}
      </h3>

      <p className="mt-2 text-sm leading-relaxed text-text-muted">
        {pkg.shortDescription}
      </p>

      {pkg.priceFrom && (
        <div className="mt-5">
          <span className="block text-xs font-medium uppercase tracking-wide text-text-muted/70">
            From
          </span>
          <span className="font-display text-4xl md:text-5xl font-semibold leading-tight text-accent-rose">
            {formatPrice(pkg.priceFrom)}
          </span>
        </div>
      )}

      <div className="my-6 h-px w-full bg-border" />

      <ul className="space-y-3 inline-block text-left flex-grow">
        {highlights.map((f) => (
          <li
            key={f}
            className="flex items-start gap-3 text-sm text-text-muted"
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
        className="mt-8 flex items-center justify-center gap-2 w-full rounded-full font-medium text-sm py-3 transition-all duration-300 bg-accent-rose hover:bg-accent-rose-dark text-white shadow-md hover:shadow-lg"
      >
        Request Quote <ArrowRight className="w-4 h-4" />
      </a>
    </article>
    </div>
  );
}
