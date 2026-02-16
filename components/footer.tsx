import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSiteSettings } from "@/lib/site-settings";

export async function Footer() {
  const [settings, session] = await Promise.all([getSiteSettings(), getServerSession(authOptions)]);
  const year = new Date().getFullYear();

  return (
    <footer className="site-shell site-footer" aria-label="Site footer">
      <div>
        <p className="brand-title">AI Help Center</p>
        <p className="meta-line">Free AI blog for practical builders.</p>
      </div>

      <nav className="nav-links" aria-label="Footer">
        <Link href="/">Home</Link>
        <Link href="/blog">Blog</Link>
        <Link href="/subscribe">Membership</Link>
        {session?.user?.role === "ADMIN" ? <Link href="/admin">Admin</Link> : null}
        {settings.buyMeACoffeeUrl ? (
          <a href={settings.buyMeACoffeeUrl} target="_blank" rel="noreferrer">
            {settings.bannerCtaLabel}
          </a>
        ) : null}
      </nav>

      <p className="meta-line">Copyright {year} AI Help Center</p>
    </footer>
  );
}
