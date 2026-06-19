"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";

interface SliderImage {
  src: string;
  alt: string;
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
  const [showLens, setShowLens] = useState(false);
  const [hover, setHover] = useState(false);
  const [cursor, setCursor] = useState({ x: 0.5, y: 0.5 });
  const wrapperRef = useRef<HTMLDivElement>(null);

  const lensImage = useMemo(
    () => (cursor.x * 100 < position ? before.src : after.src),
    [before.src, after.src, cursor.x, position]
  );

  function updateCursor(clientX: number, clientY: number) {
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
    const y = Math.min(Math.max((clientY - rect.top) / rect.height, 0), 1);
    setCursor({ x, y });
  }

  return (
    <div className={className}>
      <div
        ref={wrapperRef}
        className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-border bg-card"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onMouseMove={(e) => updateCursor(e.clientX, e.clientY)}
        onTouchMove={(e) => {
          const touch = e.touches[0];
          if (touch) updateCursor(touch.clientX, touch.clientY);
        }}
      >
        <Image
          src={before.src}
          alt={before.alt}
          fill
          sizes="(max-width: 768px) 100vw, 40vw"
          className="object-cover"
        />

        <div
          className="absolute inset-y-0 right-0 overflow-hidden"
          style={{ width: `${100 - position}%` }}
          aria-hidden
        >
          <div className="relative h-full w-full">
            <Image
              src={after.src}
              alt={after.alt}
              fill
              sizes="(max-width: 768px) 100vw, 40vw"
              className="object-cover"
            />
          </div>
        </div>

        <div
          className="absolute inset-y-0 w-0.5 bg-white/90 shadow-[0_0_0_1px_rgba(30,21,18,0.25)]"
          style={{ left: `${position}%` }}
          aria-hidden
        >
          <div className="absolute left-1/2 top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white bg-luxury-dark/70" />
        </div>

        <input
          type="range"
          min={0}
          max={100}
          value={position}
          onChange={(e) => setPosition(Number(e.target.value))}
          className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
          aria-label="Drag to compare before and after"
        />

        <span className="absolute left-3 top-3 rounded-full bg-luxury-dark/80 px-2 py-1 text-xs text-white">
          Before
        </span>
        <span className="absolute right-3 top-3 rounded-full bg-accent-rose px-2 py-1 text-xs text-white">
          After
        </span>

        <button
          type="button"
          onClick={() => setShowLens((prev) => !prev)}
          className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-card/95 px-3 py-1.5 text-xs font-medium text-text-primary shadow-sm"
          aria-pressed={showLens}
        >
          <Search className="h-3.5 w-3.5" />
          Magnifier
        </button>

        {showLens && hover && (
          <div
            className="pointer-events-none absolute h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-lg"
            style={{
              left: `${cursor.x * 100}%`,
              top: `${cursor.y * 100}%`,
              backgroundImage: `url(${lensImage})`,
              backgroundPosition: `${cursor.x * 100}% ${cursor.y * 100}%`,
              backgroundSize: "220%",
              backgroundRepeat: "no-repeat",
            }}
            aria-hidden
          />
        )}
      </div>
    </div>
  );
}

