import { siteConfig } from "@/lib/site-config";

export function JsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    name: siteConfig.brand,
    description: siteConfig.description,
    url: siteConfig.url,
    telephone: siteConfig.phoneRaw,
    email: siteConfig.email,
    image: `${siteConfig.url}/opengraph-image`,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Lagos",
      addressCountry: "NG",
    },
    areaServed: {
      "@type": "City",
      name: "Lagos",
    },
    priceRange: "₦₦₦",
    sameAs: [siteConfig.instagram, siteConfig.tiktok],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Makeup Services",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Bridal Makeup",
            description: "Professional bridal makeup in Lagos",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Event Glam Makeup",
            description: "Event and party makeup services",
          },
        },
      ],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
