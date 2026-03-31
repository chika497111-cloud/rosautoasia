"use server";

import { getProductsByCategoryPage, getProductsByCategory } from "@/lib/products-server";
import type { Product } from "@/lib/mock-data";

export async function fetchCategoryPage(
  categorySlug: string,
  page: number,
  pageSize: number = 48,
): Promise<{ products: Product[]; totalCount: number }> {
  const result = await getProductsByCategoryPage(categorySlug, page, pageSize);
  return { products: result.products, totalCount: result.totalCount };
}

/** Fetch ALL products in a category at once (for filtering) */
export async function fetchAllCategoryProducts(
  categorySlug: string,
): Promise<Product[]> {
  return getProductsByCategory(categorySlug, { limit: 5000 });
}
