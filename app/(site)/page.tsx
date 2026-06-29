import { getPortfolioItems, getBlockedDates, getInstagramFeed } from "@/sanity/fetch";
import { Hero } from "@/components/sections/Hero";
import { TrustStrip } from "@/components/sections/TrustStrip";
import { PortfolioPreview } from "@/components/sections/PortfolioPreview";
import { ServicesOverview } from "@/components/sections/ServicesOverview";
import { BeforeAfter } from "@/components/sections/BeforeAfter";
import { VideoReel } from "@/components/sections/VideoReel";
import { WhyChooseUs } from "@/components/sections/WhyChooseUs";
import { Testimonials } from "@/components/sections/Testimonials";
import { BookingProcess } from "@/components/sections/BookingProcess";
import { InstagramFeed } from "@/components/sections/InstagramFeed";
import { FAQSection } from "@/components/sections/FAQSection";
import { CTASection } from "@/components/sections/CTASection";
import { BlogPreview } from "@/components/sections/BlogPreview";
import { mediaConfig } from "@/data/copy";

export default async function HomePage() {
  const [portfolioItems, blockedDates, instagramItems] = await Promise.all([
    getPortfolioItems(),
    getBlockedDates(),
    getInstagramFeed(),
  ]);

  return (
    <>
      <Hero portfolioItems={portfolioItems} blockedDates={blockedDates} />
      <TrustStrip />
      <PortfolioPreview />
      <ServicesOverview />
      <BeforeAfter />
      <VideoReel youtubeUrl={mediaConfig.youtubeReelUrl} />
      <WhyChooseUs />
      <Testimonials />
      <BookingProcess />
      <InstagramFeed items={instagramItems} />
      <BlogPreview />
      <FAQSection limit={8} />
      <CTASection />
    </>
  );
}
