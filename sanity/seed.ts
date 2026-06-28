/**
 * Sanity seed script — pushes all hardcoded content into Sanity.
 *
 * Usage:
 *   npx tsx sanity/seed.ts
 *
 * Requires NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET,
 * and SANITY_API_TOKEN in .env.local
 */

import { createClient } from "@sanity/client";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_TOKEN;

if (!projectId || !token) {
  console.error(
    "Missing env vars. Set NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_TOKEN in .env.local"
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: "2024-01-01",
  useCdn: false,
});

// ─── Site Config (singleton) ────────────────────────────────────────────
const siteConfig = {
  _id: "siteConfig",
  _type: "siteConfig",
  brand: "Temilola Makeup",
  artistName: "Temilola",
  tagline:
    "Bridal & Event Makeup That Makes You Feel Effortlessly Confident",
  description:
    "Book professional bridal, soft glam, and event makeup in Lagos. Home service available. View real client looks, packages, and check availability for your date.",
  usp: [
    "Soft glam specialist",
    "Bridal & traditional wedding experience",
    "Home service across Lagos",
    "Skin-prep focused, camera-ready finish",
    "Calm, punctual wedding-morning service",
  ],
  url: "https://temilolomakeup.com",
  location: "Lagos, Nigeria",
  serviceArea:
    "Lagos & nearby areas (Ikeja, Lekki, Victoria Island, Mainland)",
  phone: "+234 705 859 6531",
  phoneRaw: "+2347058596531",
  whatsapp: "2347058596531",
  email: "shyllontemilola@gmail.com",
  instagram: "https://www.instagram.com/gleambytemi/",
  instagramHandle: "@gleambytemi",
  tiktok: "https://tiktok.com/@temilolomakeup",
  tiktokHandle: "@temilolomakeup",
  hours: "Mon–Sat: 8:00 AM – 8:00 PM",
  currency: "NGN",
  depositNote: "50% deposit required to secure your date",
  pricingDisclaimer:
    "Final pricing may depend on location, date, number of faces, and travel requirements.",
};

// ─── Services ───────────────────────────────────────────────────────────
const services = [
  {
    _id: "service-bridal",
    _type: "service",
    name: "Bridal Makeup",
    slug: { _type: "slug", current: "bridal-makeup" },
    shortDescription:
      "Elegant wedding-day makeup that stays flawless from vows to the last dance.",
    description:
      "Your wedding morning deserves calm, focused artistry. I build a seamless base, define your features softly, and set everything for hours of photos, tears, and celebration.",
    whoFor:
      "Brides who want a timeless, photo-ready look that still feels like them.",
    bestFor: "Wedding day · Engagement dinner · Bridal shower",
    included: [
      "Consultation on your look & outfit",
      "Skin prep & priming",
      "Full bridal makeup application",
      "Lash application",
      "Touch-up guidance for the day",
    ],
    duration: "2–3 hours",
    homeService: true,
    priceFrom: 120000,
    icon: "crown",
    highlighted: true,
    order: 1,
  },
  {
    _id: "service-traditional",
    _type: "service",
    name: "Traditional Bridal Makeup",
    slug: { _type: "slug", current: "traditional-bridal" },
    shortDescription:
      "Rich, radiant glam honouring cultural colour and ceremony.",
    description:
      "Traditional weddings call for definition, warmth, and longevity. I create looks that complement your outfit, gele, and jewellery — bold enough for ceremony, refined enough for portraits.",
    whoFor:
      "Brides at traditional weddings, engagements, and cultural celebrations.",
    bestFor: "Traditional wedding · Engagement · Cultural ceremony",
    included: [
      "Skin prep suited to long wear",
      "Full traditional glam application",
      "Defined eyes & lips",
      "Setting for heat and flash photography",
    ],
    duration: "2–3 hours",
    homeService: true,
    priceFrom: 130000,
    icon: "sparkles",
    order: 2,
  },
  {
    _id: "service-soft-glam",
    _type: "service",
    name: "Soft Glam",
    slug: { _type: "slug", current: "soft-glam" },
    shortDescription:
      "Romantic, blended glam that enhances — never overpowers — your features.",
    description:
      "Soft glam is my signature: diffused contour, glowing skin, and lashes that open the eyes without heaviness. Perfect when you want to look polished and feminine, not overdone.",
    whoFor:
      "Bridesmaids, guests, and anyone who wants an effortless elevated look.",
    bestFor: "Engagement · Dinner · Graduation · Date night",
    included: [
      "Skin prep & priming",
      "Soft glam eye & face application",
      "Lash enhancement",
      "Setting spray",
    ],
    duration: "1.5–2 hours",
    homeService: true,
    priceFrom: 35000,
    icon: "palette",
    order: 3,
  },
  {
    _id: "service-event",
    _type: "service",
    name: "Event Glam",
    slug: { _type: "slug", current: "event-glam" },
    shortDescription:
      "Defined, camera-ready makeup built to carry you through the night.",
    description:
      "Parties, launches, and celebrations need makeup that reads on camera and in person. I sculpt, define, and set your look so it survives lights, dancing, and late-night photos.",
    whoFor: "Hosts, guests, and anyone who wants to make an entrance.",
    bestFor: "Party · Corporate event · Anniversary · Red carpet",
    included: [
      "Skin prep",
      "Full glam application",
      "Defined eyes, brows & lips",
      "Long-wear setting",
    ],
    duration: "1.5–2 hours",
    homeService: true,
    priceFrom: 45000,
    icon: "party-popper",
    order: 4,
  },
  {
    _id: "service-birthday",
    _type: "service",
    name: "Birthday Glam",
    slug: { _type: "slug", current: "birthday-makeup" },
    shortDescription:
      "Birthday-ready makeup matched to your outfit, venue, and vibe.",
    description:
      "Whether you want soft and pretty or bold and celebratory, I tailor your look to your theme. You'll feel photo-ready the moment you walk in.",
    whoFor:
      "Birthday celebrants at any age — milestone parties and intimate dinners.",
    bestFor: "Birthday party · Photoshoot · Dinner celebration",
    included: [
      "Skin prep",
      "Custom glam to your brief",
      "Lash application",
      "Photo-ready finish",
    ],
    duration: "1.5–2 hours",
    homeService: true,
    priceFrom: 40000,
    icon: "sparkles",
    order: 5,
  },
  {
    _id: "service-photoshoot",
    _type: "service",
    name: "Photoshoot Makeup",
    slug: { _type: "slug", current: "photoshoot-makeup" },
    shortDescription:
      "HD makeup that translates cleanly on camera, screen, and print.",
    description:
      "Studio lights and outdoor sun demand different techniques. I adjust coverage, contour, and finish so your skin looks smooth and dimensional — not flat — in every frame.",
    whoFor:
      "Creators, models, professionals, and anyone investing in quality images.",
    bestFor: "Editorial · Brand shoot · Headshots · Content creation",
    included: [
      "Skin prep for HD application",
      "Camera-ready base & contour",
      "Eye & lip definition for lens",
      "Professional setting",
    ],
    duration: "1.5–2 hours",
    homeService: true,
    priceFrom: 50000,
    icon: "camera",
    order: 6,
  },
  {
    _id: "service-home",
    _type: "service",
    name: "Home Service Makeup",
    slug: { _type: "slug", current: "home-service" },
    shortDescription:
      "Full salon-quality glam at your home, hotel, or venue.",
    description:
      "Skip the traffic and get ready where you're comfortable. I arrive with a complete kit and set up efficiently — ideal for bridal parties and early-morning weddings.",
    whoFor:
      "Anyone who values privacy, convenience, or a relaxed getting-ready experience.",
    bestFor: "Bridal prep · Hotel getting-ready · Private residence",
    included: [
      "Travel to your location in Lagos",
      "Full professional kit & setup",
      "Same standard as studio service",
    ],
    duration: "Based on chosen service",
    homeService: true,
    priceFrom: 10000,
    icon: "home",
    order: 7,
  },
  {
    _id: "service-group",
    _type: "service",
    name: "Bridesmaids / Group Booking",
    slug: { _type: "slug", current: "group-booking" },
    shortDescription:
      "Coordinated looks for your party — efficient timing, consistent quality.",
    description:
      "I plan a schedule that keeps everyone calm and on time. Looks can match or complement — each face still suits the individual wearing it.",
    whoFor:
      "Bridesmaids, mothers of the bride, flower girls, and group celebrations.",
    bestFor: "Bridal party · Family event · Group birthday",
    included: [
      "Per-face makeup application",
      "Coordinated look planning",
      "Timed schedule for the group",
    ],
    duration: "1–1.5 hours per face",
    homeService: true,
    priceFrom: 30000,
    icon: "users",
    order: 8,
  },
  {
    _id: "service-gele",
    _type: "service",
    name: "Gele Styling",
    slug: { _type: "slug", current: "gele-styling" },
    shortDescription:
      "Expert gele tying to complete your traditional bridal ensemble.",
    description:
      "A beautifully tied gele elevates your entire look. I style to complement your face shape, outfit, and makeup — secure enough to last the full ceremony.",
    whoFor:
      "Traditional brides and guests wearing gele for cultural events.",
    bestFor: "Traditional wedding · Engagement · Cultural event",
    included: ["Gele styling & securing", "Finishing touches with your look"],
    duration: "30–45 minutes",
    homeService: true,
    priceFrom: 15000,
    icon: "crown",
    order: 9,
  },
];

