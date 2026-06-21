import { getPortfolioItems } from "@/sanity/fetch";
import { Hero } from "@/components/sections/Hero";
import { TrustStrip } from "@/components/sections/TrustStrip";
import { PortfolioPreview } from "@/components/sections/PortfolioPreview";
import { ServicesOverview } from "@/components/sections/ServicesOverview";
import { WhyChooseUs } from "@/components/sections/WhyChooseUs";
import { BeforeAfter } from "@/components/sections/BeforeAfter";
import { Testimonials } from "@/components/sections/Testimonials";
import { PricingPreview } from "@/components/sections/PricingPreview";
import { BookingProcess } from "@/components/sections/BookingProcess";
import { FAQSection } from "@/components/sections/FAQSection";
import { CTASection } from "@/components/sections/CTASection";

export default async function HomePage() {
  const portfolioItems = await getPortfolioItems();

  return (
    <>
      <Hero portfolioItems={portfolioItems} />
      <TrustStrip />
      <PortfolioPreview />
      <ServicesOverview />
      <WhyChooseUs />
      <BeforeAfter />
      <Testimonials />
      <PricingPreview />
      <BookingProcess />
      <FAQSection limit={8} />
      <CTASection />
    </>
  );
}
