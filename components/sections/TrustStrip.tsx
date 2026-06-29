"use client";

import { Crown, Home, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import { homeCopy } from "@/data/copy";

const icons = [Crown, Sparkles, Home, MapPin, ShieldCheck];

interface TrustStripProps {
  items?: string[];
}

export function TrustStrip({ items: customItems }: TrustStripProps) {
  const labels = customItems?.length ? customItems : homeCopy.trustStrip;
  const entries = labels.map((label, i) => ({
    label,
    Icon: icons[i % icons.length] ?? Sparkles,
  }));

  return (
    <section className="relative border-y border-border bg-card/60 backdrop-blur-sm py-4 overflow-hidden max-w-[100vw]">
      <div className="inline-flex gap-8 md:gap-12 animate-marquee">
        {[0, 1].map((set) => (
          <div key={set} className="flex shrink-0 items-center gap-8 md:gap-12">
            {entries.map(({ label, Icon }) => (
              <span
                key={`${label}-${set}`}
                className="flex items-center gap-2.5 whitespace-nowrap text-xs md:text-sm font-medium text-text-primary"
              >
                <span className="shrink-0 w-8 h-8 rounded-full bg-bg-blush flex items-center justify-center">
                  <Icon className="w-3.5 h-3.5 text-accent-rose" strokeWidth={1.5} />
                </span>
                {label}
              </span>
            ))}
            <span className="text-accent-gold/40 text-xs">✦</span>
          </div>
        ))}
      </div>
    </section>
  );
}
