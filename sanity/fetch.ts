import { cache } from "react";
import {
  Camera,
  Crown,
  GraduationCap,
  Home,
  Palette,
  PartyPopper,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";
import { client } from "./client";
import { urlFor } from "./image";
import {
  SERVICES_QUERY,
  SERVICE_BY_SLUG_QUERY,
  PORTFOLIO_QUERY,
  INSTAGRAM_FEED_QUERY,
  TESTIMONIALS_QUERY,
  FAQ_QUERY,
  FAQ_BY_CATEGORY_QUERY,
  FAQ_BY_SERVICE_QUERY,
  FAQ_GENERAL_QUERY,
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
  TRAINING_COURSES_QUERY,
  SHOP_LINKS_QUERY,
  SHOP_PAGE_SETTINGS_QUERY,
  BIO_LINKS_QUERY,
  LINKS_PAGE_SETTINGS_QUERY,
  LOCATIONS_QUERY,
  LOCATION_BY_SLUG_QUERY,
  ARTISTS_QUERY,
  MAKEUP_STYLES_QUERY,
  OCCASIONS_QUERY,
  WEDDING_TYPES_QUERY,
  PORTFOLIO_BY_LOCATION_QUERY,
  TESTIMONIALS_BY_LOCATION_QUERY,
} from "./queries";
import type { Service } from "@/data/services";
import type { PortfolioItem, PortfolioCategory } from "@/data/portfolio";
import type { Testimonial } from "@/data/testimonials";
import type { FAQItem } from "@/data/faq";

// Long time-based windows are intentional: on-demand revalidation (see
// app/(site)/api/revalidate/route.ts) already refreshes affected pages
// immediately when content is published in Studio. These windows are only
// the fallback for cases that don't go through that webhook.
const REVALIDATE = { next: { revalidate: 3600 } }; // 1 hour
const REVALIDATE_FAST = { next: { revalidate: 300 } }; // 5 minutes

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function imgUrl(image: any, width?: number): string {
  if (!image?.asset) return "";
  let b = urlFor(image).auto("format");
  if (width) b = b.width(width);
  return b.url();
}

const iconMap: Record<string, LucideIcon> = {
  crown: Crown,
  sparkles: Sparkles,
  palette: Palette,
  "party-popper": PartyPopper,
  camera: Camera,
  home: Home,
  users: Users,
  "graduation-cap": GraduationCap,
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
  availableInStudio?: boolean;
  priceFrom?: number;
  icon: string;
  highlighted?: boolean;
  styles?: string[];
  occasions?: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  image?: any;
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
    availableInStudio: s.availableInStudio ?? false,
    priceFrom: s.priceFrom,
    icon: iconMap[s.icon] ?? Sparkles,
    imageUrl: imgUrl(s.image, 800),
    highlighted: s.highlighted ?? false,
    styles: s.styles ?? [],
    occasions: s.occasions ?? [],
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
    availableInStudio: s.availableInStudio ?? false,
    priceFrom: s.priceFrom,
    icon: iconMap[s.icon] ?? Sparkles,
    imageUrl: imgUrl(s.image, 800),
    highlighted: s.highlighted ?? false,
    styles: s.styles ?? [],
    occasions: s.occasions ?? [],
  };
});

// ─── Portfolio ───────────────────────────────────────────────────────────────
interface RawPortfolioItem {
  _id: string;
  title: string;
  alt: string;
  category: PortfolioCategory;
  aspect?: "portrait" | "square" | "tall";
  service?: string;
  style?: string;
  occasion?: string;
  weddingType?: string;
  location?: string;
  artist?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  image?: any;
}

function mapPortfolioItem(p: RawPortfolioItem): PortfolioItem {
  return {
    id: p._id,
    title: p.title,
    alt: p.alt,
    category: p.category,
    aspect: p.aspect,
    src: imgUrl(p.image, 1200),
    service: p.service,
    style: p.style,
    occasion: p.occasion,
    weddingType: p.weddingType,
    location: p.location,
    artist: p.artist,
  };
}

export const getPortfolioItems = cache(async (): Promise<PortfolioItem[]> => {
  const raw: RawPortfolioItem[] = await client.fetch(
    PORTFOLIO_QUERY,
    {},
    REVALIDATE
  );
  return raw.map(mapPortfolioItem);
});

