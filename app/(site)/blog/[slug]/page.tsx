import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";
import { getBlogPostBySlug, getBlogPosts } from "@/sanity/fetch";
import { createPageMetadata } from "@/lib/metadata";
import { BlogPostJsonLd, BreadcrumbJsonLd } from "@/lib/seo/structured-data";
import { PageHero } from "@/components/sections/PageHero";
import { SectionWrapper } from "@/components/ui/BackgroundDecor";
import { CTASection } from "@/components/sections/CTASection";
import { Reveal } from "@/components/ui/Reveal";
import { Container } from "@/components/ui/Container";

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
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

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
          <Reveal>
            <div className="flex items-center gap-3 mb-8 text-sm text-text-muted">
              <span>By {post.author}</span>
              <span className="text-border">·</span>
              <time dateTime={post.publishedAt}>
                {formatDate(post.publishedAt)}
              </time>
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
              <div className="prose prose-lg max-w-none text-text-primary prose-headings:font-display prose-headings:text-text-primary prose-p:text-text-muted prose-p:leading-relaxed prose-a:text-accent-rose prose-strong:text-text-primary">
                <PortableText value={post.body} />
              </div>
            )}

            <div className="mt-12 pt-8 border-t border-border">
              <Link
                href="/blog"
                className="text-sm font-medium text-accent-rose hover:underline"
              >
                ← Back to all articles
              </Link>
            </div>
          </Reveal>
        </Container>
      </SectionWrapper>

      <CTASection location="blog_post" />
    </>
  );
}