// ─── Pricing Packages ───────────────────────────────────────────────────
const packages = [
  {
    _id: "pkg-soft-glam",
    _type: "pricingPackage",
    name: "Soft Glam",
    bestFor: "Bridesmaids, engagements & elegant evenings",
    shortDescription:
      "Romantic, blended makeup with a natural glow — polished without looking heavy.",
    priceFrom: 35000,
    duration: "1.5–2 hours",
    features: [
      "Skin prep & priming",
      "Soft glam application",
      "Lash enhancement",
      "Long-wear setting spray",
    ],
    highlighted: false,
    order: 1,
  },
  {
    _id: "pkg-event-glam",
    _type: "pricingPackage",
    name: "Event Glam",
    bestFor: "Parties, launches & nights you want to own",
    shortDescription:
      "More definition, more presence — built to last under lights and late hours.",
    priceFrom: 45000,
    duration: "1.5–2 hours",
    features: [
      "Skin prep",
      "Full event glam",
      "Defined eyes, brows & lips",
      "Photo & flash-ready finish",
    ],
    highlighted: true,
    order: 2,
  },
  {
    _id: "pkg-birthday",
    _type: "pricingPackage",
    name: "Birthday Glam",
    bestFor: "Milestone birthdays & celebration photos",
    shortDescription:
      "Custom glam aligned with your outfit and party energy.",
    priceFrom: 40000,
    duration: "1.5–2 hours",
    features: [
      "Skin prep",
      "Tailored birthday look",
      "Lash application",
      "Photo-ready setting",
    ],
    highlighted: false,
    order: 3,
  },
  {
    _id: "pkg-bridal",
    _type: "pricingPackage",
    name: "Bridal Glam",
    bestFor: "Your wedding day",
    shortDescription:
      "The full bridal experience — prep, application, and a finish made for an entire day of memories.",
    priceFrom: 120000,
    duration: "2–3 hours",
    features: [
      "Bridal consultation",
      "Skin prep & priming",
      "Full bridal makeup",
      "Lashes & touch-up guidance",
      "Ceremony-to-reception wear",
    ],
    highlighted: true,
    order: 4,
  },
  {
    _id: "pkg-bridesmaids",
    _type: "pricingPackage",
    name: "Bridesmaids Package",
    bestFor: "Bridal party (per face)",
    shortDescription:
      "Coordinated party glam with efficient scheduling — per person pricing.",
    priceFrom: 30000,
    duration: "1–1.5 hours per face",
    features: [
      "Matching or complementary looks",
      "Skin prep per guest",
      "Group timeline planning",
    ],
    highlighted: false,
    order: 5,
  },
  {
    _id: "pkg-home-service",
    _type: "pricingPackage",
    name: "Home Service Add-on",
    bestFor: "Getting ready at home, hotel, or venue",
    shortDescription:
      "I come to you across Lagos with a full kit — add to any package.",
    priceFrom: 10000,
    duration: "Added to your service",
    features: [
      "Travel within service area",
      "On-location setup",
      "Hotel & private venue service",
    ],
    highlighted: false,
    order: 6,
  },
];

// ─── Portfolio Items ────────────────────────────────────────────────────
const portfolioItems = [
  {
    _id: "portfolio-1",
    _type: "portfolioItem",
    title: "Elegant Bridal Glow",
    alt: "Soft glam bridal makeup — Temilola Makeup Lagos",
    category: "Bridal",
    aspect: "tall",
    order: 1,
  },
  {
    _id: "portfolio-2",
    _type: "portfolioItem",
    title: "Romantic Soft Glam",
    alt: "Event glam makeup look — Lagos makeup artist",
    category: "Soft Glam",
    aspect: "portrait",
    order: 2,
  },
  {
    _id: "portfolio-3",
    _type: "portfolioItem",
    title: "Evening Event Glam",
    alt: "Bold glam evening makeup — Temilola Makeup",
    category: "Event Glam",
    aspect: "square",
    order: 3,
  },
  {
    _id: "portfolio-4",
    _type: "portfolioItem",
    title: "Traditional Bridal",
    alt: "Traditional bridal makeup — Lagos wedding",
    category: "Traditional",
    aspect: "tall",
    order: 4,
  },
  {
    _id: "portfolio-5",
    _type: "portfolioItem",
    title: "Editorial Photoshoot",
    alt: "Photoshoot makeup — camera-ready glam",
    category: "Photoshoot",
    aspect: "portrait",
    order: 5,
  },
  {
    _id: "portfolio-6",
    _type: "portfolioItem",
    title: "Classic Bridal Beauty",
    alt: "Bridal soft glam — wedding makeup Lagos",
    category: "Bridal",
    aspect: "square",
    order: 6,
  },
  {
    _id: "portfolio-7",
    _type: "portfolioItem",
    title: "Party Soft Glam",
    alt: "Soft glam party makeup — event makeup artist",
    category: "Soft Glam",
    aspect: "portrait",
    order: 7,
  },
  {
    _id: "portfolio-8",
    _type: "portfolioItem",
    title: "Birthday Statement",
    alt: "Bold glam birthday makeup — Lagos",
    category: "Event Glam",
    aspect: "tall",
    order: 8,
  },
  {
    _id: "portfolio-9",
    _type: "portfolioItem",
    title: "Bridal Transformation",
    alt: "Before and after makeup transformation",
    category: "Before & After",
    aspect: "square",
    order: 9,
  },
  {
    _id: "portfolio-10",
    _type: "portfolioItem",
    title: "Fashion Forward",
    alt: "Photoshoot glam makeup — professional artist",
    category: "Photoshoot",
    aspect: "portrait",
    order: 10,
  },
  {
    _id: "portfolio-11",
    _type: "portfolioItem",
    title: "Cultural Elegance",
    alt: "Traditional wedding glam — Nigerian bride",
    category: "Traditional",
    aspect: "tall",
    order: 11,
  },
  {
    _id: "portfolio-12",
    _type: "portfolioItem",
    title: "Soft Glam Reveal",
    alt: "Before and after soft glam transformation",
    category: "Before & After",
    aspect: "portrait",
    order: 12,
  },
];

