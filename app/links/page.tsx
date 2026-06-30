import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
import { getSiteSettings } from "@/sanity/fetch";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import {
  Calendar,
  Images,
  Sparkles,
  MessageCircle,
  Camera,
  Globe,
} from "lucide-react";

const links = [
  {
    href: "/book#booking-form",
    label: "Book Your Date",
    description: "Check availability & reserve",
    icon: Calendar,
    primary: true,
  },
  {
    href: "/portfolio#gallery",
    label: "View Portfolio",
    description: "Real client looks & transformations",
    icon: Images,
    primary: false,
  },
  {
    href: "/services",
    label: "Services & Pricing",
    description: "Bridal, glam, editorial & more",
    icon: Sparkles,
    primary: false,
  },
  {
    href: "whatsapp",
    label: "Chat on WhatsApp",
    description: "Quick questions & quotes",
    icon: MessageCircle,
    primary: false,
  },
  {
    href: siteConfig.instagram,
    label: "Follow on Instagram",
    description: siteConfig.instagramHandle,
    icon: Camera,
    primary: false,
  },
  {
    href: "/",
    label: "Visit Full Website",
    description: "Everything about Gleam by Temi",
    icon: Globe,
    primary: false,
  },
];

export default async function LinksPage() {
  const settings = await getSiteSettings();
  const profileSrc = settings?.aboutImage ?? settings?.heroImageMain;
  const whatsappUrl = buildWhatsAppUrl({ intent: "availability" });

  return (
    <div className="flex h-[100dvh] flex-col items-center justify-center px-4 overflow-hidden">
      <div className="w-full max-w-md">
        {/* Profile */}
        <div className="mb-5 text-center">
          <div className="relative mx-auto mb-3 h-20 w-20 overflow-hidden rounded-full border-2 border-accent-rose/30 shadow-lg">
            {profileSrc ? (
              <Image
                src={profileSrc}
                alt={siteConfig.artistName}
                fill
                sizes="80px"
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-bg-blush">
                <Sparkles className="h-8 w-8 text-accent-rose" strokeWidth={1.5} />
              </div>
            )}
          </div>
          <h1 className="font-display text-2xl font-medium text-text-primary">
            {siteConfig.brand}
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Makeup that makes you glow
          </p>
          <p className="mt-0.5 text-xs text-text-muted/70">
            {siteConfig.location}
          </p>
        </div>

        {/* Links */}
        <div className="space-y-2.5 mt-2">
          {links.map((link) => {
            const Icon = link.icon;
            const isExternal =
              link.href === "whatsapp" ||
              link.href.startsWith("http");
            const resolvedHref =
              link.href === "whatsapp" ? whatsappUrl : link.href;

            const className = link.primary
              ? "group flex w-full items-center gap-4 rounded-2xl border border-accent-rose/20 bg-accent-rose px-4 py-3 text-white shadow-md transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
              : "group flex w-full items-center gap-4 rounded-2xl border border-border bg-card px-4 py-3 text-text-primary shadow-sm transition-all hover:shadow-md hover:scale-[1.02] hover:border-accent-rose/30 active:scale-[0.98]";

            const Comp = isExternal ? "a" : Link;
            const externalProps = isExternal
              ? { target: "_blank" as const, rel: "noopener noreferrer" }
              : {};

            return (
              <Comp
                key={link.label}
                href={resolvedHref}
                className={className}
                {...externalProps}
              >
                <Icon
                  className={
                    link.primary
                      ? "h-5 w-5 shrink-0 text-white/80"
                      : "h-5 w-5 shrink-0 text-accent-rose"
                  }
                  strokeWidth={1.5}
                />
                <div className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold leading-tight">
                    {link.label}
                  </span>
                  <span
                    className={
                      link.primary
                        ? "block text-xs text-white/60 leading-tight mt-0.5"
                        : "block text-xs text-text-muted leading-tight mt-0.5"
                    }
                  >
                    {link.description}
                  </span>
                </div>
                <svg
                  className={
                    link.primary
                      ? "h-4 w-4 shrink-0 text-white/40 transition-transform group-hover:translate-x-0.5"
                      : "h-4 w-4 shrink-0 text-text-muted/40 transition-transform group-hover:translate-x-0.5"
                  }
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </Comp>
            );
          })}
        </div>

        <p className="mt-4 text-center font-display text-xs tracking-widest text-text-muted/40">
          GLEAM
        </p>
      </div>
    </div>
  );
}
