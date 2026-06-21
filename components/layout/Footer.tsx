import Link from "next/link";
import { Share2 } from "lucide-react";
import { siteConfig, navLinks } from "@/lib/site-config";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { analyticsEvents } from "@/lib/analytics";
import { CopyButton } from "@/components/ui/CopyButton";

export function Footer() {
  const whatsappUrl = buildWhatsAppUrl({ intent: "booking" });
  const year = new Date().getFullYear();

  return (
    <footer className="relative bg-luxury-dark text-white pt-16 pb-8">
      <div className="orb orb-rose w-64 h-64 -top-32 right-0 opacity-20" />
      <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div className="lg:col-span-1">
            <Link href="/" className="font-display text-2xl font-semibold">
              {siteConfig.shortBrand}
              <span className="text-accent-rose">.</span>
            </Link>
            <p className="mt-4 text-sm text-white/60 leading-relaxed max-w-xs">
              Premium bridal and event makeup in {siteConfig.location}. Making
              every special moment beautifully unforgettable.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-gold mb-4">
              Navigate
            </h3>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-gold mb-4">
              Services
            </h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li>Bridal Makeup</li>
              <li>Soft & Event Glam</li>
              <li>Home Service</li>
              <li>Group Bookings</li>
              <li>Gele Styling</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-gold mb-4">
              Get in Touch
            </h3>
            <ul className="space-y-3 text-sm text-white/70">
              <li>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                  data-analytics={analyticsEvents.whatsappClick}
                >
                  WhatsApp Booking
                </a>
              </li>
              <li className="flex items-center gap-1.5">
                <a
                  href={`tel:${siteConfig.phoneRaw}`}
                  className="hover:text-white transition-colors"
                  data-analytics={analyticsEvents.phoneClick}
                >
                  {siteConfig.phone}
                </a>
                <CopyButton text={siteConfig.phone} />
              </li>
              <li className="flex items-center gap-1.5">
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="hover:text-white transition-colors"
                >
                  {siteConfig.email}
                </a>
                <CopyButton text={siteConfig.email} />
              </li>
              <li className="text-white/50">{siteConfig.serviceArea}</li>
              <li className="text-white/50">{siteConfig.hours}</li>
            </ul>

            <div className="flex gap-4 mt-6">
              <a
                href={siteConfig.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="p-2 rounded-full border border-white/20 hover:border-accent-rose hover:text-accent-rose transition-colors"
              >
                <Share2 className="w-5 h-5" />
              </a>
              <a
                href={siteConfig.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="p-2 rounded-full border border-white/20 hover:border-accent-rose hover:text-accent-rose transition-colors text-sm font-medium"
              >
                TT
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/40">
          <p>
            © {year} {siteConfig.brand}. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/blog" className="hover:text-white/70 transition-colors">
              Beauty Tips
            </Link>
            <Link href="/privacy-policy" className="hover:text-white/70 transition-colors">
              Privacy Policy
            </Link>
            <span>Makeup artist in {siteConfig.location}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
