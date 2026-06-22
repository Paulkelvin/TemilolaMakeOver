import { cn } from "@/lib/utils";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
}

export function Reveal({ children, className }: RevealProps) {
  return <div className={cn(className)}>{children}</div>;
}

export function StaggerGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}
