import { Check, Minus } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import type { PricingTableRow } from "@/data/packages";

interface PricingComparisonTableProps {
  data: PricingTableRow[];
}

export function PricingComparisonTable({ data }: PricingComparisonTableProps) {
  return (
    <Reveal>
      <SectionHeading
        label="Compare Services"
        title="All Services at a Glance"
      />

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <caption className="sr-only">
            Makeup service pricing comparison — starting prices, duration, and
            what is included
          </caption>
          <thead>
            <tr className="border-b-2 border-border">
              <th className="py-4 pr-4 text-xs font-semibold uppercase tracking-wide text-text-muted">
                Service
              </th>
              <th className="py-4 pr-4 text-xs font-semibold uppercase tracking-wide text-text-muted">
                Starting Price
              </th>
              <th className="py-4 pr-4 text-xs font-semibold uppercase tracking-wide text-text-muted">
                Duration
              </th>
              <th className="py-4 pr-4 text-xs font-semibold uppercase tracking-wide text-text-muted">
                What&apos;s Included
              </th>
              <th className="py-4 text-xs font-semibold uppercase tracking-wide text-text-muted text-center">
                Home Service
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr
                key={row.service}
                className="border-b border-border hover:bg-bg-blush/50 transition-colors"
              >
                <td className="py-4 pr-4 font-medium text-text-primary text-sm">
                  {row.service}
                </td>
                <td className="py-4 pr-4 font-display text-lg font-semibold text-accent-rose">
                  {formatPrice(row.priceFrom)}
                </td>
                <td className="py-4 pr-4 text-sm text-text-muted">
                  {row.duration}
                </td>
                <td className="py-4 pr-4 text-sm text-text-muted">
                  {row.included}
                </td>
                <td className="py-4 text-center">
                  {row.homeService ? (
                    <Check className="w-5 h-5 text-accent-gold mx-auto" />
                  ) : (
                    <Minus className="w-5 h-5 text-text-muted/40 mx-auto" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-4">
        {data.map((row) => (
          <div
            key={row.service}
            className="rounded-xl border border-border bg-card p-5"
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <h3 className="font-medium text-text-primary">{row.service}</h3>
              <span className="font-display text-lg font-semibold text-accent-rose whitespace-nowrap">
                {formatPrice(row.priceFrom)}
              </span>
            </div>
            <p className="text-sm text-text-muted mb-2">{row.included}</p>
            <div className="flex items-center justify-between text-xs text-text-muted">
              <span>{row.duration}</span>
              {row.homeService && (
                <span className="flex items-center gap-1 text-accent-gold">
                  <Check className="w-3.5 h-3.5" /> Home service
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </Reveal>
  );
}
