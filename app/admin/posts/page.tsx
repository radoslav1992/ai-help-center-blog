import Link from "next/link";
import { togglePostPublishAction } from "@/app/actions";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";

type AdminPostsProps = {
  searchParams: { status?: string };
};

export default async function AdminPostsPage({ searchParams }: AdminPostsProps) {
  const query = searchParams;

  const posts = await db.post.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      comments: {
        select: { id: true }
      },
      reviews: {
        select: { id: true }
      }
    }
  });

  return (
    <section className="neo-card">
      <div className="row-between">
        <div>
          <p className="neo-kicker">CONTENT</p>
          <h2>Manage posts</h2>
        </div>
        <Link href="/admin/posts/new" className="neo-button">
          New post
        </Link>
      </div>

      {query.status ? <p className="notice">Post update applied.</p> : null}

      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Slug</th>
              <th>Cover</th>
              <th>Updated</th>
              <th>Comments</th>
              <th>Reviews</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id}>
                <td>{post.title}</td>
                <td>{post.slug}</td>
                <td>{post.coverImageUrl ? "Yes" : "No"}</td>
                <td>{formatDate(post.updatedAt)}</td>
                <td>{post.comments.length}</td>
                <td>{post.reviews.length}</td>
                <td>{post.published ? "Published" : "Draft"}</td>
                <td>
                  <form action={togglePostPublishAction}>
                    <input type="hidden" name="postId" value={post.id} />
                    <input type="hidden" name="publish" value={String(!post.published)} />
                    <button type="submit" className="neo-button small-button">
                      {post.published ? "Unpublish" : "Publish"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!posts.length ? <p className="neo-empty">No posts yet.</p> : null}
    </section>
  );
}
