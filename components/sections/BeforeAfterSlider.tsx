"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";

interface SliderImage {
  src: string;
  alt: string;
  position?: string;
}

interface BeforeAfterSliderProps {
  before: SliderImage;
  after: SliderImage;
  className?: string;
}

export function BeforeAfterSlider({
  before,
  after,
  className,
}: BeforeAfterSliderProps) {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const updatePosition = useCallback((clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.min(Math.max(x, 0), 100));
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      dragging.current = true;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      updatePosition(e.clientX);
    },
    [updatePosition]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return;
      updatePosition(e.clientX);
    },
    [updatePosition]
  );

  const onPointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  return (
    <div className={className}>
      <div
        ref={containerRef}
        className="relative aspect-[4/5] select-none overflow-hidden rounded-2xl border border-border bg-card"
        style={{ touchAction: "pan-y" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        {/* After image — full size, bottom layer (visible by default) */}
        <Image
          src={after.src}
          alt={after.alt}
          fill
          sizes="(max-width: 768px) 100vw, 40vw"
          className="pointer-events-none object-cover"
          style={{ objectPosition: after.position ?? "50% 50%" }}
          draggable={false}
        />

        {/* Before image — full size, top layer, clipped from the right */}
        <div
          className="absolute inset-0"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
          aria-hidden
        >
          <Image
            src={before.src}
            alt={before.alt}
            fill
            sizes="(max-width: 768px) 100vw, 40vw"
            className="pointer-events-none object-cover"
            style={{ objectPosition: before.position ?? "50% 50%" }}
            draggable={false}
          />
        </div>

        {/* Divider line */}
        <div
          className="pointer-events-none absolute inset-y-0 z-10 w-0.5 -translate-x-1/2 bg-white/90 shadow-[0_0_0_1px_rgba(30,21,18,0.25)]"
          style={{ left: `${position}%` }}
          aria-hidden
        >
          {/* Handle circle */}
          <div className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-luxury-dark/70 shadow-lg">
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              className="text-white"
            >
              <path
                d="M5 9H13M5 9L7.5 6.5M5 9L7.5 11.5M13 9L10.5 6.5M13 9L10.5 11.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Labels */}
        <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-accent-rose px-2 py-1 text-xs text-white">
          After
        </span>
        <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-luxury-dark/80 px-2 py-1 text-xs text-white">
          Before
        </span>
      </div>
    </div>
  );
}
