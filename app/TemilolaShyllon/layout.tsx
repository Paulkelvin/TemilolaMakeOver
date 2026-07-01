import Link from "next/link";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import "../globals.css";
import { siteConfig } from "@/lib/site-config";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${jakarta.variable}`}>
      <body className="min-h-screen antialiased font-body bg-bg-cream">
        <div className="min-h-screen flex flex-col">
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
      </body>
    </html>
  );
}
