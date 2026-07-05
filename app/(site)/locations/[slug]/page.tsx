import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Check, Clock, Home, ArrowRight } from "lucide-react";
import {
  getServices,
  getLocations,
  getLocationBySlug,
  getTestimonialsByLocation,
  getPortfolioItemsByLocation,
} from "@/sanity/fetch";
import { createPageMetadata } from "@/lib/metadata";
import { BreadcrumbJsonLd } from "@/lib/seo/structured-data";
import { formatPrice } from "@/lib/utils";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { PageHero } from "@/components/sections/PageHero";
import { SectionWrapper } from "@/components/ui/BackgroundDecor";
import { CTASection } from "@/components/sections/CTASection";
import { Button, WhatsAppButton } from "@/components/ui/Button";
import { Reveal, StaggerGrid, StaggerItem } from "@/components/ui/Reveal";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { siteConfig } from "@/lib/site-config";

export async function generateStaticParams() {
  const locations = await getLocations();
  return locations.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const location = await getLocationBySlug(slug);
  if (!location) return {};
  return createPageMetadata({
    title: location.seoTitle,
    description: location.seoDescription,
    path: `/locations/${slug}`,
  });
}

export default async function LocationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const location = await getLocationBySlug(slug);
  if (!location) notFound();

  const [services, allLocations, localTestimonials, localPortfolio] = await Promise.all([
    getServices(),
    getLocations(),
    getTestimonialsByLocation(slug),
    getPortfolioItemsByLocation(slug),
  ]);
  const travelFee = location.travelZone && location.travelZone.fee !== -1 ? location.travelZone.fee : null;

  const bookUrl = `/book#booking-form`;
  const whatsappUrl = buildWhatsAppUrl({ intent: "booking" });

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Locations", href: "/locations" },
          { name: location.name, href: `/locations/${location.slug}` },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            name: `Makeup Artist in ${location.name}`,
            description: location.seoDescription,
            url: `${siteConfig.url}/locations/${location.slug}`,
            provider: {
              "@type": "BeautySalon",
              name: siteConfig.brand,
              url: siteConfig.url,
              telephone: siteConfig.phoneRaw,
              address: {
                "@type": "PostalAddress",
                addressLocality: "Lagos",
                addressCountry: "NG",
              },
            },
            areaServed: location.areas.map((area) => ({
              "@type": "Place",
              name: `${area}, Lagos`,
            })),
            serviceType: "Makeup Artist",
          }),
        }}
      />

      <PageHero
        label={`Serving ${location.name}`}
        title={location.headline}
        subtitle={location.subtitle}
      />

      <SectionWrapper>
        <Container>
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Locations", href: "/locations" },
              { label: location.name },
            ]}
          />

          {/* Intro */}
          <Reveal className="max-w-3xl mx-auto mb-16">
            {location.intro.map((p, i) => (
              <p key={i} className="text-text-muted leading-relaxed mb-4 last:mb-0">
                {p}
              </p>
            ))}
            {location.localNotes && (
              <p className="text-text-muted leading-relaxed mt-4">{location.localNotes}</p>
            )}
          </Reveal>

          {/* Areas served */}
          <Reveal className="mb-16">
            <h2 className="font-display text-2xl md:text-3xl font-medium text-text-primary text-center mb-8">
              Areas We Serve in {location.name}
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              {location.areas.map((area) => (
                <span
                  key={area}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-bg-blush border border-border text-sm text-text-primary"
                >
                  <MapPin className="w-3.5 h-3.5 text-accent-rose" />
                  {area}
                </span>
              ))}
            </div>
            {travelFee !== null && travelFee > 0 && (
              <p className="text-center text-sm text-text-muted mt-4">
                Travel fee for this area: {formatPrice(travelFee)}
              </p>
            )}
            {travelFee === 0 && (
              <p className="text-center text-sm text-accent-rose font-medium mt-4">
                No travel fee for this area
              </p>
            )}
          </Reveal>

          {/* Services available */}
          <Reveal className="mb-16">
            <h2 className="font-display text-2xl md:text-3xl font-medium text-text-primary text-center mb-3">
              Makeup Services Available in {location.name}
            </h2>
            <p className="text-text-muted text-center mb-8 max-w-2xl mx-auto">
              Every service includes home service — {siteConfig.artistName} comes to your location in {location.name} with a full professional kit.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((service) => (
                <Link
                  key={service.id}
                  href={`/services/${service.slug}`}
                  className="group p-5 rounded-2xl border border-border bg-card hover:border-accent-rose/30 hover:shadow-md transition-all duration-300"
                >
                  <h3 className="font-display text-lg font-medium text-text-primary group-hover:text-accent-rose transition-colors">
                    {service.name}
                  </h3>
                  <p className="text-sm text-text-muted mt-1 line-clamp-2">
                    {service.shortDescription}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    {service.priceFrom ? (
                      <span className="text-sm font-semibold text-accent-rose">
                        From {formatPrice(service.priceFrom)}
                      </span>
                    ) : (
                      <span />
                    )}
                    <span className="flex items-center gap-1 text-xs text-text-muted group-hover:text-accent-rose transition-colors">
                      View details <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-text-muted">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {service.duration}
                    </span>
                    {service.homeService && (
                      <span className="flex items-center gap-1">
                        <Home className="w-3 h-3" />
                        Home service
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </Reveal>

          {/* Why book section */}
          <Reveal className="mb-16">
            <h2 className="font-display text-2xl md:text-3xl font-medium text-text-primary text-center mb-8">
              Why Book {siteConfig.brand} in {location.name}
            </h2>
            <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
              {[
                "Punctual arrival — no stressing about Lagos traffic",
                "Full professional kit brought to your exact location",
                "Skin-prep focused approach for a natural, lasting finish",
                "Clean, sanitised tools for every session",
                "Camera-ready glam that holds up in Lagos heat",
                "Calm, professional service on your wedding morning",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 mt-0.5 shrink-0 text-accent-gold" />
                  <span className="text-sm text-text-muted">{item}</span>
                </div>
              ))}
            </div>
          </Reveal>

          {/* Real portfolio work from this location — only renders once real work is tagged here */}
          {localPortfolio.length > 0 && (
            <Reveal className="mb-16">
              <h2 className="font-display text-2xl md:text-3xl font-medium text-text-primary text-center mb-8">
                Real Looks From {location.name}
              </h2>
              <StaggerGrid className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {localPortfolio.slice(0, 6).map((item) => (
                  <StaggerItem key={item.id}>
                    <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-border">
                      <Image
                        src={item.src}
                        alt={item.alt}
                        fill
                        sizes="(max-width: 768px) 50vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                  </StaggerItem>
                ))}
              </StaggerGrid>
            </Reveal>
          )}

          {/* Testimonial highlight — only real, tagged testimonials for this location */}
          {localTestimonials.length > 0 && (
            <Reveal className="mb-16 max-w-2xl mx-auto">
              <div className="p-6 md:p-8 rounded-2xl bg-bg-blush border border-border text-center">
                <p className="text-text-primary leading-relaxed italic">
                  &ldquo;{localTestimonials[0].text}&rdquo;
                </p>
                <p className="mt-4 text-sm font-medium text-text-primary">
                  {localTestimonials[0].name}
                </p>
                <p className="text-xs text-text-muted">{localTestimonials[0].event}</p>
              </div>
            </Reveal>
          )}

          {/* CTA */}
          <Reveal className="text-center">
            <h2 className="font-display text-2xl md:text-3xl font-medium text-text-primary mb-3">
              Ready to Book Your Makeup in {location.name}?
            </h2>
            <p className="text-text-muted mb-8 max-w-xl mx-auto">
              Send your date, location, and event type — {siteConfig.artistName} will confirm availability and share a tailored quote.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button href={bookUrl} variant="primary" size="lg">
                Check Availability
              </Button>
              <WhatsAppButton href={whatsappUrl} size="lg">
                Book on WhatsApp
              </WhatsAppButton>
            </div>
          </Reveal>
        </Container>
      </SectionWrapper>

      {/* Other locations */}
      <SectionWrapper variant="blush">
        <Container size="narrow">
          <Reveal className="text-center">
            <h3 className="font-display text-xl md:text-2xl text-text-primary mb-6">
              Also Serving Other Areas in Lagos
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              {allLocations
                .filter((l) => l.slug !== location.slug)
                .map((l) => (
                  <Link
                    key={l.slug}
                    href={`/locations/${l.slug}`}
                    className="px-4 py-2 rounded-full bg-card border border-border text-sm text-text-primary hover:border-accent-rose/30 hover:text-accent-rose transition-all"
                  >
                    {l.name}
                  </Link>
                ))}
            </div>
          </Reveal>
        </Container>
      </SectionWrapper>

      <CTASection location={`location_${location.slug}`} />
    </>
  );
}
