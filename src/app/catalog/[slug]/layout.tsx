import type { Metadata } from "next";
import { getCategoryBySlug } from "@/lib/mock-data";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    return { title: "Категория не найдена" };
  }

  return {
    title: category.name,
    description: `Купить ${category.name.toLowerCase()} в ROSAutoAsia. Оригиналы и аналоги с доставкой по Кыргызстану. Фильтры по бренду, цене, наличию.`,
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
