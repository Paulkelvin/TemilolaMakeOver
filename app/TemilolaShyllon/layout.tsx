import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg-cream flex flex-col">
      <header className="py-4 px-4 text-center border-b border-border/50">
        <Link
          href="/"
          className="font-display text-xl font-semibold text-text-primary tracking-tight inline-block"
        >
          {siteConfig.shortBrand}
          <span className="text-accent-rose">.</span>
        </Link>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="py-6 px-4 text-center border-t border-border/50">
        <Link
          href="/"
          className="text-xs text-text-muted hover:text-accent-rose transition-colors"
        >
          {siteConfig.brand} · {siteConfig.location}
        </Link>
      </footer>
    </div>
  );
}
