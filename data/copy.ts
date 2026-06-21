/**
 * Website copy — single source for UX text.
 * CMS-ready: replace with Sanity document fields later.
 */

import { siteConfig } from "@/lib/site-config";

const location = siteConfig.location.split(",")[0]; // Lagos

export const seoCopy = {
  home: {
    title: `${siteConfig.brand} | Bridal & Event Makeup Artist in ${location}`,
    description: `Book professional bridal, soft glam, and event makeup in ${location}. Home service available. View real client looks, packages, and check availability for your date.`,
  },
  services: {
    title: `Makeup Services in ${location}`,
    description: `Bridal makeup, traditional glam, soft glam, event makeup, photoshoot glam, and home service in ${location}. See what's included and book your session.`,
  },
  portfolio: {
    title: `Makeup Portfolio & Client Looks`,
    description: `Browse bridal, soft glam, event, traditional, and photoshoot makeup by Temilola — professional makeup artist in ${location}.`,
  },
  pricing: {
    title: `Makeup Packages & Pricing`,
    description: `Transparent starting prices for bridal, event, and soft glam makeup in ${location}. Home service and group bookings available. Request your custom quote.`,
  },
  book: {
    title: `Book Your Makeup Session`,
    description: `Check availability and book bridal or event makeup in ${location}. WhatsApp or booking form — fast, simple, professional.`,
  },
  about: {
    title: `About Temilola`,
    description: `Meet Temilola — bridal and event makeup artist in ${location}. Calm, professional glam tailored to your face, your outfit, and your moment.`,
  },
} as const;

export const homeCopy = {
  hero: {
    eyebrow: `Premium Makeup Artist · ${location}`,
    headline: "Bridal & Event Makeup That Makes You Feel Effortlessly Confident",
    subheadline:
      "Soft, elegant makeup in Lagos — skin-prep focused, camera-ready, and designed to last beautifully from your first photo to your last dance.",
    trustLine: `Trusted for bridal, event, and photoshoot glam across ${siteConfig.serviceArea}.`,
    badges: [
      "Bridal Specialist",
      "Soft Glam",
      "Home Service",
      location,
    ],
    primaryCta: "Check Availability",
    secondaryCta: "Book Your Transformation",
  },
  trustStrip: [
    "Bridal Glam",
    "Event Makeup",
    "Home Service Available",
    `Based in ${location}`,
    "Soft Glam Specialist",
  ],
  portfolio: {
    label: "Portfolio",
    headline: "Looks Created for Real Celebrations",
    paragraph:
      "Every face tells a different story. Browse bridal, soft glam, and event looks — then imagine yours.",
    cta: "View Full Portfolio",
    footnote: "Real clients. Real events. No filters on confidence.",
  },
  services: {
    label: "Services",
    headline: "Glam for Every Special Moment",
    intro:
      "Bridal, event, birthday, and photoshoot makeup tailored to your look, timeline, and venue.",
    cardCta: "Book This Service",
  },
  whyChooseUs: {
    label: "Why Temilola",
    headline: "Calm Service. Flawless, Camera-Ready Results.",
    paragraph:
      "Precision prep, clean tools, and looks tailored to your face and event.",
  },
  beforeAfter: {
    label: "Transformations",
    headline: "From Fresh Skin to a Finish That Holds",
    paragraph:
      "Every session begins with thoughtful skin prep, then builds into a polished look that enhances your features — never masks them.",
    cta: "Book Your Transformation",
  },
  testimonials: {
    label: "Client Love",
    headline: "Words From Brides, Birthday Girls & Event Clients",
    intro: "The calmest part of their getting-ready? Often the makeup chair.",
    ctaIntro: "Ready to feel that prepared?",
    cta: "Check Availability",
  },
  pricing: {
    label: "Packages",
    headline: "Clear Starting Points. No Surprises on the Basics.",
    intro:
      "Packages help you plan — your final quote reflects your date, location, and how many faces we're glamming.",
    note: siteConfig.pricingDisclaimer,
    cta: "View All Packages",
  },
  bookingProcess: {
    label: "How Booking Works",
    headline: "Three Steps to Your Glam Date",
    intro: "Simple, clear, and handled with care from first message to confirmed booking.",
    cta: "Start Your Booking",
  },
  faq: {
    label: "FAQ",
    headline: "Questions Before You Book",
    subtitle: "Straight answers — so you can decide with confidence.",
  },
  finalCta: {
    eyebrow: "Your Date Is Waiting",
    headline: "Ready to Reserve Your Glam Session?",
    paragraph:
      "Tell me your date, your event, and the look you're dreaming of. I'll confirm availability and guide you through the next steps.",
    primaryCta: "Check Availability",
    secondaryCta: "Book on WhatsApp",
  },
} as const;

export const servicesPageCopy = {
  hero: {
    label: "Services",
    title: "Makeup Services for Every Kind of Special Day",
    subtitle:
      "From quiet bridal mornings to high-energy celebrations — each service is built around how you need to look, feel, and last.",
  },
  intro: {
    title: "Not Sure Which Service Fits?",
    body: "Bridal and traditional bookings include the fullest experience. Soft glam suits engagements and parties. Event glam is for when you want more definition. Send your date and occasion — I'll recommend the right fit.",
  },
  finalCta: {
    headline: "Know Your Date? Let's Secure Your Glam",
    subtitle: "Share your event details on WhatsApp or through the booking form.",
  },
} as const;

