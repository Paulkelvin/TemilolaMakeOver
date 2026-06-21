"use client";

import { Crown, Home, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import { homeCopy } from "@/data/copy";

const icons = [Crown, Sparkles, Home, MapPin, ShieldCheck];

const items = homeCopy.trustStrip.map((label, i) => ({
  label,
  Icon: icons[i] ?? Sparkles,
}));

function MarqueeRow() {
  return (
    <div className="flex shrink-0 items-center gap-8 md:gap-12 animate-marquee">
      {items.map(({ label, Icon }) => (
        <span
          key={label}
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
  );
}

export function TrustStrip() {
  return (
    <section className="relative border-y border-border bg-card/60 backdrop-blur-sm py-4 overflow-hidden">
      <div className="flex gap-8 md:gap-12">
        <MarqueeRow />
        <MarqueeRow />
        <MarqueeRow />
      </div>
    </section>
  );
}
