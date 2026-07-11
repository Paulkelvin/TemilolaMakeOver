type AnalyticsParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

export function trackEvent(
  name: string,
  params?: AnalyticsParams
): void {
  if (typeof window === "undefined") return;

  if (window.gtag) {
    window.gtag("event", name, params);
  }

  if (window.fbq) {
    window.fbq("trackCustom", name, params);
  }
}

export const analyticsEvents = {
  whatsappClick: "whatsapp_click",
  phoneClick: "phone_click",
  formSubmit: "booking_form_submit",
  portfolioCta: "portfolio_cta",
  packageCta: "package_cta",
  availabilityCta: "check_availability",
  faqQuestionSubmit: "faq_question_submit",
  // Booking-form-specific funnel stages — distinct names from the generic
  // whatsappClick above so the Command Center can query them without needing
  // a GA4 custom dimension on event params just to isolate "booking page only".
  bookingFormStart: "booking_form_start",
  bookingStep2: "booking_step_2",
  bookingWhatsappSubmit: "booking_whatsapp_submit",
} as const;

/** Track with optional page location for conversion analysis */
export function trackConversion(
  event: (typeof analyticsEvents)[keyof typeof analyticsEvents],
  location: string,
  extra?: AnalyticsParams
): void {
  trackEvent(event, { location, ...extra });
}
