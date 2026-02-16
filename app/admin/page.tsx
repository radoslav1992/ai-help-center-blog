import { db } from "@/lib/db";

export default async function AdminDashboardPage() {
  const [posts, pendingComments, pendingReviews, activeSubscriptions] = await Promise.all([
    db.post.count(),
    db.comment.count({ where: { status: "PENDING" } }),
    db.review.count({ where: { status: "PENDING" } }),
    db.subscription.count({ where: { active: true } })
  ]);

  return (
    <div className="grid-list">
      <article className="neo-card">
        <p className="neo-kicker">POSTS</p>
        <h2>{posts}</h2>
        <p>Total published + draft articles.</p>
      </article>

      <article className="neo-card">
        <p className="neo-kicker">PENDING COMMENTS</p>
        <h2>{pendingComments}</h2>
        <p>Waiting for moderator approval.</p>
      </article>

      <article className="neo-card">
        <p className="neo-kicker">PENDING REVIEWS</p>
        <h2>{pendingReviews}</h2>
        <p>Subscriber reviews awaiting moderation.</p>
      </article>

      <article className="neo-card">
        <p className="neo-kicker">ACTIVE SUBSCRIBERS</p>
        <h2>{activeSubscriptions}</h2>
        <p>Users with review privileges enabled.</p>
      </article>
    </div>
  );
}
