import Link from "next/link";

export default function NotFoundPage() {
  return (
    <section className="neo-card">
      <p className="neo-kicker">404</p>
      <h1>Page not found</h1>
      <p>The page you requested does not exist in AI Help Center.</p>
      <Link href="/" className="neo-button">
        Back to homepage
      </Link>
    </section>
  );
}