// Powers location pages: only returns real, editorially-tagged proof for that
// location — an untagged location simply gets an empty array, not fabricated content.
export const getPortfolioItemsByLocation = cache(async (locationSlug: string): Promise<PortfolioItem[]> => {
  const raw: RawPortfolioItem[] = await client.fetch(PORTFOLIO_BY_LOCATION_QUERY, { slug: locationSlug }, REVALIDATE);
  return raw.map(mapPortfolioItem);
});

// ─── Testimonials ─────────────────────────────────────────────────────────────
interface RawTestimonial {
  _id: string;
  name: string;
  event: string;
  text: string;
  rating: number;
  initials: string;
  audienceType?: "client" | "student";
  service?: string;
  style?: string;
  occasion?: string;
  weddingType?: string;
  location?: string;
  artist?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  avatar?: any;
}

function mapTestimonial(t: RawTestimonial): Testimonial {
  return {
    id: t._id,
    name: t.name,
    event: t.event,
    text: t.text,
    rating: t.rating,
    initials: t.initials,
    avatarUrl: imgUrl(t.avatar, 100),
    audienceType: t.audienceType ?? "client",
    service: t.service,
    style: t.style,
    occasion: t.occasion,
    weddingType: t.weddingType,
    location: t.location,
    artist: t.artist,
  };
}

export const getTestimonials = cache(async (): Promise<Testimonial[]> => {
  const raw: RawTestimonial[] = await client.fetch(
    TESTIMONIALS_QUERY,
    {},
    REVALIDATE
  );
  return raw.map(mapTestimonial);
});

// Powers location pages: real, editorially-tagged testimonials only.
export const getTestimonialsByLocation = cache(async (locationSlug: string): Promise<Testimonial[]> => {
  const raw: RawTestimonial[] = await client.fetch(TESTIMONIALS_BY_LOCATION_QUERY, { slug: locationSlug }, REVALIDATE);
  return raw.map(mapTestimonial);
});

// ─── FAQ ────────────────────────────────────────────────────────────────────
interface RawFAQ {
  _id: string;
  question: string;
  answer: string;
  service?: string;
  occasion?: string;
  location?: string;
}

function mapFaq(f: RawFAQ): FAQItem {
  return {
    id: f._id,
    question: f.question,
    answer: f.answer,
    service: f.service,
    occasion: f.occasion,
    location: f.location,
  };
}

export const getFaqItems = cache(async (): Promise<FAQItem[]> => {
  const raw: RawFAQ[] = await client.fetch(FAQ_QUERY, {}, REVALIDATE);
  return raw.map(mapFaq);
});

export const getFaqItemsByCategory = cache(async (category: "general" | "pricing"): Promise<FAQItem[]> => {
  const raw: RawFAQ[] = await client.fetch(FAQ_BY_CATEGORY_QUERY, { category }, REVALIDATE);
  return raw.map(mapFaq);
});

export const getFaqItemsByService = cache(async (serviceSlug: string): Promise<FAQItem[]> => {
  const raw: RawFAQ[] = await client.fetch(FAQ_BY_SERVICE_QUERY, { slug: serviceSlug }, REVALIDATE);
  return raw.map(mapFaq);
});

