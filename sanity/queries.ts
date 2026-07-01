export const SERVICES_QUERY = `*[_type == "service"] | order(order asc) {
  _id,
  name,
  "slug": slug.current,
  shortDescription,
  description,
  whoFor,
  bestFor,
  included,
  duration,
  homeService,
  priceFrom,
  icon,
  highlighted,
  image
}`;

export const SERVICE_BY_SLUG_QUERY = `*[_type == "service" && slug.current == $slug][0] {
  _id,
  name,
  "slug": slug.current,
  shortDescription,
  description,
  whoFor,
  bestFor,
  included,
  duration,
  homeService,
  priceFrom,
  icon,
  highlighted,
  image
}`;

export const PACKAGES_QUERY = `*[_type == "pricingPackage"] | order(order asc) {
  _id,
  name,
  bestFor,
  shortDescription,
  priceFrom,
  duration,
  features,
  highlighted
}`;

export const PORTFOLIO_QUERY = `*[_type == "portfolioItem"] | order(order asc) {
  _id,
  title,
  alt,
  category,
  aspect,
  image,
  instagramFeatured,
  instagramUrl
}`;

export const INSTAGRAM_FEED_QUERY = `*[_type == "portfolioItem" && instagramFeatured == true] | order(order asc) [0...9] {
  _id,
  title,
  alt,
  image,
  instagramUrl
}`;

export const TESTIMONIALS_QUERY = `*[_type == "testimonial"] | order(order asc) {
  _id,
  name,
  event,
  text,
  rating,
  initials,
  avatar
}`;

export const FAQ_QUERY = `*[_type == "faq"] | order(order asc) {
  _id,
  question,
  answer
}`;

export const BOOKING_STEPS_QUERY = `*[_type == "bookingStep"] | order(step asc) {
  _id,
  step,
  title,
  description
}`;

export const WHY_CHOOSE_US_QUERY = `*[_type == "whyChooseUs"] | order(order asc) {
  _id,
  title,
  description
}`;

export const ABOUT_VALUES_QUERY = `*[_type == "aboutValue"] | order(order asc) {
  _id,
  title,
  text,
  icon,
  order
}`;

export const TRANSFORMATIONS_QUERY = `*[_type == "transformation"] | order(order asc) {
  _id,
  title,
  beforeImage,
  beforeAlt,
  afterImage,
  afterAlt
}`;

export const BLOG_POSTS_QUERY = `*[_type == "blogPost"] | order(publishedAt desc) {
  _id,
  title,
  "slug": slug.current,
  excerpt,
  category,
  coverImage,
  author,
  publishedAt
}`;

export const BLOCKED_DATES_QUERY = `*[_type == "blockedDate"] { _id, date, reason }`;

export const BLOG_POST_BY_SLUG_QUERY = `*[_type == "blogPost" && slug.current == $slug][0] {
  _id,
  title,
  "slug": slug.current,
  excerpt,
  body,
  category,
  coverImage,
  author,
  publishedAt
}`;

export const PAGE_COPY_QUERY = `*[_type == "pageCopy" && page == $page][0]{
  page,
  seoTitle, seoDescription,
  heroLabel, heroTitle, heroSubtitle, heroEyebrow, heroTrustLine,
  heroBadges, heroPrimaryCta, heroSecondaryCta,
  heroImage,
  sections
}`;

export const TRAVEL_ZONES_QUERY = `*[_type == "travelZone"] | order(order asc) {
  _id,
  label,
  areas,
  fee,
  note,
  order
}`;

export const SITE_SETTINGS_QUERY = `*[_type == "siteSettings"][0]{
  youtubeReelUrl,
  heroImageMain,
  heroImageSecondary,
  heroImageDetail,
  aboutImage,
  extraFaceDiscountPercent
}`;

export const SHOP_LINKS_QUERY = `*[_type == "shopLink"] | order(sectionOrder asc, order asc) {
  _id, title, url, section, mediaType,
  "imageUrl": image.asset->url,
  "videoUrl": video.asset->url,
  "thumbnailUrl": thumbnail.asset->url,
  alt, layout, description, order, sectionOrder
}`;

export const SHOP_PAGE_SETTINGS_QUERY = `*[_type == "shopPageSettings"][0] {
  pageTitle, pageSubtitle, showSectionHeaders
}`;
