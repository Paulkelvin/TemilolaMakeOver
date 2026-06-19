import { cn } from "@/lib/utils";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: "default" | "narrow" | "wide";
}

const sizes = {
  default: "max-w-7xl",
  narrow: "max-w-4xl",
  wide: "max-w-[90rem]",
};

export function Container({
  children,
  className,
  size = "default",
}: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 md:px-6 lg:px-8",
        sizes[size],
        className
      )}
    >
      {children}
    </div>
  );
}
