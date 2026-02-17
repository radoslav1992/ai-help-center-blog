import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { getSiteSettings } from "@/lib/site-settings";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "AI Help Center",
    template: "%s | AI Help Center"
  },
  description:
    "AI Help Center is a blog with practical tutorials, tooling reviews, and actionable guides for builders.",
  keywords: [
    "AI blog",
    "AI tutorials",
    "machine learning",
    "prompt engineering",
    "AI Help Center"
  ],
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "AI Help Center",
    description:
      "Practical AI tutorials and product playbooks for builders.",
    url: siteUrl,
    siteName: "AI Help Center",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Help Center",
    description:
      "Practical AI tutorials and product playbooks for builders."
  }
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();
  const faviconUrl = settings.logoImageUrl || "/default-logo.png";

  return (
    <html lang="en">
      <head>
        <link rel="icon" href={faviconUrl} />
      </head>
      <body>
        <div className="bg-grid" />
        <Header />
        <main className="site-shell">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
