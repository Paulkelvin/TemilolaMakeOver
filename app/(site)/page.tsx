import { getPortfolioItems } from "@/sanity/fetch";
import { Hero } from "@/components/sections/Hero";
import { TrustStrip } from "@/components/sections/TrustStrip";
import { PortfolioPreview } from "@/components/sections/PortfolioPreview";
import { ServicesOverview } from "@/components/sections/ServicesOverview";
import { BeforeAfter } from "@/components/sections/BeforeAfter";
import { WhyChooseUs } from "@/components/sections/WhyChooseUs";
import { Testimonials } from "@/components/sections/Testimonials";
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
      <BeforeAfter />
      <WhyChooseUs />
      <Testimonials />
      <BookingProcess />
      <FAQSection limit={8} />
      <CTASection />
    </>
  );
}
