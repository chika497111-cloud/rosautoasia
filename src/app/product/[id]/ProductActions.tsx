"use client";

import { useState } from "react";
import { AddToCartButton } from "@/components/AddToCartButton";
import { QuantitySelector } from "./QuantitySelector";
import type { Product } from "@/lib/mock-data";

export function ProductActions({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);

  return (
    <>
      {/* Quantity selector */}
      {product.quantity > 0 && (
        <div className="flex items-center gap-4 mb-4">
          <QuantitySelector
            max={product.quantity}
            unit={product.unit}
            value={quantity}
            onChange={setQuantity}
          />
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        {product.quantity > 0 && (
          <div className="flex-1">
            <AddToCartButton product={product} quantity={quantity} />
          </div>
        )}
      </div>
    </>
  );
}
