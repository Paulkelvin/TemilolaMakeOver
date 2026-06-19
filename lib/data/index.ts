/**
 * Central content API — CMS-ready.
 * Replace these exports with Sanity/async fetchers when CMS is connected.
 */

export { siteConfig, navLinks } from "@/lib/site-config";
export { services } from "@/data/services";
export { packages, pricingFactors } from "@/data/packages";
export { portfolioItems, portfolioCategories } from "@/data/portfolio";
export { testimonials } from "@/data/testimonials";
export { faqItems } from "@/data/faq";
export { bookingSteps, whyChooseUs, trustItems } from "@/data/booking-steps";
export {
  seoCopy,
  homeCopy,
  servicesPageCopy,
  portfolioPageCopy,
  pricingPageCopy,
  aboutPageCopy,
  bookPageCopy,
  ctaBank,
} from "@/data/copy";

export type * from "./types";
