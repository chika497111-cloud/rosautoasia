"use client";

import Link from "next/link";
import type { Product } from "@/lib/mock-data";
import { FavoriteButton } from "@/components/FavoriteButton";
import { AddToCartButton } from "@/components/AddToCartButton";

export function SimilarProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/product/${product.id}`}
      className="bg-surface-lowest rounded-xl p-4 warm-shadow hover:-translate-y-1 transition-transform cursor-pointer group block"
    >
      <div className="relative mb-4 aspect-square rounded-lg overflow-hidden bg-surface-mid p-4">
        {product.image ? (
          <img
            alt={product.name}
            className="w-full h-full object-contain mix-blend-multiply"
            src={product.image}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-outline-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <FavoriteButton
          productId={product.id}
          className="absolute top-2 right-2 p-2 bg-white/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </div>
      <h3 className="font-bold text-on-surface line-clamp-2 mb-2">{product.name}</h3>
      <p className="text-primary font-black text-lg mb-4">
        {product.price.toLocaleString("ru-RU")} сом
      </p>
      <div onClick={(e) => e.preventDefault()}>
        <AddToCartButton product={product} />
      </div>
    </Link>
  );
}
