import { cache } from "react";
import {
  Camera,
  Crown,
  Home,
  Palette,
  PartyPopper,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";
import { client } from "./client";
import {
  SERVICES_QUERY,
  PACKAGES_QUERY,
  PORTFOLIO_QUERY,
  TESTIMONIALS_QUERY,
  FAQ_QUERY,
  BOOKING_STEPS_QUERY,
  WHY_CHOOSE_US_QUERY,
  TRANSFORMATIONS_QUERY,
} from "./queries";
import type { Service } from "@/data/services";
import type { Package } from "@/data/packages";
import type { PortfolioItem, PortfolioCategory } from "@/data/portfolio";
import type { Testimonial } from "@/data/testimonials";
import type { FAQItem } from "@/data/faq";

const REVALIDATE = { next: { revalidate: 3600 } };

const iconMap: Record<string, LucideIcon> = {
  crown: Crown,
  sparkles: Sparkles,
  palette: Palette,
  "party-popper": PartyPopper,
  camera: Camera,
  home: Home,
  users: Users,
};

// ─── Services ────────────────────────────────────────────────────────────────
interface RawService {
  _id: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  whoFor: string;
  bestFor: string;
  included: string[];
  duration: string;
  homeService: boolean;
  priceFrom?: number;
  icon: string;
  imageUrl?: string;
}

export const getServices = cache(async (): Promise<Service[]> => {
  const raw: RawService[] = await client.fetch(SERVICES_QUERY, {}, REVALIDATE);
  return raw.map((s) => ({
    id: s._id,
    name: s.name,
    slug: s.slug,
    shortDescription: s.shortDescription,
    description: s.description,
    whoFor: s.whoFor,
    bestFor: s.bestFor,
    included: s.included ?? [],
    duration: s.duration,
    homeService: s.homeService ?? false,
    priceFrom: s.priceFrom,
    icon: iconMap[s.icon] ?? Sparkles,
    imageUrl: s.imageUrl,
  }));
});

// ─── Packages ────────────────────────────────────────────────────────────────
interface RawPackage {
  _id: string;
  name: string;
  bestFor: string;
  shortDescription: string;
  priceFrom: number;
  duration: string;
  features: string[];
  highlighted?: boolean;
}

export const getPackages = cache(async (): Promise<Package[]> => {
  const raw: RawPackage[] = await client.fetch(PACKAGES_QUERY, {}, REVALIDATE);
  return raw.map((p) => ({
    id: p._id,
    name: p.name,
    bestFor: p.bestFor,
    shortDescription: p.shortDescription,
    priceFrom: p.priceFrom,
    duration: p.duration,
    features: p.features ?? [],
    highlighted: p.highlighted ?? false,
  }));
});

// ─── Portfolio ───────────────────────────────────────────────────────────────
interface RawPortfolioItem {
  _id: string;
  title: string;
  alt: string;
  category: PortfolioCategory;
  aspect?: "portrait" | "square" | "tall";
  imageUrl?: string;
}

export const getPortfolioItems = cache(async (): Promise<PortfolioItem[]> => {
  const raw: RawPortfolioItem[] = await client.fetch(
    PORTFOLIO_QUERY,
    {},
    REVALIDATE
  );
  return raw.map((p) => ({
    id: p._id,
    title: p.title,
    alt: p.alt,
    category: p.category,
    aspect: p.aspect,
    src: p.imageUrl ?? "",
  }));
});

// ─── Testimonials ─────────────────────────────────────────────────────────────
interface RawTestimonial {
  _id: string;
  name: string;
  event: string;
  text: string;
  rating: number;
  initials: string;
}

export const getTestimonials = cache(async (): Promise<Testimonial[]> => {
  const raw: RawTestimonial[] = await client.fetch(
    TESTIMONIALS_QUERY,
    {},
    REVALIDATE
  );
  return raw.map((t) => ({
    id: t._id,
    name: t.name,
    event: t.event,
    text: t.text,
    rating: t.rating,
    initials: t.initials,
  }));
});

// ─── FAQ ────────────────────────────────────────────────────────────────────
interface RawFAQ {
  _id: string;
  question: string;
  answer: string;
}

export const getFaqItems = cache(async (): Promise<FAQItem[]> => {
  const raw: RawFAQ[] = await client.fetch(FAQ_QUERY, {}, REVALIDATE);
  return raw.map((f) => ({
    id: f._id,
    question: f.question,
    answer: f.answer,
  }));
});

// ─── Booking Steps ─────────────────────────────────────────────────────────
export interface BookingStep {
  id: string;
  step: number;
  title: string;
  description: string;
}

export const getBookingSteps = cache(async (): Promise<BookingStep[]> => {
  return client.fetch(BOOKING_STEPS_QUERY, {}, REVALIDATE);
});

// ─── Why Choose Us ──────────────────────────────────────────────────────────
export interface WhyChooseUsItem {
  id: string;
  title: string;
  description: string;
}

export const getWhyChooseUs = cache(async (): Promise<WhyChooseUsItem[]> => {
  return client.fetch(WHY_CHOOSE_US_QUERY, {}, REVALIDATE);
});

// ─── Transformations ────────────────────────────────────────────────────────
export interface Transformation {
  id: string;
  title: string;
  beforeUrl: string;
  beforeAlt: string;
  afterUrl: string;
  afterAlt: string;
}

export const getTransformations = cache(async (): Promise<Transformation[]> => {
  return client.fetch(TRANSFORMATIONS_QUERY, {}, REVALIDATE);
});

// ─── Portfolio categories (derived) ─────────────────────────────────────────
export async function getPortfolioCategories(): Promise<PortfolioCategory[]> {
  const items = await getPortfolioItems();
  const seen = new Set<PortfolioCategory>();
  const order: PortfolioCategory[] = [
    "Bridal",
    "Soft Glam",
    "Event Glam",
    "Traditional",
    "Photoshoot",
    "Before & After",
  ];
  items.forEach((i) => seen.add(i.category));
  return order.filter((c) => seen.has(c));
}
