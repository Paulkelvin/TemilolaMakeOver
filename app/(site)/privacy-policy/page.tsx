import { createPageMetadata } from "@/lib/metadata";
import { siteConfig } from "@/lib/site-config";
import { PageHero } from "@/components/sections/PageHero";
import { SectionWrapper } from "@/components/ui/BackgroundDecor";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

export const metadata = createPageMetadata({
  title: "Privacy Policy",
  description: `Privacy policy for ${siteConfig.brand}. How we collect and use your information when you book makeup services.`,
  path: "/privacy-policy",
});

export default function PrivacyPolicyPage() {
  return (
    <>
      <PageHero label="Legal" title="Privacy Policy" />

      <SectionWrapper>
        <Container size="narrow">
          <Reveal>
            <div className="prose prose-neutral max-w-none space-y-6 text-text-muted leading-relaxed">
              <p className="text-sm text-text-muted">
                Last updated: 26 July 2026
              </p>

              <section>
                <h2 className="font-display text-2xl text-text-primary">
                  Information We Collect
                </h2>
                <p>
                  When you submit a booking form or contact us via WhatsApp, we
                  may collect your name, phone number, email (if provided), event
                  details, and any message you share with us.
                </p>
                <p>
                  When you ask a question through our website&apos;s question form,
                  we collect your name (optional), email address, and the question
                  you submit, so we can reply to you directly.
                </p>
                <p>
                  If you sign up for our newsletter, we collect your email address
                  to send you updates you&apos;ve opted into.
                </p>
                <p>
                  If you pay a deposit online, our payment processor (Paystack)
                  collects your email address, the payment amount, and related
                  booking details (your name, service, and event date) to process
                  the transaction. We do not collect or store your card details
                  ourselves &mdash; that happens entirely on Paystack&apos;s
                  secure payment page.
                </p>
              </section>

              <section>
                <h2 className="font-display text-2xl text-text-primary">
                  How We Use Your Information
                </h2>
                <p>
                  We use your information solely to respond to booking inquiries
                  and questions, confirm availability, provide quotes, process
                  deposit payments, and deliver makeup services. We do not sell
                  your personal data.
                </p>
              </section>

              <section>
                <h2 className="font-display text-2xl text-text-primary">
                  Third-Party Services
                </h2>
                <p>
                  Our website may use analytics tools (such as Google Analytics
                  or Meta Pixel) when configured. WhatsApp is used for direct
                  communication and is subject to WhatsApp&apos;s own privacy
                  policy. Online deposit payments are processed by{" "}
                  <a
                    href="https://paystack.com/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent-rose hover:underline"
                  >
                    Paystack
                  </a>
                  , subject to Paystack&apos;s own privacy policy and terms.
                </p>
              </section>

              <section>
                <h2 className="font-display text-2xl text-text-primary">
                  Google API Services
                </h2>
                <p>
                  We use Google Search Console and Google Analytics (GA4) APIs, via
                  read-only access we&apos;ve granted ourselves as the site owner, to
                  display our own site&apos;s search performance and traffic metrics
                  (e.g. impressions, clicks, sessions, pageviews) in a private
                  internal business dashboard. This access is limited to our own
                  properties &mdash; it is never used to view or collect data from
                  any other Google account, and no visitor-level personal data is
                  accessed through these APIs. The aggregate metrics retrieved are
                  stored securely in our own systems for internal reporting only and
                  are never sold, shared, or used for any purpose beyond that
                  reporting. Our use and transfer of information received from
                  Google APIs adheres to the{" "}
                  <a
                    href="https://developers.google.com/terms/api-services-user-data-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent-rose hover:underline"
                  >
                    Google API Services User Data Policy
                  </a>
                  , including the Limited Use requirements.
                </p>
              </section>

              <section>
                <h2 className="font-display text-2xl text-text-primary">
                  Contact
                </h2>
                <p>
                  For privacy-related questions, contact us at{" "}
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
          </Reveal>
        </Container>
      </SectionWrapper>
    </>
  );
}
