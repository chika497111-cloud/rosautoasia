import { ProductDetailSkeleton } from "@/components/Skeleton";

export default function ProductLoading() {
  return (
    <main className="pt-28 pb-20">
      <ProductDetailSkeleton />
    </main>
  );
}
