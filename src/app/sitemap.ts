import type { MetadataRoute } from "next";
import { categories as mockCategories } from "@/lib/mock-data";

export default function sitemap(): MetadataRoute.Sitemap {
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

  // Use static mock categories for sitemap — no Firestore calls in server-side code
  const categoryPages = mockCategories.map((cat) => ({
    url: `${baseUrl}/catalog/${cat.slug}`,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...categoryPages];
}
