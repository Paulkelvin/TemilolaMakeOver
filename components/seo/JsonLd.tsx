import { siteConfig } from "@/lib/site-config";
import { getServices } from "@/sanity/fetch";

export async function JsonLd() {
  const services = await getServices();

  const schema = {
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    "@id": `${siteConfig.url}/#organization`,
    name: siteConfig.brand,
    alternateName: "Gleam by Temi Makeup Studio",
    description: siteConfig.description,
    url: siteConfig.url,
    telephone: siteConfig.phoneRaw,
    email: siteConfig.email,
    image: `${siteConfig.url}/opengraph-image`,
    founder: {
      "@type": "Person",
      name: "Temilola Shyllon",
      jobTitle: "Professional Makeup Artist",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Lagos",
      addressRegion: "Lagos",
      addressCountry: "NG",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "6.4541",
      longitude: "3.4218",
    },
    areaServed: [
      { "@type": "City", name: "Lagos" },
      { "@type": "Place", name: "Lekki, Lagos" },
      { "@type": "Place", name: "Victoria Island, Lagos" },
      { "@type": "Place", name: "Ikoyi, Lagos" },
      { "@type": "Place", name: "Ikeja, Lagos" },
      { "@type": "Place", name: "Surulere, Lagos" },
      { "@type": "Place", name: "Ajah, Lagos" },
      { "@type": "Place", name: "Festac, Lagos" },
      { "@type": "Place", name: "Ikorodu, Lagos" },
    ],
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "08:00",
      closes: "20:00",
    },
    priceRange: "₦₦₦",
    currenciesAccepted: "NGN",
    paymentAccepted: "Bank Transfer, Cash",
    sameAs: [siteConfig.instagram, siteConfig.tiktok],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Makeup Services",
      itemListElement: services.map((s) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: s.name,
          description: s.shortDescription,
        },
      })),
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
