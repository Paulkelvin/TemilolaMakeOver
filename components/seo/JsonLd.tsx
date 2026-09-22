import { siteConfig } from "@/lib/site-config";
import { getServices } from "@/sanity/fetch";

export async function JsonLd() {
  const services = await getServices();

  const schema = {
    "@context": "https://schema.org",
    // A service-area business with no premises customers visit must not
    // use a physical-location type like BeautySalon, and must not publish
    // an address/geo/opening-hours-at-that-address — all three assert a
    // visitable storefront. areaServed is the correct way to express
    // "serves these places" without implying one.
    "@type": "LocalBusiness",
    "@id": `${siteConfig.url}/#organization`,
    name: siteConfig.brand,
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
