import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function AdminLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login?callbackUrl=/admin");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <section className="admin-shell">
      <div className="neo-card admin-nav">
        <p className="neo-kicker">ADMIN PANEL</p>
        <h1>AI Help Center</h1>
        <nav className="nav-links" aria-label="Admin">
          <Link href="/admin">Dashboard</Link>
          <Link href="/admin/posts">Posts</Link>
          <Link href="/admin/moderation">Moderation</Link>
          <Link href="/admin/settings">Settings</Link>
        </nav>
      </div>
      {children}
    </section>
  );
}
