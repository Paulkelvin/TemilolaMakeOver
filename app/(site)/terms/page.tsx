import { createPageMetadata } from "@/lib/metadata";
import { siteConfig } from "@/lib/site-config";
import { PageHero } from "@/components/sections/PageHero";
import { SectionWrapper } from "@/components/ui/BackgroundDecor";
import { Container } from "@/components/ui/Container";

export const metadata = createPageMetadata({
  title: "Terms of Service",
  description: `Terms of service for ${siteConfig.brand}. Booking terms, deposit policy, and service conditions.`,
  path: "/terms",
});

export default function TermsPage() {
  return (
    <>
      <PageHero label="Legal" title="Terms of Service" />

      <SectionWrapper>
        <Container size="narrow">
          <div className="space-y-8 text-text-muted leading-relaxed">
            <p className="text-sm text-text-muted">Last updated: 22 June 2026</p>

            <section>
              <h2 className="font-display text-2xl text-text-primary mb-3">
                Booking &amp; Deposits
              </h2>
              <p>
                All bookings require a 50% non-refundable deposit to secure your
                date. The remaining balance is due on or before the day of your
                appointment. You will receive written confirmation once your
                deposit is received.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-text-primary mb-3">
                Rescheduling &amp; Cancellations
              </h2>
              <p>
                Please notify us at least 7 days before your appointment if your
                date changes. Rescheduling is subject to availability. Late
                cancellations (less than 48 hours) may forfeit the deposit. We
                will always communicate clearly before any changes to your
                booking.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-text-primary mb-3">
                Service Delivery
              </h2>
              <p>
                We arrive on time, prepared, and with a full professional kit.
                For home service bookings, the client is responsible for
                providing a clean, well-lit workspace with access to power. We
                reserve the right to decline or discontinue service in any
                environment that is unsuitable or unsafe.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-text-primary mb-3">
                Pricing
              </h2>
              <p>
                Prices listed on our website are starting prices. Your final
                quote may vary based on your location, event date, number of
                faces, and specific requirements. We provide a clear, itemised
                quote before any deposit is taken. No hidden charges.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-text-primary mb-3">
                Travel &amp; Home Service
              </h2>
              <p>
                We travel across Lagos and nearby areas. A travel fee may apply
                depending on distance and timing. For locations outside Lagos,
                travel costs and logistics will be discussed and confirmed before
                booking.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-text-primary mb-3">
                Client Responsibilities
              </h2>
              <p>
                For the best results, arrive with a clean, product-free face
                unless otherwise instructed. Please communicate any skin
                allergies, sensitivities, or conditions before your session. We
                recommend a trial session for bridal bookings to ensure your
                look is exactly right.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-text-primary mb-3">
                Photos &amp; Portfolio
              </h2>
              <p>
                We may photograph completed looks for our portfolio and social
                media. If you prefer not to have your images shared, please let
                us know before or during your session and we will respect your
                wishes.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-text-primary mb-3">
                Contact
              </h2>
              <p>
                For questions about these terms, contact us at{" "}
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="text-accent-rose hover:underline"
                >
                  {siteConfig.email}
                </a>{" "}
                or {siteConfig.phone}.
              </p>
            </section>
          </div>
        </Container>
      </SectionWrapper>
    </>
  );
}
