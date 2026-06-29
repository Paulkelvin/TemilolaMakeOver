"use client";

import { Sparkles } from "lucide-react";

interface WhyUsItem {
  id: string;
  title: string;
  description: string;
}

function Card({ item }: { item: WhyUsItem }) {
  return (
    <div className="shrink-0 w-[280px] rounded-xl border border-border bg-card p-5 shadow-sm">
      <Sparkles className="w-4 h-4 text-accent-gold mb-3" strokeWidth={1.5} />
      <h3 className="font-medium text-text-primary">{item.title}</h3>
      <p className="mt-1 text-sm text-text-muted">{item.description}</p>
    </div>
  );
}

export function WhyUsCardMarquee({ items }: { items: WhyUsItem[] }) {
  return (
    <div className="w-full overflow-hidden">
      <div className="inline-flex gap-4 animate-marquee" style={{ animationDuration: "30s" }}>
        {[0, 1].map((set) => (
          <div key={set} className="flex shrink-0 gap-4">
            {items.map((item) => (
              <Card key={`${item.id}-${set}`} item={item} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
