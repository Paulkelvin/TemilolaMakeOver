import { siteConfig } from "@/lib/site-config";
import { testimonials } from "@/data/testimonials";

function computeAggregateRating() {
  const count = testimonials.length;
  if (count === 0) return undefined;
  const avg = testimonials.reduce((sum, t) => sum + t.rating, 0) / count;
  return {
    "@type": "AggregateRating",
    ratingValue: avg.toFixed(1),
    bestRating: "5",
    worstRating: "1",
    ratingCount: count,
    reviewCount: count,
  };
}

export function JsonLd() {
  const aggregateRating = computeAggregateRating();

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
    logo: `${siteConfig.url}/opengraph-image`,
    founder: {
      "@type": "Person",
      name: siteConfig.artistName,
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
    ...(aggregateRating && { aggregateRating }),
    review: testimonials.map((t) => ({
      "@type": "Review",
      author: { "@type": "Person", name: t.name },
      reviewRating: {
        "@type": "Rating",
        ratingValue: t.rating,
        bestRating: "5",
      },
      reviewBody: t.text,
      itemReviewed: {
        "@type": "BeautySalon",
        name: siteConfig.brand,
      },
    })),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Makeup Services",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Bridal Makeup",
            description: "Professional bridal makeup with skin prep, trial session, and long-lasting finish for your wedding day in Lagos",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Traditional Bridal Makeup",
            description: "Traditional wedding makeup coordinated with gele and outfit for Nigerian ceremonies in Lagos",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Soft Glam Makeup",
            description: "Soft glam makeup for engagements, parties, and special occasions in Lagos",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Event Glam Makeup",
            description: "Event and party makeup services with home service available across Lagos",
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
