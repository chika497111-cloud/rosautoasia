"use client";

import { useState } from "react";
import type { Product, Category } from "@/lib/mock-data";

type Tab = "description" | "specs" | "reviews";

export function ProductTabs({ product, category }: { product: Product; category?: Category }) {
  const [activeTab, setActiveTab] = useState<Tab>("specs");

  const tabs: { key: Tab; label: string }[] = [
    { key: "description", label: "Описание" },
    { key: "specs", label: "Характеристики" },
    { key: "reviews", label: "Отзывы (0)" },
  ];

  const specs: { label: string; value: string }[] = [
    { label: "Бренд", value: product.brand },
    { label: "Артикул", value: product.article },
    ...(product.car_brand ? [{ label: "Марка авто", value: product.car_brand }] : []),
    ...(product.car_model ? [{ label: "Модель авто", value: product.car_model }] : []),
    ...(category ? [{ label: "Категория", value: category.name }] : []),
    { label: "Единица измерения", value: product.unit },
  ];

  return (
    <div className="bg-surface-container-lowest rounded-xl warm-shadow overflow-hidden mb-16">
      {/* Tab headers */}
      <div className="flex border-b border-surface-container">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-8 py-5 font-[family-name:var(--font-headline)] font-bold transition-colors ${
              activeTab === tab.key
                ? "text-primary border-b-4 border-primary bg-surface-container-low"
                : "text-on-surface-variant hover:text-primary"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-8">
        {activeTab === "description" && (
          <div className="text-on-surface-variant leading-relaxed">
            <p>{product.description}</p>
          </div>
        )}

        {activeTab === "specs" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-1">
              {specs.map((spec, i) => (
                <div
                  key={spec.label}
                  className={`flex justify-between py-4 border-b border-surface-container/50 px-2 ${
                    i % 3 === 0 ? "bg-surface/30 rounded" : ""
                  }`}
                >
                  <span className="text-on-surface-variant">{spec.label}</span>
                  <span className="font-bold">{spec.value}</span>
                </div>
              ))}
            </div>
            {product.car_brand && (
              <div className="mt-8 flex items-center gap-3 bg-tertiary-container/10 p-4 rounded-xl border border-tertiary-container/20">
                <span className="material-symbols-outlined text-tertiary">check_circle</span>
                <p className="text-on-tertiary-container font-medium">
                  Гарантированная совместимость с вашим {product.car_brand} {product.car_model}
                </p>
              </div>
            )}
          </>
        )}

        {activeTab === "reviews" && (
          <div className="text-on-surface-variant text-center py-12">
            <span className="material-symbols-outlined text-4xl mb-4 block text-outline-variant">rate_review</span>
            <p className="text-lg font-medium">Отзывов пока нет</p>
            <p className="text-sm mt-1">Будьте первым, кто оставит отзыв!</p>
          </div>
        )}
      </div>
    </div>
  );
}
