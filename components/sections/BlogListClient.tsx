"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";
import { StaggerGrid, StaggerItem } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  coverImageUrl?: string;
  publishedAt: string;
}

interface BlogListClientProps {
  posts: BlogPost[];
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function BlogListClient({ posts }: BlogListClientProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = [
    "All",
    ...Array.from(new Set(posts.map((p) => p.category))),
  ];

  const filtered = posts.filter((post) => {
    const matchesCategory =
      activeCategory === "All" || post.category === activeCategory;
    const matchesSearch =
      search === "" ||
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div>
      {/* Search + Filter bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted/60" />
          <input
            type="text"
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-full border border-border bg-card text-sm text-text-primary placeholder:text-text-muted/60 focus:border-accent-rose focus:ring-1 focus:ring-accent-rose/30 transition-colors"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors",
                activeCategory === cat
                  ? "bg-accent-rose text-white"
                  : "bg-bg-blush text-text-muted hover:bg-border"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Post grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-muted">
            No articles found. Try a different search or category.
          </p>
        </div>
      ) : (
        <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filtered.map((post) => (
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
                        <span className="text-text-muted text-sm">
                          {post.category}
                        </span>
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
    </div>
  );
}
