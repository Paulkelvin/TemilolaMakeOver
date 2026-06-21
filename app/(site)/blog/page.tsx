import Link from "next/link";
import { getBlogPosts } from "@/sanity/fetch";
import { createPageMetadata } from "@/lib/metadata";
import { PageHero } from "@/components/sections/PageHero";
import { SectionWrapper } from "@/components/ui/BackgroundDecor";
import { Container } from "@/components/ui/Container";
import { CTASection } from "@/components/sections/CTASection";
import { Reveal } from "@/components/ui/Reveal";
import { BlogListClient } from "@/components/sections/BlogListClient";
import { NewsletterSignup } from "@/components/sections/NewsletterSignup";

export const metadata = createPageMetadata({
  title: "Beauty Tips & Blog",
  description:
    "Makeup tips, bridal beauty advice, and glam inspiration from Temilola — professional makeup artist in Lagos.",
  path: "/blog",
});

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <>
      <PageHero
        label="Beauty Tips"
        title="Blog & Inspiration"
        subtitle="Expert beauty advice, bridal tips, and glam inspiration from the studio."
      />

      <SectionWrapper>
        <Container>
          {posts.length === 0 ? (
            <Reveal className="text-center py-12">
              <p className="text-text-muted leading-relaxed">
                New articles coming soon. In the meantime, explore our portfolio
                or check availability for your date.
              </p>
              <Link
                href="/book"
                className="inline-block mt-6 text-accent-rose font-medium hover:underline"
              >
                Book your session while you wait →
              </Link>
            </Reveal>
          ) : (
            <BlogListClient posts={posts} />
          )}
        </Container>
      </SectionWrapper>

      <SectionWrapper variant="blush">
        <Container size="narrow">
          <Reveal>
            <NewsletterSignup />
          </Reveal>
        </Container>
      </SectionWrapper>

      <CTASection location="blog_page" />
    </>
  );
}
