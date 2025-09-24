import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://hinn.dev";

const routes = [
  "/",
  "/showcase",
  "/blog",
  "/contact",
];

const blogSlugs = [
  "welcome-to-hinn-blog",
  "website-as-a-service",
  "recent-builds-and-success-stories",
  "ai-features-on-your-site",
  "pricing-that-scales",
  "product-roadmap",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();
  const staticPages: MetadataRoute.Sitemap = routes.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: path === "/" ? 1 : 0.7,
  }));

  const blogPages: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
    url: `${SITE_URL}/blog/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticPages, ...blogPages];
}
