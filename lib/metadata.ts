import type { Metadata } from "next";
import { siteConfig } from "./site-config";

export function createPageMetadata({
  title,
  description,
  path = "",
}: {
  title: string;
  description?: string;
  path?: string;
}): Metadata {
  const fullTitle = title.includes(siteConfig.brand)
    ? title
    : `${title} | ${siteConfig.brand}`;
  const desc = description ?? siteConfig.description;
  const url = `${siteConfig.url}${path}`;

  return {
    title: fullTitle,
    description: desc,
    alternates: { canonical: url },
    openGraph: {
      title: fullTitle,
      description: desc,
      url,
      siteName: siteConfig.brand,
      locale: "en_NG",
      type: "website",
      images: [{ url: `${siteConfig.url}/opengraph-image`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: desc,
    },
  };
}
