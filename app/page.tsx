import Link from "next/link";
import { HighlightGrid, type HighlightArticle } from "@/components/highlight-grid";
import { db } from "@/lib/db";
import { average } from "@/lib/utils";
import { getSiteSettings } from "@/lib/site-settings";

function sortByNewest(a: HighlightArticle, b: HighlightArticle) {
  return b.createdAt.getTime() - a.createdAt.getTime();
}

function sortByFeatured(a: HighlightArticle, b: HighlightArticle) {
  const aRating = a.averageRating ?? -1;
  const bRating = b.averageRating ?? -1;

  if (bRating !== aRating) {
    return bRating - aRating;
  }

  if (b.reviewsCount !== a.reviewsCount) {
    return b.reviewsCount - a.reviewsCount;
  }

  return b.createdAt.getTime() - a.createdAt.getTime();
}

function sortByMostReviewed(a: HighlightArticle, b: HighlightArticle) {
  if (b.reviewsCount !== a.reviewsCount) {
    return b.reviewsCount - a.reviewsCount;
  }

  return b.createdAt.getTime() - a.createdAt.getTime();
}

function pickDistinct(
  sortedArticles: HighlightArticle[],
  usedIds: Set<string>,
  count: number,
  fallbackArticles: HighlightArticle[]
) {
  const selected: HighlightArticle[] = [];

  for (const article of sortedArticles) {
    if (usedIds.has(article.id)) {
      continue;
    }

    selected.push(article);
    usedIds.add(article.id);

    if (selected.length === count) {
      return selected;
    }
  }

  for (const article of fallbackArticles) {
    if (selected.some((selectedArticle) => selectedArticle.id === article.id)) {
      continue;
    }

    selected.push(article);
    if (selected.length === count) {
      return selected;
    }
  }

  return selected;
}

export default async function HomePage() {
  const [posts, settings] = await Promise.all([
    db.post.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
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
    }),
    getSiteSettings()
  ]);

  const articles: HighlightArticle[] = posts.map((post) => ({
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    coverImageUrl: post.coverImageUrl,
    createdAt: post.createdAt,
    commentsCount: post.comments.length,
    reviewsCount: post.reviews.length,
    averageRating: average(post.reviews.map((review) => review.rating))
  }));

  const byNewest = [...articles].sort(sortByNewest);
  const byFeatured = [...articles].sort(sortByFeatured);
  const byMostReviewed = [...articles].sort(sortByMostReviewed);

  const usedIds = new Set<string>();

  const newestArticles = pickDistinct(byNewest, usedIds, 3, byNewest);
  const featuredArticles = pickDistinct(byFeatured, usedIds, 3, byNewest);
  const mostReviewedArticles = pickDistinct(byMostReviewed, usedIds, 3, byNewest);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "AI Help Center",
    description:
      "Landing page for AI Help Center with featured and latest AI articles, reviews, and practical guides.",
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  };

  return (
    <>
      <section className="hero-block">
        <p className="neo-kicker">AI HELP CENTER</p>
        <h1>AI insights for people shipping real products</h1>
        <p>
          Explore featured breakdowns, newly published pieces, and the most reviewed content from
          the community.
        </p>
        <div className="hero-cta">
          <Link href="/blog" className="neo-button">
            Browse all articles
          </Link>
          <Link href="/subscribe" className="neo-button alt-button">
            Activate free membership
          </Link>
          {settings.buyMeACoffeeUrl ? (
            <a href={settings.buyMeACoffeeUrl} target="_blank" rel="noreferrer" className="neo-button">
              Buy me a coffee
            </a>
          ) : null}
        </div>
      </section>

      <HighlightGrid
        title="New Articles"
        description="Fresh publications and recent updates from AI Help Center."
        articles={newestArticles}
      />

      <HighlightGrid
        title="Featured Reads"
        description="Top-rated pieces selected by review quality and community feedback."
        articles={featuredArticles}
      />

      <HighlightGrid
        title="Most Reviewed"
        description="Articles that triggered the strongest discussion and most reviews."
        articles={mostReviewedArticles}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </>
  );
}