export const portfolioPageCopy = {
  hero: {
    label: "Portfolio",
    title: "A Curated Gallery of Client Glam",
    subtitle:
      "Filter by style, study the details, and picture how your own look could come together.",
  },
  intro:
    "These are real sessions — bridal, traditional, soft glam, events, and shoots across Lagos. Tap any look to view larger, or message me to book something similar.",
  galleryCta: "Book This Look",
  midCta: {
    text: "Love this style? Check availability for your date.",
    button: "Check Availability",
  },
} as const;

export const pricingPageCopy = {
  hero: {
    label: "Pricing",
    title: "Packages That Help You Plan Ahead",
    subtitle:
      "Starting prices for the most requested looks. Your custom quote reflects travel, timing, and party size.",
  },
  explanation: {
    title: "How Pricing Works",
    body: "I believe in clarity upfront. Packages show where your investment begins — we'll confirm the full amount once I know your venue, date, and exact requirements.",
  },
  deposit: {
    title: "Securing Your Date",
    body: siteConfig.depositNote + " You'll receive confirmation and prep guidance once your deposit is received.",
  },
  travel: {
    title: "Home Service & Travel",
    body: `I travel across ${siteConfig.serviceArea} with a full professional kit. A travel fee may apply based on distance and timing.`,
  },
  finalCta: {
    headline: "Need a Quote for Your Exact Event?",
    subtitle: "Send your date, location, and number of faces — I'll respond with availability and pricing.",
    cta: "Request a Custom Quote",
  },
} as const;

export const aboutPageCopy = {
  hero: {
    label: "About",
    title: "The Artist Behind the Brush",
    subtitle:
      "Temilola — Lagos makeup artist devoted to making women feel prepared, polished, and genuinely themselves.",
  },
  intro: {
    title: "Makeup Should Feel Like You — Just Elevated",
    paragraphs: [
      "I'm Temilola, a professional makeup artist based in Lagos, specialising in bridal, traditional, soft glam, and event makeup.",
      "I started this work because I love the quiet confidence that appears when someone looks in the mirror and recognises themselves — just more radiant. That moment matters whether it's a wedding morning or a milestone birthday.",
      "On your day, I bring calm energy, punctual timing, and a kit that's clean, organised, and ready. No chaos. No rushing. Just focused glam that holds up to photos, dancing, and emotion.",
    ],
  },
  philosophy: {
    label: "Philosophy",
    title: "What Guides Every Session",
  },
  trust: {
    title: "Why Clients Book Again",
    body: "Brides refer their bridesmaids. Birthday clients return for the next celebration. It's not hype — it's consistency: prep, hygiene, communication, and a finish that still looks beautiful hours later.",
  },
  cta: "Check Availability",
} as const;

export const bookPageCopy = {
  hero: {
    label: "Book Now",
    title: "Let's Find a Date for Your Glam",
    subtitle:
      "The fastest way to hear back is WhatsApp. Prefer a form? Fill it in below — I'll confirm availability within 24 hours.",
  },
  form: {
    title: "Booking Request Form",
    intro: "Share a few details about your event. Required fields are marked — everything else helps me prepare your quote.",
    submitCta: "Submit Booking Request",
    whatsappCta: "Send Details on WhatsApp",
  },
  whatsappCard: {
    title: "Prefer WhatsApp?",
    body: "Send your name, date, location, and the service you need. Most inquiries get a reply the same day during business hours.",
    cta: "Send Booking Details",
  },
  afterSubmit: {
    title: "What Happens Next",
    steps: [
      "I review your date and service request.",
      "You receive availability confirmation and a quote if needed.",
      "Secure your booking with a deposit — then we prep for your day.",
    ],
  },
  success:
    "Your booking request has been received. We'll confirm availability and send the next steps shortly.",
} as const;

export const ctaBank = {
  whatsapp: [
    "Book on WhatsApp",
    "Send Booking Details",
    "Message on WhatsApp",
    "Chat to Book",
    "Reserve via WhatsApp",
    "Check Dates on WhatsApp",
    "Start on WhatsApp",
  ],
  booking: [
    "Check Availability",
    "Reserve Your Date",
    "Start Your Booking",
    "Request a Quote",
    "Book Your Session",
    "Secure Your Date",
    "Book This Service",
    "Submit Booking Request",
  ],
  portfolio: [
    "View Makeup Looks",
    "View Full Portfolio",
    "Book This Look",
    "See More Looks",
    "Browse the Gallery",
  ],
  pricing: [
    "Request a Custom Quote",
    "View All Packages",
    "Get Your Quote",
    "See Package Details",
  ],
  bridal: [
    "Book Bridal Makeup",
    "Reserve Your Wedding Date",
    "Plan Your Bridal Look",
    "Book a Bridal Trial",
  ],
  final: [
    "Check Availability",
    "Book on WhatsApp",
    "Reserve Your Glam Session",
    "Let's Plan Your Look",
  ],
} as const;
