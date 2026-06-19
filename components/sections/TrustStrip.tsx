import { Crown, Home, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import { homeCopy } from "@/data/copy";

const icons = [Crown, Sparkles, Home, MapPin, ShieldCheck];

export function TrustStrip() {
  return (
    <section className="relative border-y border-border bg-card/60 backdrop-blur-sm py-6">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
          {homeCopy.trustStrip.map((label, i) => {
            const Icon = icons[i] ?? Sparkles;
            return (
              <li
                key={label}
                className="flex items-start gap-3 text-left justify-start"
              >
                <div className="mt-0.5 shrink-0 w-9 h-9 rounded-full bg-bg-blush flex items-center justify-center">
                  <Icon className="w-4 h-4 text-accent-rose" strokeWidth={1.5} />
                </div>
                <span className="pt-1 text-xs md:text-sm font-medium text-text-primary leading-tight">
                  {label}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
