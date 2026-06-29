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

export function TestimonialsMarquee({ items }: TestimonialsMarqueeProps) {
  const doubled = [...items, ...items];

  return (
    <div className="overflow-hidden -mx-4 md:-mx-6 lg:-mx-8">
      <div className="flex gap-5 w-max animate-marquee">
        {doubled.map((t, i) => (
          <div
            key={`${t.id}-${i}`}
            className="shrink-0 w-[280px] md:w-[320px] rounded-2xl border border-border bg-card p-6 flex flex-col gap-4 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="w-[64px] h-[64px] rounded-full overflow-hidden bg-bg-blush flex items-center justify-center text-lg font-semibold text-accent-rose shrink-0 ring-2 ring-accent-rose/20">
                {t.avatarUrl ? (
                  <Image
                    src={t.avatarUrl}
                    alt={t.name}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  t.initials
                )}
              </div>
              <div>
                <p className="font-medium text-text-primary text-sm leading-tight">{t.name}</p>
                <p className="text-xs text-text-muted mt-0.5">{t.event}</p>
                <div className="flex gap-0.5 mt-1.5">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-3 h-3 fill-accent-gold text-accent-gold" />
                  ))}
                </div>
              </div>
            </div>
            <p className="text-sm text-text-primary leading-relaxed line-clamp-4">
              &ldquo;{t.text}&rdquo;
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
