import { siteConfig } from "@/lib/site-config";

export interface LocationPage {
  slug: string;
  name: string;
  areas: string[];
  travelFee: number | null;
  headline: string;
  subtitle: string;
  seoTitle: string;
  seoDescription: string;
  intro: string[];
  keywords: string[];
}

export const locations: LocationPage[] = [
  {
    slug: "lekki",
    name: "Lekki",
    areas: ["Lekki Phase 1", "Lekki Phase 2", "Chevron", "Ikota", "VGC", "Abraham Adesanya", "Ajah", "Sangotedo"],
    travelFee: 0,
    headline: "Professional Makeup Artist in Lekki, Lagos",
    subtitle:
      "Soft glam, event, and bridal makeup — delivered to your doorstep in Lekki Phase 1, Phase 2, Chevron, Ajah, and Sangotedo.",
    seoTitle: "Makeup Artist in Lekki Lagos — Soft Glam, Event & Bridal",
    seoDescription:
      `Book a professional makeup artist in Lekki, Lagos. ${siteConfig.brand} offers soft glam, event glam, and bridal makeup, plus traditional wedding makeup, with home service across Lekki Phase 1, Phase 2, Ajah, Chevron, and VGC.`,
    intro: [
      `Looking for a reliable makeup artist in Lekki? ${siteConfig.brand} brings professional soft glam, event, and bridal makeup directly to you — whether you're getting ready at home, a hotel, or a venue anywhere in Lekki.`,
      "From intimate Lekki Phase 1 apartments to grand Ajah venues, every session starts with careful skin prep and ends with a camera-ready finish designed to last through your entire event.",
    ],
    keywords: [
      "makeup artist in Lekki",
      "bridal makeup artist Lekki",
      "makeup artist Lekki Phase 1",
      "makeup artist Ajah Lagos",
      "home service makeup Lekki",
      "wedding makeup artist Lekki",
      "soft glam makeup Lekki",
      "event makeup Lekki Lagos",
      "makeup artist near me Lekki",
      "makeup artist Chevron Lagos",
      "makeup artist VGC Lagos",
      "makeup artist Sangotedo",
    ],
  },
  {
    slug: "victoria-island",
    name: "Victoria Island",
    areas: ["Victoria Island", "Ikoyi", "Oniru", "Banana Island"],
    travelFee: 0,
    headline: "Makeup Artist in Victoria Island & Ikoyi, Lagos",
    subtitle:
      "Luxury soft glam, event, and bridal makeup for VI, Ikoyi, Oniru, and Banana Island — with punctual home service and a polished, lasting finish.",
    seoTitle: "Makeup Artist in Victoria Island Lagos — Luxury Glam & Bridal",
    seoDescription:
      `Book a professional makeup artist in Victoria Island, Lagos. ${siteConfig.brand} provides soft glam, event, and bridal makeup with home service across VI, Ikoyi, Oniru, and Banana Island.`,
    intro: [
      `${siteConfig.brand} provides luxury makeup services across Victoria Island, Ikoyi, and Oniru. Whether it's a bridal morning at a VI hotel or a private event in Banana Island, expect calm, professional service from start to finish.`,
      "Victoria Island clients appreciate punctuality, discretion, and a finish that photographs beautifully under any lighting. That's exactly what every session delivers — skin-prep focused, camera-ready glam.",
    ],
    keywords: [
      "makeup artist Victoria Island Lagos",
      "makeup artist VI Lagos",
      "bridal makeup Victoria Island",
      "makeup artist Ikoyi Lagos",
      "luxury makeup artist Lagos",
      "wedding makeup Victoria Island",
      "event makeup artist VI",
      "makeup artist Oniru",
      "makeup artist Banana Island",
      "home service makeup Victoria Island",
      "soft glam makeup VI Lagos",
    ],
  },
  {
    slug: "ikeja",
    name: "Ikeja",
    areas: ["Ikeja", "Ikeja GRA", "Maryland", "Ojodu", "Magodo", "Omole", "Berger"],
    travelFee: 10000,
    headline: "Makeup Artist in Ikeja & GRA, Lagos",
    subtitle:
      "Professional soft glam, event, and bridal makeup with home service across Ikeja, GRA, Maryland, Magodo, and Omole.",
    seoTitle: "Makeup Artist in Ikeja Lagos — Event, Soft Glam & Bridal",
    seoDescription:
      `Book a makeup artist in Ikeja, Lagos. ${siteConfig.brand} offers soft glam, event glam, and bridal makeup, plus traditional wedding makeup, with home service across Ikeja GRA, Maryland, Magodo, Omole, and Ojodu.`,
    intro: [
      `Need a professional makeup artist in Ikeja? ${siteConfig.brand} covers Ikeja GRA, Maryland, Magodo, Omole, Ojodu, and Berger — bringing a full professional kit directly to your home or venue.`,
      "Ikeja is one of the busiest wedding and event hubs in Lagos. From traditional engagement ceremonies at Ikeja GRA halls to birthday celebrations in Magodo, every session is tailored to your skin tone, outfit, and event timeline.",
    ],
    keywords: [
      "makeup artist in Ikeja",
      "bridal makeup artist Ikeja",
      "makeup artist Ikeja GRA",
      "wedding makeup artist Ikeja Lagos",
      "makeup artist Maryland Lagos",
      "makeup artist Magodo",
      "home service makeup Ikeja",
      "event makeup Ikeja Lagos",
      "traditional makeup artist Ikeja",
      "makeup artist Omole Lagos",
      "makeup artist Ojodu Berger",
      "soft glam makeup Ikeja",
    ],
  },
  {
    slug: "surulere",
    name: "Surulere & Yaba",
    areas: ["Surulere", "Yaba", "Gbagada", "Shomolu", "Bariga", "Ogudu"],
    travelFee: 10000,
    headline: "Makeup Artist in Surulere, Yaba & Gbagada, Lagos",
    subtitle:
      "Soft glam, event, and bridal makeup with home service in Surulere, Yaba, Gbagada, Shomolu, and surrounding areas.",
    seoTitle: "Makeup Artist in Surulere & Yaba Lagos — Event & Soft Glam",
    seoDescription:
      `Book a professional makeup artist in Surulere and Yaba, Lagos. ${siteConfig.brand} offers soft glam, event glam, and bridal makeup with home service across Surulere, Yaba, Gbagada, Shomolu, and Ogudu.`,
    intro: [
      `${siteConfig.brand} brings professional makeup services to Surulere, Yaba, Gbagada, and the wider Lagos mainland. Home service means you don't have to worry about traffic — the artist comes to you, fully equipped and on schedule.`,
      "Whether you're preparing for a wedding at a Surulere event hall, a birthday dinner in Gbagada, or a photoshoot in Yaba, expect polished, long-lasting makeup built on proper skin prep.",
    ],
    keywords: [
      "makeup artist Surulere Lagos",
      "makeup artist Yaba Lagos",
      "bridal makeup Surulere",
      "makeup artist Gbagada",
      "event makeup artist Surulere",
      "wedding makeup Yaba Lagos",
      "home service makeup Surulere",
      "makeup artist Shomolu",
      "makeup artist mainland Lagos",
      "soft glam makeup Surulere",
      "makeup artist near me Yaba",
    ],
  },
  {
    slug: "festac",
    name: "Festac & Amuwo-Odofin",
    areas: ["Festac", "Amuwo-Odofin", "Oshodi", "Isolo", "Egbeda", "Idimu"],
    travelFee: 15000,
    headline: "Makeup Artist in Festac, Oshodi & Amuwo-Odofin, Lagos",
    subtitle:
      "Professional soft glam, event, and bridal makeup with home service across Festac, Amuwo-Odofin, Oshodi, Isolo, and Egbeda.",
    seoTitle: "Makeup Artist in Festac & Oshodi Lagos — Event & Soft Glam",
    seoDescription:
      `Book a professional makeup artist in Festac and Oshodi, Lagos. ${siteConfig.brand} offers soft glam, event glam, and bridal makeup, plus traditional wedding makeup, with home service across Festac, Amuwo-Odofin, Isolo, Egbeda, and Idimu.`,
    intro: [
      `Serving Festac, Amuwo-Odofin, Oshodi, Isolo, and surrounding areas — ${siteConfig.brand} brings full professional makeup to your doorstep so you can focus on enjoying your day.`,
      "From church wedding mornings in Festac to traditional ceremonies in Egbeda, every session includes thorough skin prep, clean professional tools, and a finish that holds up to Lagos heat and celebration.",
    ],
    keywords: [
      "makeup artist Festac Lagos",
      "makeup artist Amuwo-Odofin",
      "bridal makeup Festac",
      "makeup artist Oshodi Lagos",
      "wedding makeup Festac Lagos",
      "event makeup Oshodi",
      "home service makeup Festac",
      "makeup artist Isolo Lagos",
      "makeup artist Egbeda",
      "soft glam makeup Festac",
      "makeup artist near me Festac",
    ],
  },
  {
    slug: "ikorodu",
    name: "Ikorodu & Epe",
    areas: ["Ikorodu", "Epe", "Badagry", "Alimosho", "Agbara"],
    travelFee: 20000,
    headline: "Makeup Artist in Ikorodu, Epe & Badagry, Lagos",
    subtitle:
      "Professional soft glam, event, and bridal makeup — now available with home service in Ikorodu, Epe, Badagry, Alimosho, and Agbara.",
    seoTitle: "Makeup Artist in Ikorodu & Epe Lagos — Event & Soft Glam Makeup",
    seoDescription:
      `Book a professional makeup artist in Ikorodu and Epe, Lagos. ${siteConfig.brand} provides soft glam, event glam, and bridal makeup, plus traditional wedding makeup, with home service in Ikorodu, Epe, Badagry, Alimosho, and Agbara.`,
    intro: [
      `${siteConfig.brand} extends professional makeup services to Ikorodu, Epe, Badagry, Alimosho, and Agbara. Distance shouldn't keep you from looking and feeling your best on your special day.`,
      "Every booking includes a dedicated timeline, full professional kit, and the same standard of skin prep and camera-ready finish that clients across Lagos trust — no matter the location.",
    ],
    keywords: [
      "makeup artist Ikorodu Lagos",
      "makeup artist Epe Lagos",
      "bridal makeup Ikorodu",
      "makeup artist Badagry Lagos",
      "wedding makeup Ikorodu",
      "event makeup Epe Lagos",
      "home service makeup Ikorodu",
      "makeup artist Alimosho Lagos",
      "traditional makeup Ikorodu",
      "makeup artist near me Ikorodu",
      "soft glam makeup Epe",
    ],
  },
];

export function getLocationBySlug(slug: string): LocationPage | undefined {
  return locations.find((l) => l.slug === slug);
}
