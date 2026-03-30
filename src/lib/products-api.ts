/**
 * Server & client functions to read products/categories from Firestore.
 * Falls back to mock-data if Firestore is unavailable or empty.
 */

import { db } from "./firebase";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
} from "firebase/firestore";
import type { Product, Category } from "./mock-data";
import {
  categories as mockCategories,
  products as mockProducts,
  searchProducts as mockSearch,
  getProductById as mockGetProductById,
  getCategoryBySlug as mockGetCategoryBySlug,
} from "./mock-data";

// ---------------------------------------------------------------------------
// Firestore → App type mappers
// ---------------------------------------------------------------------------

/** Known car brands that may appear in category names */
const CAR_BRANDS = [
  "ВАЗ", "ГАЗ", "ЗИЛ", "УАЗ", "КАМАЗ", "МАЗ", "УРАЛ",
  "Москвич", "Иномарки", "Тракторы",
];

function extractCarBrand(categoryName: string): string {
  for (const brand of CAR_BRANDS) {
    if (categoryName.includes(brand)) return brand;
  }
  return "";
}

/**
 * Convert a Firestore product document to the app's Product interface.
 * `docId` is the Firestore document ID, `data` is the document fields.
 */
export function firestoreProductToProduct(
  docId: string,
  data: Record<string, unknown>,
): Product {
  const categoryName = (data.category as string) || "";
  return {
    id: docId,
    name: (data.name as string) || "",
    article: (data.article as string) || "",
    category_id: categoryNameToSlug(categoryName),
    price: Number(data.price) || 0,
    quantity: Number(data.quantity) || 0,
    unit: (data.unit as string) || "шт.",
    description: (data.description as string) || "",
    image: (data.image as string) || "",
    brand: (data.group as string) || "",
    car_brand: extractCarBrand(categoryName),
    car_model: "",
  };
}

/** Simple slug generator: lowercase + replace spaces/special with dashes */
function categoryNameToSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}-]/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function firestoreCategoryToCategory(
  docId: string,
  data: Record<string, unknown>,
): Category & { productCount: number } {
  return {
    id: docId,
    name: (data.name as string) || "",
    slug: (data.slug as string) || docId,
    parent_id: null,
    image: "",
    productCount: Number(data.productCount) || 0,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Get all categories sorted by productCount descending.
 */
export async function getCategories(): Promise<
  (Category & { productCount: number })[]
> {
  try {
    const q = query(
      collection(db, "categories"),
      orderBy("productCount", "desc"),
    );
    const snap = await getDocs(q);
    if (snap.empty) throw new Error("empty");

    return snap.docs.map((d) =>
      firestoreCategoryToCategory(d.id, d.data()),
    );
  } catch {
    // Fallback to mock
    return mockCategories.map((c) => ({ ...c, productCount: 0 }));
  }
}

/**
 * Get a single category by its slug.
 * In Firestore the document ID === slug.
 */
export async function getCategoryBySlug(
  slug: string,
): Promise<(Category & { productCount: number }) | null> {
  try {
    const ref = doc(db, "categories", slug);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      // Try mock fallback
      const mock = mockGetCategoryBySlug(slug);
      return mock ? { ...mock, productCount: 0 } : null;
    }
    return firestoreCategoryToCategory(snap.id, snap.data());
  } catch {
    const mock = mockGetCategoryBySlug(slug);
    return mock ? { ...mock, productCount: 0 } : null;
  }
}

/**
 * Get products by category slug.
 * Products store the category *name*, so we first resolve slug → name,
 * then query products where category == name.
 */
export async function getProductsByCategory(
  categorySlug: string,
  options?: { limit?: number },
): Promise<Product[]> {
  try {
    // Resolve slug → category name
    const cat = await getCategoryBySlug(categorySlug);
    if (!cat) return [];

    const categoryName = cat.name;
    let q = query(
      collection(db, "products"),
      where("category", "==", categoryName),
    );

    if (options?.limit) {
      q = query(q, firestoreLimit(options.limit));
    }

    const snap = await getDocs(q);
    if (snap.empty) return [];

    return snap.docs.map((d) => firestoreProductToProduct(d.id, d.data()));
  } catch {
    return [];
  }
}

/**
 * Get a single product by its Firestore document ID.
 * Also checks mock data for backwards compatibility with old IDs like "p1".
 */
export async function getProductById(
  id: string,
): Promise<Product | null> {
  // Try Firestore first
  try {
    const ref = doc(db, "products", id);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return firestoreProductToProduct(snap.id, snap.data());
    }
  } catch {
    // fall through to mock
  }

  // Fallback to mock data (handles old IDs like "p1", "p2", etc.)
  const mock = mockGetProductById(id);
  return mock || null;
}

