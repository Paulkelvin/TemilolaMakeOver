import { siteConfig } from "./site-config";
import type { BookingFormValues } from "./validations/booking";
import type { TravelZone } from "@/data/travel-zones";
import { travelZones as defaultZones } from "@/data/travel-zones";
import { formatPrice } from "./utils";

export function buildBookingWhatsAppMessage(
  data: BookingFormValues,
  zones?: TravelZone[]
): string {
  const allZones = zones?.length ? zones : defaultZones;
  const zone = allZones.find((z) => z.id === data.travelZone);
  const zoneLabel = zone?.label ?? data.travelZone;
  const fee = zone ? (zone.fee === -1 ? null : zone.fee) : null;
  const travelLine =
    fee === null
      ? `Area: ${zoneLabel} (quote requested)`
      : fee === 0
        ? `Area: ${zoneLabel} (travel included)`
        : `Area: ${zoneLabel} (travel fee: ${formatPrice(fee)})`;

  return `Hello, I'd like to book a makeup session.

Name: ${data.name}
Phone: ${data.phone}
Service: ${data.service}
Event Date: ${data.eventDate}
${travelLine}
Number of Faces: ${data.numberOfFaces}
${data.preferredTime ? `Preferred Time: ${data.preferredTime}\n` : ""}${data.message ? `Message / Inspiration: ${data.message}` : ""}`.trim();
}

export function getBookingWhatsAppUrl(
  data: BookingFormValues,
  zones?: TravelZone[]
): string {
  const message = buildBookingWhatsAppMessage(data, zones);
  return `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(message)}`;
}
