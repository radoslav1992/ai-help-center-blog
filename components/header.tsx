import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";
import { getSiteSettings } from "@/lib/site-settings";

export async function Header() {
  const [session, settings] = await Promise.all([getServerSession(authOptions), getSiteSettings()]);
  const logoUrl = settings.logoImageUrl || "/default-logo.png";
  const bannerImageClass = `banner-image banner-image--${settings.bannerImageMode.toLowerCase()}`;

  return (
    <>
      <header className="site-shell site-header">
        <div>
          <Link href="/" className="brand-link">
            <img src={logoUrl} alt="AI Help Center logo" className="brand-logo" />
            <span className="brand-title">AI Help Center</span>
          </Link>
          <p className="brand-subtitle">AI blog, guides, and tooling reviews</p>
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
            <img src={settings.bannerImageUrl} alt="AI Help Center banner" className={bannerImageClass} />
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
