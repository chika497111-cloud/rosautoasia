"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { searchProducts } from "@/lib/products-api";
import { AddToCartButton } from "@/components/AddToCartButton";
import { RequestForm } from "./RequestForm";
import type { Product } from "@/lib/mock-data";

export default function SearchPage() {
  return (
    <Suspense fallback={
      <main className="pt-28 pb-20 max-w-[1440px] mx-auto px-6">
        <div className="h-4 w-48 bg-surface-low rounded animate-pulse mb-6" />
        <div className="h-12 w-96 bg-surface-low rounded animate-pulse mb-12" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-surface-lowest rounded-xl p-5 warm-shadow animate-pulse">
              <div className="aspect-square rounded-lg bg-surface-low mb-4" />
              <div className="h-5 w-3/4 bg-surface-low rounded mb-4" />
              <div className="h-8 w-32 bg-surface-low rounded" />
            </div>
          ))}
        </div>
      </main>
    }>
      <SearchPageContent />
    </Suspense>
  );
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }
    setLoading(true);
    searchProducts(query)
      .then(setResults)
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [query]);

  // Extract unique car brands for filter chips
  const carBrands = [...new Set(results.map((p) => p.car_brand).filter(Boolean))];

  return (
    <main className="pt-28 pb-20 max-w-[1440px] mx-auto px-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 mb-6 text-sm font-medium text-on-surface-variant">
        <Link href="/" className="hover:text-primary transition-colors">
          Главная
        </Link>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <span className="text-primary">Поиск</span>
      </nav>

      {/* Header Section */}
      <header className="mb-12">
        <h1 className="font-[family-name:var(--font-headline)] text-4xl md:text-5xl font-extrabold text-[#451A03] tracking-tight leading-tight">
          {query ? (
            <>
              Результаты поиска{" "}
              <span className="text-primary-container italic">&laquo;{query}&raquo;</span>
            </>
          ) : (
            "Поиск запчастей"
          )}
        </h1>
        {query && !loading && (
          <p className="mt-4 text-on-surface-variant font-medium flex items-center">
            <span
              className="material-symbols-outlined mr-2 text-primary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              analytics
            </span>
            Найдено {results.length}{" "}
            {results.length === 1 ? "товар" : results.length < 5 ? "товара" : "товаров"}
          </p>
        )}
      </header>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-surface-lowest rounded-xl p-5 warm-shadow animate-pulse">
              <div className="aspect-square rounded-lg bg-surface-low mb-4" />
              <div className="h-4 w-20 bg-surface-low rounded mb-2" />
              <div className="h-5 w-3/4 bg-surface-low rounded mb-4" />
              <div className="h-8 w-32 bg-surface-low rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Empty Query State */}
      {!query && !loading && (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-6xl text-outline-variant mb-4 block">
            search
          </span>
          <p className="text-on-surface-variant text-lg">Введите запрос в строку поиска.</p>
        </div>
      )}

      {/* No Results State */}
      {query && !loading && results.length === 0 && (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-6xl text-outline-variant mb-4 block">
            search_off
          </span>
          <p className="text-on-surface-variant text-lg mb-2">Ничего не найдено</p>
          <p className="text-on-surface-variant">Попробуйте изменить запрос или проверить артикул</p>
        </div>
      )}

      {/* Filter Chips */}
      {!loading && results.length > 0 && (
        <section className="flex flex-wrap gap-3 mb-10">
          <button className="px-6 py-2.5 rounded-full bg-primary-container text-on-primary-container font-semibold text-sm warm-shadow transition-transform active:scale-95">
            Все
          </button>
          {results.some((p) => p.quantity > 0) && (
            <button className="px-6 py-2.5 rounded-full bg-surface-low text-on-surface-variant hover:bg-surface-mid font-medium text-sm transition-all active:scale-95">
              В наличии
            </button>
          )}
          {carBrands.map((brand) => (
            <button
              key={brand}
              className="px-6 py-2.5 rounded-full bg-surface-low text-on-surface-variant hover:bg-surface-mid font-medium text-sm transition-all active:scale-95"
            >
              {brand}
            </button>
          ))}
        </section>
      )}

      {/* Product Grid */}
      {!loading && results.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((product) => (
            <article
              key={product.id}
              className="bg-surface-lowest rounded-xl p-5 warm-shadow group transition-all hover:-translate-y-1 relative flex flex-col"
            >
              {/* Image Area */}
              <Link href={`/product/${product.id}`}>
                <div className="aspect-square rounded-lg overflow-hidden mb-4 bg-surface-low relative">
                  {product.image ? (
                    <img
                      alt={product.name}
                      src={product.image}
                      loading="lazy"
                      className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                      <span className="material-symbols-outlined text-6xl text-outline-variant/40">
                        image
                      </span>
                    </div>
                  )}
                  {/* Brand Badge */}
                  <div className="absolute top-2 left-2 bg-primary-container/10 text-on-primary-fixed-variant text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider backdrop-blur-md">
                    {product.brand}
                  </div>
                </div>
              </Link>

              {/* Product Info */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                  {product.quantity > 0 ? (
                    <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                      В наличии
                    </span>
                  ) : (
                    <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                      Под заказ
                    </span>
                  )}
                  <span className="text-xs text-on-surface-variant/60">
                    Арт: {product.article}
                  </span>
                </div>
                <Link href={`/product/${product.id}`}>
                  <h3 className="font-[family-name:var(--font-headline)] font-bold text-on-surface leading-snug hover:text-primary transition-colors cursor-pointer">
                    {product.name}
                  </h3>
                </Link>
                {(product.car_brand || product.car_model) && (
                  <p className="text-xs text-on-surface-variant mt-1">
                    {product.car_brand} {product.car_model}
                  </p>
                )}
              </div>

              {/* Price & Cart */}
              <div className="mt-auto flex items-end justify-between">
                <div>
                  <span className="text-xs text-on-surface-variant block">Цена</span>
                  <span className="text-2xl font-black text-[#451A03] font-[family-name:var(--font-headline)]">
                    {product.price.toLocaleString("ru-RU")}{" "}
                    <small className="text-sm">сом</small>
                  </span>
                </div>
                <AddToCartButton product={product} />
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Show More Button */}
      {!loading && results.length > 6 && (
        <div className="flex justify-center mt-12 mb-20">
          <button className="px-8 py-3 rounded-full border border-outline-variant text-on-surface font-semibold hover:bg-surface-low transition-all active:scale-95">
            Показать ещё
          </button>
        </div>
      )}

      {/* "Не нашли?" Section */}
      <section className="mt-16 mb-8 relative overflow-hidden">
        <div className="bg-surface-mid rounded-3xl p-8 md:p-12 warm-shadow grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-[family-name:var(--font-headline)] text-3xl font-black text-[#451A03] mb-4 leading-tight">
              Не нашли нужную деталь?
            </h2>
            <p className="text-on-surface-variant mb-8 text-lg">
              Оставьте заявку, и наши специалисты подберут идеальные запчасти для вашего
              автомобиля в течение 15 минут.
            </p>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-secondary">
                <span className="material-symbols-outlined">verified</span>
                <span className="font-semibold">Гарантия совместимости</span>
              </div>
              <div className="flex items-center space-x-3 text-secondary">
                <span className="material-symbols-outlined">speed</span>
                <span className="font-semibold">Быстрая доставка по всему СНГ</span>
              </div>
            </div>
          </div>

          <RequestForm />
        </div>

        {/* Decorative circle */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary-container/10 rounded-full blur-3xl -z-10" />
      </section>
    </main>
  );
}
