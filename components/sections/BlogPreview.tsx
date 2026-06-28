import Link from "next/link";
import Image from "next/image";
import { getBlogPosts } from "@/sanity/fetch";
import { SectionWrapper } from "@/components/ui/BackgroundDecor";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Container } from "@/components/ui/Container";
import { StaggerGrid, StaggerItem } from "@/components/ui/Reveal";
import { estimateReadingTime } from "@/lib/reading-time";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-NG", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export async function BlogPreview() {
  const posts = await getBlogPosts();
  const latest = posts.slice(0, 3);

  if (latest.length === 0) return null;

  return (
    <SectionWrapper variant="blush">
      <Container>
        <SectionHeading
          label="From the Blog"
          title="Beauty Tips & Inspiration"
          subtitle="Expert advice to help you look and feel your best on every occasion."
        />
        <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {latest.map((post) => (
            <StaggerItem key={post.id}>
              <Link href={`/blog/${post.slug}`} className="group block h-full">
                <article className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-lg transition-all duration-500 hover:-translate-y-1 h-full flex flex-col">
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
                  <div className="p-5 md:p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-accent-gold">
                        {post.category}
                      </span>
                      <span className="text-xs text-text-muted">
                        {formatDate(post.publishedAt)}
                      </span>
                    </div>
                    <h3 className="font-display text-lg md:text-xl font-medium text-text-primary group-hover:text-accent-rose transition-colors leading-snug">
                      {post.title}
                    </h3>
                    <p className="mt-2 text-sm text-text-muted leading-relaxed line-clamp-2 flex-1">
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
        <div className="mt-8 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium text-accent-rose hover:underline"
          >
            View all articles →
          </Link>
        </div>
      </Container>
    </SectionWrapper>
  );
}
