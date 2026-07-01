export interface Package {
  id: string;
  name: string;
  bestFor: string;
  shortDescription: string;
  priceFrom: number;
  duration: string;
  features: string[];
  highlighted?: boolean;
}

export const packages: Package[] = [
  {
    id: "soft-glam",
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
  },
  {
    id: "event-glam",
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
  },
  {
    id: "birthday",
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
  },
  {
    id: "bridal",
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
  },
  {
    id: "bridesmaids",
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
  },
  {
    id: "home-service",
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
  },
];

export interface PricingTableRow {
  service: string;
  priceFrom: number;
  duration: string;
  included: string;
  homeService: boolean;
}

export const pricingTableData: PricingTableRow[] = [
  { service: "Bridal Makeup", priceFrom: 120000, duration: "2–3 hours", included: "Consultation, skin prep, full bridal glam, lashes, setting", homeService: true },
  { service: "Traditional Bridal", priceFrom: 130000, duration: "2–3 hours", included: "Skin prep, traditional glam, defined eyes & lips, heat-proof setting", homeService: true },
  { service: "Soft Glam", priceFrom: 35000, duration: "1.5–2 hours", included: "Skin prep, soft glam application, lash enhancement, setting spray", homeService: true },
  { service: "Event Glam", priceFrom: 45000, duration: "1.5–2 hours", included: "Skin prep, full event glam, defined features, flash-ready finish", homeService: true },
  { service: "Birthday Glam", priceFrom: 40000, duration: "1.5–2 hours", included: "Skin prep, custom glam, lash application, photo-ready setting", homeService: true },
  { service: "Photoshoot Makeup", priceFrom: 50000, duration: "1.5–2 hours", included: "HD skin prep, camera-ready base & contour, professional setting", homeService: true },
  { service: "Bridesmaids (per face)", priceFrom: 30000, duration: "1–1.5 hours", included: "Coordinated looks, skin prep, group timeline planning", homeService: true },
  { service: "Gele Styling", priceFrom: 15000, duration: "30–45 min", included: "Gele styling & securing, finishing touches", homeService: true },
  { service: "Home Service Add-on", priceFrom: 10000, duration: "Added to service", included: "Travel within Lagos, on-location setup, full kit", homeService: false },
];

export const pricingFactors = [
  "Number of faces and group size",
  "Event date and peak-season demand",
  "Venue location and travel distance",
  "Service type and add-ons (e.g. gele, trial)",
  "Early-morning or late-night call times",
];
