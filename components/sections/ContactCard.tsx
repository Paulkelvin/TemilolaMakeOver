import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { bookPageCopy } from "@/data/copy";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { WhatsAppButton } from "@/components/ui/Button";
import { analyticsEvents } from "@/lib/analytics";

export function ContactCard() {
  const copy = bookPageCopy.whatsappCard;
  const whatsappUrl = buildWhatsAppUrl({ intent: "booking" });

  return (
    <div className="rounded-2xl border border-border bg-bg-blush p-6 md:p-8 space-y-6">
      <div>
        <h3 className="font-display text-2xl text-text-primary">{copy.title}</h3>
        <p className="mt-2 text-sm text-text-muted leading-relaxed">{copy.body}</p>
      </div>

      <WhatsAppButton href={whatsappUrl} size="lg" className="w-full">
        {copy.cta}
      </WhatsAppButton>

      <ul className="space-y-4 pt-4 border-t border-border">
        <li className="flex items-start gap-3 text-sm">
          <Phone className="w-4 h-4 text-accent-rose shrink-0 mt-0.5" />
          <a
            href={`tel:${siteConfig.phoneRaw}`}
            className="text-text-primary hover:text-accent-rose transition-colors"
            data-analytics={analyticsEvents.phoneClick}
          >
            {siteConfig.phone}
          </a>
        </li>
        <li className="flex items-start gap-3 text-sm">
          <Mail className="w-4 h-4 text-accent-rose shrink-0 mt-0.5" />
          <a
            href={`mailto:${siteConfig.email}`}
            className="text-text-primary hover:text-accent-rose transition-colors"
          >
            {siteConfig.email}
          </a>
        </li>
        <li className="flex items-start gap-3 text-sm text-text-muted">
          <MapPin className="w-4 h-4 text-accent-rose shrink-0 mt-0.5" />
          {siteConfig.serviceArea}
        </li>
        <li className="flex items-start gap-3 text-sm text-text-muted">
          <Clock className="w-4 h-4 text-accent-rose shrink-0 mt-0.5" />
          {siteConfig.hours}
        </li>
      </ul>
    </div>
  );
}
