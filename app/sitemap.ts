import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const posts = await db.post.findMany({
    where: { published: true },
    select: {
      slug: true,
      updatedAt: true
    }
  });

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1
    },
    {
      url: `${siteUrl}/subscribe`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9
    }
  ];

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${siteUrl}/posts/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8
  }));

  return [...staticRoutes, ...postRoutes];
}
