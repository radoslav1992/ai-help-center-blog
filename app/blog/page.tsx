import type { Metadata } from "next";
import Link from "next/link";
import { PostCard } from "@/components/post-card";
import { db } from "@/lib/db";
import { average, parseImageUrls } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Browse, search, and filter AI Help Center articles by newest, rating, review volume, and image availability.",
  alternates: {
    canonical: "/blog"
  }
};

type BlogPageProps = {
  searchParams: {
    q?: string;
    sort?: string;
    minRating?: string;
    withImages?: string;
  };
};

type EnrichedPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl: string | null;
  galleryImageUrls: string | null;
  createdAt: Date;
  commentsCount: number;
  reviewsCount: number;
  averageRating: number | null;
};

function sortPosts(posts: EnrichedPost[], sort: string) {
  if (sort === "oldest") {
    return [...posts].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  if (sort === "top-rated") {
    return [...posts].sort((a, b) => {
      const aRating = a.averageRating ?? -1;
      const bRating = b.averageRating ?? -1;

      if (bRating !== aRating) {
        return bRating - aRating;
      }

      return b.reviewsCount - a.reviewsCount;
    });
  }

  if (sort === "most-reviewed") {
    return [...posts].sort((a, b) => {
      if (b.reviewsCount !== a.reviewsCount) {
        return b.reviewsCount - a.reviewsCount;
      }

      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  }

  return [...posts].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const q = (searchParams.q ?? "").trim();
  const normalizedQ = q.toLowerCase();
  const sort = searchParams.sort ?? "newest";
  const minRating = Number(searchParams.minRating ?? "0");
  const withImages = searchParams.withImages === "1";

  const posts = await db.post.findMany({
    where: { published: true },
    include: {
      comments: {
        where: { status: "APPROVED" },
        select: { id: true }
      },
      reviews: {
        where: { status: "APPROVED" },
        select: { id: true, rating: true }
      }
    }
  });

  const enriched: EnrichedPost[] = posts.map((post) => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    coverImageUrl: post.coverImageUrl,
    galleryImageUrls: post.galleryImageUrls,
    createdAt: post.createdAt,
    commentsCount: post.comments.length,
    reviewsCount: post.reviews.length,
    averageRating: average(post.reviews.map((review) => review.rating))
  }));

  const filtered = enriched.filter((post) => {
    if (q) {
      const haystack = `${post.title} ${post.excerpt} ${post.content}`.toLowerCase();
      if (!haystack.includes(normalizedQ)) {
        return false;
      }
    }

    if (Number.isFinite(minRating) && minRating > 0) {
      if (!post.averageRating || post.averageRating < minRating) {
        return false;
      }
    }

    if (withImages) {
      const gallery = parseImageUrls(post.galleryImageUrls);
      if (!post.coverImageUrl && !gallery.length) {
        return false;
      }
    }

    return true;
  });

  const sorted = sortPosts(filtered, sort);

  return (
    <>
      <section className="neo-card">
        <p className="neo-kicker">BLOG</p>
        <h1>Search and filter articles</h1>
        <p>
          Discover AI articles by topic, review quality, publication time, and image-rich content.
        </p>

        <form action="/blog" method="get" className="neo-form blog-filter-form">
          <label htmlFor="q">Search</label>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={q}
            placeholder="prompt engineering, agents, evals..."
          />

          <label htmlFor="sort">Sort by</label>
          <select id="sort" name="sort" defaultValue={sort}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="top-rated">Top rated</option>
            <option value="most-reviewed">Most reviewed</option>
          </select>

          <label htmlFor="minRating">Minimum rating</label>
          <select id="minRating" name="minRating" defaultValue={String(minRating)}>
            <option value="0">Any rating</option>
            <option value="3">3+ stars</option>
            <option value="4">4+ stars</option>
            <option value="5">5 stars</option>
          </select>

          <label className="checkbox-line" htmlFor="withImages">
            <input
              id="withImages"
              name="withImages"
              type="checkbox"
              value="1"
              defaultChecked={withImages}
            />
            Only articles with images
          </label>

          <div className="hero-cta">
            <button type="submit" className="neo-button">
              Apply filters
            </button>
            <Link href="/blog" className="neo-button alt-button">
              Reset
            </Link>
          </div>
        </form>

        <p className="meta-line">Showing {sorted.length} article(s).</p>
      </section>

      <section className="grid-list" aria-label="Filtered blog posts">
        {sorted.map((post) => (
          <PostCard
            key={post.id}
            slug={post.slug}
            title={post.title}
            excerpt={post.excerpt}
            createdAt={post.createdAt}
            coverImageUrl={post.coverImageUrl}
            commentsCount={post.commentsCount}
            reviewsCount={post.reviewsCount}
            averageRating={post.averageRating}
          />
        ))}
      </section>

      {!sorted.length ? (
        <p className="neo-empty">
          No posts match your filters. <Link href="/blog">Clear filters</Link> and try again.
        </p>
      ) : null}
    </>
  );
}
