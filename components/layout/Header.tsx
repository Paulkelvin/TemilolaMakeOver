"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { siteConfig, navLinks } from "@/lib/site-config";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { Button } from "@/components/ui/Button";
import { MobileMenu } from "./MobileMenu";
import { analyticsEvents } from "@/lib/analytics";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const availabilityUrl = buildWhatsAppUrl({ intent: "availability" });

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          scrolled
            ? "bg-bg-cream/90 backdrop-blur-md border-b border-border shadow-sm py-3"
            : "bg-transparent py-4 md:py-5"
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 md:px-6 lg:px-8">
          <Link
            href="/"
            className="font-display text-xl md:text-2xl font-semibold text-text-primary tracking-tight"
          >
            {siteConfig.shortBrand}
            <span className="text-accent-rose">.</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8" aria-label="Main navigation">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-text-muted hover:text-accent-rose transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 md:gap-3">
            <Button
              href={availabilityUrl}
              external
              variant="primary"
              size="sm"
              className="hidden sm:inline-flex"
              analyticsEvent={analyticsEvents.availabilityCta}
              analyticsLabel="header"
            >
              Check Availability
            </Button>
            <Link
              href="/book"
              className="hidden md:inline-flex text-sm font-medium text-text-primary hover:text-accent-rose transition-colors px-3 py-2"
            >
              Book
            </Link>
            <button
              type="button"
              className="lg:hidden p-2 rounded-full hover:bg-bg-blush transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      <MobileMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        availabilityUrl={availabilityUrl}
      />
    </>
  );
}