/**
 * Search products by name or article.
 * Uses Firestore >= / <= range queries on `name` field as a prefix search,
 * plus a secondary client-side filter by article.
 *
 * Firestore doesn't support full-text search, so we fetch a broader set
 * and filter client-side. For a site with 19k products this is acceptable
 * for now; later you can add Algolia/Typesense.
 */
export async function searchProducts(
  queryStr: string,
): Promise<Product[]> {
  const trimmed = queryStr.trim();
  if (!trimmed) return [];

  try {
    // Strategy 1: search by article (exact or prefix)
    const articleUpper = trimmed.toUpperCase();
    const articleQuery = query(
      collection(db, "products"),
      where("article", ">=", articleUpper),
      where("article", "<=", articleUpper + "\uf8ff"),
      firestoreLimit(20),
    );

    // Strategy 2: search by name prefix (case-sensitive, Cyrillic)
    // We try both the original case and capitalized first letter
    const nameVariants = [
      trimmed,
      trimmed.charAt(0).toUpperCase() + trimmed.slice(1),
      trimmed.toLowerCase(),
    ];

    const results = new Map<string, Product>();

    // Article search
    const articleSnap = await getDocs(articleQuery);
    for (const d of articleSnap.docs) {
      results.set(d.id, firestoreProductToProduct(d.id, d.data()));
    }

    // Name prefix search (try each variant)
    for (const variant of nameVariants) {
      if (results.size >= 30) break;
      try {
        const nameQuery = query(
          collection(db, "products"),
          where("name", ">=", variant),
          where("name", "<=", variant + "\uf8ff"),
          firestoreLimit(20),
        );
        const nameSnap = await getDocs(nameQuery);
        for (const d of nameSnap.docs) {
          if (!results.has(d.id)) {
            results.set(d.id, firestoreProductToProduct(d.id, d.data()));
          }
        }
      } catch {
        // individual variant may fail, continue
      }
    }

    if (results.size > 0) {
      return Array.from(results.values());
    }

    // If nothing found in Firestore, fall back to mock
    return mockSearch(trimmed);
  } catch {
    return mockSearch(trimmed);
  }
}

/**
 * Get featured/popular products for homepage.
 * Returns products that are in stock, sorted by price descending (most expensive = "popular").
 */
export async function getFeaturedProducts(
  count: number = 8,
): Promise<Product[]> {
  try {
    const q = query(
      collection(db, "products"),
      where("active", "==", true),
      where("quantity", ">", 0),
      orderBy("quantity", "desc"),
      firestoreLimit(count),
    );
    const snap = await getDocs(q);
    if (snap.empty) throw new Error("empty");

    return snap.docs.map((d) => firestoreProductToProduct(d.id, d.data()));
  } catch {
    return mockProducts.slice(0, count);
  }
}

/**
 * Get total product count (approximate — just sum category productCounts).
 */
export async function getTotalProductCount(): Promise<number> {
  try {
    const cats = await getCategories();
    return cats.reduce((sum, c) => sum + c.productCount, 0);
  } catch {
    return mockProducts.length;
  }
}
