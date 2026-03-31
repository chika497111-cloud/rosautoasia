import type { Metadata } from "next";
import { getProductById, getCategoryBySlug } from "@/lib/products-server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    return { title: "Товар не найден" };
  }

  const category = product.category_id
    ? await getCategoryBySlug(product.category_id)
    : null;

  const title = `${product.name} — купить в Бишкеке`;
  const description = [
    product.name,
    product.article ? `Артикул: ${product.article}` : "",
    product.brand ? `Бренд: ${product.brand}` : "",
    product.price ? `Цена: ${product.price.toLocaleString("ru-RU")} сом` : "",
    product.quantity > 0 ? "В наличии" : "Под заказ",
    category ? `Категория: ${category.name}` : "",
    "Доставка по Кыргызстану. ROSAutoAsia.",
  ]
    .filter(Boolean)
    .join(". ");

  return {
    title,
    description,
    openGraph: {
      title: `${product.name} | ROSAutoAsia`,
      description,
      url: `https://raa.kg/product/${id}`,
      ...(product.image ? { images: [{ url: product.image }] } : {}),
    },
  };
}

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
