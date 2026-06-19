import { cn } from "@/lib/utils";

interface BackgroundDecorProps {
  className?: string;
  variant?: "cream" | "blush" | "dark";
}

export function BackgroundDecor({
  className,
  variant = "cream",
}: BackgroundDecorProps) {
  const bg =
    variant === "dark"
      ? "bg-luxury-dark"
      : variant === "blush"
        ? "bg-bg-blush"
        : "bg-bg-cream";

  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", bg, className)}>
      <div className="orb orb-rose w-72 h-72 -top-20 -right-20 opacity-60" />
      <div className="orb orb-gold w-56 h-56 bottom-20 -left-16 opacity-40" />
      <div className="orb orb-blush w-96 h-96 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30" />
    </div>
  );
}

export function SectionWrapper({
  children,
  className,
  id,
  variant = "cream",
  decor = true,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
  variant?: "cream" | "blush" | "dark";
  decor?: boolean;
}) {
  const bgClass =
    variant === "dark"
      ? "bg-luxury-dark text-white"
      : variant === "blush"
        ? "bg-bg-blush"
        : "bg-bg-cream";

  return (
    <section id={id} className={cn("relative py-16 md:py-24 lg:py-28", bgClass, className)}>
      {decor && <BackgroundDecor variant={variant} />}
      <div className="relative z-10">{children}</div>
    </section>
  );
}
