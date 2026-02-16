import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";
import { getSiteSettings } from "@/lib/site-settings";

export async function Header() {
  const [session, settings] = await Promise.all([getServerSession(authOptions), getSiteSettings()]);

  return (
    <>
      <header className="site-shell site-header">
        <div>
          <Link href="/" className="brand-title">
            AI Help Center
          </Link>
          <p className="brand-subtitle">Neubrutalist AI blog, guides, and tooling reviews</p>
        </div>

        <nav className="nav-links" aria-label="Primary">
          <Link href="/">Home</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/subscribe">Membership</Link>
          {settings.buyMeACoffeeUrl ? (
            <a href={settings.buyMeACoffeeUrl} target="_blank" rel="noreferrer">
              Buy me a coffee
            </a>
          ) : null}
          {session?.user?.role === "ADMIN" ? <Link href="/admin">Admin</Link> : null}

          {!session ? (
            <>
              <Link href="/login">Log in</Link>
              <Link href="/signup">Sign up</Link>
            </>
          ) : (
            <LogoutButton />
          )}
        </nav>
      </header>

      {settings.bannerEnabled ? (
        <section className="site-shell banner-card" aria-label="Site banner">
          {settings.bannerImageUrl ? (
            <img src={settings.bannerImageUrl} alt="AI Help Center banner" className="banner-image" />
          ) : null}
          <p>{settings.bannerText}</p>
          {settings.buyMeACoffeeUrl ? (
            <a href={settings.buyMeACoffeeUrl} target="_blank" rel="noreferrer" className="neo-button">
              {settings.bannerCtaLabel}
            </a>
          ) : null}
        </section>
      ) : null}
    </>
  );
}
