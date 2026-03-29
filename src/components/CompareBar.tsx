"use client";

import Link from "next/link";
import { useComparison } from "@/lib/comparison-context";

export function CompareBar() {
  const { compareItems, removeFromCompare, clearCompare } = useComparison();

  if (compareItems.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-r from-[#FFFBEB] via-[#FEF3C7] to-[#FFFBEB] border-t-2 border-primary-container/30 shadow-[0_-8px_30px_rgba(69,26,3,0.12)] px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center gap-4 flex-wrap sm:flex-nowrap">
        {/* Label */}
        <span className="text-sm font-bold text-[#451A03] shrink-0">
          Сравнение ({compareItems.length}/3):
        </span>

        {/* Mini product cards */}
        <div className="flex items-center gap-3 flex-1 overflow-x-auto">
          {compareItems.map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-2 bg-white/80 rounded-lg px-3 py-2 warm-shadow shrink-0"
            >
              {/* Thumbnail placeholder */}
              <div className="w-10 h-10 bg-surface-mid rounded-md flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-outline-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#451A03] truncate max-w-[120px]">
                  {product.name}
                </p>
                <p className="text-[10px] text-on-surface-variant">
                  {product.price.toLocaleString("ru-RU")} сом
                </p>
              </div>
              {/* Remove button */}
              <button
                onClick={() => removeFromCompare(product.id)}
                className="w-6 h-6 rounded-full bg-surface-mid hover:bg-error-container text-on-surface-variant hover:text-error flex items-center justify-center transition-all shrink-0"
                aria-label="Убрать из сравнения"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={clearCompare}
            className="text-xs text-on-surface-variant hover:text-error transition-colors px-3 py-2"
          >
            Очистить
          </button>
          <Link
            href="/compare"
            className="cta-gradient text-white text-sm font-bold px-6 py-2.5 rounded-full shadow-md hover:shadow-lg hover:shadow-primary/25 transition-all active:scale-95"
          >
            Сравнить
          </Link>
        </div>
      </div>
    </div>
  );
}
