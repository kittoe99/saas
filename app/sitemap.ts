import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://hinn.dev";

const routes = [
  "/",
  "/showcase",
  "/contact",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();
  const staticPages: MetadataRoute.Sitemap = routes.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: path === "/" ? 1 : 0.7,
  }));

  return [...staticPages];
}
