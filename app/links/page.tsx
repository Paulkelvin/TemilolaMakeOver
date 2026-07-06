import Image from "next/image";
import { siteConfig } from "@/lib/site-config";
import { getSiteSettings, getBioLinks, getBlockedDates } from "@/sanity/fetch";
import { LinkCard } from "@/components/sections/ShopLinksClient";
import { CheckAvailabilityCard } from "@/components/ui/CheckAvailabilityCard";
import { Sparkles } from "lucide-react";

export default async function LinksPage() {
  const [settings, bioLinks, blockedDates] = await Promise.all([
    getSiteSettings(),
    getBioLinks(),
    getBlockedDates(),
  ]);
  const profileSrc = settings?.aboutImage ?? settings?.heroImageMain;

  const bookIndex = bioLinks.findIndex((link) => link.id === "bio-link-book");
  const linksBeforeAvailability =
    bookIndex === -1 ? bioLinks : bioLinks.slice(0, bookIndex + 1);
  const linksAfterAvailability = bookIndex === -1 ? [] : bioLinks.slice(bookIndex + 1);

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      {/* Profile */}
      <div className="mb-8 text-center">
        <div className="relative mx-auto mb-3 h-[88px] w-[88px] overflow-hidden rounded-full border-2 border-accent-rose/30 shadow-lg">
          {profileSrc ? (
            <Image
              src={profileSrc}
              alt={siteConfig.artistName}
              fill
              sizes="88px"
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

      <div className="space-y-3">
        {linksBeforeAvailability.map((link) => (
          <LinkCard key={link.id} link={link} />
        ))}
        <CheckAvailabilityCard blockedDates={blockedDates} />
        {linksAfterAvailability.map((link) => (
          <LinkCard key={link.id} link={link} />
        ))}
      </div>

      <p className="mt-8 text-center font-display text-xs tracking-widest text-text-muted/70">
        GLEAM
      </p>
    </div>
  );
}
