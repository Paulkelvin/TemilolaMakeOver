import {
  Camera,
  Crown,
  Home,
  Palette,
  PartyPopper,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface Service {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  whoFor: string;
  bestFor: string;
  included: string[];
  duration: string;
  homeService: boolean;
  priceFrom?: number;
  icon: LucideIcon;
}

export const services: Service[] = [
  {
    id: "bridal",
    name: "Bridal Makeup",
    slug: "bridal-makeup",
    shortDescription:
      "Elegant wedding-day makeup that stays flawless from vows to the last dance.",
    description:
      "Your wedding morning deserves calm, focused artistry. I build a seamless base, define your features softly, and set everything for hours of photos, tears, and celebration.",
    whoFor: "Brides who want a timeless, photo-ready look that still feels like them.",
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
    icon: Crown,
  },
  {
    id: "traditional",
    name: "Traditional Bridal Makeup",
    slug: "traditional-bridal",
    shortDescription:
      "Rich, radiant glam honouring cultural colour and ceremony.",
    description:
      "Traditional weddings call for definition, warmth, and longevity. I create looks that complement your outfit, gele, and jewellery — bold enough for ceremony, refined enough for portraits.",
    whoFor: "Brides at traditional weddings, engagements, and cultural celebrations.",
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
    icon: Sparkles,
  },
  {
    id: "soft-glam",
    name: "Soft Glam",
    slug: "soft-glam",
    shortDescription:
      "Romantic, blended glam that enhances — never overpowers — your features.",
    description:
      "Soft glam is my signature: diffused contour, glowing skin, and lashes that open the eyes without heaviness. Perfect when you want to look polished and feminine, not overdone.",
    whoFor: "Bridesmaids, guests, and anyone who wants an effortless elevated look.",
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
    icon: Palette,
  },
  {
    id: "event",
    name: "Event Glam",
    slug: "event-glam",
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
    icon: PartyPopper,
  },
  {
    id: "birthday",
    name: "Birthday Glam",
    slug: "birthday-makeup",
    shortDescription:
      "Birthday-ready makeup matched to your outfit, venue, and vibe.",
    description:
      "Whether you want soft and pretty or bold and celebratory, I tailor your look to your theme. You'll feel photo-ready the moment you walk in.",
    whoFor: "Birthday celebrants at any age — milestone parties and intimate dinners.",
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
    icon: Sparkles,
  },
  {
    id: "photoshoot",
    name: "Photoshoot Makeup",
    slug: "photoshoot-makeup",
    shortDescription:
      "HD makeup that translates cleanly on camera, screen, and print.",
    description:
      "Studio lights and outdoor sun demand different techniques. I adjust coverage, contour, and finish so your skin looks smooth and dimensional — not flat — in every frame.",
    whoFor: "Creators, models, professionals, and anyone investing in quality images.",
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
    icon: Camera,
  },
  {
    id: "home",
    name: "Home Service Makeup",
    slug: "home-service",
    shortDescription:
      "Full salon-quality glam at your home, hotel, or venue.",
    description:
      "Skip the traffic and get ready where you're comfortable. I arrive with a complete kit and set up efficiently — ideal for bridal parties and early-morning weddings.",
    whoFor: "Anyone who values privacy, convenience, or a relaxed getting-ready experience.",
    bestFor: "Bridal prep · Hotel getting-ready · Private residence",
    included: [
      "Travel to your location in Lagos",
      "Full professional kit & setup",
      "Same standard as studio service",
    ],
    duration: "Based on chosen service",
    homeService: true,
    priceFrom: 10000,
    icon: Home,
  },
  {
    id: "group",
    name: "Bridesmaids / Group Booking",
    slug: "group-booking",
    shortDescription:
      "Coordinated looks for your party — efficient timing, consistent quality.",
    description:
      "I plan a schedule that keeps everyone calm and on time. Looks can match or complement — each face still suits the individual wearing it.",
    whoFor: "Bridesmaids, mothers of the bride, flower girls, and group celebrations.",
    bestFor: "Bridal party · Family event · Group birthday",
    included: [
      "Per-face makeup application",
      "Coordinated look planning",
      "Timed schedule for the group",
    ],
    duration: "1–1.5 hours per face",
    homeService: true,
    priceFrom: 30000,
    icon: Users,
  },
  {
    id: "gele",
    name: "Gele Styling",
    slug: "gele-styling",
    shortDescription:
      "Expert gele tying to complete your traditional bridal ensemble.",
    description:
      "A beautifully tied gele elevates your entire look. I style to complement your face shape, outfit, and makeup — secure enough to last the full ceremony.",
    whoFor: "Traditional brides and guests wearing gele for cultural events.",
    bestFor: "Traditional wedding · Engagement · Cultural event",
    included: ["Gele styling & securing", "Finishing touches with your look"],
    duration: "30–45 minutes",
    homeService: true,
    priceFrom: 15000,
    icon: Crown,
  },
];
