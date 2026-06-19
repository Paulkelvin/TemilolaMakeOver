import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";

interface SectionHeadingProps {
  label?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  dark?: boolean;
  compact?: boolean;
  className?: string;
}

export function SectionHeading({
  label,
  title,
  subtitle,
  align = "center",
  dark = false,
  compact = false,
  className,
}: SectionHeadingProps) {
  return (
    <Reveal
      className={cn(
        compact ? "mb-8 md:mb-10" : "mb-12 md:mb-16",
        align === "center" && "text-center",
        className
      )}
    >
      {label && (
        <p
          className={cn(
            "mb-3 text-xs font-semibold uppercase tracking-[0.2em]",
            dark ? "text-accent-gold" : "text-accent-gold"
          )}
        >
          {label}
        </p>
      )}
      <h2
        className={cn(
          compact
            ? "font-display text-2xl md:text-3xl lg:text-4xl font-medium leading-tight"
            : "font-display text-3xl md:text-4xl lg:text-5xl font-medium leading-tight",
          dark ? "text-white" : "text-text-primary"
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={cn(
            compact
              ? "mt-3 max-w-2xl text-sm md:text-base leading-relaxed"
              : "mt-4 max-w-2xl text-base md:text-lg leading-relaxed",
            align === "center" && "mx-auto",
            dark ? "text-white/70" : "text-text-muted"
          )}
        >
          {subtitle}
        </p>
      )}
    </Reveal>
  );
}
