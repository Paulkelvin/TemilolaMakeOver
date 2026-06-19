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

export const pricingFactors = [
  "Number of faces and group size",
  "Event date and peak-season demand",
  "Venue location and travel distance",
  "Service type and add-ons (e.g. gele, trial)",
  "Early-morning or late-night call times",
];
