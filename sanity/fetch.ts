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
  SERVICE_BY_SLUG_QUERY,
  PACKAGES_QUERY,
  PORTFOLIO_QUERY,
  INSTAGRAM_FEED_QUERY,
  TESTIMONIALS_QUERY,
  FAQ_QUERY,
  BOOKING_STEPS_QUERY,
  WHY_CHOOSE_US_QUERY,
  ABOUT_VALUES_QUERY,
  TRANSFORMATIONS_QUERY,
  BLOG_POSTS_QUERY,
  BLOG_POST_BY_SLUG_QUERY,
  BLOCKED_DATES_QUERY,
  TRAVEL_ZONES_QUERY,
  SITE_SETTINGS_QUERY,
  PAGE_COPY_QUERY,
} from "./queries";
import type { Service } from "@/data/services";
import type { Package } from "@/data/packages";
import type { PortfolioItem, PortfolioCategory } from "@/data/portfolio";
import type { Testimonial } from "@/data/testimonials";
import type { FAQItem } from "@/data/faq";

const REVALIDATE = { next: { revalidate: 60 } };
const REVALIDATE_FAST = { next: { revalidate: 30 } };

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
  highlighted?: boolean;
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
    highlighted: s.highlighted ?? false,
  }));
});

export const getServiceBySlug = cache(async (slug: string): Promise<Service | null> => {
  const s: RawService | null = await client.fetch(SERVICE_BY_SLUG_QUERY, { slug }, REVALIDATE);
  if (!s) return null;
  return {
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
    highlighted: s.highlighted ?? false,
  };
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
  avatarUrl?: string;
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
    avatarUrl: t.avatarUrl,
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

// ─── About Values ────────────────────────────────────────────────────────────
export interface AboutValue {
  _id: string;
  title: string;
  text: string;
  icon: string;
  order: number;
}

export const getAboutValues = cache(async (): Promise<AboutValue[]> => {
  return client.fetch(ABOUT_VALUES_QUERY, {}, REVALIDATE);
});

// ─── Transformations ────────────────────────────────────────────────────────
interface SanityHotspot {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface SanityCrop {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

interface SanityImageMeta {
  metadata: { dimensions: { width: number; height: number } };
}

interface RawTransformation {
  _id: string;
  title: string;
  beforeUrl: string;
  beforeHotspot?: SanityHotspot;
  beforeCrop?: SanityCrop;
  beforeMeta?: SanityImageMeta;
  beforeAlt: string;
  afterUrl: string;
  afterHotspot?: SanityHotspot;
  afterCrop?: SanityCrop;
  afterMeta?: SanityImageMeta;
  afterAlt: string;
}

export interface Transformation {
  id: string;
  title: string;
  beforeUrl: string;
  beforeAlt: string;
  afterUrl: string;
  afterAlt: string;
}

function croppedUrl(
  url: string,
  meta?: SanityImageMeta,
  crop?: SanityCrop,
  hotspot?: SanityHotspot
): string {
  if (!url) return url;
  if (crop && meta) {
    const w = meta.metadata.dimensions.width;
    const h = meta.metadata.dimensions.height;
    const left = Math.round(crop.left * w);
    const top = Math.round(crop.top * h);
    const cropW = Math.round(w * (1 - crop.left - crop.right));
    const cropH = Math.round(h * (1 - crop.top - crop.bottom));
    const sep = url.includes("?") ? "&" : "?";
    return `${url}${sep}rect=${left},${top},${cropW},${cropH}&w=800&h=1000`;
  }
  if (hotspot) {
    const sep = url.includes("?") ? "&" : "?";
    return `${url}${sep}w=800&h=1000&fit=crop&crop=focalpoint&fp-x=${hotspot.x.toFixed(2)}&fp-y=${hotspot.y.toFixed(2)}`;
  }
  return url;
}

export const getTransformations = cache(async (): Promise<Transformation[]> => {
  const raw: RawTransformation[] = await client.fetch(TRANSFORMATIONS_QUERY, {}, REVALIDATE_FAST);
  return raw.map((t) => ({
    id: t._id,
    title: t.title,
    beforeUrl: croppedUrl(t.beforeUrl, t.beforeMeta, t.beforeCrop, t.beforeHotspot),
    beforeAlt: t.beforeAlt,
    afterUrl: croppedUrl(t.afterUrl, t.afterMeta, t.afterCrop, t.afterHotspot),
    afterAlt: t.afterAlt,
  }));
});

// ─── Blocked Dates ─────────────────────────────────────────────────────────
export const getBlockedDates = cache(async (): Promise<string[]> => {
  const raw: { date: string }[] = await client.fetch(BLOCKED_DATES_QUERY, {}, REVALIDATE_FAST);
  return raw.map((d) => d.date);
});

// ─── Blog Posts ──────────────────────────────────────────────────────────────
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body?: any[];
  category: string;
  coverImageUrl?: string;
  author: string;
  publishedAt: string;
}

interface RawBlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  body?: any[];
  category: string;
  coverImageUrl?: string;
  author: string;
  publishedAt: string;
}

export const getBlogPosts = cache(async (): Promise<BlogPost[]> => {
  const raw: RawBlogPost[] = await client.fetch(BLOG_POSTS_QUERY, {}, REVALIDATE);
  return raw.map((p) => ({
    id: p._id,
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    category: p.category,
    coverImageUrl: p.coverImageUrl,
    author: p.author ?? "Temilola",
    publishedAt: p.publishedAt,
  }));
});

export const getBlogPostBySlug = cache(async (slug: string): Promise<BlogPost | null> => {
  const p: RawBlogPost | null = await client.fetch(BLOG_POST_BY_SLUG_QUERY, { slug }, REVALIDATE);
  if (!p) return null;
  return {
    id: p._id,
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    body: p.body,
    category: p.category,
    coverImageUrl: p.coverImageUrl,
    author: p.author ?? "Temilola",
    publishedAt: p.publishedAt,
  };
});

// ─── Instagram Feed ──────────────────────────────────────────────────────────
export interface InstagramFeedItem {
  id: string;
  title: string;
  alt: string;
  imageUrl: string;
  instagramUrl?: string;
}

export const getInstagramFeed = cache(async (): Promise<InstagramFeedItem[]> => {
  const raw: { _id: string; title: string; alt: string; imageUrl: string; instagramUrl?: string }[] =
    await client.fetch(INSTAGRAM_FEED_QUERY, {}, REVALIDATE);
  return raw.map((p) => ({
    id: p._id,
    title: p.title,
    alt: p.alt,
    imageUrl: p.imageUrl ?? "",
    instagramUrl: p.instagramUrl,
  }));
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

// ─── Travel Zones ──────────────────────────────────────────────────────────
export interface SanityTravelZone {
  id: string;
  label: string;
  areas: string;
  fee: number;
  note?: string;
}

export const getTravelZones = cache(async (): Promise<SanityTravelZone[]> => {
  const raw: { _id: string; label: string; areas: string; fee: number; note?: string }[] =
    await client.fetch(TRAVEL_ZONES_QUERY, {}, REVALIDATE);
  return raw.map((z) => ({
    id: z._id,
    label: z.label,
    areas: z.areas,
    fee: z.fee,
    note: z.note,
  }));
});

export interface SiteSettings {
  youtubeReelUrl?: string;
  heroImageMain?: string;
  heroImageSecondary?: string;
  heroImageDetail?: string;
  aboutImage?: string;
}

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  const data = await client.fetch(SITE_SETTINGS_QUERY, {}, REVALIDATE_FAST);
  return data ?? {};
});

export interface PageCopySection {
  key: string;
  label?: string;
  headline?: string;
  paragraph?: string;
  intro?: string;
  subtitle?: string;
  title?: string;
  body?: string;
  cta?: string;
  footnote?: string;
  note?: string;
  paragraphs?: string[];
}

export interface PageCopy {
  page?: string;
  seoTitle?: string;
  seoDescription?: string;
  heroLabel?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroEyebrow?: string;
  heroTrustLine?: string;
  heroBadges?: string[];
  heroPrimaryCta?: string;
  heroSecondaryCta?: string;
  heroImageUrl?: string;
  sections?: PageCopySection[];
}

function findSection(copy: PageCopy | null, key: string): PageCopySection | undefined {
  return copy?.sections?.find((s) => s.key === key);
}

export { findSection };

export const getPageCopy = cache(async (page: string): Promise<PageCopy> => {
  const data = await client.fetch(PAGE_COPY_QUERY, { page }, REVALIDATE_FAST);
  return data ?? {};
});
