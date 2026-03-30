import type { Metadata } from "next";
import Link from "next/link";
import { products, categories, getProductById, getProductsByCategory } from "@/lib/mock-data";
import { notFound } from "next/navigation";
import { FavoriteButton } from "@/components/FavoriteButton";
import { ProductTabs } from "./ProductTabs";
import { ProductActions } from "./ProductActions";
import { SimilarProductCard } from "./SimilarProductCard";
import { ArticleCopy } from "./ArticleCopy";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = getProductById(id);

  if (!product) {
    return { title: "Товар не найден" };
  }

  const fullName = product.car_brand
    ? `${product.name} ${product.car_brand} ${product.car_model || ""}`
    : product.name;

  return {
    title: fullName,
    description: `Купить ${fullName} в ROSAutoAsia. Цена: ${product.price.toLocaleString("ru-RU")} сом. Бренд: ${product.brand}. Доставка по Кыргызстану.`,
    openGraph: {
      title: `${fullName} — ROSAutoAsia`,
      description: `${fullName} — ${product.price.toLocaleString("ru-RU")} сом. ${product.brand}. Доставка по Бишкеку и Кыргызстану.`,
      url: `https://raa.kg/product/${id}`,
    },
  };
}

export function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = getProductById(id);

  if (!product) {
    notFound();
  }

  const category = categories.find((c) => c.id === product.category_id);

  // Similar products: same category, exclude current, max 4
  const similarProducts = getProductsByCategory(product.category_id)
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  // Fake old price for design (+15%)
  const oldPrice = Math.round(product.price * 1.15);
  const discountPercent = Math.round(((oldPrice - product.price) / oldPrice) * 100);

  return (
    <div className="max-w-7xl mx-auto px-6 pt-8 pb-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-on-surface-variant mb-8">
        <Link href="/" className="hover:text-primary transition-colors">Главная</Link>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <Link href="/catalog" className="hover:text-primary transition-colors">Каталог</Link>
        {category && (
          <>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <Link href={`/catalog/${category.slug}`} className="hover:text-primary transition-colors">
              {category.name}
            </Link>
          </>
        )}
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <span className="font-medium text-on-surface">{product.name}</span>
      </nav>

      {/* Product Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12 items-start">
        {/* Left: Gallery */}
        <div className="space-y-4">
          <div className="bg-surface-lowest rounded-xl p-8 warm-shadow aspect-square flex items-center justify-center overflow-hidden">
            {product.image ? (
              <img
                alt={product.name}
                className="w-full h-full object-contain"
                src={product.image}
              />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-outline-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )}
          </div>
          {/* Thumbnail placeholders */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-surface-lowest rounded-lg p-2 border-2 border-primary-container warm-shadow cursor-pointer">
              <div className="w-full h-20 flex items-center justify-center">
                {product.image ? (
                  <img alt="Thumbnail 1" className="w-full h-20 object-contain" src={product.image} />
                ) : (
                  <span className="material-symbols-outlined text-outline-variant">image</span>
                )}
              </div>
            </div>
            {[2, 3, 4].map((i) => (
              <div key={i} className="bg-surface-lowest rounded-lg p-2 hover:bg-surface-mid transition-colors cursor-pointer">
                <div className="w-full h-20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-outline-variant">image</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Info Card */}
        <div className="bg-surface-lowest rounded-xl p-8 warm-shadow flex flex-col justify-between">
          <div>
            {/* Brand badge + rating */}
            <div className="flex justify-between items-start mb-4">
              <span className="bg-primary-container/20 text-on-primary-fixed-variant px-4 py-1 rounded-full text-sm font-bold tracking-wide uppercase">
                {product.brand}
              </span>
              <div className="flex items-center gap-1 text-primary-container">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                ))}
                <span className="text-on-surface-variant text-sm ml-1">(0 отзывов)</span>
              </div>
            </div>

            {/* Product name */}
            <h1 className="text-3xl font-black text-on-surface font-[family-name:var(--font-headline)] mb-2 leading-tight">
              {product.name}
              {product.car_brand && ` ${product.car_brand} ${product.car_model}`}
            </h1>

            {/* Article */}
            <ArticleCopy article={product.article} />

            {/* Availability */}
            <div className="flex items-center gap-2 mb-6">
              {product.quantity > 0 ? (
                <>
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  <span className="text-green-700 font-medium text-sm">В наличии</span>
                  <span className="text-on-surface-variant text-sm ml-4">
                    &bull; {product.quantity} {product.unit}
                  </span>
                </>
              ) : (
                <>
                  <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                  <span className="text-red-600 font-medium text-sm">Нет в наличии</span>
                </>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-4 mb-8">
              <span className="text-4xl font-black text-primary font-[family-name:var(--font-headline)]">
                {product.price.toLocaleString("ru-RU")} сом
              </span>
              <span className="text-xl text-on-surface-variant/60 line-through">
                {oldPrice.toLocaleString("ru-RU")} сом
              </span>
              <span className="bg-error/10 text-error px-2 py-0.5 rounded text-xs font-bold">
                -{discountPercent}%
              </span>
            </div>

            <ProductActions product={product} />

            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <FavoriteButton
                productId={product.id}
                className="px-6 py-4 rounded-full border-2 border-outline-variant text-on-surface font-bold hover:bg-surface-mid transition-all flex items-center justify-center gap-2 active:scale-95"
              />
            </div>

            {/* Delivery info */}
            <div className="bg-surface-mid p-4 rounded-xl flex items-center gap-4">
            <div className="bg-primary-container/20 p-2 rounded-lg">
              <span className="material-symbols-outlined text-primary">local_shipping</span>
            </div>
            <div>
              <p className="font-bold text-sm">Доставка по Бишкеку: 1-2 дня</p>
              <p className="text-xs text-on-surface-variant">Бесплатно при заказе от 5,000 сом</p>
            </div>
          </div>
        </div>
      </div>
    </div>

      {/* Tabs Section */}
      <ProductTabs product={product} category={category} />

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <>
          <h2 className="text-2xl font-black text-on-surface font-[family-name:var(--font-headline)] mb-8">
            Похожие товары
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {similarProducts.map((p) => (
              <SimilarProductCard key={p.id} product={p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
