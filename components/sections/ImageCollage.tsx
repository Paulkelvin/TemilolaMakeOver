"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

export interface CollageImage {
  src: string;
  alt: string;
}

interface ImageCollageProps {
  main: CollageImage;
  secondary: CollageImage;
  tertiary?: CollageImage;
  badges?: { label: string; variant?: "outline" | "rose" | "gold" }[];
  className?: string;
  priority?: boolean;
}

export function ImageCollage({
  main,
  secondary,
  tertiary,
  badges = [],
  className,
  priority = false,
}: ImageCollageProps) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={cn("relative", className)}
      initial={reduced ? false : { opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="absolute -inset-4 bg-gradient-to-br from-bg-blush via-accent-rose/10 to-accent-gold/10 rounded-[2rem] blur-2xl opacity-60" />

      <div className="relative corner-accent">
        <div className="relative aspect-[5/6] md:aspect-[4/5] rounded-3xl overflow-hidden shadow-image border border-border">
          <Image
            src={main.src}
            alt={main.alt}
            fill
            priority={priority}
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-700 hover:scale-[1.02]"
          />
        </div>

        <div className="absolute -bottom-4 -left-4 w-28 h-36 md:-bottom-6 md:-left-6 md:w-40 md:h-48 rounded-2xl overflow-hidden shadow-image border-2 border-white hidden sm:block">
          <Image
            src={secondary.src}
            alt={secondary.alt}
            fill
            sizes="180px"
            className="object-cover transition-transform duration-700 hover:scale-105"
          />
        </div>

        {tertiary && (
          <div className="absolute top-8 -right-4 w-24 h-28 md:w-28 md:h-32 rounded-xl overflow-hidden shadow-card border border-border hidden md:block">
            <Image
              src={tertiary.src}
              alt={tertiary.alt}
              fill
              sizes="120px"
              className="object-cover"
            />
          </div>
        )}

        {badges.length > 0 && (
          <>
            <div className="absolute -top-3 right-4 md:right-8 flex flex-col gap-2">
              {badges.slice(0, 2).map((b) => (
                <motion.div
                  key={b.label}
                  animate={reduced ? {} : { y: [0, -4, 0] }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Badge variant={b.variant ?? "outline"}>{b.label}</Badge>
                </motion.div>
              ))}
            </div>
            {badges.length > 2 && (
              <div className="absolute bottom-16 -right-2 md:right-4 hidden md:flex flex-col gap-2">
                {badges.slice(2).map((b) => (
                  <Badge key={b.label} variant={b.variant ?? "rose"}>
                    {b.label}
                  </Badge>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}
