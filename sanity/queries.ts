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
  "imageUrl": image.asset->url
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
  "imageUrl": image.asset->url
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
  "imageUrl": image.asset->url,
  instagramFeatured,
  instagramUrl
}`;

export const INSTAGRAM_FEED_QUERY = `*[_type == "portfolioItem" && instagramFeatured == true] | order(order asc) [0...9] {
  _id,
  title,
  alt,
  "imageUrl": image.asset->url,
  instagramUrl
}`;

export const TESTIMONIALS_QUERY = `*[_type == "testimonial"] | order(order asc) {
  _id,
  name,
  event,
  text,
  rating,
  initials,
  "avatarUrl": avatar.asset->url
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

export const TRANSFORMATIONS_QUERY = `*[_type == "transformation"] | order(order asc) {
  _id,
  title,
  "beforeUrl": beforeImage.asset->url,
  "beforeHotspot": beforeImage.hotspot,
  "beforeCrop": beforeImage.crop,
  "beforeMeta": beforeImage.asset->{metadata{dimensions}},
  beforeAlt,
  "afterUrl": afterImage.asset->url,
  "afterHotspot": afterImage.hotspot,
  "afterCrop": afterImage.crop,
  "afterMeta": afterImage.asset->{metadata{dimensions}},
  afterAlt
}`;

export const BLOG_POSTS_QUERY = `*[_type == "blogPost"] | order(publishedAt desc) {
  _id,
  title,
  "slug": slug.current,
  excerpt,
  category,
  "coverImageUrl": coverImage.asset->url,
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
  "coverImageUrl": coverImage.asset->url,
  author,
  publishedAt
}`;

export const PAGE_COPY_QUERY = `*[_type == "pageCopy" && page == $page][0]{
  page,
  seoTitle, seoDescription,
  heroLabel, heroTitle, heroSubtitle, heroEyebrow, heroTrustLine,
  heroBadges, heroPrimaryCta, heroSecondaryCta,
  "heroImageUrl": heroImage.asset->url,
  sections
}`;

export const TRAINING_COURSES_QUERY = `*[_type == "trainingCourse"] | order(order asc) {
  _id,
  title,
  "slug": slug.current,
  level,
  description,
  duration,
  price,
  classSize,
  certification,
  curriculum,
  highlights,
  "imageUrl": image.asset->url
}`;

export const SITE_SETTINGS_QUERY = `*[_type == "siteSettings"][0]{
  youtubeReelUrl,
  "heroImageMain": heroImageMain.asset->url,
  "heroImageSecondary": heroImageSecondary.asset->url,
  "heroImageDetail": heroImageDetail.asset->url,
  "aboutImage": aboutImage.asset->url
}`;