// ─── Testimonials ───────────────────────────────────────────────────────
const testimonials = [
  {
    _id: "testimonial-1",
    _type: "testimonial",
    name: "Adaeze O.",
    event: "Wedding Day Bride",
    text: "I was nervous about looking too 'done' but Temilola got it exactly right. My makeup still looked fresh at the reception — and I cried twice before then. She was so calm on the morning, which helped more than I expected.",
    rating: 5,
    initials: "AO",
    order: 1,
  },
  {
    _id: "testimonial-2",
    _type: "testimonial",
    name: "Funmi K.",
    event: "30th Birthday",
    text: "Booked soft glam for my birthday dinner and sent a Pinterest board. She matched the vibe without making it look copied. My friends kept asking for her number — already trying to book her for my sister's engagement.",
    rating: 5,
    initials: "FK",
    order: 2,
  },
  {
    _id: "testimonial-3",
    _type: "testimonial",
    name: "Chioma M.",
    event: "Traditional Wedding",
    text: "The gele and makeup worked together perfectly — I didn't have to worry about either. She arrived early, was organised, and checked everything in natural light before I left. Worth every naira.",
    rating: 5,
    initials: "CM",
    order: 3,
  },
  {
    _id: "testimonial-4",
    _type: "testimonial",
    name: "Tolu A.",
    event: "Bridesmaids (4 faces)",
    text: "Four bridesmaids, different skin tones, one timeline. Everyone looked cohesive but not identical. She kept us on schedule and the bride wasn't stressed — that alone was a gift.",
    rating: 5,
    initials: "TA",
    order: 4,
  },
  {
    _id: "testimonial-5",
    _type: "testimonial",
    name: "Ngozi E.",
    event: "Corporate Event",
    text: "I needed makeup that worked for photos and a long evening. It held up without looking cakey. Quick WhatsApp booking, clear pricing upfront — no awkward surprises.",
    rating: 5,
    initials: "NE",
    order: 5,
  },
];

// ─── FAQ ────────────────────────────────────────────────────────────────
const faqItems = [
  {
    _id: "faq-1",
    _type: "faq",
    question: "How early should I book my makeup session?",
    answer:
      "For weddings, I recommend booking 3–6 months ahead — popular dates in Lagos fill quickly. Events and birthdays can often be secured 2–4 weeks out, but earlier is always safer. If your date is soon, message me on WhatsApp and I'll check availability honestly.",
    order: 1,
  },
  {
    _id: "faq-2",
    _type: "faq",
    question: "Is a deposit required to confirm my booking?",
    answer:
      "Yes. A 50% deposit secures your date in my calendar. The balance is due on or before your appointment. You'll receive written confirmation once the deposit is received, along with prep notes for your skin and schedule.",
    order: 2,
  },
  {
    _id: "faq-3",
    _type: "faq",
    question: "Do you offer home service in Lagos?",
    answer:
      "Yes — I travel across Lagos including Ikeja, Lekki, Victoria Island, and Mainland areas. I bring a full professional kit and set up at your home, hotel, or venue. A travel fee may apply depending on distance and timing.",
    order: 3,
  },
  {
    _id: "faq-4",
    _type: "faq",
    question: "Can you travel outside Lagos for my event?",
    answer:
      "Outside Lagos may be possible for bridal and larger bookings. Share your location, date, and service needs when you inquire — I'll confirm if I can travel and include any travel costs in your quote.",
    order: 4,
  },
  {
    _id: "faq-5",
    _type: "faq",
    question: "What is your rescheduling policy?",
    answer:
      "Please notify me at least 7 days before your appointment if your date changes. Rescheduling depends on availability. Late changes may affect deposit terms — I'll always communicate clearly before you commit.",
    order: 5,
  },
  {
    _id: "faq-6",
    _type: "faq",
    question: "Do you offer bridal makeup trials?",
    answer:
      "Yes, and I recommend them. A trial lets us test your look, adjust for your skin and outfit, and remove guesswork from the wedding morning. Book your trial when you reserve your wedding date.",
    order: 6,
  },
  {
    _id: "faq-7",
    _type: "faq",
    question: "Can I book makeup for my full bridal party?",
    answer:
      "Absolutely. Share how many faces, the looks you want (matching or individual), and your timeline. I'll plan a schedule that keeps everyone ready before the bride needs to leave.",
    order: 7,
  },
  {
    _id: "faq-8",
    _type: "faq",
    question: "How long does each makeup session take?",
    answer:
      "Bridal makeup: 2–3 hours. Soft glam and event makeup: 1.5–2 hours. Gele styling: 30–45 minutes. Group bookings are timed per face at roughly 1–1.5 hours each. I'll confirm timing when we book.",
    order: 8,
  },
  {
    _id: "faq-9",
    _type: "faq",
    question: "Can I send reference photos of a look I want?",
    answer:
      "Please do — via WhatsApp or with your booking form. I'll advise what's achievable for your features, skin, and event lighting. References help us start aligned; your face guides the final result.",
    order: 9,
  },
  {
    _id: "faq-10",
    _type: "faq",
    question: "How do I confirm payment and final booking?",
    answer:
      "After we agree on your date and quote, you'll receive deposit payment details. Once received, your date is confirmed. I'll follow up with arrival time, prep tips, and anything I need from you before the day.",
    order: 10,
  },
];

// ─── Booking Steps ──────────────────────────────────────────────────────
const bookingSteps = [
  {
    _id: "booking-step-1",
    _type: "bookingStep",
    step: 1,
    title: "Choose your service",
    description:
      "Pick bridal, soft glam, event, or group makeup — or tell me your occasion and I'll suggest the right fit.",
  },
  {
    _id: "booking-step-2",
    _type: "bookingStep",
    step: 2,
    title: "Share your date & location",
    description:
      "Send your event date, venue area, and number of faces via WhatsApp or the booking form below.",
  },
  {
    _id: "booking-step-3",
    _type: "bookingStep",
    step: 3,
    title: "Confirm with deposit",
    description:
      "Once your date is available, secure it with a 50% deposit. You'll get confirmation and prep guidance right after.",
  },
];

