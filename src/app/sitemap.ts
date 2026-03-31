import type { MetadataRoute } from "next";
import { getCategories } from "@/lib/products-server";

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

  // Fetch real categories from Firestore via firebase-admin
  const categories = await getCategories();
  const categoryPages = categories.map((cat) => ({
    url: `${baseUrl}/catalog/${cat.slug}`,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...categoryPages];
}
