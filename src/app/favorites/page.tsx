"use client";

import Link from "next/link";
import { useFavorites } from "@/lib/favorites-context";
import { products } from "@/lib/mock-data";

export default function FavoritesPage() {
  const { isFavorite, toggleFavorite } = useFavorites();

  const favoriteProducts = products.filter((p) => isFavorite(p.id));

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <section className="bg-gradient-to-r from-[#451A03] to-[#5d260a] text-white">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <nav className="flex items-center gap-2 text-sm text-outline mb-4">
            <Link href="/" className="hover:text-primary-container transition-colors">
              Главная
            </Link>
            <span>/</span>
            <span className="text-white">Избранное</span>
          </nav>
          <h1 className="font-[family-name:var(--font-headline)] text-3xl sm:text-4xl font-bold tracking-tight">
            <span className="text-primary-container">Избранное</span>
          </h1>
          <p className="text-outline-variant mt-2">
            {favoriteProducts.length > 0
              ? `${favoriteProducts.length} ${
                  favoriteProducts.length === 1
                    ? "товар"
                    : favoriteProducts.length < 5
                    ? "товара"
                    : "товаров"
                } в избранном`
              : "Пока ничего не добавлено"}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {favoriteProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {favoriteProducts.map((product) => (
              <div
                key={product.id}
                className="bg-surface-lowest rounded-xl warm-shadow p-5 card-hover relative group"
              >
                {/* Remove from favorites button */}
                <button
                  onClick={() => toggleFavorite(product.id)}
                  className="absolute top-3 right-3 w-10 h-10 rounded-full bg-error-container flex items-center justify-center text-error hover:bg-error hover:text-on-error transition-all duration-300 hover:scale-110 z-10"
                  aria-label="Удалить из избранного"
                  title="Удалить из избранного"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                  </svg>
                </button>

                <Link href={`/product/${product.id}`}>
                  <div className="w-full h-40 bg-surface-mid rounded-lg mb-4 flex items-center justify-center text-outline">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div className="text-xs text-on-surface-variant mb-1">
                    {product.article}
                  </div>
                  <div className="font-semibold text-on-surface mb-1">
                    {product.name}
                  </div>
                  <div className="text-sm text-on-surface-variant mb-3">
                    {product.brand} · {product.car_brand} {product.car_model}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-[#451A03]">
                      {product.price.toLocaleString()} сом
                    </span>
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-medium ${
                        product.quantity > 0
                          ? "bg-primary-container/20 text-primary"
                          : "bg-error-container text-on-error-container"
                      }`}
                    >
                      {product.quantity > 0 ? "В наличии" : "Под заказ"}
                    </span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="text-center py-20 bg-surface-lowest rounded-xl warm-shadow">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-20 w-20 mx-auto text-outline-variant mb-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <h2 className="font-[family-name:var(--font-headline)] text-xl font-bold text-[#451A03] mb-2">
              В избранном пусто
            </h2>
            <p className="text-on-surface-variant mb-8 max-w-md mx-auto">
              Добавляйте товары в избранное, нажимая на сердечко на карточке
              товара. Так вы сможете быстро вернуться к понравившимся запчастям.
            </p>
            <Link
              href="/catalog"
              className="inline-block cta-gradient text-white font-bold px-8 py-3.5 rounded-full shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
              Перейти в каталог
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
