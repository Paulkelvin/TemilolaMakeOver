import type { Package } from "@/data/packages";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Check } from "lucide-react";

interface PricingCardProps {
  pkg: Package;
}

export function PricingCard({ pkg }: PricingCardProps) {
  const url = buildWhatsAppUrl({ intent: "quote" });

  return (
    <article
      className={cn(
        "relative flex flex-col rounded-2xl border bg-card p-5 md:p-6 transition-all duration-500 hover:shadow-xl hover:-translate-y-1 overflow-hidden",
        pkg.highlighted
          ? "border-accent-rose shadow-md ring-1 ring-accent-rose/20"
          : "border-border shadow-sm"
      )}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent-gold/80 via-accent-rose/70 to-transparent" />
      {pkg.highlighted && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent-rose text-white text-xs font-medium px-3 py-1 rounded-full">
          Most Booked
        </span>
      )}
      <h3 className="font-display text-xl md:text-2xl font-medium text-text-primary">
        {pkg.name}
      </h3>
      <p className="text-sm text-accent-gold mt-1 font-medium">{pkg.bestFor}</p>
      <p className="mt-3 text-sm text-text-muted leading-relaxed">
        {pkg.shortDescription}
      </p>
      <p className="mt-3 font-display text-2xl md:text-3xl text-accent-rose">
        From {formatPrice(pkg.priceFrom)}
      </p>
      <p className="text-xs text-text-muted mt-1">{pkg.duration}</p>
      <ul className="mt-6 space-y-2 flex-grow">
        {pkg.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-text-muted">
            <Check className="w-4 h-4 text-accent-gold shrink-0 mt-0.5" />
            {f}
          </li>
        ))}
      </ul>
      <Button
        href={url}
        external
        variant={pkg.highlighted ? "primary" : "secondary"}
        size="md"
        className="mt-8 w-full"
        analyticsEvent="package_cta"
        analyticsLabel={pkg.id}
      >
        Request Quote
      </Button>
    </article>
  );
}
