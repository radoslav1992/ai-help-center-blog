import { setCommentStatusAction, setReviewStatusAction } from "@/app/actions";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";

type ModerationProps = {
  searchParams: { status?: string };
};

export default async function ModerationPage({ searchParams }: ModerationProps) {
  const query = searchParams;

  const [comments, reviews] = await Promise.all([
    db.comment.findMany({
      where: { status: "PENDING" },
      include: {
        user: { select: { name: true } },
        post: { select: { title: true, slug: true } }
      },
      orderBy: { createdAt: "desc" }
    }),
    db.review.findMany({
      where: { status: "PENDING" },
      include: {
        user: { select: { name: true } },
        post: { select: { title: true, slug: true } }
      },
      orderBy: { createdAt: "desc" }
    })
  ]);

  return (
    <section className="neo-card">
      <p className="neo-kicker">MODERATION</p>
      <h2>Approve or reject incoming community content</h2>

      {query.status ? <p className="notice">Moderation action saved.</p> : null}

      <h3>Pending comments</h3>
      <div className="stack-list">
        {comments.map((comment) => (
          <article key={comment.id} className="mini-card">
            <p>{comment.body}</p>
            <p className="meta-line">
              {comment.user.name} on {comment.post.title} · {formatDate(comment.createdAt)}
            </p>
            <div className="inline-actions">
              <form action={setCommentStatusAction}>
                <input type="hidden" name="id" value={comment.id} />
                <input type="hidden" name="status" value="APPROVED" />
                <button type="submit" className="neo-button small-button">
                  Approve
                </button>
              </form>
              <form action={setCommentStatusAction}>
                <input type="hidden" name="id" value={comment.id} />
                <input type="hidden" name="status" value="REJECTED" />
                <button type="submit" className="neo-button small-button alt-button">
                  Reject
                </button>
              </form>
            </div>
          </article>
        ))}

        {!comments.length ? <p className="neo-empty">No pending comments.</p> : null}
      </div>

      <h3>Pending reviews</h3>
      <div className="stack-list">
        {reviews.map((review) => (
          <article key={review.id} className="mini-card">
            <p className="meta-line">Rating: {review.rating} / 5</p>
            <p>{review.body}</p>
            <p className="meta-line">
              {review.user.name} on {review.post.title} · {formatDate(review.createdAt)}
            </p>
            <div className="inline-actions">
              <form action={setReviewStatusAction}>
                <input type="hidden" name="id" value={review.id} />
                <input type="hidden" name="status" value="APPROVED" />
                <button type="submit" className="neo-button small-button">
                  Approve
                </button>
              </form>
              <form action={setReviewStatusAction}>
                <input type="hidden" name="id" value={review.id} />
                <input type="hidden" name="status" value="REJECTED" />
                <button type="submit" className="neo-button small-button alt-button">
                  Reject
                </button>
              </form>
            </div>
          </article>
        ))}

        {!reviews.length ? <p className="neo-empty">No pending reviews.</p> : null}
      </div>
    </section>
  );
}
