"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { motion, AnimatePresence } from "framer-motion";
import {
  portfolioItems,
  portfolioCategories,
  type PortfolioCategory,
} from "@/data/portfolio";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { Badge } from "@/components/ui/Badge";
import { GalleryFilter } from "@/components/ui/GalleryFilter";
import { trackEvent, analyticsEvents } from "@/lib/analytics";

interface PortfolioGalleryProps {
  bookLookLabel?: string;
}

export function PortfolioGallery({ bookLookLabel = "Book This Look" }: PortfolioGalleryProps) {
  const [filter, setFilter] = useState<PortfolioCategory | "All">("All");
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  const filtered =
    filter === "All"
      ? portfolioItems
      : portfolioItems.filter((p) => p.category === filter);

  const slides = filtered.map((p) => ({ src: p.src, alt: p.alt }));

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
  }, []);

  return (
    <>
      <GalleryFilter
        categories={portfolioCategories}
        active={filter}
        onChange={setFilter}
        className="mb-10"
      />

      <motion.div
        layout
        className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4"
      >
        <AnimatePresence mode="popLayout">
          {filtered.map((item, index) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="break-inside-avoid"
            >
              <div
                className="group relative rounded-2xl overflow-hidden border border-border bg-card cursor-pointer shadow-sm hover:shadow-lg transition-shadow duration-500"
                onClick={() => openLightbox(index)}
                onKeyDown={(e) => e.key === "Enter" && openLightbox(index)}
                role="button"
                tabIndex={0}
                aria-label={`View ${item.title}`}
              >
                <div className="relative aspect-[3/4]">
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-luxury-dark/70 via-luxury-dark/25 to-transparent opacity-100 group-hover:from-luxury-dark/85 transition-all duration-500 flex flex-col justify-end p-4">
                  <Badge variant="outline" className="w-fit">
                    {item.category}
                  </Badge>
                  <p className="text-white font-medium mt-2">{item.title}</p>
                  <a
                    href={buildWhatsAppUrl({
                      intent: "look",
                      look: `${item.title} (${item.category})`,
                    })}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      e.stopPropagation();
                      trackEvent(analyticsEvents.portfolioCta, { label: item.id });
                    }}
                    className="mt-3 inline-flex items-center justify-center rounded-full bg-accent-rose text-white px-4 py-2 text-sm font-medium hover:bg-accent-rose-dark transition-colors min-h-[40px]"
                  >
                    {bookLookLabel}
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      <Lightbox
        open={lightboxIndex >= 0}
        close={() => setLightboxIndex(-1)}
        index={lightboxIndex}
        slides={slides}
      />
    </>
  );
}
