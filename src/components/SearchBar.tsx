"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { searchProducts as mockSearch } from "@/lib/mock-data";
import type { Product } from "@/lib/mock-data";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query as fsQuery,
  where,
  limit as fsLimit,
} from "firebase/firestore";
import { firestoreProductToProduct } from "@/lib/products-api";

async function searchFirestore(q: string): Promise<Product[]> {
  const trimmed = q.trim();
  if (trimmed.length < 2) return [];

  try {
    const results = new Map<string, Product>();

    // Search by article prefix
    const articleUpper = trimmed.toUpperCase();
    const articleQ = fsQuery(
      collection(db, "products"),
      where("article", ">=", articleUpper),
      where("article", "<=", articleUpper + "\uf8ff"),
      fsLimit(5),
    );
    const articleSnap = await getDocs(articleQ);
    for (const d of articleSnap.docs) {
      results.set(d.id, firestoreProductToProduct(d.id, d.data()));
    }

    // Search by name prefix
    const nameVariants = [
      trimmed,
      trimmed.charAt(0).toUpperCase() + trimmed.slice(1),
    ];
    for (const variant of nameVariants) {
      if (results.size >= 5) break;
      const nameQ = fsQuery(
        collection(db, "products"),
        where("name", ">=", variant),
        where("name", "<=", variant + "\uf8ff"),
        fsLimit(5),
      );
      const nameSnap = await getDocs(nameQ);
      for (const d of nameSnap.docs) {
        if (!results.has(d.id)) {
          results.set(d.id, firestoreProductToProduct(d.id, d.data()));
        }
      }
    }

    if (results.size > 0) {
      return Array.from(results.values()).slice(0, 5);
    }

    // Fallback to mock
    return mockSearch(trimmed).slice(0, 5);
  } catch {
    return mockSearch(trimmed).slice(0, 5);
  }
}

function formatPrice(price: number): string {
  return price.toLocaleString("ru-RU") + " сом";
}

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  const updateSuggestions = useCallback(async (value: string) => {
    if (value.trim().length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }
    const results = await searchFirestore(value);
    setSuggestions(results);
    setIsOpen(results.length > 0);
    setActiveIndex(-1);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateSuggestions(value);
    }, 300);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      inputRef.current?.blur();
    }
  };

  const handleSelect = (product: Product) => {
    setIsOpen(false);
    setQuery("");
    router.push(`/product/${product.id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[activeIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit}>
        <div className="relative w-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-outline"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (suggestions.length > 0) setIsOpen(true);
            }}
            placeholder="Поиск запчастей..."
            autoComplete="off"
            className="w-full bg-surface-mid/60 border border-outline-variant/20 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-container/40 focus:outline-none focus:bg-white transition-all placeholder:text-outline"
          />
        </div>
      </form>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white warm-shadow-lg rounded-xl max-h-80 overflow-y-auto z-50">
          {suggestions.map((product, index) => (
            <button
              key={product.id}
              type="button"
              onClick={() => handleSelect(product)}
              onMouseEnter={() => setActiveIndex(index)}
              className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors first:rounded-t-xl last:rounded-b-xl ${
                index === activeIndex ? "bg-surface-low" : "hover:bg-surface-low"
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-on-surface truncate">
                  {product.name}
                </div>
                <div className="text-xs text-outline mt-0.5">
                  {product.brand} · {product.article}
                </div>
              </div>
              <div className="text-sm font-bold text-amber-600 whitespace-nowrap">
                {formatPrice(product.price)}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
