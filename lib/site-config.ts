export const siteConfig = {
  brand: "Temilola Makeup",
  brandName: "Temilola Makeup",
  artistName: "Temilola",
  shortBrand: "Temilola",
  whatsappNumber: "2347058596531",
  tagline: "Bridal & Event Makeup That Makes You Feel Effortlessly Confident",
  description:
    "Book professional bridal, soft glam, and event makeup in Lagos. Home service available. View real client looks, packages, and check availability for your date.",
  usp: [
    "Soft glam specialist",
    "Bridal & traditional wedding experience",
    "Home service across Lagos",
    "Skin-prep focused, camera-ready finish",
    "Calm, punctual wedding-morning service",
  ],
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://temilolomakeup.com",
  location: "Lagos, Nigeria",
  serviceArea: "Lagos & nearby areas (Ikeja, Lekki, Victoria Island, Mainland)",
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
} as const;

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
  { href: "/book", label: "Book" },
] as const;
