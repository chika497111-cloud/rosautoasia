"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import type { Product } from "./mock-data";

const LS_KEY = "roa_compare";
const MAX_ITEMS = 3;

interface ComparisonContextType {
  compareItems: Product[];
  addToCompare: (product: Product) => void;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  isInCompare: (productId: string) => boolean;
}

const ComparisonContext = createContext<ComparisonContextType | null>(null);

function loadLocalCompare(): Product[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.slice(0, MAX_ITEMS);
    }
  } catch {}
  return [];
}

function saveLocalCompare(items: Product[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  } catch {}
}

export function ComparisonProvider({ children }: { children: ReactNode }) {
  const [compareItems, setCompareItems] = useState<Product[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    setCompareItems(loadLocalCompare());
  }, []);

  // Save whenever items change
  useEffect(() => {
    saveLocalCompare(compareItems);
  }, [compareItems]);

  const addToCompare = useCallback((product: Product) => {
    setCompareItems((prev) => {
      if (prev.find((p) => p.id === product.id)) return prev;
      if (prev.length >= MAX_ITEMS) return prev;
      return [...prev, product];
    });
  }, []);

  const removeFromCompare = useCallback((productId: string) => {
    setCompareItems((prev) => prev.filter((p) => p.id !== productId));
  }, []);

  const clearCompare = useCallback(() => setCompareItems([]), []);

  const isInCompare = useCallback(
    (productId: string) => compareItems.some((p) => p.id === productId),
    [compareItems]
  );

  return (
    <ComparisonContext.Provider value={{ compareItems, addToCompare, removeFromCompare, clearCompare, isInCompare }}>
      {children}
    </ComparisonContext.Provider>
  );
}

export function useComparison() {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error("useComparison must be used within a ComparisonProvider");
  }
  return context;
}
