import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/studio", "/payment/verify", "/command-center", "/cc-login"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
