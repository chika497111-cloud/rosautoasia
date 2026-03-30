import type { MetadataRoute } from "next";
import { getCategories } from "@/lib/products-api";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://raa.kg";

  const staticPages = [
    { url: baseUrl, changeFrequency: "daily" as const, priority: 1 },
    { url: `${baseUrl}/catalog`, changeFrequency: "daily" as const, priority: 0.9 },
    { url: `${baseUrl}/about`, changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${baseUrl}/delivery`, changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${baseUrl}/contacts`, changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${baseUrl}/select-car`, changeFrequency: "weekly" as const, priority: 0.7 },
    { url: `${baseUrl}/search`, changeFrequency: "daily" as const, priority: 0.6 },
  ];

  const categories = await getCategories();

  const categoryPages = categories.map((cat) => ({
    url: `${baseUrl}/catalog/${cat.slug}`,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  // We don't list all 19k products in sitemap (too heavy).
  // Categories are enough for crawling — product pages are linked from category pages.
  return [...staticPages, ...categoryPages];
}
