import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";
import { getLocations } from "@/sanity/fetch";
import { createPageMetadata } from "@/lib/metadata";
import { BreadcrumbJsonLd } from "@/lib/seo/structured-data";
import { formatPrice } from "@/lib/utils";
import { PageHero } from "@/components/sections/PageHero";
import { SectionWrapper } from "@/components/ui/BackgroundDecor";
import { CTASection } from "@/components/sections/CTASection";
import { Reveal } from "@/components/ui/Reveal";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { siteConfig } from "@/lib/site-config";

export const metadata = createPageMetadata({
  title: "Makeup Artist Locations in Lagos — Areas We Serve",
  description: `${siteConfig.brand} serves all of Lagos with professional bridal, event, and soft glam makeup. Home service available in Lekki, Victoria Island, Ikeja, Surulere, Festac, Ikorodu, and more.`,
  path: "/locations",
});

export default async function LocationsPage() {
  const locations = await getLocations();

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Locations", href: "/locations" },
        ]}
      />

      <PageHero
        label="Areas We Serve"
        title="Makeup Artist Across Lagos"
        subtitle="Professional bridal, event, and soft glam makeup — delivered to your doorstep anywhere in Lagos and beyond."
      />

      <SectionWrapper>
        <Container>
          <Breadcrumbs
            items={[{ label: "Home", href: "/" }, { label: "Locations" }]}
          />

          <Reveal className="max-w-2xl mx-auto text-center mb-12">
            <p className="text-text-muted leading-relaxed">
              {siteConfig.brand} offers home service makeup across Lagos. Select
              your area below to see available services, travel fees, and book
              your session.
            </p>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {locations.map((location) => {
              const travelFee = location.travelZone && location.travelZone.fee !== -1 ? location.travelZone.fee : null;
              return (
                <Reveal key={location.slug}>
                  <Link
                    href={`/locations/${location.slug}`}
                    className="group block p-6 rounded-2xl border border-border bg-card hover:border-accent-rose/30 hover:shadow-md transition-all duration-300 h-full"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="w-5 h-5 text-accent-rose" />
                      <h2 className="font-display text-xl font-medium text-text-primary group-hover:text-accent-rose transition-colors">
                        {location.name}
                      </h2>
                    </div>
                    <p className="text-sm text-text-muted mb-3 line-clamp-2">
                      {location.areas.join(", ")}
                    </p>
                    <div className="flex items-center justify-between">
                      {travelFee === 0 ? (
                        <span className="text-xs font-medium text-accent-rose">
                          No travel fee
                        </span>
                      ) : travelFee !== null ? (
                        <span className="text-xs text-text-muted">
                          Travel fee: {formatPrice(travelFee)}
                        </span>
                      ) : (
                        <span className="text-xs text-text-muted">
                          Quote on request
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-xs text-text-muted group-hover:text-accent-rose transition-colors">
                        View <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </SectionWrapper>

      <CTASection location="locations_page" />
    </>
  );
}
