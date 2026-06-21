import Link from "next/link";
import Image from "next/image";
import type { BlogPost } from "@/sanity/fetch";
import { Container } from "@/components/ui/Container";
import { SectionWrapper } from "@/components/ui/BackgroundDecor";
import { Reveal, StaggerGrid, StaggerItem } from "@/components/ui/Reveal";

interface RelatedPostsProps {
  posts: BlogPost[];
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) return null;

  return (
    <SectionWrapper variant="blush">
      <Container>
        <Reveal>
          <h2 className="font-display text-2xl md:text-3xl font-medium text-text-primary text-center mb-8">
            You Might Also Like
          </h2>
        </Reveal>
        <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-accent-gold">
                        {post.category}
                      </span>
                      <span className="text-xs text-text-muted">
                        {formatDate(post.publishedAt)}
                      </span>
                    </div>
                    <h3 className="font-display text-lg font-medium text-text-primary group-hover:text-accent-rose transition-colors leading-snug line-clamp-2">
                      {post.title}
                    </h3>
                  </div>
                </article>
              </Link>
            </StaggerItem>
          ))}
        </StaggerGrid>
      </Container>
    </SectionWrapper>
  );
}
