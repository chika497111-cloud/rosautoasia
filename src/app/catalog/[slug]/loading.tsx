import { ProductCardSkeleton } from "@/components/Skeleton";

export default function CategoryLoading() {
  return (
    <main className="pt-28 pb-20 max-w-[1440px] mx-auto px-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 mb-6">
        <div className="h-4 w-16 bg-surface-mid animate-pulse rounded-full" />
        <div className="h-4 w-4 bg-surface-mid animate-pulse rounded" />
        <div className="h-4 w-16 bg-surface-mid animate-pulse rounded-full" />
        <div className="h-4 w-4 bg-surface-mid animate-pulse rounded" />
        <div className="h-4 w-32 bg-surface-mid animate-pulse rounded-full" />
      </div>

      {/* Title */}
      <div className="mb-10">
        <div className="h-10 w-64 bg-surface-mid animate-pulse rounded-lg mb-2" />
        <div className="h-4 w-48 bg-surface-mid animate-pulse rounded-full" />
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Sidebar skeleton */}
        <aside className="hidden md:flex w-64 rounded-xl bg-surface-mid/50 py-8 px-6 flex-col gap-6 shrink-0">
          <div className="h-6 w-20 bg-surface-mid animate-pulse rounded-full" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-4 w-full bg-surface-mid animate-pulse rounded-full" />
            ))}
          </div>
          <div className="h-10 w-full bg-surface-mid animate-pulse rounded-full mt-4" />
        </aside>

        {/* Product grid skeleton */}
        <section className="flex-1">
          <div className="h-14 w-full bg-surface-low rounded-xl animate-pulse mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
