import Link from "next/link";
import { getCategories, getTotalProductCount } from "@/lib/products-server";
import type { Metadata } from "next";
import type { Category } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Каталог запчастей — ROSAutoAsia",
  description: "Каталог автозапчастей из Японии, Кореи и Китая. Оригинал и аналоги с доставкой по Кыргызстану.",
};

/** Map slug prefixes to Material Symbols icon names */
const categoryIconMap: Record<string, string> = {
  "тормозная": "disc_full",
  "двигатель": "manufacturing",
  "подвеска": "height",
  "кузов": "directions_car",
  "кпп": "settings",
  "электри": "bolt",
  "компрессор": "compress",
  "инструмент": "construction",
  "аксессуар": "widgets",
  "автохимия": "water_drop",
  "болт": "hardware",
  "гайк": "hardware",
  "винт": "hardware",
};

function getCategoryIcon(slug: string): string {
  for (const [prefix, icon] of Object.entries(categoryIconMap)) {
    if (slug.startsWith(prefix)) return icon;
  }
  return "category";
}

export default async function CatalogPage() {
  const categories = await getCategories();
  const totalProducts = await getTotalProductCount();

  return (
    <main className="pt-28 pb-20 max-w-[1440px] mx-auto px-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 mb-6 text-sm font-medium text-on-surface-variant">
        <Link href="/" className="hover:text-primary transition-colors">
          Главная
        </Link>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <span className="text-primary">Каталог</span>
      </nav>

      {/* Title Section */}
      <header className="mb-10">
        <h1 className="font-[family-name:var(--font-headline)] text-4xl md:text-5xl font-extrabold text-[#451A03] tracking-tight mb-2">
          Каталог запчастей
        </h1>
        <p className="text-on-surface-variant">
          {totalProducts} {totalProducts === 1 ? "товар" : totalProducts < 5 ? "товара" : "товаров"} в наличии и под заказ
        </p>
      </header>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map((category) => {
          const count = category.productCount;
          const icon = getCategoryIcon(category.slug);

          return (
            <Link
              key={category.id}
              href={`/catalog/${category.slug}`}
              className="group bg-surface-lowest rounded-xl p-6 warm-shadow transition-all hover:-translate-y-1 hover:bg-primary-container"
            >
              {/* Icon */}
              <div className="w-14 h-14 rounded-full bg-primary-container/15 flex items-center justify-center mb-4 group-hover:bg-white/20 transition-colors">
                <span className="material-symbols-outlined text-primary text-2xl group-hover:text-white transition-colors">
                  {icon}
                </span>
              </div>

              {/* Name */}
              <h3 className="font-[family-name:var(--font-headline)] font-bold text-on-surface leading-snug mb-1 group-hover:text-white transition-colors">
                {category.name}
              </h3>

              {/* Count */}
              <p className="text-sm text-on-surface-variant group-hover:text-white/80 transition-colors">
                {count} {count === 1 ? "товар" : count < 5 ? "товара" : "товаров"}
              </p>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
