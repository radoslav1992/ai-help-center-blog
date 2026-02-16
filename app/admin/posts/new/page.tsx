import { createPostAction } from "@/app/actions";

type NewPostProps = {
  searchParams: { error?: string };
};

export default async function NewPostPage({ searchParams }: NewPostProps) {
  const query = searchParams;

  return (
    <section className="neo-card">
      <p className="neo-kicker">NEW ARTICLE</p>
      <h2>Create a post</h2>
      <p>Write AI-focused content and publish immediately or save as a draft.</p>

      {query.error ? <p className="error-line">Please fill every field correctly.</p> : null}

      <form action={createPostAction} className="neo-form">
        <label htmlFor="title">Title</label>
        <input id="title" name="title" type="text" minLength={8} maxLength={160} required />

        <label htmlFor="excerpt">Excerpt</label>
        <textarea id="excerpt" name="excerpt" minLength={16} maxLength={220} required />

        <label htmlFor="coverImageUrl">Cover image URL (optional)</label>
        <input id="coverImageUrl" name="coverImageUrl" type="url" placeholder="https://..." />

        <label htmlFor="galleryImageUrls">Gallery image URLs (optional, one per line)</label>
        <textarea
          id="galleryImageUrls"
          name="galleryImageUrls"
          rows={4}
          placeholder={`https://...\\nhttps://...`}
        />

        <label htmlFor="content">Article content</label>
        <textarea id="content" name="content" minLength={80} required rows={14} />

        <label className="checkbox-line" htmlFor="published">
          <input id="published" name="published" type="checkbox" />
          Publish now
        </label>

        <button type="submit" className="neo-button">
          Save post
        </button>
      </form>
    </section>
  );
}
