export type PortfolioCategory =
  | "Bridal"
  | "Soft Glam"
  | "Event Glam"
  | "Traditional"
  | "Photoshoot"
  | "Before & After";

export interface PortfolioItem {
  id: string;
  src: string;
  alt: string;
  category: PortfolioCategory;
  title: string;
  aspect?: "portrait" | "square" | "tall";
  service?: string;
  style?: string;
  occasion?: string;
  weddingType?: string;
  location?: string;
  artist?: string;
}

const u = (id: string, w = 900) =>
  `https://source.unsplash.com/featured/${w}x${Math.round(
    w * 1.25
  )}/?makeup,beauty,portrait&sig=${id}`;

export const portfolioItems: PortfolioItem[] = [
  {
    id: "1",
    src: u("photo-1522337360788-8b13dee7a37a"),
    alt: "Soft glam bridal makeup — Temilola Makeup Lagos",
    category: "Bridal",
    title: "Elegant Bridal Glow",
    aspect: "tall",
  },
  {
    id: "2",
    src: u("photo-1487412947147-5cebf100ffc2"),
    alt: "Event glam makeup look — Lagos makeup artist",
    category: "Soft Glam",
    title: "Romantic Soft Glam",
    aspect: "portrait",
  },
  {
    id: "3",
    src: u("photo-1596462502278-27bfdc403348"),
    alt: "Bold glam evening makeup — Temilola Makeup",
    category: "Event Glam",
    title: "Evening Event Glam",
    aspect: "square",
  },
  {
    id: "4",
    src: u("photo-1519741497674-611481863552"),
    alt: "Traditional bridal makeup — Lagos wedding",
    category: "Traditional",
    title: "Traditional Bridal",
    aspect: "tall",
  },
  {
    id: "5",
    src: u("photo-1524504388940-b1c1722653e1"),
    alt: "Photoshoot makeup — camera-ready glam",
    category: "Photoshoot",
    title: "Editorial Photoshoot",
    aspect: "portrait",
  },
  {
    id: "6",
    src: u("photo-1485893086445-ed758652e7d0"),
    alt: "Bridal soft glam — wedding makeup Lagos",
    category: "Bridal",
    title: "Classic Bridal Beauty",
    aspect: "square",
  },
  {
    id: "7",
    src: u("photo-1515377903753-eed2fbe0adbc"),
    alt: "Soft glam party makeup — event makeup artist",
    category: "Soft Glam",
    title: "Party Soft Glam",
    aspect: "portrait",
  },
  {
    id: "8",
    src: u("photo-1509964199908-096666b472b0"),
    alt: "Bold glam birthday makeup — Lagos",
    category: "Event Glam",
    title: "Birthday Statement",
    aspect: "tall",
  },
  {
    id: "9",
    src: u("photo-1492106087820-35c06a48e704"),
    alt: "Before and after makeup transformation",
    category: "Before & After",
    title: "Bridal Transformation",
    aspect: "square",
  },
  {
    id: "10",
    src: u("photo-1515886657613-9f3525f0cc0b"),
    alt: "Photoshoot glam makeup — professional artist",
    category: "Photoshoot",
    title: "Fashion Forward",
    aspect: "portrait",
  },
  {
    id: "11",
    src: u("photo-1531746020798-e6953c6e8e04"),
    alt: "Traditional wedding glam — Nigerian bride",
    category: "Traditional",
    title: "Cultural Elegance",
    aspect: "tall",
  },
  {
    id: "12",
    src: u("photo-1580618672591-eb180b1a973f"),
    alt: "Before and after soft glam transformation",
    category: "Before & After",
    title: "Soft Glam Reveal",
    aspect: "portrait",
  },
];

export const portfolioCategories: PortfolioCategory[] = [
  "Bridal",
  "Soft Glam",
  "Event Glam",
  "Traditional",
  "Photoshoot",
  "Before & After",
];
