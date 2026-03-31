"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

interface BrandInfo {
  name: string;
  categories: { slug: string; name: string; systemName: string; productCount: number }[];
  totalProducts: number;
}

const BRAND_ICONS: Record<string, string> = {
  "ВАЗ": "🚗",
  "ГАЗ": "🚐",
  "КАМАЗ": "🚛",
  "УАЗ": "🚙",
  "ЗИЛ": "🚚",
  "МАЗ": "🚛",
  "УРАЛ": "🚛",
  "Москвич": "🚗",
  "Тракторы": "🚜",
  "Иномарки": "🌏",
};

const BRAND_ORDER = ["ВАЗ", "ГАЗ", "КАМАЗ", "УАЗ", "ЗИЛ", "МАЗ", "УРАЛ", "Москвич", "Тракторы", "Иномарки"];

export default function SelectCarPage() {
  const [brands, setBrands] = useState<BrandInfo[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<BrandInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBrands() {
      try {
        const snap = await getDocs(
          query(collection(db, "categories"), orderBy("productCount", "desc"))
        );

        const brandMap = new Map<string, BrandInfo>();

        for (const doc of snap.docs) {
          const data = doc.data();
          const name = (data.name as string) || "";
          const parts = name.split(" ");
          const brandName = parts.length > 1 ? parts[parts.length - 1] : "";

          if (!BRAND_ORDER.includes(brandName)) continue;

          const systemName = parts.slice(0, -1).join(" ");

          if (!brandMap.has(brandName)) {
            brandMap.set(brandName, {
              name: brandName,
              categories: [],
              totalProducts: 0,
            });
          }

          const brand = brandMap.get(brandName)!;
          brand.categories.push({
            slug: doc.id,
            name: data.name,
            systemName,
            productCount: (data.productCount as number) || 0,
          });
          brand.totalProducts += (data.productCount as number) || 0;
        }

        const sorted = BRAND_ORDER
          .filter((b) => brandMap.has(b))
          .map((b) => brandMap.get(b)!);

        setBrands(sorted);
      } catch (err) {
        console.error("Failed to load brands:", err);
      } finally {
        setLoading(false);
      }
    }

    loadBrands();
  }, []);

  if (loading) {
    return (
      <main className="pt-28 pb-20 max-w-7xl mx-auto px-6">
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-64 bg-surface-mid rounded-lg" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-32 bg-surface-mid rounded-xl" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-28 pb-20 max-w-7xl mx-auto px-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 mb-6 text-sm font-medium text-on-surface-variant">
        <Link href="/" className="hover:text-primary transition-colors">Главная</Link>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        {selectedBrand ? (
          <>
            <button onClick={() => setSelectedBrand(null)} className="hover:text-primary transition-colors">
              Подбор по марке
            </button>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-primary">{selectedBrand.name}</span>
          </>
        ) : (
          <span className="text-primary">Подбор по марке</span>
        )}
      </nav>

      {!selectedBrand ? (
        <>
          <header className="mb-10">
            <h1 className="font-[family-name:var(--font-headline)] text-4xl md:text-5xl font-extrabold text-[#451A03] tracking-tight mb-2">
              Подбор по марке
            </h1>
            <p className="text-on-surface-variant">Выберите марку автомобиля для поиска запчастей</p>
          </header>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {brands.map((brand) => (
              <button
                key={brand.name}
                onClick={() => setSelectedBrand(brand)}
                className="bg-white warm-shadow rounded-xl p-6 flex flex-col items-center text-center group hover:bg-primary-container transition-all duration-300 active:scale-95"
              >
                <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                  {BRAND_ICONS[brand.name] || "🔧"}
                </span>
                <h3 className="font-bold text-on-surface group-hover:text-on-primary-container text-lg">
                  {brand.name}
                </h3>
                <p className="text-xs text-on-surface-variant group-hover:text-on-primary-container/70 mt-1">
                  {brand.totalProducts.toLocaleString("ru-RU")} товаров
                </p>
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <header className="mb-10">
            <div className="flex items-center gap-4 mb-2">
              <button
                onClick={() => setSelectedBrand(null)}
                className="w-10 h-10 rounded-full bg-surface-mid flex items-center justify-center hover:bg-primary-container/20 transition-colors"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              <div>
                <h1 className="font-[family-name:var(--font-headline)] text-4xl md:text-5xl font-extrabold text-[#451A03] tracking-tight">
                  {BRAND_ICONS[selectedBrand.name]} {selectedBrand.name}
                </h1>
                <p className="text-on-surface-variant mt-1">
                  {selectedBrand.totalProducts.toLocaleString("ru-RU")} товаров в {selectedBrand.categories.length} категориях
                </p>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedBrand.categories
              .sort((a, b) => b.productCount - a.productCount)
              .map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/catalog/${cat.slug}`}
                  className="bg-white warm-shadow rounded-xl p-6 group hover:bg-primary-container transition-all duration-300 flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-bold text-on-surface group-hover:text-on-primary-container">
                      {cat.systemName}
                    </h3>
                    <p className="text-sm text-on-surface-variant group-hover:text-on-primary-container/70 mt-1">
                      {cat.productCount.toLocaleString("ru-RU")} товаров
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant group-hover:text-on-primary-container transition-colors">
                    chevron_right
                  </span>
                </Link>
              ))}
          </div>
        </>
      )}
    </main>
  );
}
