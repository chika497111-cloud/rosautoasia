"use server";

import { getProductsByCategoryPage } from "@/lib/products-server";
import type { Product } from "@/lib/mock-data";

export async function fetchCategoryPage(
  categorySlug: string,
  page: number,
  pageSize: number = 48,
): Promise<{ products: Product[]; totalCount: number }> {
  const result = await getProductsByCategoryPage(categorySlug, page, pageSize);
  return { products: result.products, totalCount: result.totalCount };
}
