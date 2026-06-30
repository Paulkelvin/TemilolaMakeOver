"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { PortfolioItem } from "@/data/portfolio";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

interface Props {
  items: PortfolioItem[];
  footnote: string;
  ctaLabel: string;
}

const VISIBLE_COUNT = 3;

export function PortfolioPreviewClient({ items, footnote, ctaLabel }: Props) {
  const previewItems = items.slice(0, VISIBLE_COUNT);
  const remainingCount = Math.max(0, items.length - VISIBLE_COUNT);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const openGallery = useCallback((startIndex = 0) => {
    setActiveIndex(startIndex);
    setGalleryOpen(true);
  }, []);

  const closeGallery = useCallback((e?: React.MouseEvent | KeyboardEvent) => {
    if (e && 'stopPropagation' in e) e.stopPropagation();
    setGalleryOpen(false);
  }, []);

  const goNext = useCallback(() => {
    setActiveIndex((i) => (i + 1) % items.length);
  }, [items.length]);

  const goPrev = useCallback(() => {
    setActiveIndex((i) => (i - 1 + items.length) % items.length);
  }, [items.length]);

  useEffect(() => {
    if (!galleryOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeGallery();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    }
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [galleryOpen, closeGallery, goNext, goPrev]);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-2 gap-3 h-[420px] md:h-[520px] lg:h-[560px]">
        {previewItems.map((item, i) => {
          const isLast = i === VISIBLE_COUNT - 1 && remainingCount > 0;
          return (
            <Reveal
              key={item.id}
              className={i === 0 ? "row-span-2" : ""}
            >
              <div
                className={`group relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm hover:shadow-lg transition-all duration-500 cursor-pointer ${
                  i === 0 ? "h-full md:aspect-auto aspect-[3/4]" : "aspect-[4/3] md:aspect-auto md:h-full"
                }`}
                onClick={() => openGallery(i)}
                onKeyDown={(e) => e.key === "Enter" && openGallery(i)}
                role="button"
                tabIndex={0}
                aria-label={isLast ? `Explore ${remainingCount} more looks` : `View ${item.title}`}
              >
                {item.src && (
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    sizes={
                      i === 0
                        ? "(max-width: 768px) 100vw, 50vw"
                        : "(max-width: 768px) 50vw, 50vw"
                    }
                    className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  />
                )}

                {isLast ? (
                  <div className="absolute inset-0 bg-luxury-dark/55 flex flex-col items-center justify-center gap-2 transition-colors duration-300 group-hover:bg-luxury-dark/70">
                    <span className="font-display text-3xl md:text-4xl font-medium text-white">
                      +{remainingCount}
                    </span>
                    <span className="text-sm text-white/90 font-medium">
                      Explore more looks
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-t from-luxury-dark/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <p className="text-white text-sm font-medium">{item.title}</p>
                    </div>
                  </>
                )}
              </div>
            </Reveal>
          );
        })}
      </div>

      <Reveal className="mt-10 text-center">
        <p className="text-sm text-text-muted mb-4">{footnote}</p>
        <Button href="/portfolio" variant="secondary" size="lg">
          {ctaLabel}
        </Button>
      </Reveal>

      {/* ── In-page Gallery ────────────────────────────────────── */}
      <AnimatePresence>
        {galleryOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] flex items-center justify-center"
            onClick={(e) => closeGallery(e)}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-luxury-dark/92 backdrop-blur-sm" />

            {/* Gallery content */}
            <div
              className="portfolio-overlay-gallery relative z-10 w-full max-w-5xl mx-4 md:mx-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top bar: counter + close */}
              <div className="flex items-center justify-between mb-3">
                <div className="text-white/60 text-sm font-medium">
                  {activeIndex + 1} / {items.length}
                </div>
                <button
                  onClick={(e) => closeGallery(e)}
                  className="text-white/70 hover:text-white transition-colors p-2 -mr-2"
                  aria-label="Close gallery"
                >
                  <X className="w-7 h-7" />
                </button>
              </div>

              {/* Main image */}
              <div className="relative aspect-[3/4] md:aspect-[4/5] max-h-[75vh] rounded-2xl overflow-hidden border border-white/10 bg-luxury-dark shadow-2xl mx-auto">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={items[activeIndex].id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="absolute inset-0"
                  >
                    {items[activeIndex].src && (
                      <Image
                        src={items[activeIndex].src}
                        alt={items[activeIndex].alt}
                        fill
                        sizes="(max-width: 768px) 95vw, 60vw"
                        className="object-cover"
                        priority
                      />
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Title overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-luxury-dark/80 to-transparent p-4 md:p-6">
                  <p className="text-white font-display text-lg md:text-xl">
                    {items[activeIndex].title}
                  </p>
                  <p className="text-white/60 text-xs mt-1">
                    {items[activeIndex].category}
                  </p>
                </div>
              </div>

              {/* Nav buttons */}
              <button
                onClick={goPrev}
                className="absolute left-0 md:-left-14 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-all"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={goNext}
                className="absolute right-0 md:-right-14 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-all"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Thumbnail strip */}
              <div className="mt-4 flex gap-2 overflow-x-auto pb-2 justify-center scrollbar-hide">
                {items.map((item, idx) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveIndex(idx)}
                    className={`relative shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                      idx === activeIndex
                        ? "border-accent-rose ring-1 ring-accent-rose/40 scale-105"
                        : "border-white/10 opacity-50 hover:opacity-80"
                    }`}
                    aria-label={`View ${item.title}`}
                  >
                    {item.src && (
                      <Image
                        src={item.src}
                        alt={item.alt}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
