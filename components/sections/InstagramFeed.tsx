import Image from "next/image";
import Link from "next/link";
import { SectionWrapper } from "@/components/ui/BackgroundDecor";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/lib/site-config";
import type { InstagramFeedItem } from "@/sanity/fetch";

interface InstagramFeedProps {
  items: InstagramFeedItem[];
}

export function InstagramFeed({ items }: InstagramFeedProps) {
  if (!items || items.length === 0) return null;

  return (
    <SectionWrapper variant="cream" id="instagram">
      <Container>
        <SectionHeading
          label="Follow Along"
          title="@gleambytemi on Instagram"
          subtitle="Behind-the-scenes, client looks, and everyday glam — follow for more."
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-3">
          {items.map((item) => {
            const inner = (
              <div className="group relative aspect-square overflow-hidden rounded-xl bg-bg-blush">
                <Image
                  src={item.imageUrl}
                  alt={item.alt || item.title}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-luxury-dark/0 group-hover:bg-luxury-dark/40 transition-colors duration-300 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    aria-hidden
                  >
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                  </svg>
                </div>
                {item.title && (
                  <p className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-luxury-dark/70 to-transparent px-3 py-4 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 line-clamp-2">
                    {item.title}
                  </p>
                )}
              </div>
            );

            return item.instagramUrl ? (
              <a
                key={item.id}
                href={item.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`View ${item.title || "post"} on Instagram`}
              >
                {inner}
              </a>
            ) : (
              <div key={item.id}>{inner}</div>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <a
            href={siteConfig.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-accent-rose hover:underline transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
              aria-hidden
            >
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
            </svg>
            Follow {siteConfig.instagramHandle} for more looks
          </a>
        </div>
      </Container>
    </SectionWrapper>
  );
}
