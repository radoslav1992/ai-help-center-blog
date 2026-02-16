import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import type { Metadata } from "next";
import { createCommentAction, createReviewAction } from "@/app/actions";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getSiteSettings } from "@/lib/site-settings";
import { average, formatDate, parseImageUrls } from "@/lib/utils";

type PostPageProps = {
  params: { slug: string };
  searchParams: { comment?: string; review?: string };
};

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = params;

  const post = await db.post.findUnique({
    where: { slug },
    select: { title: true, excerpt: true, published: true, coverImageUrl: true }
  });

  if (!post || !post.published) {
    return {
      title: "Article not found"
    };
  }

  return {
    title: post.title,
    description: post.excerpt,
    alternates: {
      canonical: `/posts/${slug}`
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      url: `/posts/${slug}`,
      images: post.coverImageUrl ? [post.coverImageUrl] : undefined
    }
  };
}

export default async function PostPage({ params, searchParams }: PostPageProps) {
  const { slug } = params;
  const query = searchParams;

  const [session, post, settings] = await Promise.all([
    getServerSession(authOptions),
    db.post.findUnique({
      where: { slug },
      include: {
        comments: {
          where: { status: "APPROVED" },
          include: {
            user: {
              select: { name: true }
            }
          },
          orderBy: { createdAt: "desc" }
        },
        reviews: {
          where: { status: "APPROVED" },
          include: {
            user: {
              select: { name: true }
            }
          },
          orderBy: { createdAt: "desc" }
        }
      }
    }),
    getSiteSettings()
  ]);

  if (!post || !post.published) {
    notFound();
  }

  const subscription = session?.user?.id
    ? await db.subscription.findUnique({ where: { userId: session.user.id } })
    : null;

  const averageRating = average(post.reviews.map((review) => review.rating));
  const galleryUrls = parseImageUrls(post.galleryImageUrls);

  return (
    <article className="article-shell">
      <header className="neo-card article-header">
        <p className="neo-kicker">Published {formatDate(post.createdAt)}</p>
        <h1>{post.title}</h1>
        <p>{post.excerpt}</p>
        {post.coverImageUrl ? (
          <img src={post.coverImageUrl} alt={post.title} className="article-cover-image" />
        ) : null}
        <div className="badge-row">
          <span className="neo-badge">{post.comments.length} comments</span>
          <span className="neo-badge">{post.reviews.length} reviews</span>
          <span className="neo-badge">
            {averageRating ? `${averageRating.toFixed(1)} / 5` : "No ratings yet"}
          </span>
        </div>
      </header>

      <section className="neo-card article-content">
        {post.content.split(/\n\n+/).map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </section>

      {galleryUrls.length ? (
        <section className="neo-card">
          <h2>Article images</h2>
          <div className="gallery-grid">
            {galleryUrls.map((url) => (
              <img key={url} src={url} alt={`${post.title} illustration`} className="article-gallery-image" />
            ))}
          </div>
        </section>
      ) : null}

      <section className="neo-card">
        <h2>Comments</h2>
        <p className="helper-text">Comments are moderated before they appear publicly.</p>

        {query.comment === "submitted" ? <p className="notice">Comment submitted for review.</p> : null}

        {!session?.user ? (
          <p>
            <Link href={`/login?callbackUrl=/posts/${slug}`}>Log in</Link> to comment.
          </p>
        ) : (
          <form action={createCommentAction} className="neo-form">
            <input type="hidden" name="postId" value={post.id} />
            <input type="hidden" name="slug" value={post.slug} />
            <label htmlFor="body">Your comment</label>
            <textarea id="body" name="body" minLength={6} maxLength={1200} required />
            <button type="submit" className="neo-button">
              Submit comment
            </button>
          </form>
        )}

        <div className="stack-list">
          {post.comments.map((comment) => (
            <article key={comment.id} className="mini-card">
              <p>{comment.body}</p>
              <p className="meta-line">
                {comment.user.name} · {formatDate(comment.createdAt)}
              </p>
            </article>
          ))}

          {!post.comments.length ? <p className="neo-empty">No approved comments yet.</p> : null}
        </div>
      </section>

      <section className="neo-card">
        <h2>Reviews</h2>
        <p className="helper-text">Free members can submit one review per article.</p>

        {query.review === "submitted" ? <p className="notice">Review submitted for moderation.</p> : null}

        {!session?.user ? (
          <p>
            <Link href={`/login?callbackUrl=/posts/${slug}`}>Log in</Link> to leave a review.
          </p>
        ) : !subscription?.active ? (
          <p>
            Reviews are for members. <Link href="/subscribe">Activate free membership</Link> first.
          </p>
        ) : (
          <form action={createReviewAction} className="neo-form">
            <input type="hidden" name="postId" value={post.id} />
            <input type="hidden" name="slug" value={post.slug} />

            <label htmlFor="rating">Rating</label>
            <select id="rating" name="rating" defaultValue="5" required>
              <option value="5">5 - Excellent</option>
              <option value="4">4 - Useful</option>
              <option value="3">3 - Good</option>
              <option value="2">2 - Needs work</option>
              <option value="1">1 - Not useful</option>
            </select>

            <label htmlFor="reviewBody">Your review</label>
            <textarea id="reviewBody" name="body" minLength={8} maxLength={1200} required />
            <button type="submit" className="neo-button">
              Submit review
            </button>
          </form>
        )}

        <div className="stack-list">
          {post.reviews.map((review) => (
            <article key={review.id} className="mini-card">
              <p className="meta-line">{review.rating} / 5</p>
              <p>{review.body}</p>
              <p className="meta-line">
                {review.user.name} · {formatDate(review.createdAt)}
              </p>
            </article>
          ))}

          {!post.reviews.length ? <p className="neo-empty">No approved reviews yet.</p> : null}
        </div>

        {settings.buyMeACoffeeUrl ? (
          <a href={settings.buyMeACoffeeUrl} target="_blank" rel="noreferrer" className="neo-button">
            {settings.bannerCtaLabel}
          </a>
        ) : null}
      </section>
    </article>
  );
}