export const getGeneralFaqItems = cache(async (): Promise<FAQItem[]> => {
  const raw: RawFAQ[] = await client.fetch(FAQ_GENERAL_QUERY, {}, REVALIDATE);
  return raw.map(mapFaq);
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
interface RawTransformation {
  _id: string;
  title: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  beforeImage?: any;
  beforeAlt: string;
  beforeFocusY?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  afterImage?: any;
  afterAlt: string;
  afterFocusY?: number;
  service?: string;
  style?: string;
  occasion?: string;
  weddingType?: string;
  location?: string;
  artist?: string;
}

export interface Transformation {
  id: string;
  title: string;
  beforeUrl: string;
  beforeAlt: string;
  // CSS object-position value ("50% Y%") — lets a writer nudge the vertical
  // focus in Studio so the head lines up with the After image mid-drag,
  // instead of every pair defaulting to a dead-center crop.
  beforePosition: string;
  afterUrl: string;
  afterAlt: string;
  afterPosition: string;
  service?: string;
  style?: string;
  occasion?: string;
  weddingType?: string;
  location?: string;
  artist?: string;
}

export const getTransformations = cache(async (): Promise<Transformation[]> => {
  const raw: RawTransformation[] = await client.fetch(TRANSFORMATIONS_QUERY, {}, REVALIDATE_FAST);
  return raw.map((t) => ({
    id: t._id,
    title: t.title,
    beforeUrl: imgUrl(t.beforeImage, 800),
    beforeAlt: t.beforeAlt,
    beforePosition: `50% ${t.beforeFocusY ?? 50}%`,
    afterUrl: imgUrl(t.afterImage, 800),
    afterAlt: t.afterAlt,
    afterPosition: `50% ${t.afterFocusY ?? 50}%`,
    service: t.service,
    style: t.style,
    occasion: t.occasion,
    weddingType: t.weddingType,
    location: t.location,
    artist: t.artist,
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
  primaryService?: string;
  relatedStyle?: string;
  relatedOccasion?: string;
  relatedWeddingType?: string;
  relatedLocations?: string[];
}

interface RawBlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  body?: any[];
  category: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  coverImage?: any;
  author: string;
  publishedAt: string;
  primaryService?: string;
  relatedStyle?: string;
  relatedOccasion?: string;
  relatedWeddingType?: string;
  relatedLocations?: string[];
}

export const getBlogPosts = cache(async (): Promise<BlogPost[]> => {
  const raw: RawBlogPost[] = await client.fetch(BLOG_POSTS_QUERY, {}, REVALIDATE);
  return raw.map((p) => ({
    id: p._id,
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    category: p.category,
    coverImageUrl: imgUrl(p.coverImage, 1200),
    author: p.author ?? "Temilola",
    publishedAt: p.publishedAt,
    primaryService: p.primaryService,
    relatedStyle: p.relatedStyle,
    relatedOccasion: p.relatedOccasion,
    relatedWeddingType: p.relatedWeddingType,
    relatedLocations: p.relatedLocations,
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
    coverImageUrl: imgUrl(p.coverImage, 1200),
    author: p.author ?? "Temilola",
    publishedAt: p.publishedAt,
    primaryService: p.primaryService,
    relatedStyle: p.relatedStyle,
    relatedOccasion: p.relatedOccasion,
    relatedWeddingType: p.relatedWeddingType,
    relatedLocations: p.relatedLocations,
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw: { _id: string; title: string; alt: string; image?: any; instagramUrl?: string }[] =
    await client.fetch(INSTAGRAM_FEED_QUERY, {}, REVALIDATE);
  return raw.map((p) => ({
    id: p._id,
    title: p.title,
    alt: p.alt,
    imageUrl: imgUrl(p.image, 600),
    instagramUrl: p.instagramUrl,
  }));
});

// ─── Training Courses ──────────────────────────────────────────────────────
export interface TrainingCourse {
  id: string;
  title: string;
  slug?: string;
  level: "Beginner" | "Advanced" | "Bridal Specialty";
  description: string;
  duration: string;
  price: number;
  classSize: number;
  certification: boolean;
  curriculum: string[];
  highlights?: string[];
  imageUrl?: string;
}

interface RawTrainingCourse {
  _id: string;
  title: string;
  slug?: string;
  level: "Beginner" | "Advanced" | "Bridal Specialty";
  description: string;
  duration: string;
  price: number;
  classSize: number;
  certification: boolean;
  curriculum: string[];
  highlights?: string[];
  imageUrl?: string;
}

export const getTrainingCourses = cache(async (): Promise<TrainingCourse[]> => {
  const raw: RawTrainingCourse[] = await client.fetch(TRAINING_COURSES_QUERY, {}, REVALIDATE);
  return raw.map((c) => ({
    id: c._id,
    title: c.title,
    slug: c.slug,
    level: c.level,
    description: c.description ?? "",
    duration: c.duration ?? "",
    price: c.price ?? 0,
    classSize: c.classSize ?? 0,
    certification: c.certification ?? false,
    curriculum: c.curriculum ?? [],
    highlights: c.highlights,
    imageUrl: c.imageUrl,
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
  areas: string[];
  fee: number;
  note?: string;
}

export const getTravelZones = cache(async (): Promise<SanityTravelZone[]> => {
  const raw: { _id: string; label: string; areas: string[]; fee: number; note?: string }[] =
    await client.fetch(TRAVEL_ZONES_QUERY, {}, REVALIDATE);
  return raw.map((z) => ({
    id: z._id,
    label: z.label,
    areas: z.areas,
    fee: z.fee,
    note: z.note,
  }));
});

// ─── Locations ───────────────────────────────────────────────────────────────
export interface SanityLocation {
  id: string;
  name: string;
  slug: string;
  city?: string;
  areas: string[];
  travelZone?: { label: string; fee: number; note?: string };
  headline: string;
  subtitle: string;
  seoTitle: string;
  seoDescription: string;
  intro: string[];
  keywords: string[];
  localNotes?: string;
}

export const getLocations = cache(async (): Promise<SanityLocation[]> => {
  const raw: SanityLocation[] = await client.fetch(LOCATIONS_QUERY, {}, REVALIDATE);
  return raw;
});

export const getLocationBySlug = cache(async (slug: string): Promise<SanityLocation | null> => {
  const raw: SanityLocation | null = await client.fetch(LOCATION_BY_SLUG_QUERY, { slug }, REVALIDATE);
  return raw;
});

// ─── Artists ─────────────────────────────────────────────────────────────────
export interface Artist {
  id: string;
  name: string;
  slug: string;
  role?: string;
  bio?: string;
  photoUrl?: string;
  specialties?: string[];
  isPrimary: boolean;
  instagramUrl?: string;
}

interface RawArtist {
  _id: string;
  name: string;
  slug: string;
  role?: string;
  bio?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  photo?: any;
  specialties?: string[];
  isPrimary?: boolean;
  socialLinks?: { instagram?: string };
}

export const getArtists = cache(async (): Promise<Artist[]> => {
  const raw: RawArtist[] = await client.fetch(ARTISTS_QUERY, {}, REVALIDATE);
  return raw.map((a) => ({
    id: a._id,
    name: a.name,
    slug: a.slug,
    role: a.role,
    bio: a.bio,
    photoUrl: imgUrl(a.photo, 600),
    specialties: a.specialties ?? [],
    isPrimary: a.isPrimary ?? false,
    instagramUrl: a.socialLinks?.instagram,
  }));
});

// ─── Taxonomy: Makeup Styles, Occasions, Wedding Types ──────────────────────
export interface MakeupStyle {
  id: string;
  name: string;
  slug: string;
  description?: string;
  bestFor?: string;
  imageUrl?: string;
  order?: number;
}

export const getMakeupStyles = cache(async (): Promise<MakeupStyle[]> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw: any[] = await client.fetch(MAKEUP_STYLES_QUERY, {}, REVALIDATE);
  return raw.map((s) => ({
    id: s._id,
    name: s.name,
    slug: s.slug,
    description: s.description,
    bestFor: s.bestFor,
    imageUrl: imgUrl(s.image, 800),
    order: s.order,
  }));
});

export interface Occasion {
  id: string;
  name: string;
  slug: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  order?: number;
}

export const getOccasions = cache(async (): Promise<Occasion[]> => {
  const raw: Occasion[] = await client.fetch(OCCASIONS_QUERY, {}, REVALIDATE);
  return raw;
});

export interface WeddingType {
  id: string;
  name: string;
  slug: string;
  description?: string;
  culturalNotes?: string;
  imageUrl?: string;
  order?: number;
}

export const getWeddingTypes = cache(async (): Promise<WeddingType[]> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw: any[] = await client.fetch(WEDDING_TYPES_QUERY, {}, REVALIDATE);
  return raw.map((w) => ({
    id: w._id,
    name: w.name,
    slug: w.slug,
    description: w.description,
    culturalNotes: w.culturalNotes,
    imageUrl: imgUrl(w.image, 800),
    order: w.order,
  }));
});

// ─── Minimum-proof gate ──────────────────────────────────────────────────────
// Reusable check for future combination pages (e.g. a wedding-type or occasion
// detail page): only generate a page once real tagged proof exists for it,
// rather than generating every mathematically-possible combination up front.
// Example: hasMinimumTaggedProof("portfolioItem", "weddingType", weddingTypeId, 3)
export async function hasMinimumTaggedProof(
  leafType: "portfolioItem" | "testimonial" | "transformation",
  refField: "service" | "style" | "occasion" | "weddingType" | "location" | "artist",
  refId: string,
  minimum = 1
): Promise<boolean> {
  const count: number = await client.fetch(
    `count(*[_type == $leafType && ${refField}._ref == $refId])`,
    { leafType, refId }
  );
  return count >= minimum;
}

export interface SiteSettings {
  youtubeReelUrl?: string;
  heroImageMain?: string;
  heroImageSecondary?: string;
  heroImageDetail?: string;
  aboutImage?: string;
  extraFaceDiscountPercent?: number;
}

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  const data = await client.fetch(SITE_SETTINGS_QUERY, {}, REVALIDATE_FAST);
  if (!data) return {};
  return {
    youtubeReelUrl: data.youtubeReelUrl,
    heroImageMain: imgUrl(data.heroImageMain, 1200),
    heroImageSecondary: imgUrl(data.heroImageSecondary, 800),
    heroImageDetail: imgUrl(data.heroImageDetail, 600),
    aboutImage: imgUrl(data.aboutImage, 800),
    extraFaceDiscountPercent: data.extraFaceDiscountPercent,
  };
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
  if (!data) return {};
  return {
    ...data,
    heroImageUrl: imgUrl(data.heroImage, 1200),
  };
});

// ─── Shop Links ─────────────────────────────────────────────────────────────

// Shared shape for anything rendered by ShopLinksClient's card components —
// both ShopLink (grouped, /TemilolaShyllon) and BioLink (flat, /links)
// structurally satisfy this, so the same cards render either.
export interface LinkCardData {
  id: string;
  title: string;
  url: string;
  mediaType: "image" | "video" | "icon";
  imageUrl?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  icon?: string;
  alt?: string;
  layout: "compact" | "featured" | "wide";
  description?: string;
  order: number;
}

export interface ShopLink extends LinkCardData {
  section: string;
  sectionOrder: number;
}

interface RawShopLink {
  _id: string;
  title: string;
  url: string;
  section: string;
  mediaType: "image" | "video";
  imageUrl?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  alt?: string;
  layout: "compact" | "featured" | "wide";
  description?: string;
  order: number;
  sectionOrder: number;
}

export const getShopLinks = cache(async (): Promise<ShopLink[]> => {
  const raw: RawShopLink[] = await client.fetch(SHOP_LINKS_QUERY, {}, REVALIDATE);
  return raw.map((l) => ({
    id: l._id,
    title: l.title,
    url: l.url,
    section: l.section,
    mediaType: l.mediaType ?? "image",
    imageUrl: l.imageUrl,
    videoUrl: l.videoUrl,
    thumbnailUrl: l.thumbnailUrl,
    alt: l.alt,
    layout: l.layout ?? "compact",
    description: l.description,
    order: l.order ?? 0,
    sectionOrder: l.sectionOrder ?? 0,
  }));
});

export interface ShopPageSettings {
  pageTitle?: string;
  pageSubtitle?: string;
  showSectionHeaders?: boolean;
}

export const getShopPageSettings = cache(async (): Promise<ShopPageSettings> => {
  const data = await client.fetch(SHOP_PAGE_SETTINGS_QUERY, {}, REVALIDATE);
  return data ?? {};
});

// ─── Bio Links (/links page) ────────────────────────────────────────────────
export type BioLink = LinkCardData;

interface RawBioLink {
  _id: string;
  title: string;
  url: string;
  mediaType: "image" | "video" | "icon";
  imageUrl?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  icon?: string;
  alt?: string;
  layout: "compact" | "featured" | "wide";
  description?: string;
  order: number;
}

export const getBioLinks = cache(async (): Promise<BioLink[]> => {
  const raw: RawBioLink[] = await client.fetch(BIO_LINKS_QUERY, {}, REVALIDATE);
  return raw.map((l) => ({
    id: l._id,
    title: l.title,
    url: l.url,
    mediaType: l.mediaType ?? "image",
    imageUrl: l.imageUrl,
    videoUrl: l.videoUrl,
    thumbnailUrl: l.thumbnailUrl,
    icon: l.icon,
    alt: l.alt,
    layout: l.layout ?? "wide",
    description: l.description,
    order: l.order ?? 0,
  }));
});

export interface LinksPageSettings {
  showCheckAvailability: boolean;
  checkAvailabilityLabel: string;
  checkAvailabilityDescription: string;
}

export const getLinksPageSettings = cache(async (): Promise<LinksPageSettings> => {
  const data = await client.fetch(LINKS_PAGE_SETTINGS_QUERY, {}, REVALIDATE);
  return {
    showCheckAvailability: data?.showCheckAvailability ?? true,
    checkAvailabilityLabel: data?.checkAvailabilityLabel || "Check Availability",
    checkAvailabilityDescription:
      data?.checkAvailabilityDescription || "Pick a date & time to get started",
  };
});
