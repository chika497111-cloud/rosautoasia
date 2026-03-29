"use client";

import Link from "next/link";
import { useComparison } from "@/lib/comparison-context";

export default function ComparePage() {
  const { compareItems, removeFromCompare, clearCompare } = useComparison();

  if (compareItems.length === 0) {
    return (
      <div className="min-h-screen bg-surface">
        <div className="max-w-7xl mx-auto px-4 py-24 text-center">
          <div className="w-24 h-24 bg-surface-low rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-outline-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h1 className="text-4xl font-black text-[#451A03] font-[family-name:var(--font-headline)] tracking-tight mb-3">
            Сравнение пусто
          </h1>
          <p className="text-on-surface-variant text-lg mb-8">
            Добавьте товары для сравнения из каталога
          </p>
          <Link
            href="/catalog"
            className="inline-block cta-gradient text-white font-bold px-10 py-4 rounded-full shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            Перейти в каталог
          </Link>
        </div>
      </div>
    );
  }

  const rows: { label: string; getValue: (p: typeof compareItems[0]) => string }[] = [
    { label: "Название", getValue: (p) => p.name },
    { label: "Бренд", getValue: (p) => p.brand },
    { label: "Артикул", getValue: (p) => p.article },
    {
      label: "Цена",
      getValue: (p) => `${p.price.toLocaleString("ru-RU")} сом`,
    },
    {
      label: "Наличие",
      getValue: (p) => (p.quantity > 0 ? `В наличии (${p.quantity} ${p.unit})` : "Под заказ"),
    },
    { label: "Марка авто", getValue: (p) => p.car_brand || "—" },
    { label: "Модель", getValue: (p) => p.car_model || "—" },
  ];

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
            <span className="text-white">Сравнение товаров</span>
          </nav>
          <div className="flex items-center justify-between">
            <h1 className="font-[family-name:var(--font-headline)] text-3xl sm:text-4xl font-bold tracking-tight">
              <span className="text-primary-container">Сравнение товаров</span>
            </h1>
            <button
              onClick={clearCompare}
              className="text-sm text-outline hover:text-white transition-colors px-4 py-2 rounded-full border border-outline/30 hover:border-white/50"
            >
              Очистить всё
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-surface-lowest rounded-xl warm-shadow overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr>
                <th className="text-left p-4 text-sm font-bold text-on-surface-variant uppercase tracking-wider border-b border-surface-mid w-40">
                  Параметр
                </th>
                {compareItems.map((product) => (
                  <th key={product.id} className="p-4 border-b border-surface-mid text-center">
                    <div className="flex flex-col items-center gap-2">
                      {/* Remove button */}
                      <button
                        onClick={() => removeFromCompare(product.id)}
                        className="self-end w-7 h-7 rounded-full bg-surface-mid hover:bg-error-container text-on-surface-variant hover:text-error flex items-center justify-center transition-all"
                        aria-label="Убрать из сравнения"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Image row */}
              <tr className="border-b border-surface-mid">
                <td className="p-4 text-sm font-bold text-on-surface-variant">Изображение</td>
                {compareItems.map((product) => (
                  <td key={product.id} className="p-4 text-center">
                    <Link href={`/product/${product.id}`}>
                      <div className="w-32 h-32 bg-surface-mid rounded-lg mx-auto flex items-center justify-center hover:bg-surface-high transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-outline-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </Link>
                  </td>
                ))}
              </tr>

              {/* Data rows */}
              {rows.map((row, idx) => (
                <tr
                  key={row.label}
                  className={`border-b border-surface-mid ${idx % 2 === 0 ? "bg-surface-low/50" : ""}`}
                >
                  <td className="p-4 text-sm font-bold text-on-surface-variant">
                    {row.label}
                  </td>
                  {compareItems.map((product) => {
                    const value = row.getValue(product);
                    const isPrice = row.label === "Цена";
                    const isAvailability = row.label === "Наличие";
                    return (
                      <td key={product.id} className="p-4 text-center">
                        {isPrice ? (
                          <span className="text-lg font-black text-primary font-[family-name:var(--font-headline)]">
                            {value}
                          </span>
                        ) : isAvailability ? (
                          <span
                            className={`text-sm font-medium px-3 py-1 rounded-full ${
                              product.quantity > 0
                                ? "bg-primary-container/20 text-primary"
                                : "bg-error-container text-on-error-container"
                            }`}
                          >
                            {value}
                          </span>
                        ) : (
                          <span className="text-sm text-on-surface">{value}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
