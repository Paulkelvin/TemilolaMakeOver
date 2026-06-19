"use client";

import { cn } from "@/lib/utils";

interface GalleryFilterProps<T extends string> {
  categories: readonly T[];
  active: T | "All";
  onChange: (category: T | "All") => void;
  className?: string;
}

export function GalleryFilter<T extends string>({
  categories,
  active,
  onChange,
  className,
}: GalleryFilterProps<T>) {
  const allCategories = ["All", ...categories] as const;

  return (
    <div
      className={cn("flex flex-wrap justify-center gap-2", className)}
      role="tablist"
      aria-label="Filter portfolio by category"
    >
      {allCategories.map((cat) => (
        <button
          key={cat}
          type="button"
          role="tab"
          aria-selected={active === cat}
          onClick={() => onChange(cat as T | "All")}
          className={cn(
            "inline-flex w-auto whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 min-h-[44px] items-center justify-center",
            active === cat
              ? "bg-accent-rose text-white shadow-cta"
              : "bg-card border border-border text-text-muted hover:border-accent-rose hover:text-accent-rose"
          )}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