// ─── Why Choose Us ──────────────────────────────────────────────────────
const whyChooseUsItems = [
  {
    _id: "why-1",
    _type: "whyChooseUs",
    title: "Finish that actually lasts",
    description:
      "Setting, prep, and product choice chosen for Lagos heat, flash photography, and long events — not just the first hour.",
    order: 1,
  },
  {
    _id: "why-2",
    _type: "whyChooseUs",
    title: "Skin prep comes first",
    description:
      "Every session starts with skin that's hydrated and primed — the base for smooth application and a natural glow.",
    order: 2,
  },
  {
    _id: "why-3",
    _type: "whyChooseUs",
    title: "Made for photos & video",
    description:
      "Contour and tone balanced for both daylight and evening flash — so you look like you, not a filter.",
    order: 3,
  },
  {
    _id: "why-4",
    _type: "whyChooseUs",
    title: "Sanitised kit, every client",
    description:
      "Brushes and tools cleaned between appointments. Your skin deserves the same standard you'd expect at a top studio.",
    order: 4,
  },
  {
    _id: "why-5",
    _type: "whyChooseUs",
    title: "On time, every time",
    description:
      "Wedding mornings run on a schedule. I plan arrival and setup so you're ready when you need to be — not rushing at the last minute.",
    order: 5,
  },
  {
    _id: "why-6",
    _type: "whyChooseUs",
    title: "Tailored to your face & event",
    description:
      "Same technique, different result each time. Your bone structure, outfit, and venue lighting all shape the final look.",
    order: 6,
  },
];

// ─── About Values ───────────────────────────────────────────────────────
const aboutValues = [
  {
    _id: "about-value-1",
    _type: "aboutValue",
    title: "Beauty with intention",
    text: "Every choice — from primer to powder — serves how you need to look and feel for your specific event.",
    icon: "heart",
    order: 1,
  },
  {
    _id: "about-value-2",
    _type: "aboutValue",
    title: "Professional without the pressure",
    text: "Punctual, prepared, and calm. Your getting-ready time should feel like care, not chaos.",
    icon: "award",
    order: 2,
  },
  {
    _id: "about-value-3",
    _type: "aboutValue",
    title: "Confidence that lasts",
    text: "Makeup that holds through photos, hugs, dancing, and Lagos heat — still looking like you at the end.",
    icon: "sparkles",
    order: 3,
  },
];

