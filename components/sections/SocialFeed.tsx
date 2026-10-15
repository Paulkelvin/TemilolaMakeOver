"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Play, X, ExternalLink } from "lucide-react";
import { SectionWrapper } from "@/components/ui/BackgroundDecor";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/lib/site-config";
import type { SocialPost } from "@/sanity/fetch";

function embedUrl(post: SocialPost): string | null {
  if (post.platform === "tiktok") {
    const id = post.url.match(/\/video\/(\d+)/)?.[1];
    return id ? `https://www.tiktok.com/player/v1/${id}?autoplay=1&rel=0&music_info=0` : null;
  }
  const m = post.url.match(/instagram\.com\/(p|reel)\/([\w-]+)/);
  return m ? `https://www.instagram.com/${m[1]}/${m[2]}/embed/` : null;
}

const platformName = { tiktok: "TikTok", instagram: "Instagram" } as const;

function PlatformIcon({ platform, className }: { platform: SocialPost["platform"]; className?: string }) {
  return platform === "tiktok" ? (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
    </svg>
  ) : (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function SocialFeed({ posts }: { posts: SocialPost[] }) {
  const [active, setActive] = useState<SocialPost | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!active) return;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setActive(null);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [active]);

  if (posts.length === 0) return null;
  const activeEmbed = active ? embedUrl(active) : null;

  return (
    <SectionWrapper variant="cream" id="social">
      <Container>
        <SectionHeading
          compact
          label="Follow Along"
          title="Fresh From Our Socials"
          subtitle="Recent looks from TikTok and Instagram. Tap to watch."
        />

        <ul className="-mx-4 px-4 flex gap-3 md:gap-4 overflow-x-auto snap-x snap-mandatory pb-2 md:mx-0 md:px-0 md:justify-center [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {posts.map((post) => (
            <li key={post.id} className="snap-start shrink-0 w-[42%] sm:w-[30%] md:w-52 lg:w-56">
              <button
                type="button"
                onClick={() => (embedUrl(post) ? setActive(post) : window.open(post.url, "_blank", "noopener"))}
                className="group relative block w-full aspect-[9/16] overflow-hidden rounded-2xl bg-bg-cream shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-rose"
                aria-label={`Watch on ${platformName[post.platform]}: ${post.caption}`}
              >
                <Image
                  src={post.coverUrl}
                  alt={post.caption}
                  fill
                  sizes="(max-width: 640px) 42vw, (max-width: 768px) 30vw, 224px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
                <span className="absolute left-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm">
                  <PlatformIcon platform={post.platform} className="h-4 w-4" />
                </span>
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/85 text-text-primary shadow-md transition-transform duration-300 group-hover:scale-110">
                    <Play className="h-5 w-5 translate-x-0.5" fill="currentColor" />
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm">
          <a
            href={siteConfig.tiktok}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-border bg-card px-5 text-text-primary hover:border-accent-rose hover:text-accent-rose transition-colors"
          >
            <PlatformIcon platform="tiktok" className="h-4 w-4" />
            {siteConfig.tiktokHandle} on TikTok
          </a>
          <a
            href={siteConfig.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-border bg-card px-5 text-text-primary hover:border-accent-rose hover:text-accent-rose transition-colors"
          >
            <PlatformIcon platform="instagram" className="h-4 w-4" />
            {siteConfig.instagramHandle} on Instagram
          </a>
        </div>
      </Container>

      {active && activeEmbed && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${platformName[active.platform]} video: ${active.caption}`}
          onClick={(e) => e.target === e.currentTarget && setActive(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 modal-overlay-enter"
        >
          <div className="relative flex flex-col items-center gap-3 modal-panel-enter">
            <button
              ref={closeRef}
              type="button"
              onClick={() => setActive(null)}
              aria-label="Close video"
              className="self-end flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <div
              className={
                active.platform === "tiktok"
                  ? "aspect-[9/16] h-[min(72vh,640px)] overflow-hidden rounded-2xl bg-black"
                  : "h-[min(76vh,720px)] w-[min(92vw,400px)] overflow-hidden rounded-2xl bg-white"
              }
            >
              <iframe
                src={activeEmbed}
                title={`${platformName[active.platform]} video: ${active.caption}`}
                className="h-full w-full"
                allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                allowFullScreen
              />
            </div>
            <a
              href={active.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-white px-5 text-sm font-medium text-text-primary hover:bg-bg-blush transition-colors"
            >
              <PlatformIcon platform={active.platform} className="h-4 w-4" />
              Open in {platformName[active.platform]}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      )}
    </SectionWrapper>
  );
}
