import Link from "next/link";
import Image from "next/image";
import { getBlogPosts } from "@/sanity/fetch";
import { SectionWrapper } from "@/components/ui/BackgroundDecor";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Container } from "@/components/ui/Container";
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
          compact
          label="From the Blog"
          title="Beauty Tips & Inspiration"
          subtitle="Expert advice to help you look and feel your best on every occasion."
        />
        <ul className="-mx-4 px-4 flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 md:mx-0 md:px-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {latest.map((post) => (
            <li key={post.id} className="snap-start shrink-0 w-[80%] sm:w-[60%] md:w-auto">
              <Link href={`/blog/${post.slug}`} className="group block h-full">
                <article className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-lg transition-all duration-500 hover:-translate-y-1 h-full flex flex-col">
                  <div className="relative aspect-[16/10] bg-bg-blush overflow-hidden">
                    {post.coverImageUrl ? (
                      <Image
                        src={post.coverImageUrl}
                        alt={post.title}
                        fill
                        sizes="(max-width: 640px) 80vw, (max-width: 768px) 60vw, 33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-text-muted text-sm">{post.category}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4 md:p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-accent-gold">
                        {post.category}
                      </span>
                      <span className="text-xs text-text-muted">
                        {formatDate(post.publishedAt)}
                      </span>
                    </div>
                    <h3 className="font-display text-base md:text-lg font-medium text-text-primary group-hover:text-accent-rose transition-colors leading-snug">
                      {post.title}
                    </h3>
                    <p className="mt-2 text-sm text-text-muted leading-relaxed line-clamp-2 flex-1">
                      {post.excerpt}
                    </p>
                    <span className="inline-block mt-3 text-sm font-medium text-accent-rose">
                      Read more →
                    </span>
                  </div>
                </article>
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-6 text-center">
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
