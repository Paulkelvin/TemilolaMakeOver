import { getPortfolioItems, getBlockedDates, getSocialPosts, getSiteSettings, getPageCopy, findSection, getFaqItemsByCategory } from "@/sanity/fetch";
import { FAQPageJsonLd } from "@/lib/seo/structured-data";
import { Hero } from "@/components/sections/Hero";
import { TrustStrip } from "@/components/sections/TrustStrip";
import { PortfolioPreview } from "@/components/sections/PortfolioPreview";
import { ServicesOverview } from "@/components/sections/ServicesOverview";
import { BeforeAfter } from "@/components/sections/BeforeAfter";
import { WhyChooseUs } from "@/components/sections/WhyChooseUs";
import { Testimonials } from "@/components/sections/Testimonials";
import { FAQSection } from "@/components/sections/FAQSection";
import { CTASection } from "@/components/sections/CTASection";
import { BlogPreview } from "@/components/sections/BlogPreview";
import { SocialFeed } from "@/components/sections/SocialFeed";

const HOME_FAQ_LIMIT = 4;

export default async function HomePage() {
  const [portfolioItems, blockedDates, socialPosts, siteSettings, pageCopy, faqItems] = await Promise.all([
    getPortfolioItems(),
    getBlockedDates(),
    getSocialPosts(),
    getSiteSettings(),
    getPageCopy("home"),
    getFaqItemsByCategory("general"),
  ]);

  const portfolioSec = findSection(pageCopy, "portfolio");
  const servicesSec = findSection(pageCopy, "services");
  const whyUsSec = findSection(pageCopy, "whyChooseUs");
  const testimonialsSec = findSection(pageCopy, "testimonials");
  const ctaSec = findSection(pageCopy, "finalCta");

  return (
    <>
      {/* Matches the items FAQSection actually renders below */}
      <FAQPageJsonLd items={faqItems.slice(0, HOME_FAQ_LIMIT)} />
      <Hero portfolioItems={portfolioItems} blockedDates={blockedDates} siteSettings={siteSettings} pageCopy={pageCopy} />
      <TrustStrip />
      <PortfolioPreview sectionCopy={portfolioSec} />
      <ServicesOverview sectionCopy={servicesSec} />
      <BeforeAfter />
      <WhyChooseUs aboutImageUrl={siteSettings.aboutImage} sectionCopy={whyUsSec} />
      <Testimonials sectionCopy={testimonialsSec} blockedDates={blockedDates} />
      <SocialFeed posts={socialPosts} />
      <BlogPreview />
      <FAQSection limit={HOME_FAQ_LIMIT} />
      <CTASection
        eyebrow={ctaSec?.label}
        title={ctaSec?.headline}
        subtitle={ctaSec?.paragraph}
      />
    </>
  );
}
