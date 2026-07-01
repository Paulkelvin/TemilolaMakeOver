"use client";

import Image from "next/image";
import { ExternalLink, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ShopLink } from "@/sanity/fetch";
import type { ShopSection } from "@/app/TemilolaShyllon/page";

interface ShopLinksClientProps {
  sections: ShopSection[];
  showSectionHeaders: boolean;
}

export function ShopLinksClient({
  sections,
  showSectionHeaders,
}: ShopLinksClientProps) {
  if (sections.length === 0) {
    return (
      <p className="text-center text-text-muted text-sm py-12">
        No links yet — check back soon!
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {sections.map((section) => (
        <div key={section.name}>
          {showSectionHeaders && (
            <h2 className="text-center text-xs font-semibold uppercase tracking-widest text-text-muted mb-4">
              {section.name}
            </h2>
          )}
          <div className="space-y-3">
            {section.links.map((link) => {
              switch (link.layout) {
                case "featured":
                  return <FeaturedCard key={link.id} link={link} />;
                case "wide":
                  return <WideCard key={link.id} link={link} />;
                default:
                  return <CompactCard key={link.id} link={link} />;
              }
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function CompactCard({ link }: { link: ShopLink }) {
  const thumbSrc =
    link.mediaType === "video" ? link.thumbnailUrl : link.imageUrl;

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-2.5 transition-all duration-200 hover:shadow-md hover:scale-[1.01]"
    >
      {thumbSrc ? (
        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-bg-blush">
          <Image
            src={thumbSrc}
            alt={link.alt || link.title}
            fill
            className="object-cover"
            sizes="64px"
          />
          {link.mediaType === "video" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl">
              <Play className="w-4 h-4 text-white fill-white" />
            </div>
          )}
        </div>
      ) : (
        <div className="h-16 w-16 flex-shrink-0 rounded-xl bg-bg-blush" />
      )}

      <span className="flex-1 text-sm font-medium text-text-primary group-hover:text-accent-rose transition-colors line-clamp-2">
        {link.title}
      </span>

      <ExternalLink className="w-3.5 h-3.5 text-text-muted/50 flex-shrink-0 mr-1" />
    </a>
  );
}

function FeaturedCard({ link }: { link: ShopLink }) {
  const isVideo = link.mediaType === "video" && link.videoUrl;

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-2xl border border-border bg-card overflow-hidden transition-all duration-200 hover:shadow-md hover:scale-[1.01]"
    >
      <div className="relative aspect-[4/3] bg-bg-blush">
        {isVideo ? (
          <video
            src={link.videoUrl}
            muted
            autoPlay
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : link.imageUrl ? (
          <Image
            src={link.imageUrl}
            alt={link.alt || link.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 576px"
          />
        ) : null}
      </div>

      <div className="p-4 flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-text-primary group-hover:text-accent-rose transition-colors">
            {link.title}
          </h3>
          {link.description && (
            <p className="mt-1 text-xs text-text-muted line-clamp-2">
              {link.description}
            </p>
          )}
        </div>
        <ExternalLink className="w-3.5 h-3.5 text-text-muted/50 flex-shrink-0 mt-0.5" />
      </div>
    </a>
  );
}

function WideCard({ link }: { link: ShopLink }) {
  const isVideo = link.mediaType === "video" && link.videoUrl;

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group flex rounded-2xl border border-border bg-card overflow-hidden transition-all duration-200 hover:shadow-md hover:scale-[1.01]",
        "flex-col sm:flex-row"
      )}
    >
      <div className="relative sm:w-2/5 aspect-[4/3] sm:aspect-auto sm:min-h-[120px] bg-bg-blush flex-shrink-0">
        {isVideo ? (
          <video
            src={link.videoUrl}
            muted
            autoPlay
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : link.imageUrl ? (
          <Image
            src={link.imageUrl}
            alt={link.alt || link.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 230px"
          />
        ) : null}
      </div>

      <div className="flex-1 p-4 flex flex-col justify-center">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-text-primary group-hover:text-accent-rose transition-colors">
              {link.title}
            </h3>
            {link.description && (
              <p className="mt-1 text-xs text-text-muted line-clamp-2">
                {link.description}
              </p>
            )}
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-text-muted/50 flex-shrink-0 mt-0.5" />
        </div>
      </div>
    </a>
  );
}
