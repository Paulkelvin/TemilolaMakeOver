import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "rose" | "gold" | "dark" | "outline";
  className?: string;
}

export function Badge({
  children,
  variant = "rose",
  className,
}: BadgeProps) {
  const variants = {
    rose: "bg-accent-rose/10 text-accent-rose border-accent-rose/20",
    gold: "bg-accent-gold/10 text-accent-gold border-accent-gold/30",
    dark: "bg-luxury-dark text-white border-luxury-dark",
    outline: "bg-card/80 text-text-primary border-border backdrop-blur-sm",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium tracking-wide",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