// ─── Page Copy ──────────────────────────────────────────────────────────
const pageCopyDocs = [
  {
    _id: "pageCopy-home",
    _type: "pageCopy",
    page: "home",
    seoTitle: "Temilola Makeup | Bridal & Event Makeup Artist in Lagos",
    seoDescription:
      "Book professional bridal, soft glam, and event makeup in Lagos. Home service available. View real client looks, packages, and check availability for your date.",
    heroEyebrow: "Premium Makeup Artist · Lagos",
    heroTitle:
      "Bridal & Event Makeup That Makes You Feel Effortlessly Confident",
    heroSubtitle:
      "Soft, elegant makeup in Lagos — skin-prep focused, camera-ready, and designed to last beautifully from your first photo to your last dance.",
    heroTrustLine:
      "Trusted for bridal, event, and photoshoot glam across Lagos & nearby areas (Ikeja, Lekki, Victoria Island, Mainland).",
    heroBadges: ["Bridal Specialist", "Soft Glam", "Home Service", "Lagos"],
    heroPrimaryCta: "Check Availability",
    heroSecondaryCta: "View Makeup Looks",
    sections: [
      {
        _key: "trustStrip",
        key: "trustStrip",
        label: "Trust Strip",
        headline: "",
        paragraph: "",
      },
      {
        _key: "portfolio",
        key: "portfolio",
        label: "Portfolio",
        headline: "Looks Created for Real Celebrations",
        paragraph:
          "Every face tells a different story. Browse bridal, soft glam, and event looks — then imagine yours.",
        cta: "View Full Portfolio",
        footnote:
          "Real clients. Real events. No filters on confidence.",
      },
      {
        _key: "services",
        key: "services",
        label: "Services",
        headline: "Glam for Every Special Moment",
        intro:
          "Bridal, event, birthday, and photoshoot makeup tailored to your look, timeline, and venue.",
        cta: "Book This Service",
      },
      {
        _key: "whyChooseUs",
        key: "whyChooseUs",
        label: "Why Temilola",
        headline: "Calm Service. Flawless, Camera-Ready Results.",
        paragraph:
          "Precision prep, clean tools, and looks tailored to your face and event.",
      },
      {
        _key: "beforeAfter",
        key: "beforeAfter",
        label: "Transformations",
        headline: "From Fresh Skin to a Finish That Holds",
        paragraph:
          "Every session begins with thoughtful skin prep, then builds into a polished look that enhances your features — never masks them.",
        cta: "Book Your Transformation",
      },
      {
        _key: "testimonials",
        key: "testimonials",
        label: "Client Love",
        headline: "Words From Brides, Birthday Girls & Event Clients",
        intro:
          "The calmest part of their getting-ready? Often the makeup chair.",
        cta: "Check Availability",
      },
      {
        _key: "pricing",
        key: "pricing",
        label: "Packages",
        headline: "Clear Starting Points. No Surprises on the Basics.",
        intro:
          "Packages help you plan — your final quote reflects your date, location, and how many faces we're glamming.",
        note: "Final pricing may depend on location, date, number of faces, and travel requirements.",
        cta: "View All Packages",
      },
      {
        _key: "bookingProcess",
        key: "bookingProcess",
        label: "How Booking Works",
        headline: "Three Steps to Your Glam Date",
        intro:
          "Simple, clear, and handled with care from first message to confirmed booking.",
        cta: "Start Your Booking",
      },
      {
        _key: "faq",
        key: "faq",
        label: "FAQ",
        headline: "Questions Before You Book",
        subtitle:
          "Straight answers — so you can decide with confidence.",
      },
      {
        _key: "finalCta",
        key: "finalCta",
        label: "Your Date Is Waiting",
        headline: "Ready to Reserve Your Glam Session?",
        paragraph:
          "Tell me your date, your event, and the look you're dreaming of. I'll confirm availability and guide you through the next steps.",
        cta: "Check Availability",
      },
    ],
  },
  {
    _id: "pageCopy-services",
    _type: "pageCopy",
    page: "services",
    seoTitle: "Makeup Services in Lagos",
    seoDescription:
      "Bridal makeup, traditional glam, soft glam, event makeup, photoshoot glam, and home service in Lagos. See what's included and book your session.",
    heroLabel: "Services",
    heroTitle: "Makeup Services for Every Kind of Special Day",
    heroSubtitle:
      "From quiet bridal mornings to high-energy celebrations — each service is built around how you need to look, feel, and last.",
    sections: [
      {
        _key: "intro",
        key: "intro",
        title: "Not Sure Which Service Fits?",
        body: "Bridal and traditional bookings include the fullest experience. Soft glam suits engagements and parties. Event glam is for when you want more definition. Send your date and occasion — I'll recommend the right fit.",
      },
      {
        _key: "finalCta",
        key: "finalCta",
        headline: "Know Your Date? Let's Secure Your Glam",
        subtitle:
          "Share your event details on WhatsApp or through the booking form.",
      },
    ],
  },
  {
    _id: "pageCopy-portfolio",
    _type: "pageCopy",
    page: "portfolio",
    seoTitle: "Makeup Portfolio & Client Looks",
    seoDescription:
      "Browse bridal, soft glam, event, traditional, and photoshoot makeup by Temilola — professional makeup artist in Lagos.",
    heroLabel: "Portfolio",
    heroTitle: "A Curated Gallery of Client Glam",
    heroSubtitle:
      "Filter by style, study the details, and picture how your own look could come together.",
    sections: [
      {
        _key: "intro",
        key: "intro",
        paragraph:
          "These are real sessions — bridal, traditional, soft glam, events, and shoots across Lagos. Tap any look to view larger, or message me to book something similar.",
        cta: "Book This Look",
      },
      {
        _key: "midCta",
        key: "midCta",
        paragraph:
          "Love this style? Check availability for your date.",
        cta: "Check Availability",
      },
    ],
  },
  {
    _id: "pageCopy-pricing",
    _type: "pageCopy",
    page: "pricing",
    seoTitle: "Makeup Packages & Pricing",
    seoDescription:
      "Transparent starting prices for bridal, event, and soft glam makeup in Lagos. Home service and group bookings available. Request your custom quote.",
    heroLabel: "Pricing",
    heroTitle: "Packages That Help You Plan Ahead",
    heroSubtitle:
      "Starting prices for the most requested looks. Your custom quote reflects travel, timing, and party size.",
    sections: [
      {
        _key: "explanation",
        key: "explanation",
        title: "How Pricing Works",
        body: "I believe in clarity upfront. Packages show where your investment begins — we'll confirm the full amount once I know your venue, date, and exact requirements.",
      },
      {
        _key: "deposit",
        key: "deposit",
        title: "Securing Your Date",
        body: "50% deposit required to secure your date. You'll receive confirmation and prep guidance once your deposit is received.",
      },
      {
        _key: "travel",
        key: "travel",
        title: "Home Service & Travel",
        body: "I travel across Lagos & nearby areas (Ikeja, Lekki, Victoria Island, Mainland) with a full professional kit. A travel fee may apply based on distance and timing.",
      },
      {
        _key: "finalCta",
        key: "finalCta",
        headline: "Need a Quote for Your Exact Event?",
        subtitle:
          "Send your date, location, and number of faces — I'll respond with availability and pricing.",
        cta: "Request a Custom Quote",
      },
    ],
  },
  {
    _id: "pageCopy-about",
    _type: "pageCopy",
    page: "about",
    seoTitle: "About Temilola",
    seoDescription:
      "Meet Temilola — bridal and event makeup artist in Lagos. Calm, professional glam tailored to your face, your outfit, and your moment.",
    heroLabel: "About",
    heroTitle: "The Artist Behind the Brush",
    heroSubtitle:
      "Temilola — Lagos makeup artist devoted to making women feel prepared, polished, and genuinely themselves.",
    sections: [
      {
        _key: "intro",
        key: "intro",
        title: "Makeup Should Feel Like You — Just Elevated",
        paragraphs: [
          "I'm Temilola, a professional makeup artist based in Lagos, specialising in bridal, traditional, soft glam, and event makeup.",
          "I started this work because I love the quiet confidence that appears when someone looks in the mirror and recognises themselves — just more radiant. That moment matters whether it's a wedding morning or a milestone birthday.",
          "On your day, I bring calm energy, punctual timing, and a kit that's clean, organised, and ready. No chaos. No rushing. Just focused glam that holds up to photos, dancing, and emotion.",
        ],
        cta: "Check Availability",
      },
      {
        _key: "philosophy",
        key: "philosophy",
        label: "Philosophy",
        title: "What Guides Every Session",
      },
      {
        _key: "trust",
        key: "trust",
        title: "Why Clients Book Again",
        body: "Brides refer their bridesmaids. Birthday clients return for the next celebration. It's not hype — it's consistency: prep, hygiene, communication, and a finish that still looks beautiful hours later.",
      },
    ],
  },
  {
    _id: "pageCopy-book",
    _type: "pageCopy",
    page: "book",
    seoTitle: "Book Your Makeup Session",
    seoDescription:
      "Check availability and book bridal or event makeup in Lagos. WhatsApp or booking form — fast, simple, professional.",
    heroLabel: "Book Now",
    heroTitle: "Let's Find a Date for Your Glam",
    heroSubtitle:
      "The fastest way to hear back is WhatsApp. Prefer a form? Fill it in below — I'll confirm availability within 24 hours.",
    sections: [
      {
        _key: "form",
        key: "form",
        title: "Booking Request Form",
        intro:
          "Share a few details about your event. Required fields are marked — everything else helps me prepare your quote.",
        cta: "Submit Booking Request",
      },
      {
        _key: "whatsappCard",
        key: "whatsappCard",
        title: "Prefer WhatsApp?",
        body: "Send your name, date, location, and the service you need. Most inquiries get a reply the same day during business hours.",
        cta: "Send Booking Details",
      },
      {
        _key: "afterSubmit",
        key: "afterSubmit",
        title: "What Happens Next",
        steps: [
          "I review your date and service request.",
          "You receive availability confirmation and a quote if needed.",
          "Secure your booking with a deposit — then we prep for your day.",
        ],
      },
    ],
  },
  {
    _id: "pageCopy-transformations",
    _type: "pageCopy",
    page: "transformations",
    seoTitle: "Before & After Transformations | Temilola Makeup",
    seoDescription:
      "Drag to compare real before and after makeup transformations by Temilola Makeup in Lagos. Bridal, soft glam, event, and photoshoot results.",
    heroLabel: "Before & After",
    heroTitle: "Real Transformations You Can Drag to Compare",
    heroSubtitle:
      "Slide each image to see full before and full after in the same frame. Use the magnifier for close details.",
  },
];

