import { siteConfig } from "./site-config";

export type WhatsAppIntent =
  | "availability"
  | "booking"
  | "quote"
  | "reserve"
  | "service"
  | "look";

interface WhatsAppOptions {
  intent?: WhatsAppIntent;
  service?: string;
  look?: string;
}

const templates: Record<WhatsAppIntent, string> = {
  availability: `Hello ${siteConfig.shortBrand}, I'd like to check availability for a makeup session.

Name:
Service:
Event Date:
Location:
Number of Faces:
Preferred Look:`,
  booking: `Hello, I'd like to book a makeup session.

Name:
Service:
Event Date:
Location:
Number of Faces:
Preferred Look:`,
  quote: `Hello, I'd like to request a quote for makeup services.

Name:
Service:
Event Date:
Location:
Number of Faces:
Preferred Look:`,
  reserve: `Hello, I'd like to reserve my date for makeup services.

Name:
Service:
Event Date:
Location:
Number of Faces:
Preferred Look:`,
  service: `Hello, I'd like to book the following service:

Service: {service}
Name:
Event Date:
Location:
Number of Faces:
Preferred Look:`,
  look: `Hello, I love this makeup look from your portfolio!

Look: {look}
Name:
Event Date:
Location:
Number of Faces:`,
};

export function buildWhatsAppUrl(options: WhatsAppOptions = {}): string {
  const intent = options.intent ?? "booking";
  let message = templates[intent];

  if (intent === "service" && options.service) {
    message = message.replace("{service}", options.service);
  }
  if (intent === "look" && options.look) {
    message = message.replace("{look}", options.look);
  }

  const encoded = encodeURIComponent(message);
  return `https://wa.me/${siteConfig.whatsapp}?text=${encoded}`;
}
