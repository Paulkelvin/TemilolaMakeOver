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
  availableInStudio,
  priceFrom,
  icon,
  highlighted,
  image,
  "styles": styles[]->name,
  "occasions": occasions[]->name
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
  availableInStudio,
  priceFrom,
  icon,
  highlighted,
  image,
  "styles": styles[]->name,
  "occasions": occasions[]->name
}`;

export const PORTFOLIO_QUERY = `*[_type == "portfolioItem"] | order(order asc) {
  _id,
  title,
  alt,
  category,
  aspect,
  image,
  instagramFeatured,
  instagramUrl,
  "service": service->name,
  "style": style->name,
  "occasion": occasion->name,
  "weddingType": weddingType->name,
  "location": location->name,
  "artist": artist->name
}`;

export const INSTAGRAM_FEED_QUERY = `*[_type == "portfolioItem" && instagramFeatured == true] | order(order asc) [0...9] {
  _id,
  title,
  alt,
  image,
  instagramUrl
}`;

export const TESTIMONIALS_QUERY = `*[_type == "testimonial" && audienceType != "student"] | order(order asc) {
  _id,
  name,
  event,
  text,
  rating,
  initials,
  avatar,
  audienceType,
  "service": service->name,
  "style": style->name,
  "occasion": occasion->name,
  "weddingType": weddingType->name,
  "location": location->name,
  "artist": artist->name
}`;

export const FAQ_QUERY = `*[_type == "faq"] | order(order asc) {
  _id,
  question,
  answer,
  "service": service->name,
  "occasion": occasion->name,
  "location": location->name
}`;

export const FAQ_BY_CATEGORY_QUERY = `*[_type == "faq" && $category in category] | order(order asc) {
  _id,
  question,
  answer,
  "service": service->name,
  "occasion": occasion->name,
  "location": location->name
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
  afterAlt,
  "service": service->name,
  "style": style->name,
  "occasion": occasion->name,
  "weddingType": weddingType->name,
  "location": location->name,
  "artist": artist->name
}`;

export const BLOG_POSTS_QUERY = `*[_type == "blogPost"] | order(publishedAt desc) {
  _id,
  title,
  "slug": slug.current,
  excerpt,
  category,
  coverImage,
  author,
  publishedAt,
  "primaryService": primaryService->name,
  "relatedStyle": relatedStyle->name,
  "relatedOccasion": relatedOccasion->name,
  "relatedWeddingType": relatedWeddingType->name,
  "relatedLocations": relatedLocations[]->slug.current
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
  publishedAt,
  "primaryService": primaryService->name,
  "relatedStyle": relatedStyle->name,
  "relatedOccasion": relatedOccasion->name,
  "relatedWeddingType": relatedWeddingType->name,
  "relatedLocations": relatedLocations[]->slug.current
}`;

export const PAGE_COPY_QUERY = `*[_type == "pageCopy" && page == $page][0]{
  page,
  seoTitle, seoDescription,
  heroLabel, heroTitle, heroSubtitle, heroEyebrow, heroTrustLine,
  heroBadges, heroPrimaryCta, heroSecondaryCta,
  heroImage,
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

export const BIO_LINKS_QUERY = `*[_type == "bioLink"] | order(order asc) {
  _id, title, url, mediaType,
  "imageUrl": image.asset->url,
  "videoUrl": video.asset->url,
  "thumbnailUrl": thumbnail.asset->url,
  alt, layout, description, order
}`;

export const LOCATIONS_QUERY = `*[_type == "location" && status == "published"] | order(name asc) {
  _id,
  name,
  "slug": slug.current,
  "city": city->name,
  areas,
  "travelZone": travelZone->{label, fee, note},
  headline,
  subtitle,
  seoTitle,
  seoDescription,
  intro,
  keywords,
  localNotes
}`;

export const LOCATION_BY_SLUG_QUERY = `*[_type == "location" && slug.current == $slug && status == "published"][0] {
  _id,
  name,
  "slug": slug.current,
  "city": city->name,
  areas,
  "travelZone": travelZone->{label, fee, note},
  headline,
  subtitle,
  seoTitle,
  seoDescription,
  intro,
  keywords,
  localNotes
}`;

export const ARTISTS_QUERY = `*[_type == "artist"] | order(isPrimary desc) {
  _id,
  name,
  "slug": slug.current,
  role,
  bio,
  photo,
  "specialties": specialties[]->name,
  isPrimary,
  socialLinks
}`;

export const MAKEUP_STYLES_QUERY = `*[_type == "makeupStyle"] | order(order asc) {
  _id, name, "slug": slug.current, description, bestFor, image, order
}`;

export const OCCASIONS_QUERY = `*[_type == "occasion"] | order(order asc) {
  _id, name, "slug": slug.current, description, seoTitle, seoDescription, order
}`;

export const WEDDING_TYPES_QUERY = `*[_type == "weddingType"] | order(order asc) {
  _id, name, "slug": slug.current, description, culturalNotes, image, order
}`;

export const PORTFOLIO_BY_LOCATION_QUERY = `*[_type == "portfolioItem" && location->slug.current == $slug] | order(order asc) {
  _id, title, alt, category, aspect, image, instagramFeatured, instagramUrl
}`;

export const TESTIMONIALS_BY_LOCATION_QUERY = `*[_type == "testimonial" && location->slug.current == $slug] | order(order asc) {
  _id, name, event, text, rating, initials, avatar
}`;
