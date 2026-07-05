import { NextResponse } from "next/server";
import { client } from "@/sanity/client";

// One fan-out query across the types an operator actually searches for day
// to day — reusing the field names already established in sanity/queries.ts,
// not a new query language or search index.
const SEARCH_QUERY = `{
  "services": *[_type == "service" && name match $term][0...5]{ _id, "title": name, "slug": slug.current },
  "portfolio": *[_type == "portfolioItem" && title match $term][0...5]{ _id, title },
  "blogPosts": *[_type == "blogPost" && title match $term][0...5]{ _id, title, "slug": slug.current },
  "locations": *[_type == "location" && status == "published" && name match $term][0...5]{ _id, "title": name, "slug": slug.current },
  "testimonials": *[_type == "testimonial" && name match $term][0...5]{ _id, "title": name },
  "faqs": *[_type == "faq" && question match $term][0...5]{ _id, "title": question }
}`;

interface RawHit {
  _id: string;
  title?: string;
  slug?: string;
}

interface SearchResult {
  id: string;
  type: string;
  typeLabel: string;
  title: string;
  href: string;
}

function editUrl(type: string, id: string) {
  return `/studio/intent/edit/id=${id};type=${type}`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const raw = await client.fetch<{
    services: RawHit[];
    portfolio: RawHit[];
    blogPosts: RawHit[];
    locations: RawHit[];
    testimonials: RawHit[];
    faqs: RawHit[];
  }>(SEARCH_QUERY, { term: `${q}*` });

  const results: SearchResult[] = [
    ...raw.services.map((h): SearchResult => ({
      id: h._id, type: "service", typeLabel: "Service", title: h.title ?? h._id,
      href: h.slug ? `/services/${h.slug}` : editUrl("service", h._id),
    })),
    ...raw.portfolio.map((h): SearchResult => ({
      id: h._id, type: "portfolioItem", typeLabel: "Portfolio", title: h.title ?? h._id,
      href: editUrl("portfolioItem", h._id),
    })),
    ...raw.blogPosts.map((h): SearchResult => ({
      id: h._id, type: "blogPost", typeLabel: "Blog post", title: h.title ?? h._id,
      href: h.slug ? `/blog/${h.slug}` : editUrl("blogPost", h._id),
    })),
    ...raw.locations.map((h): SearchResult => ({
      id: h._id, type: "location", typeLabel: "Location", title: h.title ?? h._id,
      href: h.slug ? `/locations/${h.slug}` : editUrl("location", h._id),
    })),
    ...raw.testimonials.map((h): SearchResult => ({
      id: h._id, type: "testimonial", typeLabel: "Testimonial", title: h.title ?? h._id,
      href: editUrl("testimonial", h._id),
    })),
    ...raw.faqs.map((h): SearchResult => ({
      id: h._id, type: "faq", typeLabel: "FAQ", title: h.title ?? h._id,
      href: editUrl("faq", h._id),
    })),
  ];

  return NextResponse.json({ results });
}
