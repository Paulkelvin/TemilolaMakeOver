import { getPortfolioItems, getBlockedDates, getInstagramFeed, getSiteSettings, getPageCopy, findSection } from "@/sanity/fetch";
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

export default async function HomePage() {
  const [portfolioItems, blockedDates, instagramItems, siteSettings, pageCopy] = await Promise.all([
    getPortfolioItems(),
    getBlockedDates(),
    getInstagramFeed(),
    getSiteSettings(),
    getPageCopy("home"),
  ]);

  const portfolioSec = findSection(pageCopy, "portfolio");
  const servicesSec = findSection(pageCopy, "services");
  const whyUsSec = findSection(pageCopy, "whyChooseUs");
  const testimonialsSec = findSection(pageCopy, "testimonials");
  const ctaSec = findSection(pageCopy, "finalCta");

  return (
    <>
      <Hero portfolioItems={portfolioItems} blockedDates={blockedDates} siteSettings={siteSettings} pageCopy={pageCopy} />
      <TrustStrip />
      <PortfolioPreview sectionCopy={portfolioSec} />
      <ServicesOverview sectionCopy={servicesSec} />
      <BeforeAfter />
      <VideoReel youtubeUrl={siteSettings.youtubeReelUrl} />
      <WhyChooseUs aboutImageUrl={siteSettings.aboutImage} sectionCopy={whyUsSec} />
      <Testimonials sectionCopy={testimonialsSec} blockedDates={blockedDates} />
      <BookingProcess />
      <InstagramFeed items={instagramItems} />
      <BlogPreview />
      <FAQSection limit={8} />
      <CTASection
        eyebrow={ctaSec?.label}
        title={ctaSec?.headline}
        subtitle={ctaSec?.paragraph}
      />
    </>
  );
}
