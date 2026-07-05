export interface TravelZone {
  id: string;
  label: string;
  areas: string[];
  fee: number;
  note?: string;
}

export const travelZones: TravelZone[] = [
  {
    id: "island-central",
    label: "Lekki / VI / Ikoyi",
    areas: ["Lekki Phase 1", "Lekki Phase 2", "Victoria Island", "Ikoyi", "Oniru", "Banana Island", "Parkview Estate"],
    fee: 0,
  },
  {
    id: "island-extended",
    label: "Ajah / Sangotedo / Chevron",
    areas: ["Ajah", "Sangotedo", "Chevron", "Ikota", "VGC", "Abraham Adesanya", "Osapa London", "Agungi", "Ilasan", "Idado", "Awoyaya"],
    fee: 35000,
  },
  {
    id: "ikeja-axis",
    label: "Ikeja / GRA / Magodo",
    areas: ["Ikeja", "Ikeja GRA", "Maryland", "Ojodu", "Magodo", "Omole", "Berger", "Opebi", "Allen Avenue", "Alausa", "Ogba", "Agidingbi"],
    fee: 20000,
  },
  {
    id: "mainland-central",
    label: "Yaba / Surulere / Gbagada",
    areas: ["Yaba", "Surulere", "Gbagada", "Shomolu", "Bariga", "Ogudu", "Akoka", "Palmgrove", "Ebute Metta"],
    fee: 20000,
  },
  {
    id: "mainland-extended",
    label: "Festac / Amuwo / Oshodi",
    areas: ["Festac", "Amuwo-Odofin", "Oshodi", "Isolo", "Egbeda", "Idimu", "Satellite Town", "Okota", "Ejigbo"],
    fee: 20000,
  },
  {
    id: "outskirts",
    label: "Ikorodu / Epe / Badagry",
    areas: ["Ikorodu", "Epe", "Badagry", "Alimosho", "Agbara", "Igbogbo", "Ijede"],
    fee: 30000,
  },
  {
    id: "outside-lagos",
    label: "Outside Lagos (Ibadan, Abeokuta, etc.)",
    areas: ["Ibadan", "Abeokuta", "Ogun State", "and other locations"],
    fee: -1,
    note: "Travel fee quoted separately — includes transport + accommodation if needed",
  },
];

export function getTravelFee(zoneId: string): number | null {
  const zone = travelZones.find((z) => z.id === zoneId);
  if (!zone) return null;
  if (zone.fee === -1) return null;
  return zone.fee;
}

export function getTravelZoneLabel(zoneId: string): string {
  return travelZones.find((z) => z.id === zoneId)?.label ?? zoneId;
}
