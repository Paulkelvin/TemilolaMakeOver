import { getPortfolioItems, getBlockedDates } from "@/sanity/fetch";
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
import { BlogPreview } from "@/components/sections/BlogPreview";

export default async function HomePage() {
  const [portfolioItems, blockedDates] = await Promise.all([
    getPortfolioItems(),
    getBlockedDates(),
  ]);

  return (
    <>
      <Hero portfolioItems={portfolioItems} blockedDates={blockedDates} />
      <TrustStrip />
      <PortfolioPreview />
      <ServicesOverview />
      <BeforeAfter />
      <WhyChooseUs />
      <Testimonials />
      <BookingProcess />
      <BlogPreview />
      <FAQSection limit={8} />
      <CTASection />
    </>
  );
}
