import Link from "next/link";
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
              {[
                { label: "Bridal Makeup", slug: "bridal-makeup" },
                { label: "Traditional Bridal", slug: "traditional-bridal" },
                { label: "Soft Glam", slug: "soft-glam" },
                { label: "Event Glam", slug: "event-glam" },
                { label: "Birthday Glam", slug: "birthday-makeup" },
                { label: "Photoshoot Makeup", slug: "photoshoot-makeup" },
                { label: "Home Service", slug: "home-service" },
                { label: "Group Booking", slug: "group-booking" },
                { label: "Gele Styling", slug: "gele-styling" },
              ].map(({ label, slug }) => (
                <li key={slug}>
                  <Link
                    href={`/services/${slug}`}
                    className="hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
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
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </a>
              <a
                href={siteConfig.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="p-2 rounded-full border border-white/20 hover:border-accent-rose hover:text-accent-rose transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Trust badges */}
        <div className="border-t border-white/10 pt-8 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Secure payments
          </p>
          <div className="flex items-center gap-4 opacity-50">
            {/* Paystack */}
            <svg viewBox="0 0 80 24" fill="none" className="h-5 w-auto" aria-label="Paystack">
              <text x="0" y="18" fontFamily="system-ui" fontSize="14" fontWeight="700" fill="white">Paystack</text>
            </svg>
            {/* Visa */}
            <svg viewBox="0 0 60 20" className="h-5 w-auto" aria-label="Visa">
              <text x="0" y="16" fontFamily="system-ui" fontSize="18" fontWeight="800" fontStyle="italic" fill="white">VISA</text>
            </svg>
            {/* Mastercard */}
            <svg viewBox="0 0 44 28" className="h-5 w-auto" aria-label="Mastercard">
              <circle cx="14" cy="14" r="14" fill="#EB001B" opacity="0.9"/>
              <circle cx="30" cy="14" r="14" fill="#F79E1B" opacity="0.9"/>
              <path d="M22 6.3A14 14 0 0128.7 14 14 14 0 0122 21.7 14 14 0 0115.3 14 14 14 0 0122 6.3z" fill="#FF5F00" opacity="0.9"/>
            </svg>
            {/* Verve */}
            <svg viewBox="0 0 56 20" className="h-5 w-auto" aria-label="Verve">
              <text x="0" y="15" fontFamily="system-ui" fontSize="14" fontWeight="700" fill="white">Verve</text>
            </svg>
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
            <Link href="/terms" className="hover:text-white/70 transition-colors">
              Terms of Service
            </Link>
            <span>Makeup artist in {siteConfig.location}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
