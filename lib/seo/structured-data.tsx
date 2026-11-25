import type { FAQItem } from "@/data/faq";
import { siteConfig } from "@/lib/site-config";

export function FAQPageJsonLd({ items }: { items: FAQItem[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function WebSiteJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.brand,
    url: siteConfig.url,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; href: string }[];
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${siteConfig.url}${item.href}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function BlogPostJsonLd({
  title,
  description,
  slug,
  publishedAt,
  author,
  coverImageUrl,
}: {
  title: string;
  description: string;
  slug: string;
  publishedAt: string;
  author: string;
  coverImageUrl?: string;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    url: `${siteConfig.url}/blog/${slug}`,
    datePublished: publishedAt,
    author: {
      "@type": "Person",
      name: author,
      url: `${siteConfig.url}/about`,
      jobTitle: "Professional Makeup Artist",
      worksFor: {
        "@type": "Organization",
        name: siteConfig.brand,
        url: siteConfig.url,
      },
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.brand,
      url: siteConfig.url,
    },
    ...(coverImageUrl && { image: coverImageUrl }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function ServiceJsonLd({
  name,
  description,
  slug,
  priceFrom,
}: {
  name: string;
  description: string;
  slug: string;
  priceFrom?: number;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    url: `${siteConfig.url}/services/${slug}`,
    provider: {
      "@type": "LocalBusiness",
      name: siteConfig.brand,
      url: siteConfig.url,
    },
    areaServed: {
      "@type": "City",
      name: "Lagos",
    },
    ...(priceFrom && {
      offers: {
        "@type": "Offer",
        priceCurrency: "NGN",
        price: priceFrom,
        priceSpecification: {
          "@type": "PriceSpecification",
          priceCurrency: "NGN",
          price: priceFrom,
          description: "Starting from",
        },
      },
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function TrainingCoursesJsonLd({
  courses,
}: {
  courses: readonly {
    title: string;
    description: string;
    price?: number;
    duration?: string;
    level?: string;
  }[];
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Professional Makeup Training Courses in Lagos — ${siteConfig.brand}`,
    url: `${siteConfig.url}/training`,
    itemListElement: courses.map((course, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Course",
        name: course.title,
        description: course.description,
        ...(course.level && { educationalLevel: course.level }),
        provider: {
          "@type": "Organization",
          name: siteConfig.brand,
          url: siteConfig.url,
        },
        hasCourseInstance: {
          "@type": "CourseInstance",
          courseMode: "onsite",
          location: {
            "@type": "Place",
            name: "Lagos, Nigeria",
            address: {
              "@type": "PostalAddress",
              addressLocality: "Lagos",
              addressCountry: "NG",
            },
          },
          ...(course.duration && { courseWorkload: course.duration }),
        },
        ...(typeof course.price === "number" &&
          course.price > 0 && {
            offers: {
              "@type": "Offer",
              category: "Paid",
              priceCurrency: "NGN",
              price: course.price,
              availability: "https://schema.org/InStock",
            },
          }),
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
