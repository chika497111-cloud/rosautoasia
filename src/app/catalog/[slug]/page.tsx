import { notFound } from "next/navigation";
import { getCategoryBySlug, getProductsByCategoryPage } from "@/lib/products-server";
import type { Metadata } from "next";
import CategoryClient from "./CategoryClient";

const PAGE_SIZE = 48;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const category = await getCategoryBySlug(decodedSlug);
  if (!category) return { title: "Категория не найдена" };

  return {
    title: category.name,
    description: `${category.name} — ${category.productCount} товаров в наличии. Автозапчасти с доставкой по Кыргызстану. ROSAutoAsia.`,
    openGraph: {
      title: `${category.name} | ROSAutoAsia`,
      description: `Купить ${category.name.toLowerCase()} в Бишкеке. ${category.productCount} позиций в наличии.`,
      url: `https://raa.kg/catalog/${decodedSlug}`,
    },
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const category = await getCategoryBySlug(decodedSlug);
  if (!category) notFound();

  const { products, totalCount } = await getProductsByCategoryPage(
    decodedSlug,
    1,
    PAGE_SIZE,
  );

  return (
    <CategoryClient
      category={category}
      initialProducts={products}
      totalCount={totalCount}
      slug={decodedSlug}
    />
  );
}