// ─── Blog Posts ────────────────────────────────────────────────────────
const blogPosts = [
  {
    _id: "blog-post-1",
    _type: "blogPost",
    title: "How Early Should You Book Your Bridal Makeup Artist?",
    slug: { _type: "slug", current: "how-early-should-you-book-your-bridal-makeup-artist" },
    excerpt:
      "Timing is everything when it comes to bridal beauty. Here's when to start your search and why early booking matters.",
    category: "Bridal Tips",
    author: "Temilola",
    publishedAt: "2026-06-15T10:00:00Z",
    order: 1,
    body: [
      {
        _type: "block",
        _key: "bp1-b1",
        style: "normal",
        markDefs: [],
        children: [
          {
            _type: "span",
            _key: "bp1-b1-s1",
            text: "Your wedding day is one of the most photographed moments of your life, and the right makeup artist can make or break how you feel from morning prep to the last dance. But here is the thing most brides learn too late: the best artists get booked months in advance. If you are planning a wedding in Lagos, especially during peak season, starting your search early is not just smart — it is essential.",
            marks: [],
          },
        ],
      },
      {
        _type: "block",
        _key: "bp1-b2",
        style: "normal",
        markDefs: [],
        children: [
          {
            _type: "span",
            _key: "bp1-b2-s1",
            text: "Ideally, you should begin looking for your bridal makeup artist three to six months before your wedding date. This gives you enough time to research portfolios, read reviews, and reach out for consultations. Popular dates — Saturdays in December, Easter weekends, and Valentine's season — fill up fastest. If your wedding falls on one of these dates, consider booking even earlier to avoid disappointment.",
            marks: [],
          },
        ],
      },
      {
        _type: "block",
        _key: "bp1-b3",
        style: "normal",
        markDefs: [],
        children: [
          {
            _type: "span",
            _key: "bp1-b3-s1",
            text: "Early booking also gives you the advantage of scheduling a trial session. A trial lets you and your artist test your desired look, adjust for your skin type, and ensure the final result matches your outfit, jewellery, and venue lighting. Without a trial, you are leaving your wedding-day face to chance — and no bride wants that kind of surprise.",
            marks: [],
          },
        ],
      },
      {
        _type: "block",
        _key: "bp1-b4",
        style: "normal",
        markDefs: [],
        children: [
          {
            _type: "span",
            _key: "bp1-b4-s1",
            text: "What happens if you book late? You may end up settling for whoever is available rather than choosing the artist whose style genuinely matches your vision. Last-minute bookings can also mean rushed consultations, no trial session, and added stress during an already busy planning period. Your makeup artist should be someone you trust and feel comfortable with — and that relationship takes a little time to build.",
            marks: [],
          },
        ],
      },
      {
        _type: "block",
        _key: "bp1-b5",
        style: "normal",
        markDefs: [],
        children: [
          {
            _type: "span",
            _key: "bp1-b5-s1",
            text: "If you are reading this and your wedding is coming up, do not panic — just act now. Send a message with your date, location, and the look you are dreaming of. I will check availability and guide you through the next steps so your wedding morning feels calm, prepared, and beautiful.",
            marks: [],
          },
        ],
      },
    ],
  },
  {
    _id: "blog-post-2",
    _type: "blogPost",
    title: "Soft Glam vs Bold Glam: Choosing Your Event Look",
    slug: { _type: "slug", current: "soft-glam-vs-bold-glam-choosing-your-event-look" },
    excerpt:
      "Not sure which direction to take for your next event? Here's how to decide between soft glam and bold glam.",
    category: "Event Glam",
    author: "Temilola",
    publishedAt: "2026-06-10T10:00:00Z",
    order: 2,
    body: [
      {
        _type: "block",
        _key: "bp2-b1",
        style: "normal",
        markDefs: [],
        children: [
          {
            _type: "span",
            _key: "bp2-b1-s1",
            text: "One of the most common questions I get from clients is: should I go soft glam or bold glam? The answer depends on several factors — your event, your personal style, and how you want to feel when you walk into the room. Both looks are stunning, but they serve different purposes and create different impressions.",
            marks: [],
          },
        ],
      },
      {
        _type: "block",
        _key: "bp2-b2",
        style: "normal",
        markDefs: [],
        children: [
          {
            _type: "span",
            _key: "bp2-b2-s1",
            text: "Soft glam is all about enhancing your natural beauty with a polished, romantic finish. Think diffused contour, a luminous glow, neutral or warm-toned eyeshadow, and lashes that open the eyes without overpowering them. This look works beautifully for engagements, bridal showers, graduation dinners, and intimate celebrations where you want to look effortlessly elegant. It photographs well in natural light and feels comfortable to wear for long hours.",
            marks: [],
          },
        ],
      },
      {
        _type: "block",
        _key: "bp2-b3",
        style: "normal",
        markDefs: [],
        children: [
          {
            _type: "span",
            _key: "bp2-b3-s1",
            text: "Bold glam, on the other hand, is about definition and drama. Sculpted contour, deeper lip colours, more pigmented eyeshadow, and full lashes create a look that commands attention. This is the choice for parties, red carpet events, milestone birthdays, and any occasion where flash photography and dramatic lighting are involved. Bold glam reads powerfully on camera and holds up under artificial lighting that can wash out softer looks.",
            marks: [],
          },
        ],
      },
      {
        _type: "block",
        _key: "bp2-b4",
        style: "normal",
        markDefs: [],
        children: [
          {
            _type: "span",
            _key: "bp2-b4-s1",
            text: "Lighting and photography play a bigger role than most people realise. Natural daylight is forgiving and flatters soft glam beautifully. But indoor events with overhead lights, flash photography, or coloured stage lighting can flatten soft makeup and make it appear like you are wearing very little. If your event is indoors with heavy photography, bold glam often translates better in the final images — even if it feels slightly more dramatic in person.",
            marks: [],
          },
        ],
      },
      {
        _type: "block",
        _key: "bp2-b5",
        style: "normal",
        markDefs: [],
        children: [
          {
            _type: "span",
            _key: "bp2-b5-s1",
            text: "The best advice I can give is to communicate openly with your makeup artist. Share reference photos, describe the venue and lighting, and be honest about your comfort level. A skilled artist can find the sweet spot between soft and bold — giving you definition where it matters while keeping the overall feel aligned with your personality. There is no wrong choice, only the right one for you and your event.",
            marks: [],
          },
        ],
      },
    ],
  },
  {
    _id: "blog-post-3",
    _type: "blogPost",
    title: "Preparing Your Skin Before Makeup Application",
    slug: { _type: "slug", current: "preparing-your-skin-before-makeup-application" },
    excerpt:
      "Great makeup starts before the first brush touches your face. Follow these steps for a flawless, long-lasting finish.",
    category: "Skin Prep",
    author: "Temilola",
    publishedAt: "2026-06-05T10:00:00Z",
    order: 3,
    body: [
      {
        _type: "block",
        _key: "bp3-b1",
        style: "normal",
        markDefs: [],
        children: [
          {
            _type: "span",
            _key: "bp3-b1-s1",
            text: "The secret to makeup that looks smooth, blends seamlessly, and lasts all day is not just the products or the technique — it is the skin underneath. No matter how talented your makeup artist is, dry patches, excess oil, or dehydrated skin will affect how foundation sits and how long your look holds. Preparing your skin properly is the foundation of a flawless finish.",
            marks: [],
          },
        ],
      },
      {
        _type: "block",
        _key: "bp3-b2",
        style: "normal",
        markDefs: [],
        children: [
          {
            _type: "span",
            _key: "bp3-b2-s1",
            text: "Hydration starts from the inside. In the days leading up to your event, drink plenty of water and eat water-rich foods. On the morning of your appointment, apply a lightweight moisturiser suited to your skin type. If you have oily skin, use a gel-based moisturiser; if your skin runs dry, opt for something richer but non-greasy. Allow it to absorb fully before any makeup is applied — rushing this step is one of the most common mistakes.",
            marks: [],
          },
        ],
      },
      {
        _type: "block",
        _key: "bp3-b3",
        style: "normal",
        markDefs: [],
        children: [
          {
            _type: "span",
            _key: "bp3-b3-s1",
            text: "Cleansing is equally important. Arrive at your session with a clean, product-free face. Avoid applying heavy creams, sunscreen with a white cast, or leftover makeup from the night before. A gentle cleanser removes impurities without stripping your skin, giving your artist a clean canvas to work with. If your artist applies primer, it will adhere much better to freshly cleansed skin.",
            marks: [],
          },
        ],
      },
      {
        _type: "block",
        _key: "bp3-b4",
        style: "normal",
        markDefs: [],
        children: [
          {
            _type: "span",
            _key: "bp3-b4-s1",
            text: "There are a few things to avoid in the 48 hours before your makeup session. Skip harsh exfoliants, new skincare products you have never tried, facial waxing, and anything that could cause irritation or redness. Trying a new product too close to your event is risky — if your skin reacts, there is no time to recover. Stick with your trusted routine and let your skin be calm and settled.",
            marks: [],
          },
        ],
      },
      {
        _type: "block",
        _key: "bp3-b5",
        style: "normal",
        markDefs: [],
        children: [
          {
            _type: "span",
            _key: "bp3-b5-s1",
            text: "As a professional tip, I always begin every session with my own skin prep routine — gentle cleansing, toning, and a hydrating primer tailored to each client. But the better your skin arrives, the better the result. Think of it as teamwork: you handle the days before, and I handle the morning of. Together, we create a base that holds beautifully from the first photo to the last moment of your event.",
            marks: [],
          },
        ],
      },
    ],
  },
  {
    _id: "blog-post-4",
    _type: "blogPost",
    title: "How Much Does Bridal Makeup Cost in Lagos? (2026 Price Guide)",
    slug: { _type: "slug", current: "how-much-does-bridal-makeup-cost-in-lagos" },
    excerpt:
      "A transparent breakdown of bridal makeup pricing in Lagos — what affects cost, what to budget for, and how to get the best value for your wedding day glam.",
    category: "Bridal Tips",
    author: "Temilola",
    publishedAt: "2026-06-20T10:00:00Z",
    order: 4,
    body: [
      { _type: "block", _key: "bp4-b1", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bp4-b1-s1", text: "Let me be honest with you — if you have ever Googled \"bridal makeup cost in Lagos\" and got nothing but vague answers, I understand the frustration. One of the biggest stress points for brides planning their wedding in Lagos is trying to figure out how much to actually budget for makeup. So let me break it all down for you.", marks: [] }] },
      { _type: "block", _key: "bp4-h1", style: "h2", markDefs: [], children: [{ _type: "span", _key: "bp4-h1-s1", text: "What Does Bridal Makeup Typically Cost in Lagos?", marks: [] }] },
      { _type: "block", _key: "bp4-b2", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bp4-b2-s1", text: "In 2026, bridal makeup in Lagos generally ranges from 100,000 naira to 350,000 naira or more. That is a wide range, and I know that does not feel helpful yet — but the reason for the range is that every bride has different needs. A simple ceremony at a registry with natural makeup is very different from a full glam traditional wedding with gele styling, touch-ups, and a bridal party of six.", marks: [] }] },
      { _type: "block", _key: "bp4-b3", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bp4-b3-s1", text: "At Temilola Makeup, bridal makeup starts from 120,000 naira. That includes a consultation on your look and outfit, full skin prep and priming, professional bridal makeup application, and a setting routine designed to keep your face flawless from your first photo to your last dance — even in Lagos heat.", marks: [] }] },
      { _type: "block", _key: "bp4-h2", style: "h2", markDefs: [], children: [{ _type: "span", _key: "bp4-h2-s1", text: "What Factors Affect the Price?", marks: [] }] },
      { _type: "block", _key: "bp4-b4", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bp4-b4-s1", text: "Several things can move your final quote up or down. The first is location — if you need a home service or venue visit, travel is factored in, especially for areas like Lekki, Ajah, or locations outside Lagos mainland. The second factor is the number of faces. If you want your bridesmaids, mother of the bride, or other members of the bridal party done, that adds to the total. Most artists charge per face.", marks: [] }] },
      { _type: "block", _key: "bp4-b5", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bp4-b5-s1", text: "The type of ceremony also matters. A white wedding look tends to be softer and more romantic, while traditional wedding makeup — especially Yoruba or Igbo traditional — often involves bolder colours, heavier contour, and coordination with your aso-oke or coral. Some brides book both ceremonies on different days, which means two separate sessions.", marks: [] }] },
      { _type: "block", _key: "bp4-b6", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bp4-b6-s1", text: "Other factors include whether you want a trial session before the wedding day, the complexity of your desired look such as cut crease, heavy lash stacking, or special effects, and whether gele tying is included. A trial session is not mandatory, but I always recommend it — it lets us test the look, adjust for your skin type, and make sure you are 100 percent confident before the big day.", marks: [] }] },
      { _type: "block", _key: "bp4-h3", style: "h2", markDefs: [], children: [{ _type: "span", _key: "bp4-h3-s1", text: "What About Cheaper Options?", marks: [] }] },
      { _type: "block", _key: "bp4-b7", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bp4-b7-s1", text: "You will find makeup artists in Lagos who charge as low as 30,000 to 50,000 naira for bridal makeup. Some of them do good work — but here is what you need to watch out for. At that price point, you are often getting limited products, no skin prep, and no guarantee of longevity. Wedding days are long, emotional, and sweaty. If your foundation starts breaking down by the reception, no amount of blotting paper will save it.", marks: [] }] },
      { _type: "block", _key: "bp4-b8", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bp4-b8-s1", text: "Professional bridal makeup is an investment in how you feel on one of the most important days of your life. The products used, the technique, the time spent on skin preparation — all of these determine whether your makeup lasts six hours or twelve. When you are choosing an artist, do not just compare prices — compare portfolios, read reviews, and ask about their process.", marks: [] }] },
      { _type: "block", _key: "bp4-h4", style: "h2", markDefs: [], children: [{ _type: "span", _key: "bp4-h4-s1", text: "How to Budget Smart for Your Wedding Makeup", marks: [] }] },
      { _type: "block", _key: "bp4-b9", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bp4-b9-s1", text: "My advice to every bride is this: allocate 10 to 15 percent of your total wedding budget to hair and makeup. Start your search three to six months before your date, especially if your wedding falls during peak season which is November through January in Lagos. Book early, secure your date with a deposit, and schedule your trial at least two weeks before the wedding.", marks: [] }] },
      { _type: "block", _key: "bp4-b10", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bp4-b10-s1", text: "If budget is tight, consider having only yourself done professionally and letting your girls handle their own makeup. Or ask your artist about group discounts — at Temilola Makeup, we offer special rates for bridal party packages that cover multiple faces.", marks: [] }] },
      { _type: "block", _key: "bp4-h5", style: "h2", markDefs: [], children: [{ _type: "span", _key: "bp4-h5-s1", text: "Ready to Get Your Custom Quote?", marks: [] }] },
      { _type: "block", _key: "bp4-b11", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bp4-b11-s1", text: "Every wedding is different, and I would rather give you an accurate quote than a one-size-fits-all number. Send me a message with your wedding date, location, number of faces, and the style you are going for. I will get back to you within 24 hours with a detailed quote and availability. Your wedding morning should feel calm, pampered, and beautiful — and that starts with booking the right artist.", marks: [] }] },
    ],
  },
  {
    _id: "blog-post-5",
    _type: "blogPost",
    title: "What Is Soft Glam Makeup? (And Why Every Lagos Bride Is Requesting It)",
    slug: { _type: "slug", current: "what-is-soft-glam-makeup" },
    excerpt:
      "Soft glam is the most requested makeup style in Lagos right now. Here is exactly what it is, who it works best for, and why it photographs so beautifully.",
    category: "Beauty Education",
    author: "Temilola",
    publishedAt: "2026-06-18T10:00:00Z",
    order: 5,
    body: [
      { _type: "block", _key: "bp5-b1", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bp5-b1-s1", text: "If you have been scrolling through Instagram looking at bridal and event makeup in Lagos, you have probably noticed a style that keeps coming up — skin that looks like skin, lips that are defined but not overpowering, eyes that are enhanced but not dramatic. That is soft glam. And there is a reason it has become the number one most requested look at my studio.", marks: [] }] },
      { _type: "block", _key: "bp5-h1", style: "h2", markDefs: [], children: [{ _type: "span", _key: "bp5-h1-s1", text: "Soft Glam Defined", marks: [] }] },
      { _type: "block", _key: "bp5-b2", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bp5-b2-s1", text: "Soft glam is a makeup technique that enhances your natural features without making you look \"done up.\" It sits right between a natural no-makeup-makeup look and full-on bold glam. Think flawless skin with a dewy or satin finish, well-blended neutral eyeshadow, defined brows, subtle contouring, and a nude or rosy lip. The goal is to look like the most polished, beautiful version of yourself — not like someone else.", marks: [] }] },
      { _type: "block", _key: "bp5-b3", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bp5-b3-s1", text: "The key word here is balance. With soft glam, nothing is fighting for attention. Your skin glows, your eyes have depth, and your lips complement the overall look rather than competing with it. It is elegant, timeless, and incredibly flattering on every skin tone.", marks: [] }] },
      { _type: "block", _key: "bp5-h2", style: "h2", markDefs: [], children: [{ _type: "span", _key: "bp5-h2-s1", text: "Why Is Soft Glam So Popular in Lagos Right Now?", marks: [] }] },
      { _type: "block", _key: "bp5-b4", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bp5-b4-s1", text: "There are a few reasons. First, social media has changed what brides and event-goers want. People are seeing natural light photography, iPhone selfies, and video content where heavy makeup can look cakey or overdone. Soft glam translates beautifully across all media — it looks good in professional photos, in natural daylight, and on your friend's phone camera.", marks: [] }] },
      { _type: "block", _key: "bp5-b5", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bp5-b5-s1", text: "Second, Lagos weather plays a role. We live in a hot, humid city. Heavy, full-coverage makeup can feel uncomfortable and can break down faster in the heat. Soft glam uses lighter layering techniques with strategic coverage only where you need it — so your skin can breathe while still looking flawless. When done with the right products and setting techniques, it lasts just as long as bold glam.", marks: [] }] },
      { _type: "block", _key: "bp5-b6", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bp5-b6-s1", text: "Third, there is a cultural shift. Nigerian women are embracing their natural beauty more than ever. Clients are coming to me saying \"I want to look like myself, but elevated.\" That is literally the definition of soft glam.", marks: [] }] },
      { _type: "block", _key: "bp5-h3", style: "h2", markDefs: [], children: [{ _type: "span", _key: "bp5-h3-s1", text: "Soft Glam vs Bold Glam: What Is the Difference?", marks: [] }] },
      { _type: "block", _key: "bp5-b7", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bp5-b7-s1", text: "Bold glam is definition and drama. Sculpted contour, deeper lip colours, more pigmented eyeshadow, full lashes, and a look that commands attention. This is the choice for parties, red carpet events, milestone birthdays, and any occasion where flash photography and dramatic lighting are involved.", marks: [] }] },
      { _type: "block", _key: "bp5-b8", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bp5-b8-s1", text: "Soft glam reads powerfully on camera and flatters beautifully in natural light. But indoor events with overhead lights, flash photography, or coloured stage lighting can flatten soft makeup and make it appear like you are wearing very little. If your event is indoors with heavy photography, bold glam often translates better in the final images — even if it feels slightly more dramatic in person.", marks: [] }] },
      { _type: "block", _key: "bp5-h4", style: "h2", markDefs: [], children: [{ _type: "span", _key: "bp5-h4-s1", text: "Who Does Soft Glam Work Best For?", marks: [] }] },
      { _type: "block", _key: "bp5-b10", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bp5-b10-s1", text: "Honestly? Everyone. But it is especially popular with brides who want timeless wedding photos that will not look dated in ten years, event guests who want to look polished without looking like they are trying too hard, professionals attending corporate events or brand launches, and anyone who values skin-first makeup where the focus is on a healthy glow rather than heavy coverage.", marks: [] }] },
      { _type: "block", _key: "bp5-h5", style: "h2", markDefs: [], children: [{ _type: "span", _key: "bp5-h5-s1", text: "How to Book Your Soft Glam Session", marks: [] }] },
      { _type: "block", _key: "bp5-b12", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bp5-b12-s1", text: "Soft glam is one of my signature services at Temilola Makeup. Whether it is for your wedding day, a birthday dinner, a photoshoot, or any event where you want to look effortlessly stunning, I would love to create a look tailored to your skin, your outfit, and your vibe. Send me a message with your event date and details, and let us make it happen.", marks: [] }] },
    ],
  },
];

// ─── Seed function ──────────────────────────────────────────────────────
async function seed() {
  console.log("Seeding Sanity...\n");

  const allDocs = [
    siteConfig,
    ...services,
    ...packages,
    ...portfolioItems,
    ...testimonials,
    ...faqItems,
    ...bookingSteps,
    ...whyChooseUsItems,
    ...aboutValues,
    ...pageCopyDocs,
    ...blogPosts,
  ];

  let created = 0;
  let updated = 0;

  for (const doc of allDocs) {
    try {
      const existing = await client.getDocument(doc._id);
      if (existing) {
        await client.createOrReplace(doc);
        updated++;
        console.log(`  Updated: [${doc._type}] ${doc._id}`);
      } else {
        await client.createOrReplace(doc);
        created++;
        console.log(`  Created: [${doc._type}] ${doc._id}`);
      }
    } catch {
      await client.createOrReplace(doc);
      created++;
      console.log(`  Created: [${doc._type}] ${doc._id}`);
    }
  }

  console.log(`\nDone! Created: ${created}, Updated: ${updated}`);
  console.log("Total documents: " + allDocs.length);
  console.log(
    "\nNote: Portfolio items and service images need to be uploaded manually"
  );
  console.log(
    "in the Sanity Studio. The text content is fully seeded."
  );
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
