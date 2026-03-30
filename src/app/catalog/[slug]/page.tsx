"use client";

import Link from "next/link";
import { useState, useMemo, use, useEffect } from "react";
import { notFound } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { useComparison } from "@/lib/comparison-context";
import type { Product, Category } from "@/lib/mock-data";
import {
  getCategoryBySlug as mockGetCategoryBySlug,
  products as mockProducts,
} from "@/lib/mock-data";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { firestoreProductToProduct, firestoreCategoryToCategory } from "@/lib/products-api";

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: rawSlug } = use(params);
  const slug = decodeURIComponent(rawSlug);
  const { addItem } = useCart();
  const { addToCompare, isInCompare, removeFromCompare } = useComparison();

  const [category, setCategory] = useState<(Category & { productCount?: number }) | null>(null);
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        // Try Firestore: category doc ID === slug
        const catRef = doc(db, "categories", slug);
        const catSnap = await getDoc(catRef);

        if (!cancelled && catSnap.exists()) {
          const cat = firestoreCategoryToCategory(catSnap.id, catSnap.data());
          setCategory(cat);

          // Fetch products by category name
          const q = query(
            collection(db, "products"),
            where("category", "==", cat.name),
          );
          const prodSnap = await getDocs(q);
          if (!cancelled) {
            setCategoryProducts(
              prodSnap.docs.map((d) => firestoreProductToProduct(d.id, d.data())),
            );
          }
        } else if (!cancelled) {
          // Fallback to mock
          const mockCat = mockGetCategoryBySlug(slug);
          if (mockCat) {
            setCategory(mockCat);
            setCategoryProducts(mockProducts.filter((p) => p.category_id === mockCat.id));
          } else {
            setNotFoundState(true);
          }
        }
      } catch {
        if (!cancelled) {
          // Fallback to mock on error
          const mockCat = mockGetCategoryBySlug(slug);
          if (mockCat) {
            setCategory(mockCat);
            setCategoryProducts(mockProducts.filter((p) => p.category_id === mockCat.id));
          } else {
            setNotFoundState(true);
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, [slug]);

  if (notFoundState) {
    notFound();
  }

  if (loading) {
    return (
      <main className="pt-28 pb-20 max-w-[1440px] mx-auto px-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-surface-mid rounded" />
          <div className="h-12 w-96 bg-surface-mid rounded" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-surface-mid rounded-xl h-80" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (!category) {
    notFound();
  }

  // Unique car brands and product brands for filters
  const carBrands = [...new Set(categoryProducts.map((p) => p.car_brand).filter(Boolean))];
  const brands = [...new Set(categoryProducts.map((p) => p.brand).filter(Boolean))];

  const [selectedCarBrands, setSelectedCarBrands] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState("default");
  const [priceMax, setPriceMax] = useState(50000);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    if (showMobileFilters) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [showMobileFilters]);

  const maxPrice = Math.max(...categoryProducts.map((p) => p.price), 50000);

  const filteredProducts = useMemo(() => {
    let result = [...categoryProducts];

    if (selectedCarBrands.length > 0) {
      result = result.filter((p) => selectedCarBrands.includes(p.car_brand));
    }
    if (selectedBrands.length > 0) {
      result = result.filter((p) => selectedBrands.includes(p.brand));
    }
    if (inStockOnly) {
      result = result.filter((p) => p.quantity > 0);
    }
    if (priceMax < maxPrice) {
      result = result.filter((p) => p.price <= priceMax);
    }

    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name, "ru"));
        break;
    }

    return result;
  }, [categoryProducts, selectedCarBrands, selectedBrands, inStockOnly, sortBy, priceMax, maxPrice]);

  const toggleCarBrand = (brand: string) => {
    setSelectedCarBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const resetFilters = () => {
    setSelectedCarBrands([]);
    setSelectedBrands([]);
    setInStockOnly(false);
    setSortBy("default");
    setPriceMax(maxPrice);
  };

  return (
    <main className="pt-28 pb-20 max-w-[1440px] mx-auto px-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 mb-6 text-sm font-medium text-on-surface-variant">
        <Link href="/" className="hover:text-primary transition-colors">
          Главная
        </Link>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <Link href="/catalog" className="hover:text-primary transition-colors">
          Каталог
        </Link>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <span className="text-primary">{category.name}</span>
      </nav>

      {/* Title Section */}
      <header className="mb-10">
        <h1 className="font-[family-name:var(--font-headline)] text-4xl md:text-5xl font-extrabold text-[#451A03] tracking-tight mb-2">
          {category.name}
        </h1>
        <p className="text-on-surface-variant">
          Найдено {filteredProducts.length} из {categoryProducts.length} товаров
        </p>
      </header>

      {/* Mobile filter button */}
      <button
        onClick={() => setShowMobileFilters(true)}
        className="md:hidden flex items-center gap-2 cta-gradient text-white px-6 py-3 rounded-full font-semibold mb-4 active:scale-95 transition-transform"
      >
        <span className="material-symbols-outlined text-lg">tune</span>
        Фильтры
      </button>

      {/* Mobile filters modal */}
      {showMobileFilters && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "10vh", overflow: "hidden" }} className="md:hidden">
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.6)" }} onClick={() => setShowMobileFilters(false)} />
          <div style={{ position: "relative", width: "90%", maxWidth: "400px", maxHeight: "80vh" }} className="bg-surface-lowest rounded-2xl overflow-y-auto p-6 space-y-6 warm-shadow-lg">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-[family-name:var(--font-headline)] font-bold text-on-surface text-lg">Фильтры</h3>
              <button onClick={() => setShowMobileFilters(false)} className="p-2 rounded-full hover:bg-surface-mid">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {carBrands.length > 0 && (
              <div>
                <h4 className="font-semibold text-on-surface-variant text-sm uppercase tracking-wider mb-3">Марка авто</h4>
                {carBrands.map((brand) => (
                  <label key={brand} className="flex items-center gap-2 py-1.5 cursor-pointer">
                    <input type="checkbox" checked={selectedCarBrands.includes(brand)} onChange={() => setSelectedCarBrands((prev) => prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand])} className="rounded" />
                    <span className="text-sm">{brand}</span>
                  </label>
                ))}
              </div>
            )}

            {brands.length > 0 && (
              <div>
                <h4 className="font-semibold text-on-surface-variant text-sm uppercase tracking-wider mb-3">Бренды</h4>
                {brands.map((brand) => (
                  <label key={brand} className="flex items-center gap-2 py-1.5 cursor-pointer">
                    <input type="checkbox" checked={selectedBrands.includes(brand)} onChange={() => setSelectedBrands((prev) => prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand])} className="rounded" />
                    <span className="text-sm">{brand}</span>
                  </label>
                ))}
              </div>
            )}

            <div>
              <h4 className="font-semibold text-on-surface-variant text-sm uppercase tracking-wider mb-3">Наличие</h4>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="stock-mobile" checked={!inStockOnly} onChange={() => setInStockOnly(false)} />
                <span className="text-sm">Все товары</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer mt-1.5">
                <input type="radio" name="stock-mobile" checked={inStockOnly} onChange={() => setInStockOnly(true)} />
                <span className="text-sm">В наличии</span>
              </label>
            </div>

            <button
              onClick={() => setShowMobileFilters(false)}
              className="w-full cta-gradient text-white py-3 rounded-full font-bold active:scale-95 transition-transform"
            >
              Показать {filteredProducts.length} товаров
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden md:flex w-64 sticky top-24 rounded-xl overflow-hidden bg-surface-mid py-8 px-6 warm-shadow flex-col gap-6 shrink-0">
          <div>
            <h3 className="font-[family-name:var(--font-headline)] font-bold text-on-surface mb-1">
              Фильтры
            </h3>
            <p className="text-xs text-on-surface-variant mb-4">Параметры поиска</p>
          </div>

          {/* Categories (car brands) */}
          {carBrands.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-primary font-medium text-sm">
                <span className="material-symbols-outlined text-lg">category</span>
                <span>Марка авто</span>
              </div>
              <div className="space-y-2 pl-7">
                {carBrands.map((brand) => (
                  <label key={brand} className="flex items-center gap-2 text-sm cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedCarBrands.includes(brand)}
                      onChange={() => toggleCarBrand(brand)}
                      className="rounded border-outline-variant text-primary focus:ring-primary"
                    />
                    <span className="group-hover:text-primary transition-colors">{brand}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Brands */}
          {brands.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-on-surface-variant font-medium text-sm">
                <span className="material-symbols-outlined text-lg">factory</span>
                <span>Бренды</span>
              </div>
              <div className="space-y-2 pl-7">
                {brands.map((brand) => (
                  <label key={brand} className="flex items-center gap-2 text-sm cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand)}
                      onChange={() => toggleBrand(brand)}
                      className="rounded border-outline-variant text-primary focus:ring-primary"
                    />
                    <span className="group-hover:text-primary transition-colors">{brand}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Price Range */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-on-surface-variant font-medium text-sm">
              <span className="material-symbols-outlined text-lg">payments</span>
              <span>Цена (сом)</span>
            </div>
            <div className="px-2">
              <input
                type="range"
                min={0}
                max={maxPrice}
                value={priceMax}
                onChange={(e) => setPriceMax(Number(e.target.value))}
                className="w-full accent-primary h-1.5 bg-surface-highest rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between mt-2 text-xs font-bold text-on-surface-variant">
                <span>0</span>
                <span>{priceMax.toLocaleString("ru-RU")}</span>
              </div>
            </div>
          </div>

          {/* Availability */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-on-surface-variant font-medium text-sm">
              <span className="material-symbols-outlined text-lg">check_circle</span>
              <span>Наличие</span>
            </div>
            <div className="space-y-2 pl-7">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="stock"
                  checked={!inStockOnly}
                  onChange={() => setInStockOnly(false)}
                  className="text-primary focus:ring-primary"
                />
                <span>Все товары</span>
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="stock"
                  checked={inStockOnly}
                  onChange={() => setInStockOnly(true)}
                  className="text-primary focus:ring-primary"
                />
                <span>В наличии</span>
              </label>
            </div>
          </div>

          {/* Apply / Reset Button */}
          <button
            onClick={resetFilters}
            className="signature-glow text-white font-bold py-3 rounded-full mt-4 hover:opacity-90 active:scale-95 transition-all shadow-md"
          >
            Сбросить
          </button>
        </aside>

        {/* Main Content Area */}
        <section className="flex-1">
          {/* Sorting & View Controls */}
          <div className="flex flex-wrap justify-between items-center bg-surface-low rounded-xl px-6 py-4 mb-8 gap-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-on-surface-variant">Сортировка:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border-none text-sm font-bold text-primary focus:ring-0 cursor-pointer"
              >
                <option value="default">По популярности</option>
                <option value="price-asc">Сначала дешевле</option>
                <option value="price-desc">Сначала дороже</option>
                <option value="name">По названию</option>
              </select>
            </div>
            <div className="text-sm text-on-surface-variant font-medium">
              {filteredProducts.length} {filteredProducts.length === 1 ? "товар" : filteredProducts.length < 5 ? "товара" : "товаров"}
            </div>
          </div>

          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-6xl text-outline-variant mb-4 block">
                search_off
              </span>
              <p className="text-on-surface-variant mb-4 text-lg">Товаров не найдено</p>
              <button
                onClick={resetFilters}
                className="text-primary hover:text-primary/80 font-bold transition-colors"
              >
                Сбросить фильтры
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <article
                  key={product.id}
                  className="bg-surface-lowest rounded-xl p-5 warm-shadow group transition-all hover:-translate-y-1 relative"
                >
                  {/* Image Area */}
                  <Link href={`/product/${product.id}`}>
                    <div className="aspect-square rounded-lg overflow-hidden mb-4 bg-surface-low relative">
                      <div className="w-full h-full flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                        <span className="material-symbols-outlined text-6xl text-outline-variant/40">
                          image
                        </span>
                      </div>
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
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-xs text-on-surface-variant block">Цена</span>
                      <span className="text-2xl font-black text-[#451A03] font-[family-name:var(--font-headline)]">
                        {product.price.toLocaleString("ru-RU")}{" "}
                        <small className="text-sm">сом</small>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Compare button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          if (isInCompare(product.id)) {
                            removeFromCompare(product.id);
                          } else {
                            addToCompare(product);
                          }
                        }}
                        title={isInCompare(product.id) ? "Убрать из сравнения" : "Сравнить"}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90 ${
                          isInCompare(product.id)
                            ? "bg-primary-container text-white shadow-md"
                            : "bg-surface-mid text-on-surface-variant hover:bg-primary-container/20 hover:text-primary"
                        }`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </button>
                      {/* Cart button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          addItem(product);
                        }}
                        className="signature-glow w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg active:scale-90 transition-transform"
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          add_shopping_cart
                        </span>
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
