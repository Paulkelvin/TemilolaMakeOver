import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";
import { getBlogPostBySlug, getBlogPosts } from "@/sanity/fetch";
import { createPageMetadata } from "@/lib/metadata";
import { BlogPostJsonLd, BreadcrumbJsonLd } from "@/lib/seo/structured-data";
import { estimateReadingTime } from "@/lib/reading-time";
import { PageHero } from "@/components/sections/PageHero";
import { SectionWrapper } from "@/components/ui/BackgroundDecor";
import { CTASection } from "@/components/sections/CTASection";
import { Reveal } from "@/components/ui/Reveal";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { RelatedPosts } from "@/components/sections/RelatedPosts";
import { Clock } from "lucide-react";
import { VideoEmbed } from "@/components/ui/VideoEmbed";

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return {};
  return createPageMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${slug}`,
    ogType: "article",
    publishedTime: post.publishedAt,
    author: post.author,
  });
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [post, allPosts] = await Promise.all([
    getBlogPostBySlug(slug),
    getBlogPosts(),
  ]);
  if (!post) notFound();

  const readingTime = estimateReadingTime(post.body);

  const related = allPosts
    .filter((p) => p.slug !== slug)
    .sort((a, b) => {
      const aMatch = a.category === post.category ? 1 : 0;
      const bMatch = b.category === post.category ? 1 : 0;
      return bMatch - aMatch;
    })
    .slice(0, 3);

  return (
    <>
      <BlogPostJsonLd
        title={post.title}
        description={post.excerpt}
        slug={post.slug}
        publishedAt={post.publishedAt}
        author={post.author}
        coverImageUrl={post.coverImageUrl}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Blog", href: "/blog" },
          { name: post.title, href: `/blog/${post.slug}` },
        ]}
      />
      <PageHero
        label={post.category}
        title={post.title}
        subtitle={post.excerpt}
      />

      <SectionWrapper>
        <Container size="narrow">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Blog", href: "/blog" },
              { label: post.title },
            ]}
          />
          <Reveal>
            <div className="flex items-center gap-3 mb-8 text-sm text-text-muted">
              <span>By {post.author}</span>
              <span className="text-border">&middot;</span>
              <time dateTime={post.publishedAt}>
                {formatDate(post.publishedAt)}
              </time>
              <span className="text-border">&middot;</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {readingTime} min read
              </span>
            </div>

            {post.coverImageUrl && (
              <div className="relative aspect-[16/9] rounded-2xl overflow-hidden border border-border shadow-lg mb-10">
                <Image
                  src={post.coverImageUrl}
                  alt={post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 720px"
                  className="object-cover"
                  priority
                />
              </div>
            )}

            {post.body && (
              <div className="blog-content max-w-none">
                <PortableText
                  value={post.body}
                  components={{
                    types: {
                      videoEmbed: ({ value }) => (
                        <VideoEmbed url={value.url} caption={value.caption} />
                      ),
                      // Editor-only marker from the Evidence Scanner (lib/intelligence/evidence-scan.ts) —
                      // must never reach a real visitor, however it was resolved in Studio.
                      experiencePlaceholder: () => null,
                    },
                    block: {
                      h1: ({ children }) => <h2>{children}</h2>,
                    },
                    marks: {
                      link: ({ value, children }) => {
                        const href = value?.href ?? "#";
                        const isInternal = href.startsWith("/");
                        return isInternal ? (
                          <Link href={href} className="text-accent-rose underline hover:no-underline">
                            {children}
                          </Link>
                        ) : (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent-rose underline hover:no-underline"
                          >
                            {children}
                          </a>
                        );
                      },
                    },
                  }}
                />
              </div>
            )}

            <div className="mt-12 pt-8 border-t border-border">
              <Link
                href="/blog"
                className="text-sm font-medium text-accent-rose hover:underline"
              >
                &larr; Back to all articles
              </Link>
            </div>
          </Reveal>
        </Container>
      </SectionWrapper>

      <RelatedPosts posts={related} />

      <CTASection location="blog_post" />
    </>
  );
}
