"use client";

/**
 * Reusable skeleton loading components — Amber Workshop theme.
 * Uses animate-pulse with bg-surface-mid (warm beige, NOT gray).
 */

export function ProductCardSkeleton() {
  return (
    <div className="bg-surface-lowest rounded-xl overflow-hidden warm-shadow">
      {/* Image area */}
      <div className="aspect-square bg-surface-mid animate-pulse" />
      {/* Card body */}
      <div className="p-5 space-y-3">
        {/* Brand / category line */}
        <div className="h-3 w-24 bg-surface-mid animate-pulse rounded-full" />
        {/* Product name */}
        <div className="h-4 w-full bg-surface-mid animate-pulse rounded-full" />
        <div className="h-4 w-3/4 bg-surface-mid animate-pulse rounded-full" />
        {/* Price + button row */}
        <div className="flex items-center justify-between pt-2">
          <div className="h-6 w-28 bg-surface-mid animate-pulse rounded-full" />
          <div className="w-10 h-10 bg-surface-mid animate-pulse rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function CategoryCardSkeleton() {
  return (
    <div className="bg-surface-lowest warm-shadow rounded-xl p-6 flex flex-col items-center">
      {/* Icon circle */}
      <div className="w-14 h-14 rounded-full bg-surface-mid animate-pulse mb-4" />
      {/* Text */}
      <div className="h-4 w-20 bg-surface-mid animate-pulse rounded-full" />
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-6 pt-8 pb-12">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 mb-8">
        <div className="h-4 w-16 bg-surface-mid animate-pulse rounded-full" />
        <div className="h-4 w-4 bg-surface-mid animate-pulse rounded-full" />
        <div className="h-4 w-16 bg-surface-mid animate-pulse rounded-full" />
        <div className="h-4 w-4 bg-surface-mid animate-pulse rounded-full" />
        <div className="h-4 w-32 bg-surface-mid animate-pulse rounded-full" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12 items-start">
        {/* Image area */}
        <div className="space-y-4">
          <div className="bg-surface-mid rounded-xl aspect-square animate-pulse" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-surface-mid rounded-lg h-20 animate-pulse" />
            ))}
          </div>
        </div>

        {/* Info block */}
        <div className="bg-surface-lowest rounded-xl p-8 warm-shadow space-y-4">
          {/* Brand badge */}
          <div className="h-7 w-24 bg-surface-mid animate-pulse rounded-full" />
          {/* Product name */}
          <div className="h-8 w-full bg-surface-mid animate-pulse rounded-full" />
          <div className="h-8 w-3/4 bg-surface-mid animate-pulse rounded-full" />
          {/* Article */}
          <div className="h-4 w-40 bg-surface-mid animate-pulse rounded-full" />
          {/* Availability */}
          <div className="h-4 w-32 bg-surface-mid animate-pulse rounded-full" />
          {/* Price */}
          <div className="h-10 w-48 bg-surface-mid animate-pulse rounded-full" />
          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <div className="h-14 flex-1 bg-surface-mid animate-pulse rounded-full" />
            <div className="h-14 w-14 bg-surface-mid animate-pulse rounded-full" />
          </div>
          {/* Delivery info */}
          <div className="h-16 w-full bg-surface-mid animate-pulse rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function CartItemSkeleton() {
  return (
    <div className="bg-surface-lowest p-6 rounded-xl shadow-[0_10px_30px_rgba(69,26,3,0.04)] flex flex-wrap md:flex-nowrap items-center gap-6">
      {/* Thumbnail */}
      <div className="w-24 h-24 bg-surface-mid rounded-lg animate-pulse flex-shrink-0" />
      {/* Name + article */}
      <div className="flex-grow min-w-0 space-y-2">
        <div className="h-5 w-48 bg-surface-mid animate-pulse rounded-full" />
        <div className="h-3 w-32 bg-surface-mid animate-pulse rounded-full" />
        <div className="h-3 w-24 bg-surface-mid animate-pulse rounded-full" />
      </div>
      {/* Quantity */}
      <div className="h-10 w-28 bg-surface-mid animate-pulse rounded-full" />
      {/* Price */}
      <div className="h-6 w-24 bg-surface-mid animate-pulse rounded-full" />
    </div>
  );
}

export function FavoriteCardSkeleton() {
  return (
    <div className="bg-surface-lowest rounded-xl warm-shadow p-5">
      {/* Image */}
      <div className="w-full h-40 bg-surface-mid rounded-lg mb-4 animate-pulse" />
      {/* Article */}
      <div className="h-3 w-24 bg-surface-mid animate-pulse rounded-full mb-2" />
      {/* Name */}
      <div className="h-4 w-full bg-surface-mid animate-pulse rounded-full mb-1" />
      {/* Brand */}
      <div className="h-3 w-32 bg-surface-mid animate-pulse rounded-full mb-3" />
      {/* Price + badge */}
      <div className="flex items-center justify-between">
        <div className="h-5 w-24 bg-surface-mid animate-pulse rounded-full" />
        <div className="h-5 w-16 bg-surface-mid animate-pulse rounded-full" />
      </div>
    </div>
  );
}

export function AccountSkeleton() {
  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="h-9 w-56 bg-surface-mid animate-pulse rounded-full" />
          <div className="h-10 w-20 bg-surface-mid animate-pulse rounded-full" />
        </div>

        {/* Profile card */}
        <div className="bg-surface-lowest rounded-xl warm-shadow p-6 md:p-8 mb-6">
          <div className="h-6 w-32 bg-surface-mid animate-pulse rounded-full mb-5" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-20 bg-surface-mid animate-pulse rounded-full" />
                <div className="h-5 w-36 bg-surface-mid animate-pulse rounded-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Orders */}
        <div className="bg-surface-lowest rounded-xl warm-shadow p-6 md:p-8">
          <div className="h-6 w-40 bg-surface-mid animate-pulse rounded-full mb-5" />
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-surface-low rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-5 w-32 bg-surface-mid animate-pulse rounded-full" />
                  <div className="h-4 w-24 bg-surface-mid animate-pulse rounded-full" />
                </div>
                <div className="h-4 w-full bg-surface-mid animate-pulse rounded-full" />
                <div className="h-4 w-3/4 bg-surface-mid animate-pulse rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
