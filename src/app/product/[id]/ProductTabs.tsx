"use client";

import { useState, useEffect, Component, type ReactNode } from "react";
import type { Product, Category } from "@/lib/mock-data";
import { ReviewSection } from "@/components/ReviewSection";
import { getProductReviews } from "@/lib/reviews";

// Error boundary to prevent ReviewSection crashes from breaking the whole page
class ReviewErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center text-on-surface-variant">
          <p>Не удалось загрузить отзывы. Попробуйте обновить страницу.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

type Tab = "description" | "specs" | "reviews";

export function ProductTabs({ product, category }: { product: Product; category?: Category }) {
  const [activeTab, setActiveTab] = useState<Tab>("specs");
  const [reviewCount, setReviewCount] = useState(0);

  useEffect(() => {
    getProductReviews(product.id).then((r) => setReviewCount(r.length)).catch(() => {});
  }, [product.id]);

  const tabs: { key: Tab; label: string }[] = [
    { key: "description", label: "Описание" },
    { key: "specs", label: "Характеристики" },
    { key: "reviews", label: `Отзывы (${reviewCount})` },
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
    <div className="bg-surface-lowest rounded-xl warm-shadow overflow-hidden mb-16">
      {/* Tab headers */}
      <div className="flex border-b border-surface-high">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-8 py-5 font-[family-name:var(--font-headline)] font-bold transition-colors ${
              activeTab === tab.key
                ? "text-primary border-b-4 border-primary bg-surface-low"
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
                  className={`flex justify-between py-4 border-b border-surface-high/50 px-2 ${
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
                <p className="text-on-primary-fixed-variant font-medium">
                  Гарантированная совместимость с вашим {product.car_brand} {product.car_model}
                </p>
              </div>
            )}
          </>
        )}

        {activeTab === "reviews" && (
          <ReviewErrorBoundary>
            <ReviewSection productId={product.id} productArticle={product.article} />
          </ReviewErrorBoundary>
        )}
      </div>
    </div>
  );
}
