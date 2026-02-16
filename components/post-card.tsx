import Link from "next/link";
import { formatDate } from "@/lib/utils";

type PostCardProps = {
  title: string;
  slug: string;
  excerpt: string;
  createdAt: Date;
  coverImageUrl: string | null;
  commentsCount: number;
  reviewsCount: number;
  averageRating: number | null;
};

export function PostCard({
  title,
  slug,
  excerpt,
  createdAt,
  coverImageUrl,
  commentsCount,
  reviewsCount,
  averageRating
}: PostCardProps) {
  return (
    <article className="neo-card">
      {coverImageUrl ? <img src={coverImageUrl} alt={title} className="post-card-image" /> : null}
      <p className="neo-kicker">{formatDate(createdAt)}</p>
      <h2>
        <Link href={`/posts/${slug}`} className="card-title-link">
          {title}
        </Link>
      </h2>
      <p>{excerpt}</p>

      <div className="badge-row">
        <span className="neo-badge">{commentsCount} comments</span>
        <span className="neo-badge">{reviewsCount} reviews</span>
        <span className="neo-badge">
          {averageRating ? `${averageRating.toFixed(1)} / 5` : "No ratings yet"}
        </span>
      </div>
    </article>
  );
}
