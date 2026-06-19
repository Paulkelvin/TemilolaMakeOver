import Link from "next/link";
import { createPageMetadata } from "@/lib/metadata";
import { PageHero } from "@/components/sections/PageHero";
import { SectionWrapper } from "@/components/ui/BackgroundDecor";
import { Container } from "@/components/ui/Container";
import { CTASection } from "@/components/sections/CTASection";
import { Reveal } from "@/components/ui/Reveal";

export const metadata = createPageMetadata({
  title: "Beauty Tips & Blog",
  description:
    "Makeup tips, bridal beauty advice, and glam inspiration from Temilola — professional makeup artist in Lagos.",
  path: "/blog",
});

const comingSoonPosts = [
  {
    title: "How Early Should You Book Your Bridal Makeup Artist?",
    category: "Bridal Tips",
  },
  {
    title: "Soft Glam vs Bold Glam: Choosing Your Event Look",
    category: "Event Glam",
  },
  {
    title: "Preparing Your Skin Before Makeup Application",
    category: "Skin Prep",
  },
];

export default function BlogPage() {
  return (
    <>
      <PageHero
        label="Beauty Tips"
        title="Blog & Inspiration"
        subtitle="Expert beauty advice, bridal tips, and glam inspiration — coming soon."
      />

      <SectionWrapper>
        <Container size="narrow">
          <Reveal className="text-center mb-12">
            <p className="text-text-muted leading-relaxed">
              We&apos;re preparing helpful guides for brides and glam lovers. In
              the meantime, explore our portfolio or check availability for your
              date.
            </p>
          </Reveal>

          <div className="space-y-4">
            {comingSoonPosts.map((post, i) => (
              <Reveal key={post.title} delay={i * 0.08}>
                <article className="rounded-2xl border border-border bg-card p-6 opacity-80">
                  <span className="text-xs font-semibold uppercase tracking-wider text-accent-gold">
                    {post.category}
                  </span>
                  <h2 className="mt-2 font-display text-xl text-text-primary">
                    {post.title}
                  </h2>
                  <p className="mt-2 text-sm text-text-muted">Coming soon</p>
                </article>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-10 text-center">
            <Link
              href="/book"
              className="text-accent-rose font-medium hover:underline"
            >
              Book your session while you wait →
            </Link>
          </Reveal>
        </Container>
      </SectionWrapper>

      <CTASection location="blog_page" />
    </>
  );
}
