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
  "imageUrl": image.asset->url
}`;

export const TESTIMONIALS_QUERY = `*[_type == "testimonial"] | order(order asc) {
  _id,
  name,
  event,
  text,
  rating,
  initials
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
  beforeAlt,
  "afterUrl": afterImage.asset->url,
  afterAlt
}`;
