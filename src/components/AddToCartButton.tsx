"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import type { Product } from "@/lib/mock-data";

export function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <button
      onClick={handleAdd}
      className={`w-full font-bold py-4 rounded-full transition-all flex items-center justify-center gap-2 active:scale-95 ${
        added
          ? "bg-green-600 text-white shadow-lg shadow-green-600/20"
          : "cta-gradient text-white shadow-lg shadow-primary/20"
      }`}
    >
      <span className="material-symbols-outlined">{added ? "check_circle" : "shopping_cart"}</span>
      {added ? "Добавлено!" : "В корзину"}
    </button>
  );
}
