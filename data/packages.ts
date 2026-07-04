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
  { service: "Bridesmaids (per face)", priceFrom: 30000, duration: "1–1.5 hours", included: "Coordinated looks, skin prep, group timeline planning", homeService: true },
];

export const pricingStartingFrom = 30000;

export const pricingFactors = [
  "Number of faces and group size",
  "Event date and peak-season demand",
  "Venue location and travel distance",
];
