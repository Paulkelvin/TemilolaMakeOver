import type { Metadata } from "next";
import { siteConfig } from "./site-config";

export function createPageMetadata({
  title,
  description,
  path = "",
  noindex = false,
  ogType = "website",
  publishedTime,
  author,
}: {
  title: string;
  description?: string;
  path?: string;
  noindex?: boolean;
  ogType?: "website" | "article";
  publishedTime?: string;
  author?: string;
}): Metadata {
  const fullTitle = title.includes(siteConfig.brand)
    ? title
    : `${title} | ${siteConfig.brand}`;
  const desc = description ?? siteConfig.description;
  const url = `${siteConfig.url}${path}`;

  const ogImages = [{ url: `${siteConfig.url}/opengraph-image`, width: 1200, height: 630 }];

  const openGraph =
    ogType === "article"
      ? {
          title: fullTitle,
          description: desc,
          url,
          siteName: siteConfig.brand,
          locale: "en_NG",
          type: "article" as const,
          images: ogImages,
          ...(publishedTime && { publishedTime }),
          ...(author && { authors: [author] }),
        }
      : {
          title: fullTitle,
          description: desc,
          url,
          siteName: siteConfig.brand,
          locale: "en_NG",
          type: "website" as const,
          images: ogImages,
        };

  return {
    title: { absolute: fullTitle },
    description: desc,
    alternates: { canonical: url },
    ...(noindex && { robots: { index: false, follow: false } }),
    openGraph,
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: desc,
    },
  };
}
