import Image from "next/image";
import { siteConfig } from "@/lib/site-config";
import { getSiteSettings } from "@/sanity/fetch";
import {
  CalendarDays,
  Image as ImageIcon,
  Sparkles,
  MessageCircle,
  Camera,
  Globe,
  ChevronRight,
} from "lucide-react";

const links = [
  {
    href: "/book#booking-form",
    label: "Book Your Date",
    sub: "Check availability & reserve",
    icon: CalendarDays,
    primary: true,
  },
  {
    href: "/portfolio#gallery",
    label: "View Portfolio",
    sub: "Real client looks & transformations",
    icon: ImageIcon,
  },
  {
    href: "/pricing",
    label: "Services & Pricing",
    sub: "Bridal, glam, editorial & more",
    icon: Sparkles,
  },
  {
    href: `https://wa.me/${siteConfig.whatsapp}`,
    label: "Chat on WhatsApp",
    sub: "Quick questions & quotes",
    icon: MessageCircle,
    external: true,
  },
  {
    href: siteConfig.instagram,
    label: "Follow on Instagram",
    sub: siteConfig.instagramHandle,
    icon: Camera,
    external: true,
  },
  {
    href: "/",
    label: "Visit Full Website",
    sub: `Everything about ${siteConfig.brand}`,
    icon: Globe,
  },
];

export default async function LinksPage() {
  const settings = await getSiteSettings();
  const avatarUrl = settings.aboutImage;

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-5 py-6">
      <div className="w-full max-w-md flex flex-col items-center">
        {/* Avatar */}
        <div className="w-20 h-20 rounded-full border-2 border-accent-rose/30 overflow-hidden bg-bg-blush mb-3">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={siteConfig.brand}
              width={80}
              height={80}
              className="object-cover object-top w-full h-full"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-accent-rose font-display text-2xl">
              G
            </div>
          )}
        </div>

        {/* Name & tagline */}
        <h1 className="font-display text-2xl text-text-primary">
          {siteConfig.brand}
        </h1>
        <p className="text-sm text-text-muted mt-0.5">
          Makeup that makes you glow
        </p>
        <p className="text-xs text-text-muted/70 mt-0.5">
          {siteConfig.location}
        </p>

        {/* Links */}
        <nav className="w-full mt-5 space-y-2.5" aria-label="Quick links">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <a
                key={link.label}
                href={link.href}
                {...(link.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className={`group flex items-center gap-3 w-full rounded-2xl border px-4 py-3 transition-all duration-200 ${
                  link.primary
                    ? "bg-accent-rose text-white border-accent-rose hover:bg-accent-rose-dark shadow-sm"
                    : "bg-white text-text-primary border-border hover:border-accent-rose/30 hover:shadow-sm"
                }`}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 ${
                    link.primary ? "text-white/80" : "text-accent-rose"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium block leading-tight">
                    {link.label}
                  </span>
                  <span
                    className={`text-[11px] block leading-tight mt-0.5 ${
                      link.primary ? "text-white/70" : "text-text-muted"
                    }`}
                  >
                    {link.sub}
                  </span>
                </div>
                <ChevronRight
                  className={`w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5 ${
                    link.primary ? "text-white/50" : "text-text-muted/40"
                  }`}
                />
              </a>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
