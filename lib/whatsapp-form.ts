import { siteConfig } from "./site-config";
import type { BookingFormValues } from "./validations/booking";

export function buildBookingWhatsAppMessage(data: BookingFormValues): string {
  return `Hello, I'd like to book a makeup session.

Name: ${data.name}
Phone: ${data.phone}
${data.email ? `Email: ${data.email}\n` : ""}Service: ${data.service}
Event Type: ${data.eventType}
Event Date: ${data.eventDate}
Location: ${data.eventLocation}
Number of Faces: ${data.numberOfFaces}
${data.preferredTime ? `Preferred Time: ${data.preferredTime}\n` : ""}${data.message ? `Message / Inspiration: ${data.message}` : "Preferred Look:"}`;
}

export function getBookingWhatsAppUrl(data: BookingFormValues): string {
  const message = buildBookingWhatsAppMessage(data);
  return `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(message)}`;
}
