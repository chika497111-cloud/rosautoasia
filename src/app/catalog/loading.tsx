import { CategoryCardSkeleton } from "@/components/Skeleton";

export default function CatalogLoading() {
  return (
    <main className="pt-28 pb-20 max-w-7xl mx-auto px-6">
      <div className="mb-10">
        <div className="h-10 w-48 bg-surface-mid animate-pulse rounded-lg mb-2" />
        <div className="h-4 w-64 bg-surface-mid animate-pulse rounded-full" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <CategoryCardSkeleton key={i} />
        ))}
      </div>
    </main>
  );
}
