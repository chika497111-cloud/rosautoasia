"use client";

import Link from "next/link";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useCart } from "@/lib/cart-context";
import { useComparison } from "@/lib/comparison-context";
import type { Product, Category } from "@/lib/mock-data";
import { fetchCategoryPage, fetchAllCategoryProducts } from "./actions";

interface CategoryClientProps {
  category: Category & { productCount: number };
  initialProducts: Product[];
  totalCount: number;
  slug: string;
}

const PAGE_SIZE = 48;

export default function CategoryClient({
  category,
  initialProducts,
  totalCount,
  slug,
}: CategoryClientProps) {
  const { addItem } = useCart();
  const { addToCompare, isInCompare, removeFromCompare } = useComparison();

  // Filter state
  const [selectedCarBrands, setSelectedCarBrands] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState("default");
  const [priceMax, setPriceMax] = useState(50000);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [jumpInput, setJumpInput] = useState("");
  const [showJumpInput, setShowJumpInput] = useState(false);

  // Products state
  // pageCache stores products per page (1-indexed) for server-side pagination
  const [pageCache, setPageCache] = useState<Record<number, Product[]>>({
    1: initialProducts,
  });
  const [displayProducts, setDisplayProducts] = useState<Product[]>(initialProducts);
  const [pageLoading, setPageLoading] = useState(false);

  // All products — loaded lazily when filters are first used
  const [allProducts, setAllProducts] = useState<Product[] | null>(null);
  const [allProductsLoading, setAllProductsLoading] = useState(false);
  const allProductsLoadedRef = useRef(false);

  const [currentTotalCount, setCurrentTotalCount] = useState(totalCount);

  const gridRef = useRef<HTMLDivElement>(null);

  // Determine if any filter is active
  const filtersActive =
    selectedCarBrands.length > 0 ||
    selectedBrands.length > 0 ||
    inStockOnly ||
    sortBy !== "default" ||
    priceMax < 50000;

  // Load ALL products in one server request (for filtering)
  const loadAllProducts = useCallback(async () => {
    if (allProductsLoadedRef.current || allProductsLoading) return;
    setAllProductsLoading(true);

    try {
      const all = await fetchAllCategoryProducts(slug);
      setAllProducts(all);
      setCurrentTotalCount(all.length);
      allProductsLoadedRef.current = true;
    } catch (err) {
      console.error("Failed to load all products for filtering:", err);
    } finally {
      setAllProductsLoading(false);
    }
  }, [slug, allProductsLoading]);

  // Pre-load ALL products in background on mount (for filters + brand list)
  useEffect(() => {
    if (!allProductsLoadedRef.current) {
      loadAllProducts();
    }
  }, [loadAllProducts]);

  // Reset to page 1 when filters/sort change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCarBrands, selectedBrands, inStockOnly, sortBy, priceMax]);

  // When page changes and filters are NOT active, fetch that page from server
  useEffect(() => {
    if (filtersActive) return; // filtering is handled locally

    if (pageCache[currentPage]) {
      setDisplayProducts(pageCache[currentPage]);
      return;
    }

    let cancelled = false;
    setPageLoading(true);

    fetchCategoryPage(slug, currentPage, PAGE_SIZE)
      .then((result) => {
        if (!cancelled) {
          setPageCache((prev) => ({ ...prev, [currentPage]: result.products }));
          setDisplayProducts(result.products);
          setCurrentTotalCount(result.totalCount);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch page:", err);
      })
      .finally(() => {
        if (!cancelled) setPageLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [currentPage, filtersActive, slug, pageCache]);

  // Mobile filters: lock body scroll
  useEffect(() => {
    if (showMobileFilters) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showMobileFilters]);

  // Source products for filtering: allProducts when loaded, else initialProducts
  const sourceProducts = allProducts ?? initialProducts;

  const maxPrice = Math.max(...sourceProducts.map((p) => p.price), 50000);

  // Filtered & sorted products (only used when filters are active)
  const filteredProducts = useMemo(() => {
    if (!filtersActive) return null; // signal: use server-side pagination

    let result = [...(allProducts ?? initialProducts)];

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
  }, [allProducts, initialProducts, selectedCarBrands, selectedBrands, inStockOnly, sortBy, priceMax, maxPrice, filtersActive]);

  // The products to show on the current page
  const currentPageProducts = useMemo(() => {
    if (filteredProducts !== null) {
      // Filters active — paginate locally
      return filteredProducts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
    }
    // No filters — use server-fetched page
    return displayProducts;
  }, [filteredProducts, currentPage, displayProducts]);

  // Total for pagination
  const effectiveTotalCount = filteredProducts !== null ? filteredProducts.length : currentTotalCount;
  const effectiveFilteredCount = filteredProducts !== null ? filteredProducts.length : currentTotalCount;

  // Unique car brands and product brands for filters (from all known products)
  const carBrands = [...new Set(sourceProducts.map((p) => p.car_brand).filter(Boolean))];
  const brands = [...new Set(sourceProducts.map((p) => p.brand).filter(Boolean))];

  const sectionRef = useRef<HTMLElement>(null);

  const withScrollLock = (fn: () => void) => {
    fn();
  };

  const toggleCarBrand = (brand: string) => {
    withScrollLock(() => {
      setSelectedCarBrands((prev) =>
        prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
      );
    });
  };

  const toggleBrand = (brand: string) => {
    withScrollLock(() => {
      setSelectedBrands((prev) =>
        prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
      );
    });
  };

  const resetFilters = () => {
    withScrollLock(() => {
      setSelectedCarBrands([]);
      setSelectedBrands([]);
      setInStockOnly(false);
      setSortBy("default");
      setPriceMax(maxPrice);
    });
  };

  // Show loading overlay when fetching a page or loading all products for filters
  const isLoading = pageLoading || allProductsLoading;

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
          {filteredProducts !== null
            ? `Найдено ${filteredProducts.length} из ${allProducts?.length ?? currentTotalCount} товаров`
            : `Найдено ${currentTotalCount} товаров`}
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
              Показать {effectiveFilteredCount} товаров
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden md:flex w-64 sticky top-24 rounded-xl bg-surface-mid warm-shadow flex-col shrink-0" style={{ maxHeight: "calc(100vh - 120px)" }}>
          <div className="py-6 px-6 pb-2">
            <h3 className="font-[family-name:var(--font-headline)] font-bold text-on-surface mb-1">
              Фильтры
            </h3>
            <p className="text-xs text-on-surface-variant mb-2">Параметры поиска</p>
          </div>
          <div className="flex-1 overflow-y-auto px-6 space-y-6 pb-2">

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
                  onChange={() => withScrollLock(() => setInStockOnly(false))}
                  className="text-primary focus:ring-primary"
                />
                <span>Все товары</span>
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="stock"
                  checked={inStockOnly}
                  onChange={() => withScrollLock(() => setInStockOnly(true))}
                  className="text-primary focus:ring-primary"
                />
                <span>В наличии</span>
              </label>
            </div>
          </div>

          </div>{/* end scrollable area */}
          {/* Fixed reset button at bottom */}
          <div className="px-6 py-4 border-t border-outline-variant/20">
            <button
              onClick={resetFilters}
              className="w-full signature-glow text-white font-bold py-3 rounded-full hover:opacity-90 active:scale-95 transition-all shadow-md"
            >
              Сбросить
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <section ref={sectionRef} className="flex-1" style={{ minHeight: "calc(100vh - 200px)" }}>
          {/* Sorting & View Controls */}
          <div className="flex flex-wrap justify-between items-center bg-surface-low rounded-xl px-6 py-4 mb-8 gap-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-on-surface-variant">Сортировка:</span>
              <select
                value={sortBy}
                onChange={(e) => withScrollLock(() => setSortBy(e.target.value))}
                className="bg-transparent border-none text-sm font-bold text-primary focus:ring-0 cursor-pointer"
              >
                <option value="default">По популярности</option>
                <option value="price-asc">Сначала дешевле</option>
                <option value="price-desc">Сначала дороже</option>
                <option value="name">По названию</option>
              </select>
            </div>
            <div className="text-sm text-on-surface-variant font-medium">
              {effectiveFilteredCount} {effectiveFilteredCount === 1 ? "товар" : effectiveFilteredCount < 5 ? "товара" : "товаров"}
            </div>
          </div>

          {/* Loading overlay for page transitions */}
          {isLoading && (
            <div className="flex justify-center py-12">
              <div className="animate-pulse space-y-6 w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-surface-mid rounded-xl h-80" />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Product Grid */}
          {!isLoading && currentPageProducts.length === 0 ? (
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
          ) : !isLoading ? (
            <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentPageProducts.map((product) => (
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
          ) : null}

          {/* Pagination */}
          {(() => {
            const totalPages = Math.ceil(effectiveTotalCount / PAGE_SIZE);
            if (totalPages <= 1) return null;

            const goToPage = (page: number) => {
              setCurrentPage(Math.max(1, Math.min(page, totalPages)));
              gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            };

            // Build page numbers: 1, 2, 3, ..., last
            const pages: (number | "dots")[] = [];
            if (totalPages <= 7) {
              for (let i = 1; i <= totalPages; i++) pages.push(i);
            } else {
              pages.push(1);
              if (currentPage > 3) pages.push("dots");
              for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
                pages.push(i);
              }
              if (currentPage < totalPages - 2) pages.push("dots");
              pages.push(totalPages);
            }

            const from = (currentPage - 1) * PAGE_SIZE + 1;
            const to = Math.min(currentPage * PAGE_SIZE, effectiveTotalCount);

            return (
              <div className="mt-10 space-y-4">
                <p className="text-sm text-on-surface-variant text-center">
                  Показано {from}–{to} из {effectiveTotalCount} товаров
                </p>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  {/* Prev arrow */}
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface-mid active:scale-90"
                  >
                    <span className="material-symbols-outlined text-lg">chevron_left</span>
                  </button>

                  {pages.map((page, i) =>
                    page === "dots" ? (
                      <button
                        key={`dots-${i}`}
                        onClick={() => setShowJumpInput(!showJumpInput)}
                        className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-mid transition-all text-sm font-bold"
                        title="Перейти к странице..."
                      >
                        •••
                      </button>
                    ) : (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all active:scale-90 ${
                          page === currentPage
                            ? "cta-gradient text-white shadow-md"
                            : "hover:bg-surface-mid text-on-surface-variant"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}

                  {/* Next arrow */}
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface-mid active:scale-90"
                  >
                    <span className="material-symbols-outlined text-lg">chevron_right</span>
                  </button>
                </div>

                {/* Jump to page input */}
                {showJumpInput && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const num = parseInt(jumpInput, 10);
                      if (num >= 1 && num <= totalPages) {
                        goToPage(num);
                        setShowJumpInput(false);
                        setJumpInput("");
                      }
                    }}
                    className="flex items-center justify-center gap-2"
                  >
                    <span className="text-sm text-on-surface-variant">Страница:</span>
                    <input
                      type="number"
                      min={1}
                      max={totalPages}
                      value={jumpInput}
                      onChange={(e) => setJumpInput(e.target.value)}
                      placeholder={`1–${totalPages}`}
                      className="w-20 px-3 py-2 rounded-lg border border-outline-variant/30 text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="cta-gradient text-white text-sm font-bold px-4 py-2 rounded-lg active:scale-95 transition-transform"
                    >
                      Перейти
                    </button>
                  </form>
                )}
              </div>
            );
          })()}
        </section>
      </div>
    </main>
  );
}
