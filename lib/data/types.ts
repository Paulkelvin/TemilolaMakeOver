/**
 * CMS-ready content types.
 * Swap data/*.ts sources for Sanity fetches without changing component props.
 */

export type { Service } from "@/data/services";
export type { Package } from "@/data/packages";
export type { PortfolioItem, PortfolioCategory } from "@/data/portfolio";
export type { Testimonial } from "@/data/testimonials";
export type { FAQItem } from "@/data/faq";

export interface SiteContent {
  brandName: string;
  artistName: string;
  location: string;
  phone: string;
  whatsappNumber: string;
  email: string;
  instagram: string;
  tiktok: string;
}
