"use client";

import Image from "next/image";
import { Star } from "lucide-react";

interface MarqueeItem {
  id: string;
  name: string;
  event: string;
  text: string;
  rating: number;
  initials: string;
  avatarUrl?: string;
}

interface TestimonialsMarqueeProps {
  items: MarqueeItem[];
}

function TestimonialCard({ t }: { t: MarqueeItem }) {
  return (
    <div className="shrink-0 w-[260px] md:w-[280px] group">
      <div className="relative rounded-2xl overflow-hidden border border-border bg-card shadow-sm hover:shadow-lg transition-shadow duration-500">
        {/* Photo hero */}
        <div className="relative h-[280px] md:h-[300px] bg-bg-blush">
          {t.avatarUrl ? (
            <Image
              src={t.avatarUrl}
              alt={`${t.name} — ${t.event}`}
              fill
              sizes="280px"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-5xl font-display font-semibold text-accent-rose/40">
                {t.initials}
              </span>
            </div>
          )}
          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-luxury-dark/80 via-luxury-dark/20 to-transparent" />

          {/* Stars + quote overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <div className="flex gap-0.5 mb-2">
              {Array.from({ length: t.rating }).map((_, j) => (
                <Star key={j} className="w-3.5 h-3.5 fill-accent-gold text-accent-gold" />
              ))}
            </div>
            <p className="text-white/95 text-sm leading-relaxed line-clamp-3">
              &ldquo;{t.text}&rdquo;
            </p>
          </div>
        </div>

        {/* Name strip */}
        <div className="px-5 py-4 flex items-center justify-between">
          <div>
            <p className="font-medium text-text-primary text-sm">{t.name}</p>
            <p className="text-xs text-text-muted">{t.event}</p>
          </div>
          <div className="w-2 h-2 rounded-full bg-accent-rose/40 shrink-0" />
        </div>
      </div>
    </div>
  );
}

export function TestimonialsMarquee({ items }: TestimonialsMarqueeProps) {
  // Triple the items to guarantee no visible gap on wide screens
  const tripled = [...items, ...items, ...items];

  return (
    <div className="overflow-hidden">
      <div
        className="flex gap-5 animate-marquee"
        style={{ width: "max-content" }}
      >
        {tripled.map((t, i) => (
          <TestimonialCard key={`${t.id}-${i}`} t={t} />
        ))}
      </div>
    </div>
  );
}
