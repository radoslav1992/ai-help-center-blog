import Link from "next/link";
import { getServerSession } from "next-auth";
import { cancelSubscriptionAction, subscribeAction } from "@/app/actions";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getSiteSettings } from "@/lib/site-settings";

type SubscribePageProps = {
  searchParams: { status?: string; next?: string };
};

export default async function SubscribePage({ searchParams }: SubscribePageProps) {
  const query = searchParams;
  const [session, settings] = await Promise.all([getServerSession(authOptions), getSiteSettings()]);

  if (!session?.user) {
    return (
      <section className="neo-card">
        <p className="neo-kicker">MEMBER ACCESS</p>
        <h1>Activate free membership for article reviews</h1>
        <p>
          You need an account to activate free member benefits. Once active, you can post one
          review per article at no cost.
        </p>

        <div className="hero-cta">
          <Link
            href={`/login?callbackUrl=${encodeURIComponent(query.next ?? "/subscribe")}`}
            className="neo-button"
          >
            Log in
          </Link>
          <Link href="/signup" className="neo-button alt-button">
            Create account
          </Link>
          {settings.buyMeACoffeeUrl ? (
            <a href={settings.buyMeACoffeeUrl} target="_blank" rel="noreferrer" className="neo-button">
              {settings.bannerCtaLabel}
            </a>
          ) : null}
        </div>
      </section>
    );
  }

  const subscription = await db.subscription.findUnique({
    where: { userId: session.user.id }
  });

  return (
    <section className="neo-card">
      <p className="neo-kicker">MEMBERSHIP</p>
      <h1>Manage your reviewer access</h1>
      <p>Membership is free. Members can publish reviews after moderation approval.</p>

      {query.status === "active" ? <p className="notice">Membership is now active.</p> : null}
      {query.status === "paused" ? <p className="notice">Membership paused.</p> : null}

      <div className="stack-list">
        <article className="mini-card">
          <p className="meta-line">Current state</p>
          <p>
            {subscription?.active ? `${subscription.tier} active` : "Inactive. Activate to unlock reviews."}
          </p>
        </article>

        <article className="mini-card">
          <p className="meta-line">What you get</p>
          <p>Review posting, article discussion, and early access to selected AI playbooks.</p>
        </article>

        {settings.buyMeACoffeeUrl ? (
          <article className="mini-card">
            <p className="meta-line">Optional support</p>
            <p>Membership is free. If you want to support the blog, you can use Buy me a coffee.</p>
            <a href={settings.buyMeACoffeeUrl} target="_blank" rel="noreferrer" className="neo-button">
              {settings.bannerCtaLabel}
            </a>
          </article>
        ) : null}
      </div>

      <form action={subscribeAction} className="neo-form">
        <button type="submit" className="neo-button">
          Activate free membership
        </button>
      </form>

      {subscription?.active ? (
        <form action={cancelSubscriptionAction}>
          <button type="submit" className="neo-button alt-button">
            Pause membership
          </button>
        </form>
      ) : null}
    </section>
  );
}
