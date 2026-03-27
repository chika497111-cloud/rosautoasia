import type { Metadata } from "next";
import Link from "next/link";
import { categories, products } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "ROSAutoAsia — Автозапчасти в Бишкеке | Оригиналы и аналоги",
  description:
    "Интернет-магазин автозапчастей ROSAutoAsia. Оригиналы и аналоги из Японии, Кореи и Китая с доставкой по Кыргызстану. Более 100,000 наименований в наличии.",
  openGraph: {
    title: "ROSAutoAsia — Автозапчасти в Бишкеке",
    description:
      "Оригинальные автозапчасти из Японии, Кореи и Китая с доставкой по Кыргызстану. Более 100,000 наименований.",
    url: "https://raa.kg",
  },
};

/* SVG icons for each category (keyed by category id) */
const categoryIcons: Record<string, React.ReactNode> = {
  /* 1 — Тормозная система */
  "1": (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <circle cx="12" cy="12" r="9" strokeWidth={2} />
      <circle cx="12" cy="12" r="4" strokeWidth={2} />
      <path strokeLinecap="round" strokeWidth={2} d="M12 3v2M12 19v2M3 12h2M19 12h2" />
    </svg>
  ),
  /* 2 — Двигатель */
  "2": (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  /* 3 — Подвеска */
  "3": (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
    </svg>
  ),
  /* 4 — Фильтры */
  "4": (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
  ),
  /* 5 — Электрика */
  "5": (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
  /* 6 — Кузов */
  "6": (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  /* 7 — Масла и жидкости */
  "7": (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
  ),
  /* 8 — Охлаждение */
  "8": (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v18m0-18l-3 3m3-3l3 3m-3 15l-3-3m3 3l3-3M3 12h18M3 12l3-3m-3 3l3 3m15-3l-3-3m3 3l-3 3" />
    </svg>
  ),
};

/* Badge text for featured products */
const productBadges: Record<string, string> = {
  p1: "Гарантия 1 год",
  p5: "Хит продаж",
  p7: "Полный комплект",
  p8: "Оригинал",
};

export default function Home() {
  const featuredProducts = products.slice(0, 4);

  return (
    <div>
      {/* ===== HERO SECTION ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#FFFBEB] via-[#FEF3C7] to-white py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div className="z-10 text-center lg:text-left">
            <span className="inline-block px-4 py-1.5 rounded-full bg-tertiary-container/10 text-on-tertiary-container text-xs font-bold tracking-wider uppercase mb-6">
              Премиум сервис в Кыргызстане
            </span>
            <h1 className="font-[family-name:var(--font-headline)] text-5xl lg:text-6xl font-extrabold text-[#451A03] leading-tight tracking-tight mb-6">
              Автозапчасти из <br />
              <span className="text-primary italic">Японии, Кореи и Китая</span>
            </h1>
            <p className="text-lg text-on-surface-variant mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Оригинал и аналоги с гарантией и доставкой по всей республике. Более 100,000 наименований в наличии на собственном складе.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="/catalog"
                className="cta-gradient text-white px-10 py-4 rounded-full font-bold shadow-lg hover:shadow-xl hover:shadow-primary/25 transition-all active:scale-95 inline-flex items-center justify-center gap-2"
              >
                Перейти в каталог
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
              <Link
                href="/delivery"
                className="bg-white border-2 border-primary-container/20 text-on-surface px-10 py-4 rounded-full font-bold hover:bg-surface-low transition-all text-center"
              >
                Узнать о доставке
              </Link>
            </div>
          </div>
          <div className="relative group">
            {/* Glow effect behind image */}
            <div className="absolute -inset-4 bg-primary-container/10 rounded-full blur-3xl group-hover:bg-primary-container/20 transition-all duration-700" />
            <img
              src="https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&h=600&fit=crop&q=80"
              alt="Оранжевый спорткар — ROSAutoAsia автозапчасти"
              className="relative rounded-xl warm-shadow w-full h-[450px] object-cover border-8 border-white"
            />
          </div>
        </div>
      </section>

      {/* ===== CATEGORIES SECTION ===== */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header row */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-4">
            <div>
              <h2 className="font-[family-name:var(--font-headline)] text-3xl sm:text-4xl font-extrabold tracking-tight text-on-surface">
                Популярные категории
              </h2>
              <p className="text-on-surface-variant mt-2">Быстрый доступ к нужным запчастям</p>
            </div>
            <Link href="/catalog" className="text-primary font-bold flex items-center gap-2 hover:gap-4 transition-all shrink-0">
              Все категории
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Category grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {categories.slice(0, 8).map((category) => (
              <Link
                key={category.id}
                href={`/catalog/${category.slug}`}
                className="bg-white warm-shadow rounded-xl p-6 flex flex-col items-center text-center group hover:bg-primary-container transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  {categoryIcons[category.id]}
                </div>
                <h3 className="font-bold text-on-surface group-hover:text-on-primary-container text-sm sm:text-base">
                  {category.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRODUCTS SECTION ===== */}
      <section className="bg-surface-low py-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Centered title with orange line */}
          <div className="text-center mb-14">
            <h2 className="font-[family-name:var(--font-headline)] text-3xl sm:text-4xl font-extrabold tracking-tight text-on-surface mb-4">
              Рекомендуемые товары
            </h2>
            <div className="h-1 w-20 bg-primary mx-auto rounded-full" />
          </div>

          {/* Products grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => {
              const category = categories.find((c) => c.id === product.category_id);
              const badge = productBadges[product.id];

              return (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
                  className="bg-white rounded-xl overflow-hidden warm-shadow group hover:shadow-xl transition-all duration-300"
                >
                  {/* Image area */}
                  <div className="aspect-square bg-surface-low relative flex items-center justify-center overflow-hidden">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-16 w-16 text-outline-variant/30 group-hover:scale-110 transition-transform duration-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    {badge && (
                      <div className="absolute top-3 left-3 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full">
                        {badge}
                      </div>
                    )}
                  </div>

                  {/* Card body */}
                  <div className="p-5">
                    <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mb-1 block">
                      {product.brand} {category ? `/ ${category.name}` : ""}
                    </span>
                    <h3 className="font-bold text-on-surface mb-3 leading-tight group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-black text-on-surface">
                        {product.price.toLocaleString("ru-RU")} <span className="text-sm font-medium text-on-surface-variant">сом</span>
                      </span>
                      {/* Round orange add-to-cart button */}
                      <span className="w-10 h-10 rounded-full cta-gradient flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== TRUST SECTION ===== */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 100% Оригинал */}
            <div className="bg-primary-container/10 border border-primary-container/20 rounded-xl p-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-bold text-on-surface mb-2">100% Оригинал</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Гарантируем подлинность каждой детали. Работаем напрямую с поставщиками из Японии, Кореи и Китая.
              </p>
            </div>

            {/* Быстрая доставка */}
            <div className="bg-primary-container/10 border border-primary-container/20 rounded-xl p-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-bold text-on-surface mb-2">Быстрая доставка</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Доставка по Бишкеку за 2-4 часа. Отправка по всей республике транспортными компаниями.
              </p>
            </div>

            {/* Экспертный подбор */}
            <div className="bg-primary-container/10 border border-primary-container/20 rounded-xl p-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-on-surface mb-2">Экспертный подбор</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Наши специалисты помогут подобрать нужную деталь по VIN-коду или гос. номеру за 15 минут.
              </p>
            </div>

            {/* Склад в Бишкеке */}
            <div className="bg-primary-container/10 border border-primary-container/20 rounded-xl p-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="font-bold text-on-surface mb-2">Склад в Бишкеке</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Более 100,000 наименований в наличии на собственном складе. Без ожидания доставки из-за рубежа.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
