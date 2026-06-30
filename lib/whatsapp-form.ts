import { siteConfig } from "./site-config";
import type { BookingFormValues } from "./validations/booking";
import { getTravelZoneLabel, getTravelFee } from "@/data/travel-zones";
import { formatPrice } from "./utils";

export function buildBookingWhatsAppMessage(data: BookingFormValues): string {
  const zoneLabel = getTravelZoneLabel(data.travelZone);
  const fee = getTravelFee(data.travelZone);
  const travelLine = fee === null
    ? `Area: ${zoneLabel} (quote requested)`
    : fee === 0
      ? `Area: ${zoneLabel} (travel included)`
      : `Area: ${zoneLabel} (travel fee: ${formatPrice(fee)})`;

  return `Hello, I'd like to book a makeup session.

Name: ${data.name}
Phone: ${data.phone}
${data.email ? `Email: ${data.email}\n` : ""}Service: ${data.service}
Event Type: ${data.eventType}
Event Date: ${data.eventDate}
${travelLine}
Number of Faces: ${data.numberOfFaces}
${data.preferredTime ? `Preferred Time: ${data.preferredTime}\n` : ""}${data.message ? `Message / Inspiration: ${data.message}` : ""}`.trim();
}

export function getBookingWhatsAppUrl(data: BookingFormValues): string {
  const message = buildBookingWhatsAppMessage(data);
  return `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(message)}`;
}
