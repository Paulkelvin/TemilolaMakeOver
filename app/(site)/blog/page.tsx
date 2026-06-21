import Link from "next/link";
import Image from "next/image";
import { getBlogPosts } from "@/sanity/fetch";
import { createPageMetadata } from "@/lib/metadata";
import { PageHero } from "@/components/sections/PageHero";
import { SectionWrapper } from "@/components/ui/BackgroundDecor";
import { Container } from "@/components/ui/Container";
import { CTASection } from "@/components/sections/CTASection";
import { Reveal, StaggerGrid, StaggerItem } from "@/components/ui/Reveal";

export const metadata = createPageMetadata({
  title: "Beauty Tips & Blog",
  description:
    "Makeup tips, bridal beauty advice, and glam inspiration from Temilola — professional makeup artist in Lagos.",
  path: "/blog",
});

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

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
            <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {posts.map((post) => (
                <StaggerItem key={post.id}>
                  <Link href={`/blog/${post.slug}`} className="group block">
                    <article className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-lg transition-all duration-500 hover:-translate-y-1">
                      <div className="relative aspect-[16/10] bg-bg-blush overflow-hidden">
                        {post.coverImageUrl ? (
                          <Image
                            src={post.coverImageUrl}
                            alt={post.title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-text-muted text-sm">{post.category}</span>
                          </div>
                        )}
                      </div>
                      <div className="p-5 md:p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-accent-gold">
                            {post.category}
                          </span>
                          <span className="text-xs text-text-muted">
                            {formatDate(post.publishedAt)}
                          </span>
                        </div>
                        <h2 className="font-display text-lg md:text-xl font-medium text-text-primary group-hover:text-accent-rose transition-colors leading-snug">
                          {post.title}
                        </h2>
                        <p className="mt-2 text-sm text-text-muted leading-relaxed line-clamp-2">
                          {post.excerpt}
                        </p>
                        <span className="inline-block mt-4 text-sm font-medium text-accent-rose">
                          Read more →
                        </span>
                      </div>
                    </article>
                  </Link>
                </StaggerItem>
              ))}
            </StaggerGrid>
          )}
        </Container>
      </SectionWrapper>

      <CTASection location="blog_page" />
    </>
  );
}
