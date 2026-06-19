"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FAQItem } from "@/data/faq";

interface FAQAccordionProps {
  items: FAQItem[];
  limit?: number;
}

export function FAQAccordion({ items, limit }: FAQAccordionProps) {
  const displayItems = limit ? items.slice(0, limit) : items;
  const [openId, setOpenId] = useState<string | null>(displayItems[0]?.id ?? null);
  const reduced = useReducedMotion();

  return (
    <div className="space-y-3 max-w-3xl mx-auto">
      {displayItems.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div
            key={item.id}
            className="rounded-xl border border-border bg-card overflow-hidden"
          >
            <button
              type="button"
              className="w-full flex items-center justify-between gap-4 p-5 md:p-6 text-left min-h-[56px]"
              aria-expanded={isOpen}
              onClick={() => setOpenId(isOpen ? null : item.id)}
            >
              <span className="font-medium text-text-primary pr-4">
                {item.question}
              </span>
              <ChevronDown
                className={cn(
                  "w-5 h-5 shrink-0 text-accent-rose transition-transform duration-300",
                  isOpen && "rotate-180"
                )}
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={reduced ? false : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <p className="px-5 md:px-6 pb-5 md:pb-6 text-sm text-text-muted leading-relaxed">
                    {item.answer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
