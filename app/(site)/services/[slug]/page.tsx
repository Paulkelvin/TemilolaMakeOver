import Image from "next/image";
import { notFound } from "next/navigation";
import { getServiceBySlug, getServices } from "@/sanity/fetch";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { createPageMetadata } from "@/lib/metadata";
import { ServiceJsonLd, BreadcrumbJsonLd } from "@/lib/seo/structured-data";
import { formatPrice } from "@/lib/utils";
import { PageHero } from "@/components/sections/PageHero";
import { SectionWrapper } from "@/components/ui/BackgroundDecor";
import { CTASection } from "@/components/sections/CTASection";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import Link from "next/link";
import { Check, Clock, Home } from "lucide-react";

export async function generateStaticParams() {
  const services = await getServices();
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) return {};
  return createPageMetadata({
    title: `${service.name} — Makeup Service`,
    description: service.shortDescription,
    path: `/services/${slug}`,
  });
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) notFound();

  const imageUrl = service.imageUrl;
  const whatsappUrl = buildWhatsAppUrl({
    intent: "service",
    service: service.name,
  });

  return (
    <>
      <ServiceJsonLd
        name={service.name}
        description={service.description}
        slug={service.slug}
        priceFrom={service.priceFrom}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Services", href: "/services" },
          { name: service.name, href: `/services/${service.slug}` },
        ]}
      />
      <PageHero
        label={service.bestFor}
        title={service.name}
        subtitle={service.shortDescription}
      />

      <SectionWrapper>
        <Container>
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Services", href: "/services" },
              { label: service.name },
            ]}
          />
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <Reveal>
              <h2 className="font-display text-2xl md:text-3xl font-medium text-text-primary">
                {service.description}
              </h2>

              <p className="mt-4 text-text-muted leading-relaxed">
                <strong className="text-text-primary">Ideal for:</strong>{" "}
                {service.whoFor}
              </p>

              {service.priceFrom && (
                <p className="mt-4 font-display text-2xl md:text-3xl font-semibold text-accent-rose">
                  From {formatPrice(service.priceFrom)}
                </p>
              )}

              <ul className="mt-6 space-y-2.5">
                <li className="text-sm font-medium text-text-primary">
                  What&apos;s included:
                </li>
                {service.included.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-sm text-text-muted"
                  >
                    <Check className="w-4 h-4 mt-0.5 shrink-0 text-accent-gold" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex flex-wrap gap-4 text-sm text-text-muted">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-accent-rose" />
                  {service.duration}
                </span>
                {service.homeService && (
                  <span className="flex items-center gap-1.5">
                    <Home className="w-4 h-4 text-accent-rose" />
                    Home service available
                  </span>
                )}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button href={whatsappUrl} external variant="primary" size="lg">
                  Book This Service
                </Button>
                <Button
                  href={buildWhatsAppUrl({ intent: "quote" })}
                  external
                  variant="secondary"
                  size="lg"
                >
                  Request Quote
                </Button>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden border border-border shadow-lg">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={`${service.name} — Temilola Makeup Lagos`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-bg-blush flex items-center justify-center">
                    <span className="text-text-muted text-sm">
                      {service.name}
                    </span>
                  </div>
                )}
              </div>
            </Reveal>
          </div>
        </Container>
      </SectionWrapper>

      <SectionWrapper variant="blush">
        <Container size="narrow">
          <Reveal className="text-center">
            <h3 className="font-display text-xl md:text-2xl text-text-primary mb-4">
              Related Beauty Tips
            </h3>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
              <Link href="/blog/soft-glam-makeup-tutorial-step-by-step" className="text-sm text-accent-rose font-medium hover:underline">
                Soft Glam Tutorial
              </Link>
              <Link href="/blog/how-to-make-makeup-last-all-day-lagos-heat" className="text-sm text-accent-rose font-medium hover:underline">
                Make Makeup Last All Day
              </Link>
              <Link href="/blog/preparing-your-skin-before-makeup-application" className="text-sm text-accent-rose font-medium hover:underline">
                Skin Prep Guide
              </Link>
            </div>
          </Reveal>
        </Container>
      </SectionWrapper>

      <CTASection
        title="Ready to Book?"
        subtitle={`Secure your ${service.name.toLowerCase()} session today.`}
        location="service_detail"
      />
    </>
  );
}
