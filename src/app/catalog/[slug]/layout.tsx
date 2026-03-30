import type { Metadata } from "next";
import { getCategoryBySlug } from "@/lib/products-api";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return { title: "Категория" };
  }

  return {
    title: category.name,
    description: `Купить ${category.name.toLowerCase()} в ROSAutoAsia. Оригиналы и аналоги с доставкой по Кыргызстану.`,
    openGraph: {
      title: `${category.name} — ROSAutoAsia`,
      description: `${category.name}: оригиналы и аналоги в наличии и под заказ.`,
      url: `https://raa.kg/catalog/${slug}`,
    },
  };
}

export default function CategoryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
