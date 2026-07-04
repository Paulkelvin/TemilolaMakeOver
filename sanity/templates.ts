import type { Template } from "sanity";

// One-click starting points for the 7 known Lagos travel zones — pre-fills
// the zone name, its known areas, and its usual fee, all still editable.
export const travelZoneTemplates: Template[] = [
  {
    id: "travelZone-island-central",
    title: "Lekki / VI / Ikoyi",
    schemaType: "travelZone",
    value: {
      label: "Lekki / VI / Ikoyi",
      areas: ["Lekki Phase 1", "Lekki Phase 2", "Victoria Island", "Ikoyi", "Oniru", "Banana Island", "Parkview Estate"],
      fee: 0,
    },
  },
  {
    id: "travelZone-island-extended",
    title: "Ajah / Sangotedo / Chevron",
    schemaType: "travelZone",
    value: {
      label: "Ajah / Sangotedo / Chevron",
      areas: ["Ajah", "Sangotedo", "Chevron", "Ikota", "VGC", "Abraham Adesanya", "Osapa London", "Agungi", "Ilasan", "Idado", "Awoyaya"],
      fee: 5000,
    },
  },
  {
    id: "travelZone-ikeja-axis",
    title: "Ikeja / GRA / Magodo",
    schemaType: "travelZone",
    value: {
      label: "Ikeja / GRA / Magodo",
      areas: ["Ikeja", "Ikeja GRA", "Maryland", "Ojodu", "Magodo", "Omole", "Berger", "Opebi", "Allen Avenue", "Alausa", "Ogba", "Agidingbi"],
      fee: 10000,
    },
  },
  {
    id: "travelZone-mainland-central",
    title: "Yaba / Surulere / Gbagada",
    schemaType: "travelZone",
    value: {
      label: "Yaba / Surulere / Gbagada",
      areas: ["Yaba", "Surulere", "Gbagada", "Shomolu", "Bariga", "Ogudu", "Akoka", "Palmgrove", "Ebute Metta"],
      fee: 10000,
    },
  },
  {
    id: "travelZone-mainland-extended",
    title: "Festac / Amuwo / Oshodi",
    schemaType: "travelZone",
    value: {
      label: "Festac / Amuwo / Oshodi",
      areas: ["Festac", "Amuwo-Odofin", "Oshodi", "Isolo", "Egbeda", "Idimu", "Satellite Town", "Okota", "Ejigbo"],
      fee: 15000,
    },
  },
  {
    id: "travelZone-outskirts",
    title: "Ikorodu / Epe / Badagry",
    schemaType: "travelZone",
    value: {
      label: "Ikorodu / Epe / Badagry",
      areas: ["Ikorodu", "Epe", "Badagry", "Alimosho", "Agbara", "Igbogbo", "Ijede"],
      fee: 20000,
    },
  },
  {
    id: "travelZone-outside-lagos",
    title: "Outside Lagos (Ibadan, Abeokuta, etc.)",
    schemaType: "travelZone",
    value: {
      label: "Outside Lagos (Ibadan, Abeokuta, etc.)",
      areas: ["Ibadan", "Abeokuta", "Ogun State", "and other locations"],
      fee: -1,
      note: "Travel fee quoted separately — includes transport + accommodation if needed",
    },
  },
];
