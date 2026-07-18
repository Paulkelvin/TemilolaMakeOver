/**
 * Sanity bootstrap seed script — populates a Sanity project with the
 * current content model. Safe to run any number of times: existing
 * documents are never overwritten or deleted (see the "Seed function"
 * section at the bottom for the exact guarantees).
 *
 * This is a bootstrap script, not a migration runner — it's meant for
 * standing up a new/empty project correctly, or filling in taxonomy
 * documents this project didn't have yet. Changes to already-live data
 * (renaming a field, re-tagging content, deleting a document) should be
 * a one-off script in sanity/migrations/ instead, reviewed and run once.
 *
 * Usage:
 *   npx tsx sanity/seed.ts --dry-run   # preview only, zero writes
 *   npx tsx sanity/seed.ts             # apply
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
    "Makeup That Makes You Feel Effortlessly Confident",
  description:
    "Book a professional makeup artist in Lagos for soft glam, event, and bridal makeup. Home service available. View real client looks, packages, and check availability for your date.",
  usp: [
    "Soft glam specialist",
    "Bridal & traditional wedding experience",
    "Home service across Lagos",
    "Skin-prep focused, camera-ready finish",
    "Calm, punctual service for every event",
  ],
  url: "https://www.gleambytemi.com",
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
    name: "Soft Glam",
    slug: { _type: "slug", current: "Soft-glam" },
    shortDescription:
      "A polished look perfect for everyday elegance and special occasions.",
    description:
      "Soft Glam is our signature beauty experience for clients who want to look effortlessly elegant. Designed to enhance your features rather than transform them, this service delivers flawless skin, softly defined eyes, sculpted brows, and a beautiful lip combination that feels luxurious without appearing overdone. Perfect for clients who appreciate understated sophistication.",
    whoFor: "Clients who want a natural yet polished makeup look with a radiant finish.",
    bestFor: "* Birthday celebrations * Date nights * Church * Brunch * Graduation * Dinner events * Everyday luxury",
    included: [
      "Luxury skin prep",
      "Flawless foundation application",
      "Concealer & complexion correction",
      "Soft contour & blush",
      "Soft eyeshadow",
      "Defined brows",
      "Premium strip lashes",
      "Lip liner & lipstick/gloss",
      "Setting spray for long wear",
    ],
    duration: "1 hour 30 minutes",
    homeService: true,
    priceFrom: 30000,
    icon: "sparkles",
    highlighted: true,
    order: 1,
  },
  {
    _id: "service-soft-glam",
    _type: "service",
    name: "Event/Owambe Glam",
    slug: { _type: "slug", current: "Event-owambe-glam" },
    shortDescription:
      "Owambe Glamour is designed to stand out beautifully at every celebration.",
    description:
      "Event/Owambe Glam is created to ensure you look impeccable in person and on camera whether you're attending a wedding, birthday, engagement, gala or a special event. \n\nThis service features enhanced complexion work, more detailed eye makeup, and a longer-lasting finish that stays throughout your event.",
    bestFor: "• Wedding guests • Birthday celebrants • Owambe guests • Engagement parties • Corporate events • Gala nights",
    included: [
      "Skin prep & priming",
      "Premium complexion application",
      "Sculpted contour",
      "Blush & highlight",
      "Detailed eyeshadow",
      "Premium Lashes",
      "Defined brows ",
      "Customized lip combination",
      "Long-wear setting spray",
    ],
    duration: "2 hours",
    homeService: true,
    priceFrom: 40000,
    icon: "party-popper",
    highlighted: false,
    order: 2,
  },
  {
    _id: "service-group",
    _type: "service",
    name: "Photoshoot Makeup",
    slug: { _type: "slug", current: "Photoshoot-makeup" },
    shortDescription:
      "Created to look just as beautiful on camera as it does in real life.",
    description:
      "Camera flashes and studio lights can change the way makeup looks. That's why our Photoshoot Makeup is carefully tailored to photography, giving you a flawless finish that translates beautifully in every shot. Whether it's your graduation shoot, birthday shoot, maternity session or brand photos, we've got you covered.",
    whoFor: "Clients preparing for any kind of professional photoshoot.",
    bestFor: "• Birthday shoots • graduation • maternity • branding sessions • studio portraits and content creation",
    included: [
      "Camera-ready skin prep",
      "HD complexion",
      "Detailed eye makeup",
      "Premium lashes",
      "Sculpted contour",
      "Beautiful lip finish",
      "Long-wear setting spray",
    ],
    duration: "2 hours",
    homeService: true,
    priceFrom: 45000,
    icon: "camera",
    order: 3,
  },
  {
    _id: "service-home",
    _type: "service",
    name: "Luxury Full Glam",
    slug: { _type: "slug", current: "Luxury-full-glam" },
    shortDescription:
      "For the woman who wants all the glam, all the confidence and all the attention.",
    description:
      "Luxury Full Glam is our premium makeup experience. Every detail is carefully perfected—from your skin to your eyes and lips—to give you a rich, glamorous finish that's impossible to ignore. If your outfit is making a statement, your makeup should too.",
    whoFor: "Clients who love bold, glamorous makeup.",
    bestFor: "• Luxury events • birthdays • weddings • gala nights • content creation and special occasions.",
    included: [
      "Luxury skin prep",
      "Premium complexion products",
      "Full contour and highlight",
      "Detailed eye artistry",
      "Luxury lashes",
      "Defined brows",
      "Custom lip combination ",
      "Long-lasting finish",
    ],
    duration: "2hrs",
    homeService: true,
    priceFrom: 50000,
    icon: "crown",
    order: 4,
  },
  {
    _id: "service-traditional",
    _type: "service",
    name: "Bridal Makeup",
    slug: { _type: "slug", current: "bridal-makeup" },
    shortDescription:
      "Beautiful, timeless bridal makeup that lets you enjoy every moment of your big day with confidence.",
    description:
      "Your wedding day isn't the day to worry about your makeup. From the moment you sit in our chair, our focus is making sure you look radiant, feel confident and stay flawless throughout the day. We use premium products and long-wear techniques so your makeup looks just as beautiful during your first look as it does at the end of the celebration.",
    whoFor: "Brides who want a timeless, elegant and long-lasting bridal look.",
    bestFor: "• Traditional weddings • white weddings and civil ceremonies",
    included: [
      "Bridal consultation",
      "Luxury skin prep",
      "Waterproof, long-lasting makeup",
      "Premium lashes",
      "Customized eye look",
      "Flawless complexion",
      "Lip touch-up product",
      "Setting spray",
    ],
    duration: "2 hours 30 minutes",
    homeService: true,
    priceFrom: 120000,
    icon: "palette",
    order: 5,
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
    title: "Photoshoot Makeup",
    alt: "Photoshoot makeup — camera-ready glam",
    category: "Photoshoot",
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
    category: ["general"],
    order: 1,
  },
  {
    _id: "faq-2",
    _type: "faq",
    question: "Is a deposit required to confirm my booking?",
    answer:
      "Yes. A 50% deposit secures your date in my calendar. The balance is due on or before your appointment. You'll receive written confirmation once the deposit is received, along with prep notes for your skin and schedule.",
    category: ["general"],
    order: 2,
  },
  {
    _id: "faq-3",
    _type: "faq",
    question: "Do you offer home service in Lagos?",
    answer:
      "Yes — I travel across Lagos including Ikeja, Lekki, Victoria Island, and Mainland areas. I bring a full professional kit and set up at your home, hotel, or venue. A travel fee may apply depending on distance and timing.",
    category: ["general"],
    order: 3,
  },
  {
    _id: "faq-4",
    _type: "faq",
    question: "Can you travel outside Lagos for my event?",
    answer:
      "Outside Lagos may be possible for bridal and larger bookings. Share your location, date, and service needs when you inquire — I'll confirm if I can travel and include any travel costs in your quote.",
    category: ["general"],
    order: 4,
  },
  {
    _id: "faq-5",
    _type: "faq",
    question: "What is your rescheduling policy?",
    answer:
      "Please notify me at least 7 days before your appointment if your date changes. Rescheduling depends on availability. Late changes may affect deposit terms — I'll always communicate clearly before you commit.",
    category: ["general"],
    order: 5,
  },
  {
    _id: "faq-6",
    _type: "faq",
    question: "Do you offer bridal makeup trials?",
    answer:
      "Yes, and I recommend them. A trial lets us test your look, adjust for your skin and outfit, and remove guesswork from the wedding morning. Book your trial when you reserve your wedding date.",
    category: ["general"],
    order: 6,
  },
  {
    _id: "faq-7",
    _type: "faq",
    question: "Can I book makeup for my full bridal party?",
    answer:
      "Absolutely. Share how many faces, the looks you want (matching or individual), and your timeline. I'll plan a schedule that keeps everyone ready before the bride needs to leave.",
    category: ["general"],
    order: 7,
  },
  {
    _id: "faq-8",
    _type: "faq",
    question: "How long does each makeup session take?",
    answer:
      "Bridal makeup: 2–3 hours. Soft glam and event makeup: 1.5–2 hours. Group bookings are timed per face at roughly 1–1.5 hours each. I'll confirm timing when we book.",
    category: ["general"],
    order: 8,
  },
  {
    _id: "faq-9",
    _type: "faq",
    question: "Can I send reference photos of a look I want?",
    answer:
      "Please do — via WhatsApp or with your booking form. I'll advise what's achievable for your features, skin, and event lighting. References help us start aligned; your face guides the final result.",
    category: ["general"],
    order: 9,
  },
  {
    _id: "faq-10",
    _type: "faq",
    question: "How do I confirm payment and final booking?",
    answer:
      "After we agree on your date and quote, you'll receive deposit payment details. Once received, your date is confirmed. I'll follow up with arrival time, prep tips, and anything I need from you before the day.",
    category: ["general"],
    order: 10,
  },
  {
    _id: "faq-11",
    _type: "faq",
    question: "How much does bridal makeup cost in Lagos?",
    answer:
      "Bridal makeup at Gleam by Temi starts from ₦120,000 for a white wedding look and ₦130,000 for traditional bridal makeup. The final price depends on location, whether you need a trial session, and the number of faces in your bridal party. You'll get a clear quote before committing.",
    category: ["general", "pricing"],
    order: 11,
  },
  {
    _id: "faq-12",
    _type: "faq",
    question: "How much does a makeup session cost in Lagos?",
    answer:
      "Soft glam starts from ₦35,000, event glam from ₦45,000, and birthday glam from ₦40,000. Bridal starts from ₦120,000. Home service is an additional ₦10,000. Every quote is customised to your needs — message me with your event details for exact pricing.",
    category: ["general"],
    order: 12,
  },
  {
    _id: "faq-13",
    _type: "faq",
    question: "What is the best makeup artist in Lagos for weddings?",
    answer:
      "The best makeup artist is one who listens, preps your skin properly, and delivers a look that lasts all day. At Gleam by Temi, I specialise in bridal makeup across Lagos — from Ikeja to Lekki to Victoria Island. Check my portfolio to see real bridal looks, then decide if my style matches your vision.",
    category: ["general"],
    order: 13,
  },
  {
    _id: "faq-15",
    _type: "faq",
    question: "What should I do to prepare my skin before makeup?",
    answer:
      "Drink plenty of water in the days leading up to your appointment. Cleanse and moisturise the night before, but skip heavy skincare products on the morning. Arrive with a clean, bare face — no foundation or sunscreen. I'll handle skin prep from there.",
    category: ["general"],
    order: 15,
  },
  {
    _id: "faq-16",
    _type: "faq",
    question: "Can I book same-day or last-minute makeup in Lagos?",
    answer:
      "Same-day bookings depend on my schedule. If I have availability, I'll fit you in — message me on WhatsApp and I'll confirm honestly. For the best experience, especially for events and bridal, booking at least 2–4 weeks ahead is ideal.",
    category: ["general"],
    order: 16,
  },
  {
    _id: "faq-17",
    _type: "faq",
    question: "What areas in Lagos do you cover for home service?",
    answer:
      "I cover Ikeja, Lekki, Victoria Island, Ikoyi, Ajah, Yaba, Surulere, Mainland, and surrounding Lagos areas. For locations outside central Lagos, a travel fee may apply. Share your address when booking and I'll confirm coverage and any additional cost.",
    category: ["general"],
    order: 17,
  },
  {
    _id: "faq-p2",
    _type: "faq",
    question: "What does makeup artist pricing include?",
    answer:
      "Every package includes skin prep, professional-grade product application, lash enhancement, and long-wear setting. Bridal packages also include a consultation and touch-up guidance. The price shown is a starting point — your custom quote covers your specific needs.",
    category: ["pricing"],
    order: 18,
  },
  {
    _id: "faq-p3",
    _type: "faq",
    question: "Is a bridal trial included in the price?",
    answer:
      "A bridal trial is a separate session and not included in the base bridal price. However, I strongly recommend it — we test your look, adjust for your skin and outfit, and fine-tune everything so your wedding morning is stress-free. Ask about trial pricing when booking.",
    category: ["pricing"],
    order: 19,
  },
  {
    _id: "faq-p4",
    _type: "faq",
    question: "Do you charge extra for home service?",
    answer:
      "Yes, home service is an add-on starting from ₦10,000 depending on location within Lagos. I bring a full professional kit and set up at your home, hotel, or venue. The fee covers travel and on-location setup.",
    category: ["pricing"],
    order: 20,
  },
  {
    _id: "faq-p5",
    _type: "faq",
    question: "Can I get a discount for booking multiple faces?",
    answer:
      "Group bookings are priced per face starting from ₦30,000 each, which is already our most competitive rate. For larger bridal parties (5+ faces), message me with the details and I'll work out the best package for your group.",
    category: ["pricing"],
    order: 21,
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
    seoTitle: "Temilola Makeup | Makeup Artist in Lagos",
    seoDescription:
      "Book a professional makeup artist in Lagos for soft glam, event, and bridal makeup. Home service available. View real client looks, packages, and check availability for your date.",
    heroEyebrow: "Premium Makeup Artist · Lagos",
    heroTitle:
      "Makeup That Makes You Feel Effortlessly Confident",
    heroSubtitle:
      "Soft, elegant makeup in Lagos — skin-prep focused, camera-ready, and designed to last beautifully from your first photo to your last dance.",
    heroTrustLine:
      "Trusted for soft glam, event, bridal, and photoshoot makeup across Lagos & nearby areas (Ikeja, Lekki, Victoria Island, Mainland).",
    heroBadges: ["Makeup Artist", "Soft Glam", "Home Service", "Lagos"],
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
          "Soft glam, event, birthday, bridal, and photoshoot-ready makeup tailored to your look, timeline, and venue.",
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
      "Soft glam, event makeup, bridal makeup, traditional glam, photoshoot glam, and home service in Lagos. See what's included and book your session.",
    heroLabel: "Services",
    heroTitle: "Makeup Services for Every Kind of Special Day",
    heroSubtitle:
      "From soft glam sessions to bridal mornings and high-energy celebrations — each service is built around how you need to look, feel, and last.",
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
      "Browse soft glam, event, bridal, traditional, and photoshoot makeup by Temilola — professional makeup artist in Lagos.",
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
      "Makeup services in Lagos start from ₦30,000. Compare bridal, soft glam, event, and group pricing, plus home service rates. Request your custom quote.",
    heroLabel: "Pricing",
    heroTitle: "Packages That Help You Plan Ahead",
    heroSubtitle:
      "Services start from ₦30,000. Your custom quote reflects your location, event date, and party size.",
    sections: [
      {
        _key: "explanation",
        key: "explanation",
        title: "How Pricing Works",
        body: "I believe in clarity upfront — services start from ₦30,000. From there, your final quote is shaped by your location and travel distance, your event date, and how many faces we're glamming.",
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
      "Meet Temilola — makeup artist in Lagos offering soft glam, event, and bridal makeup. Calm, professional glam tailored to your face, your outfit, and your moment.",
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
          "I'm Temilola, a professional makeup artist based in Lagos, specialising in soft glam, event, bridal, and traditional makeup.",
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
      "Check availability and book event or bridal makeup in Lagos. WhatsApp or booking form — fast, simple, professional.",
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
      "Drag to compare real before and after makeup transformations by Temilola Makeup in Lagos. Soft glam, event, bridal, and photoshoot results.",
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
        markDefs: [
          { _type: "link", _key: "bp1-il1", href: "/blog/preparing-your-skin-before-makeup-application" },
        ],
        children: [
          { _type: "span", _key: "bp1-b3-s1", text: "Early booking also gives you the advantage of scheduling a trial session. A trial lets you and your artist test your desired look, ", marks: [] },
          { _type: "span", _key: "bp1-b3-s2", text: "adjust for your skin type", marks: ["bp1-il1"] },
          { _type: "span", _key: "bp1-b3-s3", text: ", and ensure the final result matches your outfit, jewellery, and venue lighting. Without a trial, you are leaving your wedding-day face to chance — and no bride wants that kind of surprise.", marks: [] },
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
        markDefs: [
          { _type: "link", _key: "bp1-l1", href: "/blog/how-much-does-bridal-makeup-cost-in-lagos" },
          { _type: "link", _key: "bp1-l2", href: "/blog/preparing-your-skin-before-makeup-application" },
        ],
        children: [
          { _type: "span", _key: "bp1-b5-s1", text: "If you are reading this and your wedding is coming up, do not panic — just act now. Before you book, you may want to read our ", marks: [] },
          { _type: "span", _key: "bp1-b5-s2", text: "bridal makeup cost guide for Lagos", marks: ["bp1-l1"] },
          { _type: "span", _key: "bp1-b5-s3", text: " so you know what to budget. And to make sure your skin is ready for your trial and wedding day, check out our guide on ", marks: [] },
          { _type: "span", _key: "bp1-b5-s4", text: "preparing your skin before makeup application", marks: ["bp1-l2"] },
          { _type: "span", _key: "bp1-b5-s5", text: ". Send a message with your date, location, and the look you are dreaming of — I will check availability and guide you through the next steps.", marks: [] },
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
        markDefs: [
          { _type: "link", _key: "bp2-il1", href: "/blog/what-is-soft-glam-makeup" },
        ],
        children: [
          { _type: "span", _key: "bp2-b2-s1", text: "", marks: [] },
          { _type: "span", _key: "bp2-b2-s2", text: "Soft glam", marks: ["bp2-il1"] },
          { _type: "span", _key: "bp2-b2-s3", text: " is all about enhancing your natural beauty with a polished, romantic finish. Think diffused contour, a luminous glow, neutral or warm-toned eyeshadow, and lashes that open the eyes without overpowering them. This look works beautifully for engagements, bridal showers, graduation dinners, and intimate celebrations where you want to look effortlessly elegant. It photographs well in natural light and feels comfortable to wear for long hours.", marks: [] },
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
        markDefs: [
          { _type: "link", _key: "bp2-l1", href: "/blog/what-is-soft-glam-makeup" },
          { _type: "link", _key: "bp2-l2", href: "/blog/soft-glam-makeup-tutorial-step-by-step" },
        ],
        children: [
          { _type: "span", _key: "bp2-b5-s1", text: "The best advice I can give is to communicate openly with your makeup artist. If you are leaning towards soft glam, read our detailed guide on ", marks: [] },
          { _type: "span", _key: "bp2-b5-s2", text: "what soft glam makeup actually is", marks: ["bp2-l1"] },
          { _type: "span", _key: "bp2-b5-s3", text: " or follow our ", marks: [] },
          { _type: "span", _key: "bp2-b5-s4", text: "step-by-step soft glam tutorial", marks: ["bp2-l2"] },
          { _type: "span", _key: "bp2-b5-s5", text: " to see the full process. Share reference photos, describe the venue and lighting, and be honest about your comfort level. There is no wrong choice, only the right one for you and your event.", marks: [] },
        ],
      },
      {
        _type: "block",
        _key: "bp2-fr",
        style: "normal",
        markDefs: [{ _type: "link", _key: "bp2-fr-l1", href: "/blog/owambe-makeup-guide-lagos" }],
        children: [
          { _type: "span", _key: "bp2-fr-s1", text: "Owambe season brings its own rules for getting your glam right — heavier hands, longer wear, and coordinating with a gele. I cover it in full in ", marks: [] },
          { _type: "span", _key: "bp2-fr-s2", text: "Owambe Makeup: The Complete Glam Guide for Lagos's Biggest Celebrations", marks: ["bp2-fr-l1"] },
          { _type: "span", _key: "bp2-fr-s3", text: ".", marks: [] },
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
        markDefs: [
          { _type: "link", _key: "bp3-il1", href: "/blog/how-to-make-makeup-last-all-day-lagos-heat" },
        ],
        children: [
          { _type: "span", _key: "bp3-b1-s1", text: "The secret to makeup that looks smooth, blends seamlessly, and ", marks: [] },
          { _type: "span", _key: "bp3-b1-s2", text: "lasts all day", marks: ["bp3-il1"] },
          { _type: "span", _key: "bp3-b1-s3", text: " is not just the products or the technique — it is the skin underneath. No matter how talented your makeup artist is, dry patches, excess oil, or dehydrated skin will affect how foundation sits and how long your look holds. Preparing your skin properly is the foundation of a flawless finish.", marks: [] },
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
        markDefs: [
          { _type: "link", _key: "bp3-il2", href: "/blog/complete-skin-prep-routine-for-flawless-makeup" },
        ],
        children: [
          { _type: "span", _key: "bp3-b3-s1", text: "Cleansing is equally important. Arrive at your session with a clean, product-free face. Avoid applying heavy creams, sunscreen with a white cast, or leftover makeup from the night before. A gentle cleanser removes impurities without stripping your skin, giving your artist a clean canvas to work with. If your artist applies primer, it will adhere much better to freshly cleansed skin. For the full step-by-step process, see our ", marks: [] },
          { _type: "span", _key: "bp3-b3-s2", text: "complete professional skin prep routine", marks: ["bp3-il2"] },
          { _type: "span", _key: "bp3-b3-s3", text: ".", marks: [] },
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
        markDefs: [
          { _type: "link", _key: "bp3-l1", href: "/blog/how-to-make-makeup-last-all-day-lagos-heat" },
          { _type: "link", _key: "bp3-l2", href: "/blog/how-early-should-you-book-your-bridal-makeup-artist" },
        ],
        children: [
          { _type: "span", _key: "bp3-b5-s1", text: "As a professional tip, I always begin every session with my own skin prep routine — gentle cleansing, toning, and a hydrating primer tailored to each client. Good prep is also the key to ", marks: [] },
          { _type: "span", _key: "bp3-b5-s2", text: "making your makeup last all day in Lagos heat", marks: ["bp3-l1"] },
          { _type: "span", _key: "bp3-b5-s3", text: ". The better your skin arrives, the better the result. Ready to book? Here is ", marks: [] },
          { _type: "span", _key: "bp3-b5-s4", text: "how early you should book your bridal makeup artist", marks: ["bp3-l2"] },
          { _type: "span", _key: "bp3-b5-s5", text: " so you do not miss out on your ideal date.", marks: [] },
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
      { _type: "block", _key: "bp4-b3", style: "normal", markDefs: [{ _type: "link", _key: "bp4-il1", href: "/blog/preparing-your-skin-before-makeup-application" }, { _type: "link", _key: "bp4-il2", href: "/blog/how-to-make-makeup-last-all-day-lagos-heat" }], children: [{ _type: "span", _key: "bp4-b3-s1", text: "At Temilola Makeup, bridal makeup starts from 120,000 naira. That includes a consultation on your look and outfit, full ", marks: [] }, { _type: "span", _key: "bp4-b3-s2", text: "skin prep and priming", marks: ["bp4-il1"] }, { _type: "span", _key: "bp4-b3-s3", text: ", professional bridal makeup application, and a ", marks: [] }, { _type: "span", _key: "bp4-b3-s4", text: "setting routine designed to last even in Lagos heat", marks: ["bp4-il2"] }, { _type: "span", _key: "bp4-b3-s5", text: " — from your first photo to your last dance.", marks: [] }] },
      { _type: "block", _key: "bp4-h2", style: "h2", markDefs: [], children: [{ _type: "span", _key: "bp4-h2-s1", text: "What Factors Affect the Price?", marks: [] }] },
      { _type: "block", _key: "bp4-b4", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bp4-b4-s1", text: "Several things can move your final quote up or down. The first is location — if you need a home service or venue visit, travel is factored in, especially for areas like Lekki, Ajah, or locations outside Lagos mainland. The second factor is the number of faces. If you want your bridesmaids, mother of the bride, or other members of the bridal party done, that adds to the total. Most artists charge per face.", marks: [] }] },
      { _type: "block", _key: "bp4-b5", style: "normal", markDefs: [{ _type: "link", _key: "bp4-il3", href: "/blog/what-is-soft-glam-makeup" }], children: [{ _type: "span", _key: "bp4-b5-s1", text: "The type of ceremony also matters. A white wedding look tends to be ", marks: [] }, { _type: "span", _key: "bp4-b5-s2", text: "softer and more romantic", marks: ["bp4-il3"] }, { _type: "span", _key: "bp4-b5-s3", text: ", while traditional wedding makeup — especially Yoruba or Igbo traditional — often involves bolder colours, heavier contour, and coordination with your aso-oke or coral. Some brides book both ceremonies on different days, which means two separate sessions.", marks: [] }] },
      { _type: "block", _key: "bp4-b6", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bp4-b6-s1", text: "Other factors include whether you want a trial session before the wedding day, the complexity of your desired look such as cut crease, heavy lash stacking, or special effects, and whether gele tying is included. A trial session is not mandatory, but I always recommend it — it lets us test the look, adjust for your skin type, and make sure you are 100 percent confident before the big day.", marks: [] }] },
      { _type: "block", _key: "bp4-h3", style: "h2", markDefs: [], children: [{ _type: "span", _key: "bp4-h3-s1", text: "What About Cheaper Options?", marks: [] }] },
      { _type: "block", _key: "bp4-b7", style: "normal", markDefs: [{ _type: "link", _key: "bp4-il4", href: "/blog/preparing-your-skin-before-makeup-application" }, { _type: "link", _key: "bp4-il5", href: "/blog/how-to-make-makeup-last-all-day-lagos-heat" }], children: [{ _type: "span", _key: "bp4-b7-s1", text: "You will find makeup artists in Lagos who charge as low as 30,000 to 50,000 naira for bridal makeup. Some of them do good work — but here is what you need to watch out for. At that price point, you are often getting limited products, ", marks: [] }, { _type: "span", _key: "bp4-b7-s2", text: "no skin prep", marks: ["bp4-il4"] }, { _type: "span", _key: "bp4-b7-s3", text: ", and ", marks: [] }, { _type: "span", _key: "bp4-b7-s4", text: "no guarantee of longevity", marks: ["bp4-il5"] }, { _type: "span", _key: "bp4-b7-s5", text: ". Wedding days are long, emotional, and sweaty. If your foundation starts breaking down by the reception, no amount of blotting paper will save it.", marks: [] }] },
      { _type: "block", _key: "bp4-b8", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bp4-b8-s1", text: "Professional bridal makeup is an investment in how you feel on one of the most important days of your life. The products used, the technique, the time spent on skin preparation — all of these determine whether your makeup lasts six hours or twelve. When you are choosing an artist, do not just compare prices — compare portfolios, read reviews, and ask about their process.", marks: [] }] },
      { _type: "block", _key: "bp4-h4", style: "h2", markDefs: [], children: [{ _type: "span", _key: "bp4-h4-s1", text: "How to Budget Smart for Your Wedding Makeup", marks: [] }] },
      { _type: "block", _key: "bp4-b9", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bp4-b9-s1", text: "My advice to every bride is this: allocate 10 to 15 percent of your total wedding budget to hair and makeup. Start your search three to six months before your date, especially if your wedding falls during peak season which is November through January in Lagos. Book early, secure your date with a deposit, and schedule your trial at least two weeks before the wedding.", marks: [] }] },
      { _type: "block", _key: "bp4-b10", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bp4-b10-s1", text: "If budget is tight, consider having only yourself done professionally and letting your girls handle their own makeup. Or ask your artist about group discounts — at Temilola Makeup, we offer special rates for bridal party packages that cover multiple faces.", marks: [] }] },
      { _type: "block", _key: "bp4-h5", style: "h2", markDefs: [], children: [{ _type: "span", _key: "bp4-h5-s1", text: "Ready to Get Your Custom Quote?", marks: [] }] },
      { _type: "block", _key: "bp4-b11", style: "normal", markDefs: [{ _type: "link", _key: "bp4-l1", href: "/blog/how-early-should-you-book-your-bridal-makeup-artist" }, { _type: "link", _key: "bp4-l2", href: "/blog/what-is-soft-glam-makeup" }], children: [{ _type: "span", _key: "bp4-b11-s1", text: "Every wedding is different, and I would rather give you an accurate quote than a one-size-fits-all number. Not sure when to start looking? Read about ", marks: [] }, { _type: "span", _key: "bp4-b11-s2", text: "how early you should book your bridal makeup artist", marks: ["bp4-l1"] }, { _type: "span", _key: "bp4-b11-s3", text: ". Interested in the most popular bridal look right now? Find out ", marks: [] }, { _type: "span", _key: "bp4-b11-s4", text: "why every Lagos bride is requesting soft glam", marks: ["bp4-l2"] }, { _type: "span", _key: "bp4-b11-s5", text: ". Send me a message with your wedding date, location, number of faces, and the style you are going for — I will get back to you within 24 hours.", marks: [] }] },
      { _type: "block", _key: "bp4-fr", style: "normal", markDefs: [{ _type: "link", _key: "bp4-fr-l1", href: "/blog/how-to-choose-a-makeup-artist-in-lagos" }], children: [{ _type: "span", _key: "bp4-fr-s1", text: "If you are still comparing artists before you commit to anyone, I put together a practical checklist in ", marks: [] }, { _type: "span", _key: "bp4-fr-s2", text: "How to Choose the Right Makeup Artist in Lagos", marks: ["bp4-fr-l1"] }, { _type: "span", _key: "bp4-fr-s3", text: " — portfolio red flags, the trial question, and how to actually compare quotes.", marks: [] }] },
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
      { _type: "block", _key: "bp5-b5", style: "normal", markDefs: [{ _type: "link", _key: "bp5-il1", href: "/blog/how-to-make-makeup-last-all-day-lagos-heat" }], children: [{ _type: "span", _key: "bp5-b5-s1", text: "Second, Lagos weather plays a role. We live in a hot, humid city. Heavy, full-coverage makeup can feel uncomfortable and can break down faster in the heat. Soft glam uses lighter layering techniques with strategic coverage only where you need it — so your skin can breathe while still looking flawless. When done with the right products and ", marks: [] }, { _type: "span", _key: "bp5-b5-s2", text: "setting techniques", marks: ["bp5-il1"] }, { _type: "span", _key: "bp5-b5-s3", text: ", it lasts just as long as bold glam.", marks: [] }] },
      { _type: "block", _key: "bp5-b6", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bp5-b6-s1", text: "Third, there is a cultural shift. Nigerian women are embracing their natural beauty more than ever. Clients are coming to me saying \"I want to look like myself, but elevated.\" That is literally the definition of soft glam.", marks: [] }] },
      { _type: "block", _key: "bp5-h3", style: "h2", markDefs: [], children: [{ _type: "span", _key: "bp5-h3-s1", text: "Soft Glam vs Bold Glam: What Is the Difference?", marks: [] }] },
      { _type: "block", _key: "bp5-b7", style: "normal", markDefs: [{ _type: "link", _key: "bp5-il2", href: "/blog/soft-glam-vs-bold-glam-choosing-your-event-look" }], children: [{ _type: "span", _key: "bp5-b7-s1", text: "", marks: [] }, { _type: "span", _key: "bp5-b7-s2", text: "Bold glam", marks: ["bp5-il2"] }, { _type: "span", _key: "bp5-b7-s3", text: " is definition and drama. Sculpted contour, deeper lip colours, more pigmented eyeshadow, full lashes, and a look that commands attention. This is the choice for parties, red carpet events, milestone birthdays, and any occasion where flash photography and dramatic lighting are involved.", marks: [] }] },
      { _type: "block", _key: "bp5-b8", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bp5-b8-s1", text: "Soft glam reads powerfully on camera and flatters beautifully in natural light. But indoor events with overhead lights, flash photography, or coloured stage lighting can flatten soft makeup and make it appear like you are wearing very little. If your event is indoors with heavy photography, bold glam often translates better in the final images — even if it feels slightly more dramatic in person.", marks: [] }] },
      { _type: "block", _key: "bp5-h4", style: "h2", markDefs: [], children: [{ _type: "span", _key: "bp5-h4-s1", text: "Who Does Soft Glam Work Best For?", marks: [] }] },
      { _type: "block", _key: "bp5-b10", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bp5-b10-s1", text: "Honestly? Everyone. But it is especially popular with brides who want timeless wedding photos that will not look dated in ten years, event guests who want to look polished without looking like they are trying too hard, professionals attending corporate events or brand launches, and anyone who values skin-first makeup where the focus is on a healthy glow rather than heavy coverage.", marks: [] }] },
      { _type: "block", _key: "bp5-h5", style: "h2", markDefs: [], children: [{ _type: "span", _key: "bp5-h5-s1", text: "How to Book Your Soft Glam Session", marks: [] }] },
      { _type: "block", _key: "bp5-b12", style: "normal", markDefs: [{ _type: "link", _key: "bp5-l1", href: "/blog/soft-glam-makeup-tutorial-step-by-step" }, { _type: "link", _key: "bp5-l2", href: "/blog/soft-glam-vs-bold-glam-choosing-your-event-look" }], children: [{ _type: "span", _key: "bp5-b12-s1", text: "Want to try it yourself? Follow our ", marks: [] }, { _type: "span", _key: "bp5-b12-s2", text: "step-by-step soft glam makeup tutorial", marks: ["bp5-l1"] }, { _type: "span", _key: "bp5-b12-s3", text: " for the full breakdown. Still deciding between soft and bold? Our guide on ", marks: [] }, { _type: "span", _key: "bp5-b12-s4", text: "soft glam vs bold glam", marks: ["bp5-l2"] }, { _type: "span", _key: "bp5-b12-s5", text: " will help you choose. Or if you want it done professionally, soft glam is one of my signature services at Temilola Makeup — send me a message with your event date and details.", marks: [] }] },
    ],
  },
  {
    _id: "blog-post-6",
    _type: "blogPost",
    title: "Soft Glam Makeup Tutorial: A Step-by-Step Guide for Beginners",
    slug: { _type: "slug", current: "soft-glam-makeup-tutorial-step-by-step" },
    excerpt:
      "Learn exactly how to achieve a soft glam makeup look from start to finish — the products, techniques, and pro tips that make this the most flattering everyday glam.",
    category: "Tutorials",
    author: "Temilola",
    publishedAt: "2026-06-21T10:00:00Z",
    order: 6,
    body: [
      { _type: "block", _key: "bp6-b1", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bp6-b1-s1", text: "Soft glam is one of the most requested makeup looks I get asked about — and for good reason. It is that perfect sweet spot between natural and full glam where you look polished, radiant, and unmistakably you. Whether you are headed to a date night, a birthday dinner, or you just want to elevate your everyday look, soft glam is the answer.", marks: [] }] },
      { _type: "block", _key: "bp6-b2", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bp6-b2-s1", text: "In this guide, I am breaking down every single step — from skin prep to setting spray — so you can recreate this look at home with confidence.", marks: [] }] },

      { _type: "block", _key: "bp6-h1", style: "h2", markDefs: [], children: [{ _type: "span", _key: "bp6-h1-s1", text: "Step 1: Prep Your Skin (This Is Non-Negotiable)", marks: [] }] },
      { _type: "block", _key: "bp6-b3", style: "normal", markDefs: [{ _type: "link", _key: "bp6-il1", href: "/blog/preparing-your-skin-before-makeup-application" }], children: [{ _type: "span", _key: "bp6-b3-s1", text: "No matter your skin type — oily, dry, or combination — you need to ", marks: [] }, { _type: "span", _key: "bp6-b3-s2", text: "moisturize and prep your skin", marks: ["bp6-il1"] }, { _type: "span", _key: "bp6-b3-s3", text: " before applying any makeup. If your skin is on the drier side, overcompensate with hydration. Use a glow serum or hydrating moisturizer and let it sink in for at least 10 minutes before moving to primer. This waiting time is crucial because if you rush it, your foundation can separate or peel.", marks: [] }] },
      { _type: "block", _key: "bp6-b4", style: "normal", markDefs: [{ _type: "link", _key: "bp6-il4", href: "/blog/complete-skin-prep-routine-for-flawless-makeup" }], children: [{ _type: "span", _key: "bp6-b4-s1", text: "Next, apply an illuminating primer all over your face. If you have oily skin, focus the primer on your T-zone and eyelids — this prevents your eyeshadow from creasing and helps your makeup last all day. An illuminating primer gives soft glam that beautiful lit-from-within glow, but if you prefer a more matte finish, a mattifying primer works too. The key is letting each layer absorb before adding the next. For the full breakdown of primers and priming techniques, see our ", marks: [] }, { _type: "span", _key: "bp6-b4-s2", text: "complete skin prep routine guide", marks: ["bp6-il4"] }, { _type: "span", _key: "bp6-b4-s3", text: ".", marks: [] }] },

      { _type: "block", _key: "bp6-h2", style: "h2", markDefs: [], children: [{ _type: "span", _key: "bp6-h2-s1", text: "Step 2: Foundation — Less Is More", marks: [] }] },
      { _type: "block", _key: "bp6-b5", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bp6-b5-s1", text: "For soft glam, choose a foundation that gives a satin or dewy finish with medium, buildable coverage. You do not need full coverage for this look — the goal is skin that looks like skin, just perfected. Apply a small amount with a brush first to control how much product goes on your face, then blend out with a damp beauty sponge by tapping gently. The sponge diffuses the product so it melts into your skin rather than sitting on top.", marks: [] }] },
      { _type: "block", _key: "bp6-b6", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bp6-b6-s1", text: "A lightweight, hydrating foundation will give you that gorgeous glow that soft glam is known for. If you find that your foundation looks cakey, you are probably using too much product. Start with a tiny amount — you can always build up. After blending one side, compare it to the bare side and you will see the beautiful difference even a thin layer makes.", marks: [] }] },

      { _type: "block", _key: "bp6-h3", style: "h2", markDefs: [], children: [{ _type: "span", _key: "bp6-h3-s1", text: "Step 3: Concealer — Layer Strategically", marks: [] }] },
      { _type: "block", _key: "bp6-b7", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bp6-b7-s1", text: "Here is a pro tip most beginners miss: do not go straight in with a super bright concealer. If you have dark circles, start with a concealer that matches your skin tone or is just one shade lighter to neutralize the darkness first. Then layer a brighter concealer on top for that lifted, brightened effect. Going too bright too fast means the shadow underneath will seep through.", marks: [] }] },
      { _type: "block", _key: "bp6-b8", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bp6-b8-s1", text: "Apply concealer under your eyes, on your forehead, down the bridge of your nose, on your upper lip, and your chin. Blend with a brush first for more coverage, then go over it with a damp beauty sponge to pat everything down smoothly. One important tip — blend out the edges of your under-eye concealer immediately, but leave the centre to set slightly before blending. This prevents harsh lines and gives you a seamless finish.", marks: [] }] },

      { _type: "block", _key: "bp6-h4", style: "h2", markDefs: [], children: [{ _type: "span", _key: "bp6-h4-s1", text: "Step 4: Contour and Blush", marks: [] }] },
      { _type: "block", _key: "bp6-b9", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bp6-b9-s1", text: "For soft glam, keep your contour subtle. Apply a cream or liquid contour on your cheekbones and temples, then blend well. You are not going for a sculpted, carved-out look — just gentle definition that adds dimension to your face. Use a contour brush to place the product, then blend with your beauty sponge.", marks: [] }] },
      { _type: "block", _key: "bp6-b10", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bp6-b10-s1", text: "Now for blush — and this is where soft glam really comes alive. For women of colour, an orange-toned blush does something magical to our skin. Apply a cream blush on the apples of your cheeks and blend upward. Here is a trick I love: layer a second cream blush on top of the first one. It gives your cheeks that effortless, lit-from-within glow without needing a separate highlighter.", marks: [] }] },

      { _type: "block", _key: "bp6-h5", style: "h2", markDefs: [], children: [{ _type: "span", _key: "bp6-h5-s1", text: "Step 5: Set Your Face Properly", marks: [] }] },
      { _type: "block", _key: "bp6-b11", style: "normal", markDefs: [{ _type: "link", _key: "bp6-il2", href: "/blog/how-to-make-makeup-last-all-day-lagos-heat" }], children: [{ _type: "span", _key: "bp6-b11-s1", text: "", marks: [] }, { _type: "span", _key: "bp6-b11-s2", text: "Setting is what separates makeup that melts in two hours from makeup that lasts all day", marks: ["bp6-il2"] }, { _type: "span", _key: "bp6-b11-s3", text: ". Take a thin, even layer of setting powder and press it into your skin — do not sweep or swirl. Focus on your T-zone if you are oily, and set your under-eye area immediately after blending your concealer. This is the number one way to prevent creasing.", marks: [] }] },
      { _type: "block", _key: "bp6-b12", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bp6-b12-s1", text: "If you want extra longevity under the eyes, bake with a slightly thicker layer and let it sit while you do the rest of your face. When you dust it off later, the result is a smooth, crease-free, brightened under-eye. For the rest of your face, use a finishing powder to blend everything together — this is what takes your face from looking powdery to looking polished.", marks: [] }] },

      { _type: "block", _key: "bp6-h6", style: "h2", markDefs: [], children: [{ _type: "span", _key: "bp6-h6-s1", text: "Step 6: Soft, Warm Eyes", marks: [] }] },
      { _type: "block", _key: "bp6-b13", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bp6-b13-s1", text: "Since this is soft glam, the eyes should be warm, blended, and understated. Start with a warm brown transition shade in your crease using a fluffy blending brush — circular motions are your best friend here. Then add a slightly deeper brown to your outer corner for depth, but do not bring it as high as the transition shade.", marks: [] }] },
      { _type: "block", _key: "bp6-b14", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bp6-b14-s1", text: "Pack a shimmer or satin shade onto your lid with a flat brush — a champagne, rose gold, or soft pink works beautifully. Add a touch of shimmer to your inner corners for that doe-eyed brightness. For the lower lash line, sweep a bit of the transition shade underneath to tie everything together. If you want a wing, keep it thin and subtle — nothing dramatic.", marks: [] }] },

      { _type: "block", _key: "bp6-h7", style: "h2", markDefs: [], children: [{ _type: "span", _key: "bp6-h7-s1", text: "Step 7: Lashes and Brows", marks: [] }] },
      { _type: "block", _key: "bp6-b15", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bp6-b15-s1", text: "Curl your natural lashes and apply a lengthening mascara. For soft glam, you can add half lashes or small clusters at the outer corners to create a subtle cat-eye effect without looking over the top. Apply mascara to your bottom lashes too — it frames the eye beautifully.", marks: [] }] },
      { _type: "block", _key: "bp6-b16", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bp6-b16-s1", text: "For brows, keep them natural and groomed. Use a fine-tipped brow pencil to fill in sparse areas with light, hair-like strokes. Set them with a brow gel to keep everything in place. The goal is polished but not drawn-on — your brows should frame your face, not dominate it.", marks: [] }] },

      { _type: "block", _key: "bp6-h8", style: "h2", markDefs: [], children: [{ _type: "span", _key: "bp6-h8-s1", text: "Step 8: The Perfect Soft Glam Lip", marks: [] }] },
      { _type: "block", _key: "bp6-b17", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bp6-b17-s1", text: "Line your lips with a brown or nude lip pencil — make sure your lips are dry before you apply liner so it grips properly. Fill in with a nude or rosy lipstick, focusing colour in the centre for a soft gradient effect. Top everything off with a clear or sheer pink lip gloss. The combination of liner, lipstick, and gloss gives you that plump, polished lip that is quintessentially soft glam.", marks: [] }] },

      { _type: "block", _key: "bp6-h9", style: "h2", markDefs: [], children: [{ _type: "span", _key: "bp6-h9-s1", text: "Step 9: Set and Seal Everything", marks: [] }] },
      { _type: "block", _key: "bp6-b18", style: "normal", markDefs: [{ _type: "link", _key: "bp6-il3", href: "/blog/how-to-make-makeup-last-all-day-lagos-heat" }], children: [{ _type: "span", _key: "bp6-b18-s1", text: "Here is a detail most tutorials skip: ", marks: [] }, { _type: "span", _key: "bp6-b18-s2", text: "fixing spray and setting spray are two different products", marks: ["bp6-il3"] }, { _type: "span", _key: "bp6-b18-s3", text: ". A fixing spray locks your makeup in place. A setting spray gives your finish a dewy or matte quality. Use your fixing spray first, then follow with a setting spray for the finish you want. For a soft glam look, I recommend a matte fixing spray on your centre and a dewy setting spray on the sides of your face — this gives you that gorgeous glow peeking through on the cheeks while keeping everything locked down.", marks: [] }] },

      { _type: "block", _key: "bp6-h10", style: "h2", markDefs: [], children: [{ _type: "span", _key: "bp6-h10-s1", text: "Want This Look Done Professionally?", marks: [] }] },
      { _type: "block", _key: "bp6-b19", style: "normal", markDefs: [{ _type: "link", _key: "bp6-l1", href: "/blog/how-to-make-makeup-last-all-day-lagos-heat" }, { _type: "link", _key: "bp6-l2", href: "/blog/preparing-your-skin-before-makeup-application" }], children: [{ _type: "span", _key: "bp6-b19-s1", text: "Want your soft glam to last all day? Read our pro tips on ", marks: [] }, { _type: "span", _key: "bp6-b19-s2", text: "how to make your makeup last in Lagos heat", marks: ["bp6-l1"] }, { _type: "span", _key: "bp6-b19-s3", text: ". And for the best results, make sure you ", marks: [] }, { _type: "span", _key: "bp6-b19-s4", text: "prepare your skin properly before application", marks: ["bp6-l2"] }, { _type: "span", _key: "bp6-b19-s5", text: ". Soft glam is one of my most-booked services at Temilola Makeup — home service available across Lagos. Send me a message to check availability for your date.", marks: [] }] },
    ],
  },
  {
    _id: "blog-post-7",
    _type: "blogPost",
    title: "How to Make Your Makeup Last All Day in Lagos Heat (Pro Setting Tips)",
    slug: { _type: "slug", current: "how-to-make-makeup-last-all-day-lagos-heat" },
    excerpt:
      "Your makeup melting by midday? These professional setting and prep techniques will keep your face flawless from morning to midnight — even in Lagos humidity.",
    category: "Beauty Education",
    author: "Temilola",
    publishedAt: "2026-06-21T14:00:00Z",
    order: 7,
    body: [
      { _type: "block", _key: "bp7-b1", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bp7-b1-s1", text: "If you live in Lagos, you know the struggle. You spend an hour perfecting your makeup, step outside, and within two hours your foundation is sliding, your concealer is creasing, and your setting powder has basically evaporated. It does not have to be this way. The difference between makeup that melts and makeup that lasts twelve hours comes down to technique — specifically, how you prep, layer, and set.", marks: [] }] },
      { _type: "block", _key: "bp7-b2", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bp7-b2-s1", text: "Here are the exact professional techniques I use on my clients to make sure their makeup survives Lagos heat, humidity, tears, and long event days.", marks: [] }] },

      { _type: "block", _key: "bp7-h1", style: "h2", markDefs: [], children: [{ _type: "span", _key: "bp7-h1-s1", text: "Start With Skincare — But Wait Before You Prime", marks: [] }] },
      { _type: "block", _key: "bp7-b3", style: "normal", markDefs: [{ _type: "link", _key: "bp7-il1", href: "/blog/preparing-your-skin-before-makeup-application" }], children: [{ _type: "span", _key: "bp7-b3-s1", text: "Every long-lasting makeup application starts with ", marks: [] }, { _type: "span", _key: "bp7-b3-s2", text: "skincare, not foundation", marks: ["bp7-il1"] }, { _type: "span", _key: "bp7-b3-s3", text: ". Moisturize your face even if you have oily skin — oily skin that is dehydrated actually produces more oil to compensate. Apply a lightweight moisturizer or glow serum, then wait at least 10 minutes before applying primer. This is the step most people skip, and it is the reason their primer pills up or their foundation separates later in the day.", marks: [] }] },
      { _type: "block", _key: "bp7-b4", style: "normal", markDefs: [{ _type: "link", _key: "bp7-il4", href: "/blog/complete-skin-prep-routine-for-flawless-makeup" }], children: [{ _type: "span", _key: "bp7-b4-s1", text: "Your skincare and primer also need to be compatible. If your moisturizer is water-based and your primer is silicone-based, they can conflict and cause pilling. Check your product ingredients and keep them in the same family. When in doubt, use a primer from the same brand as your foundation — they are usually formulated to work together. For the full layering order, see our ", marks: [] }, { _type: "span", _key: "bp7-b4-s2", text: "complete skin prep routine guide", marks: ["bp7-il4"] }, { _type: "span", _key: "bp7-b4-s3", text: ".", marks: [] }] },

      { _type: "block", _key: "bp7-h2", style: "h2", markDefs: [], children: [{ _type: "span", _key: "bp7-h2-s1", text: "Prime Your Eyelids Separately", marks: [] }] },
      { _type: "block", _key: "bp7-b5", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bp7-b5-s1", text: "This is something a lot of people overlook. Your eyelids produce oil throughout the day, which is why your eyeshadow creases and disappears by afternoon. Apply primer to your eyelids specifically — even if you are not wearing eyeshadow. If you have oily lids, a mattifying primer on this area alone will make a noticeable difference in how long your eye makeup holds.", marks: [] }] },

      { _type: "block", _key: "bp7-h3", style: "h2", markDefs: [], children: [{ _type: "span", _key: "bp7-h3-s1", text: "Use Foundation Strategically — Not Everywhere", marks: [] }] },
      { _type: "block", _key: "bp7-b6", style: "normal", markDefs: [{ _type: "link", _key: "bp7-il2", href: "/blog/soft-glam-makeup-tutorial-step-by-step" }], children: [{ _type: "span", _key: "bp7-b6-s1", text: "In Lagos heat, ", marks: [] }, { _type: "span", _key: "bp7-b6-s2", text: "less foundation means longer wear", marks: ["bp7-il2"] }, { _type: "span", _key: "bp7-b6-s3", text: ". Instead of covering your entire face in a thick layer, apply a thin layer all over and then spot-conceal only where you need it — hyperpigmentation, dark circles, blemishes. A foundation that is too heavy will slide off faster because there is simply more product for the heat and humidity to break down.", marks: [] }] },
      { _type: "block", _key: "bp7-b7", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bp7-b7-s1", text: "Choose a long-wearing, satin-finish foundation over a dewy one if longevity is your priority. Dewy foundations look beautiful but can feel and look oily in humid conditions. A satin finish gives you glow without the slip. Apply with a brush first to control the amount, then blend with a damp sponge by tapping — never dragging.", marks: [] }] },

      { _type: "block", _key: "bp7-h4", style: "h2", markDefs: [], children: [{ _type: "span", _key: "bp7-h4-s1", text: "The Concealer Setting Rule You Must Follow", marks: [] }] },
      { _type: "block", _key: "bp7-b8", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bp7-b8-s1", text: "This is the single most important tip for preventing under-eye creasing: set your concealer immediately after blending. Not five minutes later, not after you finish your brows — immediately. If you are using two shades of concealer (one to neutralize, one to brighten), set right after applying the second shade. The longer concealer sits unset, the more it moves into your fine lines and creases.", marks: [] }] },
      { _type: "block", _key: "bp7-b9", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bp7-b9-s1", text: "Use a powder puff to press setting powder into your under-eye area — do not use a brush for this step, as a puff gives you more precision and deposits more product exactly where you need it. Take a thin, even layer of powder, press it in, and then use a small brush to blend away any excess. This creates a crease-proof barrier that holds all day.", marks: [] }] },

      { _type: "block", _key: "bp7-h5", style: "h2", markDefs: [], children: [{ _type: "span", _key: "bp7-h5-s1", text: "The T-Zone Strategy for Oily Skin", marks: [] }] },
      { _type: "block", _key: "bp7-b10", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bp7-b10-s1", text: "If you get oily — and in Lagos, most of us do — focus your setting powder on your T-zone: forehead, nose, and chin. These areas produce the most oil and are where your makeup breaks down first. Set these areas with a slightly heavier hand than the rest of your face. For the cheeks, use a lighter touch so you maintain that healthy glow rather than looking flat and matte all over.", marks: [] }] },

      { _type: "block", _key: "bp7-h6", style: "h2", markDefs: [], children: [{ _type: "span", _key: "bp7-h6-s1", text: "Powder Contour on Top of Cream — The Double Lock", marks: [] }] },
      { _type: "block", _key: "bp7-b11", style: "normal", markDefs: [{ _type: "link", _key: "bp7-il3", href: "/blog/soft-glam-makeup-tutorial-step-by-step" }], children: [{ _type: "span", _key: "bp7-b11-s1", text: "If you ", marks: [] }, { _type: "span", _key: "bp7-b11-s2", text: "contour with cream", marks: ["bp7-il3"] }, { _type: "span", _key: "bp7-b11-s3", text: " (which gives a more natural finish), set it by going over the same areas with a powder bronzer. This locks the cream contour in place so it does not shift or fade in the heat. Use a light hand — the bronzer is not adding more colour, it is sealing what is already there. The same principle applies to cream blush: layer a powder blush in the same shade family on top for double the staying power.", marks: [] }] },

      { _type: "block", _key: "bp7-h7", style: "h2", markDefs: [], children: [{ _type: "span", _key: "bp7-h7-s1", text: "Fixing Spray vs Setting Spray — You Need Both", marks: [] }] },
      { _type: "block", _key: "bp7-b12", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bp7-b12-s1", text: "Most people use one spray and call it a day. But fixing spray and setting spray do different jobs. A fixing spray contains polymers that physically lock your makeup in place — this is the one that prevents transfer and smudging. A setting spray controls the finish — matte, dewy, or natural — and helps melt all your powder layers together so they look like skin.", marks: [] }] },
      { _type: "block", _key: "bp7-b13", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bp7-b13-s1", text: "Apply your fixing spray first, then your setting spray. For Lagos heat, I recommend a matte or semi-matte fixing spray for your T-zone and centre of the face, and a dewy setting spray on the sides for a natural, healthy-looking finish. Always test your spray before misting your face — shake the bottle and spray once into the air to clear any initial blast.", marks: [] }] },

      { _type: "block", _key: "bp7-h8", style: "h2", markDefs: [], children: [{ _type: "span", _key: "bp7-h8-s1", text: "Bonus: The Applicators Matter More Than You Think", marks: [] }] },
      { _type: "block", _key: "bp7-b14", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bp7-b14-s1", text: "Your brushes, sponges, and powder puffs directly affect how your makeup applies and how long it lasts. Use a soft, bouncy sponge that does not absorb too much product. Use a powder puff for under-eye setting rather than a brush. Use a fluffy brush for bronzer so you do not pick up too much product. The right tools give you control — and control is what makes makeup last.", marks: [] }] },

      { _type: "block", _key: "bp7-h9", style: "h2", markDefs: [], children: [{ _type: "span", _key: "bp7-h9-s1", text: "Need Heat-Proof Makeup for Your Event?", marks: [] }] },
      { _type: "block", _key: "bp7-b15", style: "normal", markDefs: [{ _type: "link", _key: "bp7-l1", href: "/blog/soft-glam-makeup-tutorial-step-by-step" }, { _type: "link", _key: "bp7-l2", href: "/blog/preparing-your-skin-before-makeup-application" }], children: [{ _type: "span", _key: "bp7-b15-s1", text: "Now that you know the setting secrets, try putting them into practice with our ", marks: [] }, { _type: "span", _key: "bp7-b15-s2", text: "soft glam makeup tutorial", marks: ["bp7-l1"] }, { _type: "span", _key: "bp7-b15-s3", text: ". And remember — longevity starts the night before. Read our guide on ", marks: [] }, { _type: "span", _key: "bp7-b15-s4", text: "preparing your skin before makeup application", marks: ["bp7-l2"] }, { _type: "span", _key: "bp7-b15-s5", text: " for the full prep routine. Every look I create at Temilola Makeup is designed to last 10 to 12 hours — book your session and let me take the worry out of your glam.", marks: [] }] },
    ],
  },
  {
    _id: "blog-post-8",
    _type: "blogPost",
    title: "The Complete Skin Prep Routine for Flawless Makeup (Professional MUA Guide)",
    slug: { _type: "slug", current: "complete-skin-prep-routine-for-flawless-makeup" },
    excerpt:
      "A professional makeup artist's step-by-step skin prep routine — from micellar water to setting spray — that guarantees your foundation sits beautifully and lasts all day.",
    category: "Tutorials",
    author: "Temilola",
    publishedAt: "2026-06-22T10:00:00Z",
    order: 8,
    body: [
      { _type: "block", _key: "bp8-b1", style: "normal", markDefs: [{ _type: "link", _key: "bp8-il1", href: "/blog/preparing-your-skin-before-makeup-application" }], children: [{ _type: "span", _key: "bp8-b1-s1", text: "If there is one thing I tell every client and every aspiring makeup artist, it is this: your makeup is only as good as the skin underneath it. You can own the most expensive foundation in the world, but if your ", marks: [] }, { _type: "span", _key: "bp8-b1-s2", text: "skin is not properly prepared", marks: ["bp8-il1"] }, { _type: "span", _key: "bp8-b1-s3", text: ", that foundation will separate, crack, or slide off within hours. A solid skin prep routine is not optional — it is the foundation of every flawless face I create.", marks: [] }] },
      { _type: "block", _key: "bp8-b2", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bp8-b2-s1", text: "In this guide, I am walking you through my complete professional skin prep routine — the exact steps I follow for bridal clients, event glam, and editorial work. Whether you are a makeup artist building your process or someone who wants their personal makeup to look more professional, these steps will transform your results.", marks: [] }] },

      { _type: "block", _key: "bp8-h1", style: "h2", markDefs: [], children: [{ _type: "span", _key: "bp8-h1-s1", text: "Step 1: Clean Hands First — Always", marks: [] }] },
      { _type: "block", _key: "bp8-b3", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bp8-b3-s1", text: "Before you touch a client's face — or your own — wash your hands thoroughly. This sounds basic, but it is a step many people skip. Your hands carry bacteria, oils, and invisible dirt that transfers directly onto the skin. If you are cleaning someone's face but your hands are not clean, you are just moving dirt around. Start every session with clean, sanitised hands.", marks: [] }] },

      { _type: "block", _key: "bp8-h2", style: "h2", markDefs: [], children: [{ _type: "span", _key: "bp8-h2-s1", text: "Step 2: Cleanse With Micellar Water", marks: [] }] },
      { _type: "block", _key: "bp8-b4", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bp8-b4-s1", text: "Even if your client has just stepped out of the shower, cleanse their face with micellar water on a cotton pad. This is non-negotiable. You would be surprised how much hidden dirt, sweat, and residue remains on the skin even after washing. A micellar water is gentle enough for all skin types — including sensitive skin — and removes impurities without stripping moisture. Wipe the entire face, including the neck and behind the ears, until the cotton pad comes away clean.", marks: [] }] },
      { _type: "block", _key: "bp8-b5", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bp8-b5-s1", text: "After cleansing, let the face dry completely. Do not rush this step. Use a fan to speed up drying if needed — I always keep a portable fan at my station. Applying products to a damp face changes how they absorb and can cause pilling later.", marks: [] }] },

      { _type: "block", _key: "bp8-h3", style: "h2", markDefs: [], children: [{ _type: "span", _key: "bp8-h3-s1", text: "Step 3: Tone the Skin", marks: [] }] },
      { _type: "block", _key: "bp8-b6", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bp8-b6-s1", text: "Apply toner with a cotton pad to balance the skin's pH level and remove any remaining impurities the micellar water missed. Toner also helps prepare the skin to absorb the products that follow — think of it as opening the door for your serums and moisturisers.", marks: [] }] },
      { _type: "block", _key: "bp8-b7", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bp8-b7-s1", text: "Here is a key tip for dry skin: do not apply toner all over the face. Focus it on the T-zone only — forehead, nose, and chin. Toner can close pores and reduce oil production, which is helpful on oily areas but counterproductive on dry cheeks that need all the moisture they can get. For oily or combination skin, you can apply toner across the entire face.", marks: [] }] },

      { _type: "block", _key: "bp8-h4", style: "h2", markDefs: [], children: [{ _type: "span", _key: "bp8-h4-s1", text: "Step 4: Apply a Hydrating Serum", marks: [] }] },
      { _type: "block", _key: "bp8-b8", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bp8-b8-s1", text: "This is the step that separates a basic prep from a professional one. Before your moisturiser, apply a hydrating serum — something with hyaluronic acid, niacinamide, or vitamin C works beautifully. The rule is always serum before moisturiser, because serums have smaller molecules that penetrate deeper into the skin. They improve moisture retention so your skin stays hydrated longer under makeup.", marks: [] }] },
      { _type: "block", _key: "bp8-b9", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bp8-b9-s1", text: "Apply the serum generously and take your time blending it into the skin. Use your fingertips in gentle pressing motions — do not drag or rub. Allow it to absorb fully before moving to the next step. I use a fan here again to help the product sink in without evaporating.", marks: [] }] },

      { _type: "block", _key: "bp8-h5", style: "h2", markDefs: [], children: [{ _type: "span", _key: "bp8-h5-s1", text: "Step 5: Moisturise Generously (Especially for Dry Skin)", marks: [] }] },
      { _type: "block", _key: "bp8-b10", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bp8-b10-s1", text: "Now apply your moisturiser. For dry skin, be generous — dry skin needs all the hydration it can get. Do not be afraid to apply a full, even layer. For oily skin, use a lightweight gel-based moisturiser instead of a heavy cream. The key is matching the moisturiser to the skin type: rich for dry, light for oily, balanced for combination.", marks: [] }] },
      { _type: "block", _key: "bp8-b11", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bp8-b11-s1", text: "Here is where most people go wrong: they apply moisturiser and immediately reach for the primer. Do not do this. Take your time blending the moisturiser into every part of the face, especially under the eyes — this area is the thinnest skin on the face and creases easily if it is not properly hydrated. Use a brush or your ring finger in gentle circular motions. If the moisturiser is not blended properly, it will mix with your foundation later and cause separation. Wait for it to absorb completely.", marks: [] }] },
      { _type: "block", _key: "bp8-b12", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bp8-b12-s1", text: "For very dry skin, I sometimes layer two moisturisers — a hydrating one first, then a nourishing one on top. This creates a moisture barrier that keeps the skin comfortable under makeup for hours. Do not forget your lips either. Apply a hydrating lip balm at this stage so it has time to absorb before you apply lip products later.", marks: [] }] },

      { _type: "block", _key: "bp8-h6", style: "h2", markDefs: [], children: [{ _type: "span", _key: "bp8-h6-s1", text: "Step 6: Sweat Control (Essential for Lagos)", marks: [] }] },
      { _type: "block", _key: "bp8-b13", style: "normal", markDefs: [{ _type: "link", _key: "bp8-il2", href: "/blog/how-to-make-makeup-last-all-day-lagos-heat" }], children: [{ _type: "span", _key: "bp8-b13-s1", text: "If you live in Lagos — or anywhere hot and humid — a sweat block is a game changer for ", marks: [] }, { _type: "span", _key: "bp8-b13-s2", text: "making your makeup last all day", marks: ["bp8-il2"] }, { _type: "span", _key: "bp8-b13-s3", text: ". Apply it only to the areas where you sweat most: typically the forehead, nose, upper lip, and temples. Do not apply it all over — just the specific zones that tend to get oily or sweaty during the day.", marks: [] }] },
      { _type: "block", _key: "bp8-b14", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bp8-b14-s1", text: "Use a cotton pad to press the sweat block into the skin. Let it dry completely before moving to primer. This creates an invisible shield that holds your makeup in place even when the heat is working against you.", marks: [] }] },

      { _type: "block", _key: "bp8-h7", style: "h2", markDefs: [], children: [{ _type: "span", _key: "bp8-h7-s1", text: "Step 7: Prime Strategically", marks: [] }] },
      { _type: "block", _key: "bp8-b15", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bp8-b15-s1", text: "Primer is not one-size-fits-all, and you should not necessarily use the same primer on every part of the face. A grip primer goes on the cheeks, chin, and forehead to help your foundation adhere. A mattifying primer goes on the T-zone to control oil and shine throughout the day. For dry skin, use a hydrating primer all over — you do not want to mattify skin that is already lacking moisture.", marks: [] }] },
      { _type: "block", _key: "bp8-b16", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bp8-b16-s1", text: "Apply primer with a brush for even distribution and blend it into every part of the face except the under-eye area if you are using a grip or mattifying formula there. The under-eye area is delicate and benefits more from the moisturiser and serum you have already applied. For oily skin, focus the mattifying primer on the T-zone and use a lighter touch everywhere else.", marks: [] }] },
      { _type: "block", _key: "bp8-b17", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bp8-b17-s1", text: "A crucial rule I follow for bridal work: do not over-mattify. Even if the skin is oily, mattifying the entire face can make the makeup look flat and lifeless. I only mattify the T-zone unless the skin is extremely oily. You want the cheeks and perimeter of the face to retain some luminosity — that is what makes the makeup look alive and healthy in photos.", marks: [] }] },

      { _type: "block", _key: "bp8-h8", style: "h2", markDefs: [], children: [{ _type: "span", _key: "bp8-h8-s1", text: "Step 8: Lock Everything In With a Hydrating Spray", marks: [] }] },
      { _type: "block", _key: "bp8-b18", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bp8-b18-s1", text: "Before you touch any foundation, seal your entire prep with a hydrating setting spray. This locks all the layers together — serum, moisturiser, primer — and creates a smooth, unified base for your foundation to glide onto. A hydrating spray also adds a final layer of moisture that gives the skin that dewy, prepped look professionals are known for.", marks: [] }] },
      { _type: "block", _key: "bp8-b19", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bp8-b19-s1", text: "Wait for the spray to dry completely before applying foundation. When it is fully set, you will see the skin looking dewy, healthy, and ready to receive makeup. This is exactly the base you want — hydrated, primed, and sealed. Your foundation will sit beautifully, blend effortlessly, and last significantly longer.", marks: [] }] },

      { _type: "block", _key: "bp8-h9", style: "h2", markDefs: [], children: [{ _type: "span", _key: "bp8-h9-s1", text: "The Golden Rule: Let Each Layer Dry", marks: [] }] },
      { _type: "block", _key: "bp8-b20", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bp8-b20-s1", text: "If there is one takeaway from this entire guide, it is this: let every single product absorb before applying the next one. Micellar water — wait. Toner — wait. Serum — wait. Moisturiser — wait. Primer — wait. Rushing through these steps is the number one reason makeup separates, pills, or breaks down prematurely. Each layer needs time to bond with the skin before the next one goes on top. I keep a fan at every session specifically for this.", marks: [] }] },

      { _type: "block", _key: "bp8-h10", style: "h2", markDefs: [], children: [{ _type: "span", _key: "bp8-h10-s1", text: "Dry Skin vs Oily Skin: Adjusting Your Prep", marks: [] }] },
      { _type: "block", _key: "bp8-b21", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bp8-b21-s1", text: "For dry skin, double up on hydration at every step. Use a hydrating serum, a rich moisturiser (sometimes two layers), a hydrating primer, and add a glow illuminator before foundation for extra luminosity. Dry skin needs all the moisture it can get — do not hold back. Toner should only go on the T-zone to avoid further drying the cheeks.", marks: [] }] },
      { _type: "block", _key: "bp8-b22", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bp8-b22-s1", text: "For oily skin, use lightweight, gel-based products and focus mattifying products on the T-zone. Do not skip moisturiser — oily skin that is dehydrated produces even more oil to compensate. A light moisturiser actually helps control oil production throughout the day. Use a mattifying primer on the T-zone and a grip primer on the rest of the face.", marks: [] }] },

      { _type: "block", _key: "bp8-h11", style: "h2", markDefs: [], children: [{ _type: "span", _key: "bp8-h11-s1", text: "Ready for the Next Step?", marks: [] }] },
      { _type: "block", _key: "bp8-b23", style: "normal", markDefs: [{ _type: "link", _key: "bp8-l1", href: "/blog/soft-glam-makeup-tutorial-step-by-step" }, { _type: "link", _key: "bp8-l2", href: "/blog/how-to-make-makeup-last-all-day-lagos-heat" }, { _type: "link", _key: "bp8-l3", href: "/blog/how-early-should-you-book-your-bridal-makeup-artist" }], children: [{ _type: "span", _key: "bp8-b23-s1", text: "Now that your skin is prepped like a professional, you are ready to apply makeup that actually stays. Follow our ", marks: [] }, { _type: "span", _key: "bp8-b23-s2", text: "step-by-step soft glam makeup tutorial", marks: ["bp8-l1"] }, { _type: "span", _key: "bp8-b23-s3", text: " to put this prep to work. Want to make sure your finished look survives Lagos weather? Read our guide on ", marks: [] }, { _type: "span", _key: "bp8-b23-s4", text: "how to make your makeup last all day in Lagos heat", marks: ["bp8-l2"] }, { _type: "span", _key: "bp8-b23-s5", text: ". And if you want this done professionally for your wedding or event, find out ", marks: [] }, { _type: "span", _key: "bp8-b23-s6", text: "how early you should book your bridal makeup artist", marks: ["bp8-l3"] }, { _type: "span", _key: "bp8-b23-s7", text: " — your skin (and your photos) will thank you.", marks: [] }] },
    ],
  },
  {
    _id: "blog-post-9",
    _type: "blogPost",
    title: "Owambe Makeup: The Complete Glam Guide for Lagos's Biggest Celebrations",
    slug: { _type: "slug", current: "owambe-makeup-guide-lagos" },
    excerpt:
      "From aso-ebi coordination to sweat-proof glam that survives hours of dancing — everything you need to know about getting your makeup right for your next owambe.",
    category: "Event Glam",
    author: "Temilola",
    publishedAt: "2026-07-01T10:00:00Z",
    order: 9,
    body: [
      { _type: "block", _key: "bp9-b1", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bp9-b1-s1", text: "If you have ever been to a real Lagos owambe, you already know it is not just a party — it is a full production. The aso-ebi is coordinated, the gele is standing tall, the small chops are on their way, and everybody's face has to be ready for hours of dancing, photos, and video booths. Your makeup has one job on a day like this: hold up from the first entrance to the last dance.", marks: [] }] },
      { _type: "block", _key: "bp9-h1", style: "h2", markDefs: [], children: [{ _type: "span", _key: "bp9-h1-s1", text: "What Makes Owambe Makeup Different From Everyday Glam", marks: [] }] },
      { _type: "block", _key: "bp9-b2", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bp9-b2-s1", text: "Owambe makeup is not the same as a quiet dinner-date look. You are getting ready under time pressure, in a house full of aunties, with a gele that is heavy and warm, and then you are on your feet — dancing, greeting guests, taking photos — for six, seven, sometimes ten hours straight. That calls for a heavier hand than your usual soft glam: more definition on the eyes, a fuller lip, and contour that photographs well under event lighting and phone flashes. It also calls for products built to survive heat and sweat, not just to look good in the mirror before you leave the house.", marks: [] }] },
      { _type: "block", _key: "bp9-h2", style: "h2", markDefs: [], children: [{ _type: "span", _key: "bp9-h2-s1", text: "Choosing Your Look: Aso-Ebi, Gele, and Your Face", marks: [] }] },
      { _type: "block", _key: "bp9-b3", style: "normal", markDefs: [{ _type: "link", _key: "bp9-l1", href: "/blog/soft-glam-vs-bold-glam-choosing-your-event-look" }], children: [{ _type: "span", _key: "bp9-b3-s1", text: "Your outfit colour and your gele height should guide your makeup, not the other way around. Bold aso-ebi colours — reds, golds, deep jewel tones — usually carry a bolder lip and a stronger smoky or cut-crease eye beautifully. Lighter, softer aso-ebi in pastels or whites often looks best with a softer glam so your face does not compete with your outfit for attention. If you are torn between the two directions, I break down exactly how to decide in ", marks: [] }, { _type: "span", _key: "bp9-b3-s2", text: "Soft Glam vs Bold Glam: Choosing Your Event Look", marks: ["bp9-l1"] }, { _type: "span", _key: "bp9-b3-s3", text: ".", marks: [] }] },
      { _type: "block", _key: "bp9-b4", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bp9-b4-s1", text: "One thing I always ask clients before I start their face: what is your gele height and style? A tall gele changes how your brows and eyes read from a distance, and it can shift where contour needs to sit on your forehead. It is a five-minute conversation that saves you from a look that gets thrown off the moment your gele goes on.", marks: [] }] },
      { _type: "block", _key: "bp9-h3", style: "h2", markDefs: [], children: [{ _type: "span", _key: "bp9-h3-s1", text: "Making Your Owambe Makeup Survive the Whole Event", marks: [] }] },
      { _type: "block", _key: "bp9-b5", style: "normal", markDefs: [{ _type: "link", _key: "bp9-l2", href: "/blog/how-to-make-makeup-last-all-day-lagos-heat" }], children: [{ _type: "span", _key: "bp9-b5-s1", text: "This is the part people underestimate. A Lagos owambe usually means an indoor hall packed with bodies, or a tent with limited airflow, plus hours of dancing under event lighting. Your makeup needs to survive all of that without sliding off your face by the second hour. I cover my full process for this in ", marks: [] }, { _type: "span", _key: "bp9-b5-s2", text: "How to Make Your Makeup Last All Day in Lagos Heat", marks: ["bp9-l2"] }, { _type: "span", _key: "bp9-b5-s3", text: ", but the short version for owambe specifically is: sweat-proofing on the T-zone before foundation, a setting spray built for humidity rather than a light mist, and blotting powder in your clutch for touch-ups between dances — not full reapplication.", marks: [] }] },
      { _type: "block", _key: "bp9-h4", style: "h2", markDefs: [], children: [{ _type: "span", _key: "bp9-h4-s1", text: "Group Owambe Glam: Getting Ready With Your Aso-Ebi Squad", marks: [] }] },
      { _type: "block", _key: "bp9-b6", style: "normal", markDefs: [{ _type: "link", _key: "bp9-l3", href: "/services/Event-owambe-glam" }], children: [{ _type: "span", _key: "bp9-b6-s1", text: "Owambe rarely happens solo. Most of my owambe bookings are for a group — you, your sisters, your friends, sometimes your mother — all in matching aso-ebi and all needing to be camera-ready by the same time. This is exactly what ", marks: [] }, { _type: "span", _key: "bp9-b6-s2", text: "Event/Owambe Glam", marks: ["bp9-l3"] }, { _type: "span", _key: "bp9-b6-s3", text: " is built for: a full glam application per face, timed so your whole group is ready together instead of one person done and everyone else waiting. If it is more than two or three faces, tell me the headcount early so I can plan the schedule properly.", marks: [] }] },
      { _type: "block", _key: "bp9-h5", style: "h2", markDefs: [], children: [{ _type: "span", _key: "bp9-h5-s1", text: "How Much Does Owambe Makeup Cost in Lagos?", marks: [] }] },
      { _type: "block", _key: "bp9-b7", style: "normal", markDefs: [{ _type: "link", _key: "bp9-l4", href: "/pricing" }], children: [{ _type: "span", _key: "bp9-b7-s1", text: "Event and owambe glam in Lagos typically starts from ₦40,000 per face, and that is where my Event/Owambe Glam package begins too. What moves the price up is home service — I travel to you with a full kit, so a small travel fee applies depending on location — group size, and how elaborate the look is. A soft daytime look costs less than a full bold glam with lashes, contour, and a longer-wear finish. You can see the exact breakdown on my ", marks: [] }, { _type: "span", _key: "bp9-b7-s2", text: "pricing page", marks: ["bp9-l4"] }, { _type: "span", _key: "bp9-b7-s3", text: ", and I am always happy to send a straight quote over WhatsApp once I know your date, look, and headcount.", marks: [] }] },
      { _type: "block", _key: "bp9-b8", style: "normal", markDefs: [{ _type: "link", _key: "bp9-l5", href: "/book" }], children: [{ _type: "span", _key: "bp9-b8-s1", text: "Owambe season in Lagos does not slow down, and neither should your glam. If you have a celebration coming up — big or small — ", marks: [] }, { _type: "span", _key: "bp9-b8-s2", text: "book your session", marks: ["bp9-l5"] }, { _type: "span", _key: "bp9-b8-s3", text: " early so your date is secured, especially if you need a group of faces done together. I would love to help you show up looking exactly as good as the occasion deserves.", marks: [] }] },
    ],
  },
  {
    _id: "blog-post-10",
    _type: "blogPost",
    title: "How to Choose the Right Makeup Artist in Lagos (Without Regretting It)",
    slug: { _type: "slug", current: "how-to-choose-a-makeup-artist-in-lagos" },
    excerpt:
      "Portfolio red flags, the trial question everyone forgets to ask, and how to actually compare quotes — a practical guide to booking a makeup artist you won't regret.",
    category: "Beauty Education",
    author: "Temilola",
    publishedAt: "2026-07-02T10:00:00Z",
    order: 10,
    body: [
      { _type: "block", _key: "bp10-b1", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bp10-b1-s1", text: "I get messages almost every week from people who booked the wrong makeup artist for their event and are now scrambling to fix it before their date. Most of the time, it was avoidable — a portfolio that did not match what they actually wanted, no trial for a big day, or a quote that looked good until the extra fees showed up on the morning of. So let me walk you through exactly how I would choose a makeup artist in Lagos if I were the client, not the one holding the brush.", marks: [] }] },
      { _type: "block", _key: "bp10-h1", style: "h2", markDefs: [], children: [{ _type: "span", _key: "bp10-h1-s1", text: "Start With the Portfolio — But Look Past the Highlight Reel", marks: [] }] },
      { _type: "block", _key: "bp10-b2", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bp10-b2-s1", text: "Every makeup artist's page shows their best work, so one pretty photo alone tells you very little. Look for consistency instead — can this artist repeat the same quality of work across different face shapes, skin tones, and lighting conditions, or does a single perfect photo carry the whole page? Pay attention to skin texture in the photos too. Heavily filtered or edited portfolio images can hide exactly the kind of cakey, ashy, or patchy application you are trying to avoid on your own day. If an artist shows real client photos alongside their professional shoots, that is usually a good sign — it means the day-to-day work holds up too.", marks: [] }] },
      { _type: "block", _key: "bp10-h2", style: "h2", markDefs: [], children: [{ _type: "span", _key: "bp10-h2-s1", text: "Ask About the Trial (Even If You Think You Do Not Need One)", marks: [] }] },
      { _type: "block", _key: "bp10-b3", style: "normal", markDefs: [{ _type: "link", _key: "bp10-l1", href: "/blog/how-early-should-you-book-your-bridal-makeup-artist" }], children: [{ _type: "span", _key: "bp10-b3-s1", text: "If your event is a wedding, or anything with real photos and a lot riding on it, ask whether a trial is offered and what it costs. A trial is where you find out if an artist actually listens — did they recreate the look you asked for, or did they give you their signature look regardless of your references? I talk more about timing your trial and your booking in ", marks: [] }, { _type: "span", _key: "bp10-b3-s2", text: "How Early Should You Book Your Bridal Makeup Artist", marks: ["bp10-l1"] }, { _type: "span", _key: "bp10-b3-s3", text: ", but the short version is: book your trial early enough that you have time to adjust the look if it is not quite right, not two days before your event.", marks: [] }] },
      { _type: "block", _key: "bp10-h3", style: "h2", markDefs: [], children: [{ _type: "span", _key: "bp10-h3-s1", text: "Compare Quotes the Right Way, Not Just the Number", marks: [] }] },
      { _type: "block", _key: "bp10-b4", style: "normal", markDefs: [{ _type: "link", _key: "bp10-l2", href: "/blog/how-much-does-bridal-makeup-cost-in-lagos" }, { _type: "link", _key: "bp10-l3", href: "/pricing" }], children: [{ _type: "span", _key: "bp10-b4-s1", text: "The lowest quote is not automatically the best deal. Ask exactly what is included — skin prep, lashes, touch-up kit, setting routine — and whether a trial or home service is priced separately. Two artists can quote very differently for what looks like \"the same service\" once you see the full breakdown. I explain what actually drives bridal pricing in ", marks: [] }, { _type: "span", _key: "bp10-b4-s2", text: "How Much Does Bridal Makeup Cost in Lagos", marks: ["bp10-l2"] }, { _type: "span", _key: "bp10-b4-s3", text: ", and you can see exactly what each of my own packages includes on my ", marks: [] }, { _type: "span", _key: "bp10-b4-s4", text: "pricing page", marks: ["bp10-l3"] }, { _type: "span", _key: "bp10-b4-s5", text: " before you ever have to ask.", marks: [] }] },
      { _type: "block", _key: "bp10-h4", style: "h2", markDefs: [], children: [{ _type: "span", _key: "bp10-h4-s1", text: "Home Service or Studio? Know What You Are Booking", marks: [] }] },
      { _type: "block", _key: "bp10-b5", style: "normal", markDefs: [{ _type: "link", _key: "bp10-l4", href: "/services" }], children: [{ _type: "span", _key: "bp10-b5-s1", text: "Some artists only work from a fixed studio location; others travel to you. If getting ready at home, your hotel, or your venue matters to you — and for most Lagos brides and event clients, it does — confirm this upfront, not after you have already paid a deposit. Ask what home service actually includes: does the artist bring a full kit, proper lighting, and enough time to set up, or are you the one adjusting around their limitations? You can see exactly what is included across each of my own services, including home service availability, on the ", marks: [] }, { _type: "span", _key: "bp10-b5-s2", text: "services page", marks: ["bp10-l4"] }, { _type: "span", _key: "bp10-b5-s3", text: ".", marks: [] }] },
      { _type: "block", _key: "bp10-h5", style: "h2", markDefs: [], children: [{ _type: "span", _key: "bp10-h5-s1", text: "Questions to Ask Before You Pay a Deposit", marks: [] }] },
      { _type: "block", _key: "bp10-b6", style: "normal", markDefs: [], children: [{ _type: "span", _key: "bp10-b6-s1", text: "Before any money changes hands, get clear answers to a few basics: How much is the deposit, and what happens to it if your date changes? Is it a percentage of the total, and when is the balance due? What is the cancellation and rescheduling policy? Is a travel fee included for home service, or added separately? A trustworthy artist will answer all of this clearly and in writing — usually over WhatsApp or email — before you commit. If you get vague answers to direct questions, treat that as your answer.", marks: [] }] },
      { _type: "block", _key: "bp10-b7", style: "normal", markDefs: [{ _type: "link", _key: "bp10-l5", href: "/portfolio" }, { _type: "link", _key: "bp10-l6", href: "/book" }], children: [{ _type: "span", _key: "bp10-b7-s1", text: "At the end of the day, the right makeup artist for you is the one whose portfolio matches your taste, who answers your questions clearly, and who takes your specific face and event seriously instead of giving everyone the same look. Take a look through my ", marks: [] }, { _type: "span", _key: "bp10-b7-s2", text: "portfolio", marks: ["bp10-l5"] }, { _type: "span", _key: "bp10-b7-s3", text: " to see if my style is the one you are after, and when you are ready, ", marks: [] }, { _type: "span", _key: "bp10-b7-s4", text: "book your session", marks: ["bp10-l6"] }, { _type: "span", _key: "bp10-b7-s5", text: " and I will walk you through everything from there.", marks: [] }] },
    ],
  },
];

// ─── Training Courses ──────────────────────────────────────────────────
const trainingCourses = [
  {
    _id: "training-beginner",
    _type: "trainingCourse",
    title: "Foundation Course",
    slug: { _type: "slug", current: "foundation-course" },
    level: "Beginner",
    description:
      "Start from zero. Learn skin prep, base application, and everyday glam techniques.",
    duration: "2 weeks",
    price: 150000,
    classSize: 6,
    certification: true,
    curriculum: [
      "Skin prep & analysis",
      "Foundation & concealer application",
      "Basic contouring & highlighting",
      "Everyday eye makeup",
      "Lip techniques",
      "Setting for longevity",
    ],
    highlights: [
      "Hands-on practice from day one",
      "Small class — personal attention",
      "Professional starter kit included",
    ],
    order: 1,
  },
  {
    _id: "training-advanced",
    _type: "trainingCourse",
    title: "Professional Masterclass",
    slug: { _type: "slug", current: "professional-masterclass" },
    level: "Advanced",
    description:
      "Elevate your artistry. Advanced techniques for bridal, editorial, and high-definition makeup.",
    duration: "3 weeks",
    price: 250000,
    classSize: 4,
    certification: true,
    curriculum: [
      "Advanced skin prep & correction",
      "Bridal glam — white & traditional",
      "Editorial & photoshoot techniques",
      "HD makeup for camera",
      "Client management & pricing",
      "Building your portfolio",
    ],
    highlights: [
      "Real bridal and editorial shoots",
      "Portfolio-building sessions",
      "Business & pricing guidance",
    ],
    order: 2,
  },
  {
    _id: "training-bridal",
    _type: "trainingCourse",
    title: "Bridal Intensive",
    slug: { _type: "slug", current: "bridal-intensive" },
    level: "Bridal Specialty",
    description:
      "Specialise in bridal. Master the techniques that Lagos brides are willing to pay premium for.",
    duration: "1 week intensive",
    price: 200000,
    classSize: 4,
    certification: true,
    curriculum: [
      "Bridal consultation process",
      "White wedding & traditional looks",
      "Long-wear bridal setting",
      "Bridal party scheduling",
      "Pricing bridal packages",
      "Building bridal clientele",
    ],
    highlights: [
      "Focused bridal specialisation",
      "Real bridal mock sessions",
      "Bridal business blueprint",
    ],
    order: 3,
  },
];

// ─── Travel Zones ───────────────────────────────────────────────────────
const travelZones = [
  {
    _id: "travelZone-island-central",
    _type: "travelZone",
    label: "Lekki / VI / Ikoyi",
    areas: ["Lekki Phase 1", "Lekki Phase 2", "Victoria Island", "Ikoyi", "Oniru", "Banana Island", "Parkview Estate"],
    fee: 0,
    order: 1,
  },
  {
    _id: "travelZone-island-extended",
    _type: "travelZone",
    label: "Ajah / Sangotedo / Chevron",
    areas: ["Ajah", "Sangotedo", "Chevron", "Ikota", "VGC", "Abraham Adesanya", "Osapa London", "Agungi", "Ilasan", "Idado", "Awoyaya"],
    fee: 35000,
    order: 2,
  },
  {
    _id: "travelZone-ikeja-axis",
    _type: "travelZone",
    label: "Ikeja / GRA / Magodo",
    areas: ["Ikeja", "Ikeja GRA", "Maryland", "Ojodu", "Magodo", "Omole", "Berger", "Opebi", "Allen Avenue", "Alausa", "Ogba", "Agidingbi"],
    fee: 20000,
    order: 3,
  },
  {
    _id: "travelZone-mainland-central",
    _type: "travelZone",
    label: "Yaba / Surulere / Gbagada",
    areas: ["Yaba", "Surulere", "Gbagada", "Shomolu", "Bariga", "Ogudu", "Akoka", "Palmgrove", "Ebute Metta"],
    fee: 20000,
    order: 4,
  },
  {
    _id: "travelZone-mainland-extended",
    _type: "travelZone",
    label: "Festac / Amuwo / Oshodi",
    areas: ["Festac", "Amuwo-Odofin", "Oshodi", "Isolo", "Egbeda", "Idimu", "Satellite Town", "Okota", "Ejigbo"],
    fee: 20000,
    order: 5,
  },
  {
    _id: "travelZone-outskirts",
    _type: "travelZone",
    label: "Ikorodu / Epe / Badagry",
    areas: ["Ikorodu", "Epe", "Badagry", "Alimosho", "Agbara", "Igbogbo", "Ijede"],
    fee: 30000,
    order: 6,
  },
  {
    _id: "travelZone-outside-lagos",
    _type: "travelZone",
    label: "Outside Lagos (Ibadan, Abeokuta, etc.)",
    areas: ["Ibadan", "Abeokuta", "Ogun State", "and other locations"],
    fee: -1,
    note: "Travel fee quoted separately — includes transport + accommodation if needed",
    order: 7,
  },
];

// ─── Cities ─────────────────────────────────────────────────────────────
const cities = [
  { _id: "city-lagos", _type: "city", name: "Lagos", slug: { _type: "slug", current: "lagos" }, state: "Lagos State", isActive: true },
];

// ─── Artists ────────────────────────────────────────────────────────────
const artists = [
  {
    _id: "artist-temilola",
    _type: "artist",
    name: "Temilola",
    slug: { _type: "slug", current: "temilola" },
    role: "Founder & Lead Artist",
    bio: "I'm Temilola, the artist behind Gleam by Temi — a professional makeup studio based in Lagos, specialising in soft glam, event, bridal, and traditional makeup.\n\nI started this work because I love the quiet confidence that appears when someone looks in the mirror and recognises themselves — just more radiant. That moment matters whether it's a wedding morning or a milestone birthday.\n\nOn your day, I bring calm energy, punctual timing, and a kit that's clean, organised, and ready. No chaos. No rushing. Just focused glam that holds up to photos, dancing, and emotion.",
    isPrimary: true,
    specialties: [
      { _type: "reference", _ref: "style-soft-glam" },
      { _type: "reference", _ref: "style-bold-glam" },
    ],
  },
];

// ─── Makeup Styles ──────────────────────────────────────────────────────
const makeupStyles = [
  {
    _id: "style-soft-glam",
    _type: "makeupStyle",
    name: "Soft Glam",
    slug: { _type: "slug", current: "soft-glam" },
    description: "Blended neutrals, a skin-like base, and subtle dimension — wearable, natural-looking glam.",
    bestFor: "Everyday elegance, daytime events, and clients who want to look like a more radiant version of themselves.",
    order: 1,
  },
  {
    _id: "style-bold-glam",
    _type: "makeupStyle",
    name: "Bold / Full Glam",
    slug: { _type: "slug", current: "bold-full-glam" },
    description: "More definition on the eyes, a fuller lip, and contour that photographs well under event lighting and phone flashes.",
    bestFor: "Owambe, parties, and events where the makeup needs to hold up for hours and read from a distance.",
    order: 2,
  },
];

// ─── Occasions ──────────────────────────────────────────────────────────
const occasions = [
  { _id: "occasion-wedding", _type: "occasion", name: "Wedding", slug: { _type: "slug", current: "wedding" }, description: "Bridal makeup for the wedding day itself, including trials.", order: 1 },
  { _id: "occasion-owambe-party", _type: "occasion", name: "Owambe / Party", slug: { _type: "slug", current: "owambe-party" }, description: "Event and celebration glam — owambe, parties, and social events.", order: 2 },
  { _id: "occasion-birthday", _type: "occasion", name: "Birthday", slug: { _type: "slug", current: "birthday" }, description: "Birthday celebration makeup.", order: 3 },
  { _id: "occasion-photoshoot", _type: "occasion", name: "Photoshoot", slug: { _type: "slug", current: "photoshoot" }, description: "HD makeup built for camera and studio lighting.", order: 4 },
  { _id: "occasion-corporate", _type: "occasion", name: "Corporate", slug: { _type: "slug", current: "corporate" }, description: "Professional makeup for corporate events and headshots.", order: 5 },
];

// ─── Wedding Types ──────────────────────────────────────────────────────
const weddingTypes = [
  { _id: "weddingtype-white-wedding", _type: "weddingType", name: "White Wedding", slug: { _type: "slug", current: "white-wedding" }, description: "Church/white wedding bridal makeup — typically softer, more romantic styling.", order: 1 },
  { _id: "weddingtype-traditional-wedding", _type: "weddingType", name: "Traditional Wedding", slug: { _type: "slug", current: "traditional-wedding" }, description: "Traditional wedding makeup — bolder colours, heavier contour, coordinated with gele/aso-oke.", order: 2 },
];

// ─── Locations ──────────────────────────────────────────────────────────
const locations = [
  {
    _id: "location-lekki",
    _type: "location",
    name: "Lekki",
    slug: { _type: "slug", current: "lekki" },
    city: { _type: "reference", _ref: "city-lagos" },
    areas: ["Lekki Phase 1", "Lekki Phase 2", "Chevron", "Ikota", "VGC", "Abraham Adesanya", "Ajah", "Sangotedo"],
    travelZone: { _type: "reference", _ref: "travelZone-island-central" },
    headline: "Professional Makeup Artist in Lekki, Lagos",
    subtitle: "Soft glam, event, and bridal makeup — delivered to your doorstep in Lekki Phase 1, Phase 2, Chevron, Ajah, and Sangotedo.",
    seoTitle: "Makeup Artist in Lekki Lagos — Soft Glam, Event & Bridal",
    seoDescription: "Book a professional makeup artist in Lekki, Lagos. Gleam by Temi offers soft glam, event glam, and bridal makeup, plus traditional wedding makeup, with home service across Lekki Phase 1, Phase 2, Ajah, Chevron, and VGC.",
    intro: [
      "Looking for a reliable makeup artist in Lekki? Gleam by Temi brings professional soft glam, event, and bridal makeup directly to you — whether you're getting ready at home, a hotel, or a venue anywhere in Lekki.",
      "From intimate Lekki Phase 1 apartments to grand Ajah venues, every session starts with careful skin prep and ends with a camera-ready finish designed to last through your entire event.",
    ],
    keywords: ["makeup artist in Lekki", "bridal makeup artist Lekki", "makeup artist Lekki Phase 1", "makeup artist Ajah Lagos", "home service makeup Lekki", "wedding makeup artist Lekki", "soft glam makeup Lekki", "event makeup Lekki Lagos", "makeup artist near me Lekki", "makeup artist Chevron Lagos", "makeup artist VGC Lagos", "makeup artist Sangotedo"],
    status: "published",
  },
  {
    _id: "location-victoria-island",
    _type: "location",
    name: "Victoria Island",
    slug: { _type: "slug", current: "victoria-island" },
    city: { _type: "reference", _ref: "city-lagos" },
    areas: ["Victoria Island", "Ikoyi", "Oniru", "Banana Island"],
    travelZone: { _type: "reference", _ref: "travelZone-island-central" },
    headline: "Makeup Artist in Victoria Island & Ikoyi, Lagos",
    subtitle: "Luxury soft glam, event, and bridal makeup for VI, Ikoyi, Oniru, and Banana Island — with punctual home service and a polished, lasting finish.",
    seoTitle: "Makeup Artist in Victoria Island Lagos — Luxury Glam & Bridal",
    seoDescription: "Book a professional makeup artist in Victoria Island, Lagos. Gleam by Temi provides soft glam, event, and bridal makeup with home service across VI, Ikoyi, Oniru, and Banana Island.",
    intro: [
      "Gleam by Temi provides luxury makeup services across Victoria Island, Ikoyi, and Oniru. Whether it's a bridal morning at a VI hotel or a private event in Banana Island, expect calm, professional service from start to finish.",
      "Victoria Island clients appreciate punctuality, discretion, and a finish that photographs beautifully under any lighting. That's exactly what every session delivers — skin-prep focused, camera-ready glam.",
    ],
    keywords: ["makeup artist Victoria Island Lagos", "makeup artist VI Lagos", "bridal makeup Victoria Island", "makeup artist Ikoyi Lagos", "luxury makeup artist Lagos", "wedding makeup Victoria Island", "event makeup artist VI", "makeup artist Oniru", "makeup artist Banana Island", "home service makeup Victoria Island", "soft glam makeup VI Lagos"],
    status: "published",
  },
  {
    _id: "location-ikeja",
    _type: "location",
    name: "Ikeja",
    slug: { _type: "slug", current: "ikeja" },
    city: { _type: "reference", _ref: "city-lagos" },
    areas: ["Ikeja", "Ikeja GRA", "Maryland", "Ojodu", "Magodo", "Omole", "Berger"],
    travelZone: { _type: "reference", _ref: "travelZone-ikeja-axis" },
    headline: "Makeup Artist in Ikeja & GRA, Lagos",
    subtitle: "Professional soft glam, event, and bridal makeup with home service across Ikeja, GRA, Maryland, Magodo, and Omole.",
    seoTitle: "Makeup Artist in Ikeja Lagos — Event, Soft Glam & Bridal",
    seoDescription: "Book a makeup artist in Ikeja, Lagos. Gleam by Temi offers soft glam, event glam, and bridal makeup, plus traditional wedding makeup, with home service across Ikeja GRA, Maryland, Magodo, Omole, and Ojodu.",
    intro: [
      "Need a professional makeup artist in Ikeja? Gleam by Temi covers Ikeja GRA, Maryland, Magodo, Omole, Ojodu, and Berger — bringing a full professional kit directly to your home or venue.",
      "Ikeja is one of the busiest wedding and event hubs in Lagos. From traditional engagement ceremonies at Ikeja GRA halls to birthday celebrations in Magodo, every session is tailored to your skin tone, outfit, and event timeline.",
    ],
    keywords: ["makeup artist in Ikeja", "bridal makeup artist Ikeja", "makeup artist Ikeja GRA", "wedding makeup artist Ikeja Lagos", "makeup artist Maryland Lagos", "makeup artist Magodo", "home service makeup Ikeja", "event makeup Ikeja Lagos", "traditional makeup artist Ikeja", "makeup artist Omole Lagos", "makeup artist Ojodu Berger", "soft glam makeup Ikeja"],
    status: "published",
  },
  {
    _id: "location-surulere",
    _type: "location",
    name: "Surulere & Yaba",
    slug: { _type: "slug", current: "surulere" },
    city: { _type: "reference", _ref: "city-lagos" },
    areas: ["Surulere", "Yaba", "Gbagada", "Shomolu", "Bariga", "Ogudu"],
    travelZone: { _type: "reference", _ref: "travelZone-mainland-central" },
    headline: "Makeup Artist in Surulere, Yaba & Gbagada, Lagos",
    subtitle: "Soft glam, event, and bridal makeup with home service in Surulere, Yaba, Gbagada, Shomolu, and surrounding areas.",
    seoTitle: "Makeup Artist in Surulere & Yaba Lagos — Event & Soft Glam",
    seoDescription: "Book a professional makeup artist in Surulere and Yaba, Lagos. Gleam by Temi offers soft glam, event glam, and bridal makeup with home service across Surulere, Yaba, Gbagada, Shomolu, and Ogudu.",
    intro: [
      "Gleam by Temi brings professional makeup services to Surulere, Yaba, Gbagada, and the wider Lagos mainland. Home service means you don't have to worry about traffic — the artist comes to you, fully equipped and on schedule.",
      "Whether you're preparing for a wedding at a Surulere event hall, a birthday dinner in Gbagada, or a photoshoot in Yaba, expect polished, long-lasting makeup built on proper skin prep.",
    ],
    keywords: ["makeup artist Surulere Lagos", "makeup artist Yaba Lagos", "bridal makeup Surulere", "makeup artist Gbagada", "event makeup artist Surulere", "wedding makeup Yaba Lagos", "home service makeup Surulere", "makeup artist Shomolu", "makeup artist mainland Lagos", "soft glam makeup Surulere", "makeup artist near me Yaba"],
    status: "published",
  },
  {
    _id: "location-festac",
    _type: "location",
    name: "Festac & Amuwo-Odofin",
    slug: { _type: "slug", current: "festac" },
    city: { _type: "reference", _ref: "city-lagos" },
    areas: ["Festac", "Amuwo-Odofin", "Oshodi", "Isolo", "Egbeda", "Idimu"],
    travelZone: { _type: "reference", _ref: "travelZone-mainland-extended" },
    headline: "Makeup Artist in Festac, Oshodi & Amuwo-Odofin, Lagos",
    subtitle: "Professional soft glam, event, and bridal makeup with home service across Festac, Amuwo-Odofin, Oshodi, Isolo, and Egbeda.",
    seoTitle: "Makeup Artist in Festac & Oshodi Lagos — Event & Soft Glam",
    seoDescription: "Book a professional makeup artist in Festac and Oshodi, Lagos. Gleam by Temi offers soft glam, event glam, and bridal makeup, plus traditional wedding makeup, with home service across Festac, Amuwo-Odofin, Isolo, Egbeda, and Idimu.",
    intro: [
      "Serving Festac, Amuwo-Odofin, Oshodi, Isolo, and surrounding areas — Gleam by Temi brings full professional makeup to your doorstep so you can focus on enjoying your day.",
      "From church wedding mornings in Festac to traditional ceremonies in Egbeda, every session includes thorough skin prep, clean professional tools, and a finish that holds up to Lagos heat and celebration.",
    ],
    keywords: ["makeup artist Festac Lagos", "makeup artist Amuwo-Odofin", "bridal makeup Festac", "makeup artist Oshodi Lagos", "wedding makeup Festac Lagos", "event makeup Oshodi", "home service makeup Festac", "makeup artist Isolo Lagos", "makeup artist Egbeda", "soft glam makeup Festac", "makeup artist near me Festac"],
    status: "published",
  },
  {
    _id: "location-ikorodu",
    _type: "location",
    name: "Ikorodu & Epe",
    slug: { _type: "slug", current: "ikorodu" },
    city: { _type: "reference", _ref: "city-lagos" },
    areas: ["Ikorodu", "Epe", "Badagry", "Alimosho", "Agbara"],
    travelZone: { _type: "reference", _ref: "travelZone-outskirts" },
    headline: "Makeup Artist in Ikorodu, Epe & Badagry, Lagos",
    subtitle: "Professional soft glam, event, and bridal makeup — now available with home service in Ikorodu, Epe, Badagry, Alimosho, and Agbara.",
    seoTitle: "Makeup Artist in Ikorodu & Epe Lagos — Event & Soft Glam Makeup",
    seoDescription: "Book a professional makeup artist in Ikorodu and Epe, Lagos. Gleam by Temi provides soft glam, event glam, and bridal makeup, plus traditional wedding makeup, with home service in Ikorodu, Epe, Badagry, Alimosho, and Agbara.",
    intro: [
      "Gleam by Temi extends professional makeup services to Ikorodu, Epe, Badagry, Alimosho, and Agbara. Distance shouldn't keep you from looking and feeling your best on your special day.",
      "Every booking includes a dedicated timeline, full professional kit, and the same standard of skin prep and camera-ready finish that clients across Lagos trust — no matter the location.",
    ],
    keywords: ["makeup artist Ikorodu Lagos", "makeup artist Epe Lagos", "bridal makeup Ikorodu", "makeup artist Badagry Lagos", "wedding makeup Ikorodu", "event makeup Epe Lagos", "home service makeup Ikorodu", "makeup artist Alimosho Lagos", "traditional makeup Ikorodu", "makeup artist near me Ikorodu", "soft glam makeup Epe"],
    status: "published",
  },
];

// ─── Additive taxonomy tagging (setIfMissing only — see seed function) ──
// Mirrors the live backfill applied when the taxonomy graph was introduced.
// Each entry: which document, which fields, what value — applied only if
// the field is not already set, so any manual edit always wins.
const taxonomyPatches: { id: string; fields: Record<string, unknown> }[] = [
  // Services
  { id: "service-traditional", fields: { occasions: [{ _type: "reference", _ref: "occasion-wedding" }] } },
  { id: "service-bridal", fields: { styles: [{ _type: "reference", _ref: "style-soft-glam" }] } },
  { id: "service-soft-glam", fields: { styles: [{ _type: "reference", _ref: "style-bold-glam" }], occasions: [{ _type: "reference", _ref: "occasion-owambe-party" }, { _type: "reference", _ref: "occasion-birthday" }] } },
  { id: "service-group", fields: { occasions: [{ _type: "reference", _ref: "occasion-photoshoot" }] } },
  { id: "service-home", fields: { styles: [{ _type: "reference", _ref: "style-bold-glam" }], occasions: [{ _type: "reference", _ref: "occasion-owambe-party" }] } },
  // Portfolio
  { id: "portfolio-1", fields: { occasion: { _type: "reference", _ref: "occasion-wedding" }, artist: { _type: "reference", _ref: "artist-temilola" } } },
  { id: "portfolio-6", fields: { occasion: { _type: "reference", _ref: "occasion-wedding" }, artist: { _type: "reference", _ref: "artist-temilola" } } },
  { id: "portfolio-2", fields: { style: { _type: "reference", _ref: "style-soft-glam" }, artist: { _type: "reference", _ref: "artist-temilola" } } },
  { id: "portfolio-7", fields: { style: { _type: "reference", _ref: "style-soft-glam" }, occasion: { _type: "reference", _ref: "occasion-owambe-party" }, artist: { _type: "reference", _ref: "artist-temilola" } } },
  { id: "portfolio-3", fields: { style: { _type: "reference", _ref: "style-bold-glam" }, occasion: { _type: "reference", _ref: "occasion-owambe-party" }, artist: { _type: "reference", _ref: "artist-temilola" } } },
  { id: "portfolio-8", fields: { style: { _type: "reference", _ref: "style-bold-glam" }, occasion: { _type: "reference", _ref: "occasion-birthday" }, artist: { _type: "reference", _ref: "artist-temilola" } } },
  { id: "portfolio-10", fields: { occasion: { _type: "reference", _ref: "occasion-photoshoot" }, artist: { _type: "reference", _ref: "artist-temilola" } } },
  { id: "portfolio-9", fields: { occasion: { _type: "reference", _ref: "occasion-photoshoot" }, artist: { _type: "reference", _ref: "artist-temilola" } } },
  // Testimonials
  { id: "testimonial-1", fields: { occasion: { _type: "reference", _ref: "occasion-wedding" }, weddingType: { _type: "reference", _ref: "weddingtype-white-wedding" }, artist: { _type: "reference", _ref: "artist-temilola" }, audienceType: "client" } },
  { id: "testimonial-2", fields: { occasion: { _type: "reference", _ref: "occasion-birthday" }, artist: { _type: "reference", _ref: "artist-temilola" }, audienceType: "client" } },
  { id: "testimonial-3", fields: { occasion: { _type: "reference", _ref: "occasion-wedding" }, weddingType: { _type: "reference", _ref: "weddingtype-traditional-wedding" }, artist: { _type: "reference", _ref: "artist-temilola" }, audienceType: "client" } },
  { id: "testimonial-4", fields: { occasion: { _type: "reference", _ref: "occasion-wedding" }, artist: { _type: "reference", _ref: "artist-temilola" }, audienceType: "client" } },
  { id: "testimonial-5", fields: { occasion: { _type: "reference", _ref: "occasion-corporate" }, artist: { _type: "reference", _ref: "artist-temilola" }, audienceType: "client" } },
  // Transformations
  { id: "transformation-1", fields: { occasion: { _type: "reference", _ref: "occasion-wedding" }, artist: { _type: "reference", _ref: "artist-temilola" } } },
  { id: "transformation-2", fields: { style: { _type: "reference", _ref: "style-soft-glam" }, artist: { _type: "reference", _ref: "artist-temilola" } } },
  { id: "transformation-3", fields: { occasion: { _type: "reference", _ref: "occasion-photoshoot" }, artist: { _type: "reference", _ref: "artist-temilola" } } },
  { id: "transformation-4", fields: { occasion: { _type: "reference", _ref: "occasion-wedding" }, weddingType: { _type: "reference", _ref: "weddingtype-traditional-wedding" }, artist: { _type: "reference", _ref: "artist-temilola" } } },
  { id: "transformation-5", fields: { style: { _type: "reference", _ref: "style-bold-glam" }, occasion: { _type: "reference", _ref: "occasion-owambe-party" }, artist: { _type: "reference", _ref: "artist-temilola" } } },
  // Blog posts
  { id: "blog-post-1", fields: { primaryService: { _type: "reference", _ref: "service-traditional" }, relatedOccasion: { _type: "reference", _ref: "occasion-wedding" } } },
  { id: "blog-post-4", fields: { primaryService: { _type: "reference", _ref: "service-traditional" }, relatedOccasion: { _type: "reference", _ref: "occasion-wedding" } } },
  { id: "blog-post-2", fields: { primaryService: { _type: "reference", _ref: "service-soft-glam" }, relatedOccasion: { _type: "reference", _ref: "occasion-owambe-party" } } },
  { id: "blog-post-9", fields: { primaryService: { _type: "reference", _ref: "service-soft-glam" }, relatedOccasion: { _type: "reference", _ref: "occasion-owambe-party" }, relatedStyle: { _type: "reference", _ref: "style-bold-glam" } } },
  { id: "blog-post-5", fields: { relatedStyle: { _type: "reference", _ref: "style-soft-glam" } } },
  { id: "blog-post-6", fields: { relatedStyle: { _type: "reference", _ref: "style-soft-glam" } } },
  // FAQs (bridal-specific only)
  { id: "faq-6", fields: { service: { _type: "reference", _ref: "service-traditional" }, occasion: { _type: "reference", _ref: "occasion-wedding" } } },
  { id: "faq-7", fields: { service: { _type: "reference", _ref: "service-traditional" }, occasion: { _type: "reference", _ref: "occasion-wedding" } } },
  { id: "faq-11", fields: { service: { _type: "reference", _ref: "service-traditional" }, occasion: { _type: "reference", _ref: "occasion-wedding" } } },
  { id: "faq-13", fields: { service: { _type: "reference", _ref: "service-traditional" }, occasion: { _type: "reference", _ref: "occasion-wedding" } } },
  { id: "faq-p3", fields: { service: { _type: "reference", _ref: "service-traditional" }, occasion: { _type: "reference", _ref: "occasion-wedding" } } },
];

// ─── Seed function ──────────────────────────────────────────────────────
//
// Safety model (see the discussion this was designed around — kept here
// so it isn't lost the next time this file is touched):
//
//   1. Every document is written with client.createIfNotExists(). If a
//      document with that _id already exists — because it was seeded
//      before, or created/edited manually in Studio — this is a complete
//      no-op. Nothing is read back and merged; nothing is ever replaced.
//      This alone guarantees the script is safe to run any number of
//      times and can never delete or overwrite existing content.
//
//   2. Taxonomy reference fields being backfilled onto documents that
//      predate the taxonomy graph (services, portfolio, testimonials,
//      transformations, blog posts, FAQs — see taxonomyPatches above) go
//      through client.patch(id).setIfMissing({...}). A field is only
//      written if it currently has no value at all, so a manual edit in
//      Studio always wins and is never touched.
//
//   3. Run with --dry-run to see the exact plan with zero writes:
//        npx tsx sanity/seed.ts --dry-run
//      The dry run and the real run share the same planning code, so the
//      preview is guaranteed to match what actually happens.

const DRY_RUN = process.argv.includes("--dry-run");

interface SeedDoc {
  _id: string;
  _type: string;
  [key: string]: unknown;
}

interface DocPlan {
  id: string;
  type: string;
  action: "create" | "skip-exists";
}

interface PatchPlanEntry {
  id: string;
  action: "patch" | "skip-already-set" | "skip-missing-target";
  fieldsPlanned: string[];
  fieldsAlreadySet: string[];
  fieldsToSet: Record<string, unknown>;
}

async function planDocs(docs: SeedDoc[]): Promise<DocPlan[]> {
  const plans: DocPlan[] = [];
  for (const doc of docs) {
    const existing = await client.getDocument(doc._id).catch(() => null);
    plans.push({ id: doc._id, type: doc._type, action: existing ? "skip-exists" : "create" });
  }
  return plans;
}

async function planPatches(patches: typeof taxonomyPatches): Promise<PatchPlanEntry[]> {
  const results: PatchPlanEntry[] = [];
  for (const p of patches) {
    const existing = await client.getDocument<Record<string, unknown>>(p.id).catch(() => null);
    if (!existing) {
      results.push({ id: p.id, action: "skip-missing-target", fieldsPlanned: Object.keys(p.fields), fieldsAlreadySet: [], fieldsToSet: {} });
      continue;
    }
    const toSet: Record<string, unknown> = {};
    const alreadySet: string[] = [];
    for (const [key, value] of Object.entries(p.fields)) {
      if (existing[key] === undefined) toSet[key] = value;
      else alreadySet.push(key);
    }
    if (Object.keys(toSet).length === 0) {
      results.push({ id: p.id, action: "skip-already-set", fieldsPlanned: [], fieldsAlreadySet: alreadySet, fieldsToSet: {} });
    } else {
      results.push({ id: p.id, action: "patch", fieldsPlanned: Object.keys(toSet), fieldsAlreadySet: alreadySet, fieldsToSet: toSet });
    }
  }
  return results;
}

async function main() {
  console.log(DRY_RUN ? "DRY RUN — no writes will be made.\n" : "Seeding Sanity...\n");

  const allDocs: SeedDoc[] = [
    siteConfig,
    ...cities,
    ...artists,
    ...makeupStyles,
    ...occasions,
    ...weddingTypes,
    ...travelZones,
    ...locations,
    ...services,
    ...portfolioItems,
    ...testimonials,
    ...faqItems,
    ...bookingSteps,
    ...whyChooseUsItems,
    ...aboutValues,
    ...pageCopyDocs,
    ...blogPosts,
    ...trainingCourses,
  ] as SeedDoc[];

  const docPlans = await planDocs(allDocs);
  const patchPlans = await planPatches(taxonomyPatches);

  const toCreate = docPlans.filter((p) => p.action === "create");
  const toSkipExisting = docPlans.filter((p) => p.action === "skip-exists");
  const toPatch = patchPlans.filter((p) => p.action === "patch");
  const toSkipPatch = patchPlans.filter((p) => p.action === "skip-already-set");
  const conflicts = patchPlans.filter((p) => p.action === "skip-missing-target");

  console.log("=== PLAN ===");

  console.log(`\nDocuments that would be CREATED (${toCreate.length}):`);
  toCreate.forEach((p) => console.log(`  + [${p.type}] ${p.id}`));

  console.log(`\nDocuments already present — SKIPPED, left untouched (${toSkipExisting.length}):`);
  toSkipExisting.forEach((p) => console.log(`  = [${p.type}] ${p.id}`));

  console.log(`\nAdditive patches that would be APPLIED (${toPatch.length}):`);
  toPatch.forEach((p) => console.log(`  ~ ${p.id} -> setIfMissing: ${p.fieldsPlanned.join(", ")}`));

  console.log(`\nPatches SKIPPED — field(s) already set, manual edits preserved (${toSkipPatch.length}):`);
  toSkipPatch.forEach((p) => console.log(`  = ${p.id} -> already has: ${p.fieldsAlreadySet.join(", ")}`));

  if (conflicts.length > 0) {
    console.log(`\n⚠ CONFLICTS / unexpected conditions (${conflicts.length}):`);
    conflicts.forEach((p) => console.log(`  ! ${p.id} -> patch target does not exist yet; skipping this patch (it will apply automatically once the document is created)`));
  } else {
    console.log(`\nConflicts / unexpected conditions: none.`);
  }

  console.log(
    `\nSummary: ${toCreate.length} would be created, ${toPatch.length} would be patched, ${toSkipExisting.length + toSkipPatch.length} left completely untouched.`
  );
  console.log(
    "No existing document will be overwritten or deleted: creates only ever apply to IDs that don't exist yet, and patches only ever fill in fields that are currently empty."
  );

  if (DRY_RUN) {
    console.log("\nDry run complete — no changes were made. Re-run without --dry-run to apply.");
    return;
  }

  console.log("\n=== APPLYING ===");

  const byId = new Map(allDocs.map((d) => [d._id, d]));
  for (const p of toCreate) {
    const doc = byId.get(p.id)!;
    await client.createIfNotExists(doc);
    console.log(`  Created: [${doc._type}] ${doc._id}`);
  }
  for (const p of toPatch) {
    await client.patch(p.id).setIfMissing(p.fieldsToSet).commit();
    console.log(`  Patched: ${p.id} -> ${p.fieldsPlanned.join(", ")}`);
  }

  console.log(
    `\nDone. Created: ${toCreate.length}, Patched: ${toPatch.length}, Left untouched: ${toSkipExisting.length + toSkipPatch.length}.`
  );
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
