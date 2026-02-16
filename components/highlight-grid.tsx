import Link from "next/link";
import { formatDate } from "@/lib/utils";

export type HighlightArticle = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImageUrl: string | null;
  createdAt: Date;
  commentsCount: number;
  reviewsCount: number;
  averageRating: number | null;
};

type HighlightGridProps = {
  title: string;
  description: string;
  articles: HighlightArticle[];
};

function Stats({
  commentsCount,
  reviewsCount,
  averageRating
}: {
  commentsCount: number;
  reviewsCount: number;
  averageRating: number | null;
}) {
  return (
    <div className="badge-row">
      <span className="neo-badge">{commentsCount} comments</span>
      <span className="neo-badge">{reviewsCount} reviews</span>
      <span className="neo-badge">{averageRating ? `${averageRating.toFixed(1)} / 5` : "No ratings"}</span>
    </div>
  );
}

export function HighlightGrid({ title, description, articles }: HighlightGridProps) {
  if (!articles.length) {
    return (
      <section className="neo-card section-block">
        <div className="section-head">
          <div>
            <p className="neo-kicker">DISCOVER</p>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>
          <Link href="/blog" className="neo-button small-button">
            Open blog
          </Link>
        </div>
        <p className="neo-empty">No published articles available for this section yet.</p>
      </section>
    );
  }

  const [main, ...rest] = articles;

  return (
    <section className="neo-card section-block">
      <div className="section-head">
        <div>
          <p className="neo-kicker">DISCOVER</p>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <Link href="/blog" className="neo-button small-button">
          Open blog
        </Link>
      </div>

      <div className="highlight-grid" aria-label={title}>
        <article className="mini-card highlight-main-card">
          {main.coverImageUrl ? (
            <img src={main.coverImageUrl} alt={main.title} className="highlight-main-image" />
          ) : null}
          <p className="meta-line">{formatDate(main.createdAt)}</p>
          <h3>
            <Link href={`/posts/${main.slug}`} className="card-title-link">
              {main.title}
            </Link>
          </h3>
          <p>{main.excerpt}</p>
          <Stats
            commentsCount={main.commentsCount}
            reviewsCount={main.reviewsCount}
            averageRating={main.averageRating}
          />
        </article>

        <div className="highlight-side-stack">
          {rest.slice(0, 2).map((article) => (
            <article key={article.id} className="mini-card highlight-side-card">
              <div>
                <p className="meta-line">{formatDate(article.createdAt)}</p>
                <h3>
                  <Link href={`/posts/${article.slug}`} className="card-title-link">
                    {article.title}
                  </Link>
                </h3>
                <p>{article.excerpt}</p>
              </div>

              {article.coverImageUrl ? (
                <img src={article.coverImageUrl} alt={article.title} className="highlight-side-image" />
              ) : null}

              <Stats
                commentsCount={article.commentsCount}
                reviewsCount={article.reviewsCount}
                averageRating={article.averageRating}
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
